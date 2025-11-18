/**
 * Google Sheets Integration Utility
 * 
 * This file provides functions to load credit data from Google Sheets
 * and populate the credits page dynamically.
 * 
 * Setup Instructions:
 * 1. Create a Google Sheet with the following columns:
 *    - area
 *    - disciplina
 *    - icon (use icon names from lucide-react: BookOpen, Beaker, Calculator, etc.)
 *    - autorias_livro
 *    - autorias_guia
 *    - autorias_audiovisual
 *    - capitulo_3
 *    - capitulo_4
 *    - capitulo_5
 *    - capitulo_6
 *    - capitulo_7
 *    - capitulo_8
 *    - creditos_gerais
 * 
 * 2. Publish the sheet as JSON:
 *    File > Share > Publish to web > Choose "JSON" format
 * 
 * 3. Get the sheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/SHEET_ID/edit
 * 
 * 4. Replace SHEET_ID and API_KEY in the constants below
 */

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';
const SHEET_NAME = 'Credits'; // Name of your sheet tab

interface SheetRow {
  [key: string]: string;
}

interface CreditData {
  area: string;
  disciplina: string;
  icon: string;
  autorias_livro?: string;
  autorias_guia?: string;
  autorias_audiovisual?: string;
  capitulo_3?: string;
  capitulo_4?: string;
  capitulo_5?: string;
  capitulo_6?: string;
  capitulo_7?: string;
  capitulo_8?: string;
  creditos_gerais?: string;
}

/**
 * Fetch data from Google Sheets using the Google Sheets API v4
 */
export async function loadCreditsFromGoogleSheets(): Promise<CreditData[]> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return parseSheetData(data.values);
  } catch (error) {
    console.error('Error loading credits from Google Sheets:', error);
    return [];
  }
}

/**
 * Alternative method using public JSON feed (simpler setup, no API key needed)
 * 
 * Setup:
 * 1. Go to File > Share > Publish to web
 * 2. Choose the sheet and format as "Web page"
 * 3. Get the published URL
 * 4. Use this format:
 *    https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:json&sheet=SHEET_NAME
 */
export async function loadCreditsFromPublicSheet(sheetUrl: string): Promise<CreditData[]> {
  try {
    const response = await fetch(sheetUrl);
    const text = await response.text();
    
    // Google returns JSONP, we need to extract the JSON
    const json = text.substring(47).slice(0, -2);
    const data = JSON.parse(json);
    
    return parseGoogleVizData(data);
  } catch (error) {
    console.error('Error loading credits from public sheet:', error);
    return [];
  }
}

/**
 * Parse raw sheet data into CreditData format
 */
function parseSheetData(values: string[][]): CreditData[] {
  if (!values || values.length < 2) {
    return [];
  }
  
  const headers = values[0];
  const rows = values.slice(1);
  
  return rows.map(row => {
    const credit: any = {};
    
    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/\s+/g, '_');
      credit[key] = row[index] || '';
    });
    
    return credit as CreditData;
  }).filter(credit => credit.area && credit.disciplina);
}

/**
 * Parse Google Visualization API data format
 */
function parseGoogleVizData(data: any): CreditData[] {
  try {
    const cols = data.table.cols.map((col: any) => col.label);
    const rows = data.table.rows;
    
    return rows.map((row: any) => {
      const credit: any = {};
      
      cols.forEach((col: string, index: number) => {
        const key = col.toLowerCase().replace(/\s+/g, '_');
        const value = row.c[index]?.v || '';
        credit[key] = value;
      });
      
      return credit as CreditData;
    }).filter((credit: CreditData) => credit.area && credit.disciplina);
  } catch (error) {
    console.error('Error parsing Google Viz data:', error);
    return [];
  }
}

/**
 * Example CSV parser (if you export the sheet as CSV)
 */
export async function loadCreditsFromCSV(csvUrl: string): Promise<CreditData[]> {
  try {
    const response = await fetch(csvUrl);
    const text = await response.text();
    
    return parseCSV(text);
  } catch (error) {
    console.error('Error loading credits from CSV:', error);
    return [];
  }
}

/**
 * Parse CSV text into CreditData format
 */
function parseCSV(csv: string): CreditData[] {
  const lines = csv.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const credit: any = {};
    
    headers.forEach((header, index) => {
      credit[header] = values[index] || '';
    });
    
    return credit as CreditData;
  }).filter(credit => credit.area && credit.disciplina);
}

/**
 * Utility function to validate credit data
 */
export function validateCreditData(data: CreditData[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('Credit data is empty or invalid');
    return false;
  }
  
  const requiredFields = ['area', 'disciplina', 'icon'];
  
  for (const credit of data) {
    for (const field of requiredFields) {
      if (!credit[field as keyof CreditData]) {
        console.warn(`Missing required field "${field}" in credit:`, credit);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Example usage in your component:
 * 
 * import { loadCreditsFromGoogleSheets, validateCreditData } from '@/utils/googleSheets';
 * 
 * useEffect(() => {
 *   async function loadData() {
 *     const data = await loadCreditsFromGoogleSheets();
 *     
 *     if (validateCreditData(data)) {
 *       setCreditsData(data);
 *     }
 *   }
 *   
 *   loadData();
 * }, []);
 */