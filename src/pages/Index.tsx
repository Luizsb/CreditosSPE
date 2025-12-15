import { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface CreditData {
  anoColecao?: string;
  volume?: number;
  segmento?: string;
  serie?: string;
  area: string;
  disciplina: string;
  icon: string;
  autorias_livro?: string;
  autorias_guia?: string;
  autorias_audiovisual?: string;
  autorias_digital?: string;
  capitulo_3?: string;
  capitulo_4?: string;
  capitulo_5?: string;
  capitulo_6?: string;
  capitulo_7?: string;
  capitulo_8?: string;
  creditos_gerais?: string;
  // Campos dinâmicos adicionais (ex: autorias_*, outros campos por volume)
  camposAdicionais?: Record<string, { label: string; valor: string }>;
}

interface RawGeneralCreditRow {
  ano_colecao?: number | string;
  volume?: number | string;
  segmento?: string;
  serie?: string;
  disciplina?: string;
  bloco_creditos?: string;
  creditos?: string;
  area_principal?: string;
  "área_principal"?: string;
  funcao_exibida?: string;
  "função_exibida"?: string;
  [key: string]: unknown;
}

interface GeneralCreditRow {
  anoColecao: string;
  volume: number;
  segmento: string;
  serie?: string;
  disciplina: string;
  areaPrincipal: string;
  funcaoExibida: string;
  blocoCreditos: string;
}

interface GeneralGroup {
  area: string;
  items: { funcao: string; bloco: string }[];
}

interface RawDisciplineRow {
  ano_colecao?: number | string;
  volume?: number | string;
  segmento?: string;
  serie?: string;
  disciplina?: string;
  area_principal?: string;
  "área_principal"?: string;
  funcao?: string;
  funcao_exibida?: string;
  "função_exibida"?: string;
  bloco_creditos?: string;
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
  [key: string]: unknown;
}

interface LoadedDisciplineData {
  anoColecao: string;
  volume: number;
  segmento: string;
  serie?: string;
  area: string;
  disciplina: string;
  icon: string;
  autorias_livro?: string;
  autorias_guia?: string;
  autorias_audiovisual?: string;
  autorias_digital?: string;
  capitulo_3?: string;
  capitulo_4?: string;
  capitulo_5?: string;
  capitulo_6?: string;
  capitulo_7?: string;
  capitulo_8?: string;
  creditos_gerais?: string;
  // Campos dinâmicos adicionais
  camposAdicionais?: Record<string, { label: string; valor: string }>;
}

// Mapeamento das disciplinas para os ícones
const iconMap: Record<string, string> = {
  "LÍNGUA PORTUGUESA": "por",
  "LITERATURA": "lit",
  "LÍNGUA INGLESA": "ing",
  "LÍNGUA ESPANHOLA": "esp",
  "ARTE": "art",
  "FILOSOFIA": "fil",
  "EDUCAÇÃO FÍSICA": "edf",
  "BIOLOGIA": "bio",
  "FÍSICA": "fis",
  "QUÍMICA": "qui",
  "GEOGRAFIA": "geo",
  "HISTÓRIA": "his",
  "MATEMÁTICA": "mat",
  "SOCIOLOGIA": "soc",
  "CONVERSAS PEDAGÓGICAS": "conv",
  "CONVERSAS": "conv"
};

// Resolve assets respeitando o base path configurado no Vite
const getAssetPath = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}`;
};

// Normalização usada para comparar segmentos e séries sem se preocupar com acentos/caixa
const removeDiacritics = (value: string): string =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeSegmentValue = (value: string): string =>
  removeDiacritics(value || "").trim().toLowerCase();

const segmentsMatch = (segmentA?: string, segmentB?: string): boolean => {
  if (!segmentA || !segmentB) {
    return false;
  }
  const normA = normalizeSegmentValue(segmentA);
  const normB = normalizeSegmentValue(segmentB);
  if (normA === normB) {
    return true;
  }
  return normA.includes("infantil") && normB.includes("infantil");
};

const getSegmentKey = (segment?: string): string => {
  const normalized = normalizeSegmentValue(segment || "");
  if (!normalized) return "";
  if (normalized.includes("infantil")) {
    return "infantil";
  }
  return normalized;
};

const Index = () => {
  const [year, setYear] = useState("");
  const [segment, setSegment] = useState("");
  const [serie, setSerie] = useState("");
  const [activeVolume, setActiveVolume] = useState(1);
  const [allCreditsData, setAllCreditsData] = useState<CreditData[]>([]);
  const [generalCredits, setGeneralCredits] = useState<GeneralCreditRow[]>([]);
  const [allSoundMusicCredits, setAllSoundMusicCredits] = useState<Record<string, string>>({});
  const [allRawRows, setAllRawRows] = useState<(RawGeneralCreditRow & RawDisciplineRow)[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const normalizedSegment = normalizeSegmentValue(segment);
  const isInfantilSegment = normalizedSegment.includes("infantil");

  // Monitora o scroll para exibir/ocultar o botão "voltar ao topo"
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Converte entradas como "V4" ou "4" em um número
  const parseVolume = (volume: string | number | undefined): number => {
    if (typeof volume === 'number') {
      return volume;
    }
    const volumeStr = String(volume ?? "").trim();
    if (!volumeStr) return 0;
    
    const match = volumeStr.match(/^[Vv]?(\d+)$/);
    if (match) {
      return Number(match[1]);
    }
    
    const num = Number(volumeStr);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const loadCredits = async () => {
      try {
        // Adiciona timestamp para evitar cache do navegador
        const timestamp = new Date().getTime();
        const url = `${getAssetPath("creditos.xlsx")}?t=${timestamp}`;
        const response = await fetch(url, {
          cache: "no-store"
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar a planilha de créditos.");
        }

        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        
        // Ler aba "Geral" (Sessões Gerais)
        const geralSheet = workbook.Sheets["Geral"];
        const geralRows = geralSheet 
          ? (XLSX.utils.sheet_to_json(geralSheet, { defval: "" }) as RawGeneralCreditRow[])
          : [];

        // Ler aba "Autorias" (Disciplinas)
        const autoriasSheet = workbook.Sheets["Autorias"];
        const autoriasRows = autoriasSheet
          ? (XLSX.utils.sheet_to_json(autoriasSheet, { defval: "" }) as RawDisciplineRow[])
          : [];

        // Combinar todas as linhas para processamento
        const allRows = [...geralRows, ...autoriasRows] as (RawGeneralCreditRow & RawDisciplineRow)[];

        // Processar dados da aba Geral
        const normalizedGeneral: GeneralCreditRow[] = geralRows.map((row) => {
          const volumeStr = String(row.volume ?? "");
          const volumeNum = parseVolume(volumeStr);
          
          return {
            anoColecao: String(row.ano_colecao ?? "").trim(),
            volume: volumeNum,
            segmento: String(row.segmento ?? "").trim(),
            serie: row.serie ? String(row.serie).trim() : undefined,
            disciplina: "todos", // A aba Geral não tem disciplina específica
            areaPrincipal: String(row["área_principal"] ?? row.area_principal ?? "").trim(),
            funcaoExibida: String(row["função_exibida"] ?? row.funcao_exibida ?? "").trim(),
            blocoCreditos: String(row.creditos ?? row.bloco_creditos ?? "").trim()
          };
        });

        // Processar dados da aba Autorias
        const normalizedDiscipline = buildDisciplineCredits(autoriasRows);

        // Filtrar créditos de Sons e Música por ano, volume, segmento e série
        const soundMusicMap: Record<string, string> = {};
        geralRows.forEach((row) => {
          const areaPrincipalRaw = String(
            row["área_principal"] ??
            row["?rea_principal"] ??
            row.area_principal ??
            ""
          ).trim();
          const funcaoExibidaRaw = String(
            row["função_exibida"] ??
            row["fun??o_exibida"] ??
            row.funcao_exibida ??
            ""
          ).trim();
          const areaPrincipalNormalized = removeDiacritics(areaPrincipalRaw).toLowerCase();
          const funcaoExibidaNormalized = removeDiacritics(funcaoExibidaRaw).toLowerCase();
          const ano = String(row.ano_colecao ?? "").trim();
          const volumeStr = String(row.volume ?? "").trim();
          const volumeNum = parseVolume(volumeStr);
          const segmentoRaw = String(row.segmento ?? "").trim();
          const serieStr = row.serie ? String(row.serie).trim() : "";
          const segmentKey = getSegmentKey(segmentoRaw);
          const serieKey = serieStr ? `-${normalizeSegmentValue(serieStr)}` : "";
          const isRelevantArea =
            areaPrincipalNormalized.includes("sons") ||
            areaPrincipalNormalized.includes("musica") ||
            areaPrincipalNormalized === "geral";
          const isRelevantFuncao =
            funcaoExibidaNormalized.includes("creditos") ||
            funcaoExibidaNormalized.includes("sons") ||
            funcaoExibidaNormalized.includes("musica");
          const creditText = String(row.creditos ?? row.bloco_creditos ?? "").trim();

          if (segmentKey && ano && volumeNum > 0 && isRelevantArea && isRelevantFuncao && creditText) {
            const baseKey = `${ano}-${volumeNum}-${segmentKey}`.toLowerCase();
            const fullKey = `${baseKey}${serieKey}`.toLowerCase();
            soundMusicMap[fullKey] = creditText;

            if (serieKey && !soundMusicMap[baseKey]) {
              soundMusicMap[baseKey] = creditText;
            }
          }
        });

        // Extrair anos únicos
        const uniqueYears = Array.from(
          new Set(
            allRows
              .map((row) => String(row.ano_colecao ?? "").trim())
              .filter((year) => year !== "")
          )
        ).sort((a, b) => b.localeCompare(a)); // Ordenar do mais recente para o mais antigo

        setGeneralCredits(normalizedGeneral);
        setAllCreditsData(normalizedDiscipline.length > 0 ? normalizedDiscipline : []);
        setAllSoundMusicCredits(soundMusicMap);
        setAllRawRows(allRows);
        setAvailableYears(uniqueYears);

        // Definir valores iniciais com base nos dados disponíveis
        if (uniqueYears.length > 0) {
          if (!year || !uniqueYears.includes(year)) {
            setYear(uniqueYears[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar os créditos:", error);
      }
    };

    loadCredits();
  }, []);

  const buildDisciplineCredits = (rows: RawDisciplineRow[]): CreditData[] => {
    const grouped = rows.reduce<Record<string, LoadedDisciplineData>>((acc, row) => {
      const disciplina = String(row.disciplina ?? "").trim();
      if (!disciplina || disciplina.toLowerCase() === "todos" || disciplina.toLowerCase() === "gerais") {
        return acc;
      }

      const segmento = String(row.segmento ?? "").trim();
      const volumeStr = String(row.volume ?? "");
      const volumeNum = parseVolume(volumeStr);
      const serieStr = row.serie ? String(row.serie).trim() : "";
      
      // Incluir série na chave se existir
      const key = serieStr
        ? `${row.ano_colecao}-${volumeStr}-${segmento}-${serieStr}-${disciplina}`.toLowerCase()
        : `${row.ano_colecao}-${volumeStr}-${segmento}-${disciplina}`.toLowerCase();
        
      if (!acc[key]) {
        acc[key] = {
          anoColecao: String(row.ano_colecao ?? "").trim(),
          volume: volumeNum,
          segmento,
          serie: serieStr || undefined,
          area: String(row["área_principal"] ?? row.area_principal ?? ""),
          disciplina,
          icon: iconMap[disciplina.toUpperCase()] || "placeholder"
        };
      }

      const funcao = String(row["função_exibida"] ?? row.funcao_exibida ?? "").toLowerCase();
      const funcaoOriginal = String(row["função_exibida"] ?? row.funcao_exibida ?? "").trim();
      const blocoCreditos = String(row.bloco_creditos ?? "").trim();

      // Campos fixos conhecidos
      if (funcao.includes("livro")) {
        acc[key].autorias_livro = blocoCreditos;
      } else if (funcao.includes("guia")) {
        acc[key].autorias_guia = blocoCreditos;
      } else if (funcao.includes("audiovisual")) {
        acc[key].autorias_audiovisual = blocoCreditos;
      } else if (funcao.includes("digital")) {
        acc[key].autorias_digital = blocoCreditos;
      } else if (funcao.includes("capítulo 3")) {
        acc[key].capitulo_3 = blocoCreditos;
      } else if (funcao.includes("capítulo 4")) {
        acc[key].capitulo_4 = blocoCreditos;
      } else if (funcao.includes("capítulo 5")) {
        acc[key].capitulo_5 = blocoCreditos;
      } else if (funcao.includes("capítulo 6")) {
        acc[key].capitulo_6 = blocoCreditos;
      } else if (funcao.includes("capítulo 7")) {
        acc[key].capitulo_7 = blocoCreditos;
      } else if (funcao.includes("capítulo 8")) {
        acc[key].capitulo_8 = blocoCreditos;
      } else if (funcao.includes("créditos gerais") || funcao.includes("créditos - imagens")) {
        acc[key].creditos_gerais = blocoCreditos;
      } else if (funcaoOriginal && blocoCreditos) {
        // Campos dinâmicos: armazena qualquer função não mapeada
        if (!acc[key].camposAdicionais) {
          acc[key].camposAdicionais = {};
        }
        acc[key].camposAdicionais![funcaoOriginal] = {
          label: funcaoOriginal,
          valor: blocoCreditos
        };
      }

      return acc;
    }, {});

    return Object.values(grouped);
  };

  const areaOrder = ["Geral", "Núcleo de Arte", "Núcleo de Conteúdo Educacional"];

  const filteredGeneralCredits = useMemo(() => {
    const byYearVolumeAndSegment = generalCredits.filter(
      (item) => {
        const funcaoLower = item.funcaoExibida.toLowerCase();
        const isSoundMusic = funcaoLower.includes("créditos") && 
                            (funcaoLower.includes("sons") || funcaoLower.includes("música"));
        
        return (
          item.anoColecao === year &&
          item.volume === activeVolume &&
          segmentsMatch(item.segmento, segment) &&
          item.disciplina.toLowerCase() === "todos" &&
          (!serie || !item.serie || normalizeSegmentValue(item.serie) === normalizeSegmentValue(serie)) &&
          // Excluir créditos de Sons e Música (já aparecem na seção inferior)
          !isSoundMusic
        );
      }
    );

    const grouped = byYearVolumeAndSegment.reduce<Record<string, GeneralGroup["items"]>>((acc, item) => {
      if (!item.areaPrincipal) return acc;

      if (!acc[item.areaPrincipal]) {
        acc[item.areaPrincipal] = [];
      }

      acc[item.areaPrincipal].push({
        funcao: item.funcaoExibida,
        bloco: item.blocoCreditos
      });

      return acc;
    }, {});

    const weight = (area: string) => {
      const idx = areaOrder.indexOf(area);
      return idx === -1 ? areaOrder.length : idx;
    };

    return Object.entries(grouped)
      .map(([area, items]) => ({ area, items }))
      .sort((a, b) => {
        const weightDiff = weight(a.area) - weight(b.area);
        if (weightDiff !== 0) {
          return weightDiff;
        }
        return a.area.localeCompare(b.area);
      });
  }, [generalCredits, year, activeVolume, segment, serie]);

  const filteredCreditsData = useMemo(() => {
    return allCreditsData.filter(
      (credit) =>
        (!credit.anoColecao || credit.anoColecao === year) &&
        (!credit.volume || credit.volume === activeVolume) &&
        (!credit.segmento || segmentsMatch(credit.segmento, segment)) &&
        (!serie || !credit.serie || normalizeSegmentValue(credit.serie) === normalizeSegmentValue(serie))
    );
  }, [allCreditsData, year, activeVolume, segment, serie]);

  const conversasCredits = useMemo(() => {
    return filteredCreditsData.filter(
      (credit) => credit.disciplina?.toLowerCase().includes("conversas")
    );
  }, [filteredCreditsData]);

  const filteredSoundMusicCredits = useMemo(() => {
    const segmentKey = getSegmentKey(segment);
    if (!segmentKey) {
      return "";
    }
    const baseKey = `${year}-${activeVolume}-${segmentKey}`.toLowerCase();
    const serieKey = serie ? `-${normalizeSegmentValue(serie)}` : "";
    const fullKey = `${baseKey}${serieKey}`.toLowerCase();
    return (
      allSoundMusicCredits[fullKey] ||
      allSoundMusicCredits[baseKey] ||
      ""
    );
  }, [allSoundMusicCredits, year, activeVolume, segment, serie]);

  // Segmentos disponíveis filtrados pelo ano selecionado
  const availableSegments = useMemo(() => {
    if (!year || allRawRows.length === 0) {
      return [];
    }

    const segmentsForYear = Array.from(
      new Set(
        allRawRows
          .filter((row) => String(row.ano_colecao ?? "").trim() === year)
          .map((row) => String(row.segmento ?? "").trim())
          .filter((seg) => seg !== "")
      )
    ).sort();

    return segmentsForYear;
  }, [allRawRows, year]);

  // Séries disponíveis filtradas por ano, segmento e volume
  // Apenas para EM, AI e AF (não para Infantil)
  const availableSeries = useMemo(() => {
    if (!year || !segment || allRawRows.length === 0) {
      return [];
    }

    const segmentLower = normalizedSegment;
    // Verificar se o segmento precisa de série (EM, AI, AF)
    const needsSerie = segmentLower.includes("medio") || 
                      segmentLower.includes("anos iniciais") || 
                      segmentLower.includes("anos finais");
    
    if (!needsSerie) {
      return [];
    }

    const seriesForSegment = Array.from(
      new Set(
        allRawRows
          .filter((row) => {
            const rowAno = String(row.ano_colecao ?? "").trim();
            const rowSegmento = String(row.segmento ?? "").trim();
            const rowSerie = row.serie ? String(row.serie).trim() : "";
            return rowAno === year && 
                   segmentsMatch(rowSegmento, segment) && 
                   rowSerie !== "";
          })
          .map((row) => String(row.serie ?? "").trim())
          .filter((serie) => serie !== "")
      )
    ).sort();

    return seriesForSegment;
  }, [allRawRows, year, segment]);

  // Ajustar segmento quando o ano mudar
  useEffect(() => {
    if (year && availableSegments.length > 0) {
      if (!segment || !availableSegments.includes(segment)) {
        setSegment(availableSegments[0]);
      }
    } else if (year && availableSegments.length === 0) {
      setSegment("");
    }
  }, [year, availableSegments, segment]);

  // Ajustar série quando o segmento mudar
  useEffect(() => {
    if (segment && availableSeries.length > 0) {
      if (!serie || !availableSeries.includes(serie)) {
        setSerie(availableSeries[0]);
      }
    } else {
      setSerie("");
    }
  }, [segment, availableSeries, serie]);

  const hasDataForCurrentSelection = useMemo(() => {
    if (isInfantilSegment) {
      const hasConversas = conversasCredits.length > 0;
      return hasConversas || filteredSoundMusicCredits.length > 0;
    }
    return (
      filteredGeneralCredits.length > 0 ||
      filteredCreditsData.length > 0 ||
      filteredSoundMusicCredits.length > 0
    );
  }, [
    filteredGeneralCredits,
    filteredCreditsData,
    filteredSoundMusicCredits,
    conversasCredits,
    isInfantilSegment
  ]);

  const renderCreditCard = (
    credit: CreditData,
    index: number,
    options: { forceConversas?: boolean; customTitle?: string } = {}
  ) => {
    const iconSlug = iconMap[credit.disciplina] || credit.icon;
    const iconPath = getAssetPath(`${iconSlug}.png`);
    const disciplinaLower = credit.disciplina?.toLowerCase() || "";
    const isConversasDiscipline = disciplinaLower.includes("conversas");
    const highlightConversas = options.forceConversas || (isInfantilSegment && isConversasDiscipline);
    const displayTitle = options.customTitle || (highlightConversas ? "Conversas pedagógicas" : credit.disciplina);

    const dynamicFields = credit.camposAdicionais
      ? Object.entries(credit.camposAdicionais)
      : [];

    const regularFields = dynamicFields.filter(([_, campo]) => {
      const labelLower = campo.label.toLowerCase();
      return (
        !labelLower.includes("capítulo") &&
        !labelLower.includes("créditos") &&
        !labelLower.match(/\b(va\d+|v\d+)\b/i)
      );
    });

    const imageFields = dynamicFields.filter(([_, campo]) => {
      const labelLower = campo.label.toLowerCase();
      return (
        labelLower.includes("capítulo") ||
        labelLower.includes("créditos") ||
        labelLower.match(/\b(va\d+|v\d+)\b/i)
      );
    });

    const hasImageCredits =
      credit.capitulo_3 ||
      credit.capitulo_4 ||
      credit.capitulo_5 ||
      credit.capitulo_6 ||
      credit.capitulo_7 ||
      credit.capitulo_8 ||
      imageFields.length > 0;

    return (
      <div
        key={`${credit.disciplina}-${index}`}
        className={`credit-card ${highlightConversas ? "credit-card--conversas" : ""}`}
        data-area={credit.area}
        data-disciplina={credit.disciplina}
      >
        <div className="card-header-section">
          <div className="card-icon">
            <img
              src={iconPath}
              alt={`Ícone ${credit.disciplina}`}
              className="card-icon-image"
            />
          </div>
          <h2 className="card-title">{displayTitle}</h2>
        </div>

        <div className="card-content">
          {credit.autorias_livro && (
            <div className="credit-item">
              <strong>Livro didático:</strong>
              <p>{credit.autorias_livro}</p>
            </div>
          )}

          {credit.autorias_guia && (
            <div className="credit-item">
              <strong>Guia de Estudos:</strong>
              <p>{credit.autorias_guia}</p>
            </div>
          )}

          {credit.autorias_audiovisual && (
            <div className="credit-item">
              <strong>Audiovisual:</strong>
              <p>{credit.autorias_audiovisual}</p>
            </div>
          )}

          {credit.autorias_digital && (
            <div className="credit-item">
              <strong>Digital:</strong>
              <p>{credit.autorias_digital}</p>
            </div>
          )}

          {regularFields.map(([key, campo]) => (
            <div key={key} className="credit-item">
              <strong>{campo.label}:</strong>
              <p>{campo.valor}</p>
            </div>
          ))}

          {hasImageCredits && (
            <div className="credits-section">
              <strong className="credits-title">Créditos - Imagens</strong>

              {credit.capitulo_3 && (
                <div className="credit-chapter">
                  <span className="chapter-label">Capítulo 3:</span>
                  <span>{credit.capitulo_3}</span>
                </div>
              )}

              {credit.capitulo_4 && (
                <div className="credit-chapter">
                  <span className="chapter-label">Capítulo 4:</span>
                  <span>{credit.capitulo_4}</span>
                </div>
              )}

              {credit.capitulo_5 && (
                <div className="credit-chapter">
                  <span className="chapter-label">Capítulo 5:</span>
                  <span>{credit.capitulo_5}</span>
                </div>
              )}

              {credit.capitulo_6 && (
                <div className="credit-chapter">
                  <span className="chapter-label">Capítulo 6:</span>
                  <span>{credit.capitulo_6}</span>
                </div>
              )}

              {credit.capitulo_7 && (
                <div className="credit-chapter">
                  <span className="chapter-label">Capítulo 7:</span>
                  <span>{credit.capitulo_7}</span>
                </div>
              )}

              {credit.capitulo_8 && (
                <div className="credit-chapter">
                  <span className="chapter-label">Capítulo 8:</span>
                  <span>{credit.capitulo_8}</span>
                </div>
              )}

              {imageFields.map(([key, campo]) => (
                <div key={key} className="credit-chapter">
                  <span className="chapter-label">{campo.label}:</span>
                  <span>{campo.valor}</span>
                </div>
              ))}
            </div>
          )}

          {credit.creditos_gerais && (
            <div className="credit-item general-credits">
              <strong>Créditos Gerais:</strong>
              <p>{credit.creditos_gerais}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInfantilView = () => (
    <div className="infantil-credits-container">
      {conversasCredits.length > 0 && (
        <div className="infantil-bottom-section">
          {conversasCredits.map((credit, index) =>
            renderCreditCard(credit, index, {
              forceConversas: true,
              customTitle: "Conversas pedagógicas"
            })
          )}
        </div>
      )}
    </div>
  );

  const renderDefaultView = () => (
    <div className="credits-grid">
      {filteredCreditsData.map((credit, index) => renderCreditCard(credit, index))}
    </div>
  );

  // Volumes disponíveis dinamicamente baseado nos dados
  const availableVolumes = useMemo(() => {
    if (!year || !segment || allRawRows.length === 0) {
      return [];
    }

    const volumesSet = new Set<number>();

    allRawRows.forEach((row) => {
      const rowAno = String(row.ano_colecao ?? "").trim();
      const rowSegmento = String(row.segmento ?? "").trim();
      const rowSerie = row.serie ? String(row.serie).trim() : "";
      const rowVolumeStr = String(row.volume ?? "");
      const rowVolume = parseVolume(rowVolumeStr);

      if (rowAno === year && segmentsMatch(rowSegmento, segment) && rowVolume > 0) {
        if (serie) {
          if (rowSerie === serie) {
            volumesSet.add(rowVolume);
          }
        } else {
          volumesSet.add(rowVolume);
        }
      }
    });

    return Array.from(volumesSet).sort((a, b) => a - b);
  }, [allRawRows, year, segment, serie]);

  // Ajustar volume ativo quando os volumes disponíveis mudarem
  useEffect(() => {
    if (availableVolumes.length > 0) {
      if (!availableVolumes.includes(activeVolume)) {
        setActiveVolume(availableVolumes[0]);
      }
    }
  }, [availableVolumes, activeVolume]);

  return (
    <div className="credits-page">
      {/* Header */}
      <header className="credits-header">
        <div className="header-content">
          <h1 className="header-title">Ficha de Créditos</h1>
          
          <div className="header-logo-section">
            <div className="header-divider"></div>
            <img 
              src={getAssetPath("logo-positivoSVG.svg")} 
              alt="Logo Positivo" 
              className="logo-positivo-image"
            />
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="header-controls">
          <Select value={year || undefined} onValueChange={setYear} disabled={availableYears.length === 0}>
            <SelectTrigger className="year-select">
              <SelectValue placeholder={availableYears.length === 0 ? "Carregando..." : "Selecione o ano"} />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((yr) => (
                <SelectItem key={yr} value={yr}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={segment || undefined} onValueChange={setSegment} disabled={availableSegments.length === 0}>
            <SelectTrigger className="segment-select">
              <SelectValue placeholder={availableSegments.length === 0 ? "Carregando..." : "Selecione o segmento"} />
            </SelectTrigger>
            <SelectContent>
              {availableSegments.map((seg) => (
                <SelectItem key={seg} value={seg}>
                  {seg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Seletor de Série - apenas para EM, AI e AF */}
          {availableSeries.length > 0 && (
            <Select value={serie || undefined} onValueChange={setSerie} disabled={availableSeries.length === 0}>
              <SelectTrigger className="serie-select">
                <SelectValue placeholder={availableSeries.length === 0 ? "Carregando..." : "Selecione a série"} />
              </SelectTrigger>
              <SelectContent>
                {availableSeries.map((ser) => (
                  <SelectItem key={ser} value={ser}>
                    {ser}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Volume Selector Section */}
      {availableVolumes.length > 0 && (
        <div className="volume-section">
          <div className="volume-selector">
            {availableVolumes.map((vol) => (
              <Button
                key={vol}
                variant={activeVolume === vol ? "default" : "outline"}
                size="sm"
                className={`volume-button ${activeVolume === vol ? "active" : ""}`}
                onClick={() => setActiveVolume(vol)}
              >
                Volume {vol}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredGeneralCredits.length > 0 && (
        <section className="general-credits-section">
          <div className="general-credits-content">
            {filteredGeneralCredits.some((group) => group.area === "Geral") && (
              <div className="general-block general-block--list">
                {filteredGeneralCredits
                  .find((group) => group.area === "Geral")
                  ?.items.map((item, index) => (
                    <div key={`geral-${index}`} className="general-list-row">
                      <span className="general-list-label">{item.funcao}</span>
                      <span className="general-list-value">{item.bloco}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Primeira linha: Núcleo de Arte e Núcleo de Conteúdo Educacional */}
            <div className="general-grid general-grid--top">
              {filteredGeneralCredits
                .filter((group) => 
                  group.area !== "Geral" && 
                  (group.area === "Núcleo de Arte" || group.area === "Núcleo de Conteúdo Educacional")
                )
                .map((group) => (
                  <div key={group.area} className="general-box-wrapper">
                    <h3 className="general-box-title">{group.area}</h3>
                    <div className="general-box">
                      <div className="general-box-body">
                        {group.items.map((item, index) => (
                          <div key={`${group.area}-${index}`} className="general-box-row">
                            <span className="general-box-label">{item.funcao}</span>
                            <span className="general-box-value">{item.bloco}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Segunda linha: Conteúdo Digital */}
            {filteredGeneralCredits.some((group) => group.area === "Conteúdo Digital") && (
              <div className="general-grid general-grid--bottom">
                {filteredGeneralCredits
                  .filter((group) => group.area === "Conteúdo Digital")
                  .map((group) => (
                    <div key={group.area} className="general-box-wrapper general-box-wrapper--full">
                      <h3 className="general-box-title">{group.area}</h3>
                      <div className="general-box">
                        <div className="general-box-body">
                          {group.items.map((item, index) => (
                            <div key={`${group.area}-${index}`} className="general-box-row">
                              <span className="general-box-label">{item.funcao}</span>
                              <span className="general-box-value">{item.bloco}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Outras áreas (se houver) */}
            {filteredGeneralCredits
              .filter((group) => 
                group.area !== "Geral" && 
                group.area !== "Núcleo de Arte" && 
                group.area !== "Núcleo de Conteúdo Educacional" &&
                group.area !== "Conteúdo Digital"
              )
              .length > 0 && (
              <div className="general-grid">
                {filteredGeneralCredits
                  .filter((group) => 
                    group.area !== "Geral" && 
                    group.area !== "Núcleo de Arte" && 
                    group.area !== "Núcleo de Conteúdo Educacional" &&
                    group.area !== "Conteúdo Digital"
                  )
                  .map((group) => (
                    <div key={group.area} className="general-box-wrapper">
                      <h3 className="general-box-title">{group.area}</h3>
                      <div className="general-box">
                        <div className="general-box-body">
                          {group.items.map((item, index) => (
                            <div key={`${group.area}-${index}`} className="general-box-row">
                              <span className="general-box-label">{item.funcao}</span>
                              <span className="general-box-value">{item.bloco}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Content - Credits Grid */}
      <main className="credits-main">
        {!hasDataForCurrentSelection ? (
          <div className="empty-state">
            <p className="empty-state-message">
              N?o h? cr?ditos dispon?veis para a Cole??o {year}, Volume {activeVolume}.
            </p>
          </div>
        ) : isInfantilSegment ? (
          renderInfantilView()
        ) : (
          renderDefaultView()
        )}
      </main>

      {/* Sound and Music Credits Section */}
      {filteredSoundMusicCredits && hasDataForCurrentSelection && (
        <section className="sound-music-section">
          <div className="sound-music-grid">
            <div className="sound-music-wrapper">
              <h3 className="sound-music-title">Gerais</h3>
              <div className="sound-music-box">
                <div className="sound-music-item">
                  <strong>Créditos (Sons e Música):</strong>
                  <span>{filteredSoundMusicCredits}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="credits-footer">
        <div className="footer-content">
          <p className="footer-copyright">
            ©Todos os direitos estão reservados à Companhia Brasileira de Educação e Sistemas de Ensino S.A<br />
            R. João Domachoski, 5. CEP: 81200-150 - Mossunguê - Curitiba - PR
          </p>
          <div className="footer-logos">
            <img 
              src={getAssetPath("logo-positivoWhiteSVG.svg")} 
              alt="Logo Positivo" 
              className="footer-logo-positivo"
            />
            <div className="footer-logo-abdr-container">
              <img 
                src={getAssetPath("abdr_white.png")} 
                alt="ABDR" 
                className="footer-logo-abdr"
              />
              <p className="footer-production-text">PRODUÇÃO {year}</p>
            </div>
          </div>
          <p className="footer-info">
            Sistema de Ensino Positivo é um Selo Editorial da Companhia Brasileira de Sistemas de Ensino S.A.<br />
            CONTATO 0800-591-1510  |  Site: <a href="https://www.sistemapositivo.com.br" target="_blank" rel="noopener noreferrer" className="footer-link">www.sistemapositivo.com.br</a>  |  atendimento@sistemapositivo.com.br
          </p>
        </div>
      </footer>

      {/* Botão Voltar ao Topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-button"
          aria-label="Voltar ao topo"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 15L12 8L19 15"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Index;




