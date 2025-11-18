import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Beaker, 
  Calculator, 
  Globe, 
  Palette, 
  Activity,
  Laptop,
  Brain,
  Languages,
  Microscope,
  History,
  MapPin,
  Music
} from "lucide-react";

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

const iconMap: Record<string, any> = {
  BookOpen,
  Beaker,
  Calculator,
  Globe,
  Palette,
  Activity,
  Laptop,
  Brain,
  Languages,
  Microscope,
  History,
  MapPin,
  Music
};

// Sample data structure - will be replaced by Google Sheets data
const sampleData: CreditData[] = [
  {
    area: "Língua Portuguesa",
    disciplina: "LÍNGUA PORTUGUESA",
    icon: "BookOpen",
    autorias_livro: "Equipe Editorial | Márcia Paganini Cavéquia | Pedro Leandro",
    autorias_guia: "Flávia Cristina",
    autorias_audiovisual: "Luís Vitor et al | Luís Flavio | Rogério Tilio et al",
    capitulo_3: "Getty Images | Latitude Stock | Latinstock",
    capitulo_4: "Shutterstock | Stock.Adobe.com | Wikimedia Commons",
    creditos_gerais: "123RF.com | Freepik.com | Pexels.com"
  },
  {
    area: "Literatura",
    disciplina: "LITERATURA",
    icon: "BookOpen",
    autorias_livro: "Walmick Braga | Mariana Novaes Rodrigues | Juliano Souza",
    autorias_guia: "Renata Muniz Santos",
    autorias_audiovisual: "Arquivo IVI et al | Autodesk et al | Iv et al",
    capitulo_3: "Shutterstock | Getty Images | Latinstock",
    capitulo_4: "Arquivo Adobe Stock | Dreamstime | Pixabay",
    creditos_gerais: "Getty Images | Shutterstock | Wikimedia Commons"
  },
  {
    area: "Língua Inglesa",
    disciplina: "LÍNGUA INGLESA",
    icon: "Languages",
    autorias_livro: "Cynthia Pittteri | Magali Krause | Jorge Vaz Andrade",
    autorias_guia: "David Mitchell Duque Estrada | Julio Souza",
    autorias_audiovisual: "Bianca Mc Donald | Julio Souza | Jason Connor",
    capitulo_3: "Getty Images | Shutterstock | Unsplash",
    capitulo_4: "Adobe Stock | Dreamstime | iStock",
    creditos_gerais: "Wikimedia Commons | Public Domain | Creative Commons"
  },
  {
    area: "Língua Espanhola",
    disciplina: "LÍNGUA ESPANHOLA",
    icon: "Languages",
    autorias_livro: "Rodrigo de Espíndola | Ana Luisa Díaz | Sofia Martinez",
    autorias_guia: "Flamínia M. Souza | José Acevedo",
    autorias_audiovisual: "Arquivo et al | Shutterstock et al",
    capitulo_3: "Shutterstock | Getty Images | Adobe Stock",
    capitulo_4: "Archivo ABC | Latinstock | Depositphotos",
    creditos_gerais: "EFE | Europa Press | Creative Commons"
  },
  {
    area: "Arte",
    disciplina: "ARTE",
    icon: "Palette",
    autorias_livro: "Luciana Ferreira de Andrade | Mônica Pena Lobo Chaves",
    autorias_guia: "Ana Carolina de Souza Santos | Márcia Soares",
    autorias_audiovisual: "Museu do Louvre | MoMA | Pinacoteca",
    capitulo_3: "Museu Imperial | MAM | Wikimedia Commons",
    capitulo_4: "Getty Images | Shutterstock | Art Collection",
    creditos_gerais: "Creative Commons | Public Domain | Museum Collections"
  },
  {
    area: "Filosofia",
    disciplina: "FILOSOFIA",
    icon: "Brain",
    autorias_livro: "Professor Thomaz S. Magalhães | Dra. Elisa B. de Souza",
    autorias_guia: "Diogo Maria Bastos da Silva | Juliana Peres",
    autorias_audiovisual: "Isa e Matheus Seco | Rodrigo Diniz Silva",
    capitulo_3: "Getty Images | Shutterstock | Historical Archive",
    capitulo_4: "Wikimedia Commons | Philosophy Archives",
    creditos_gerais: "Public Domain | Academic Sources | Creative Commons"
  },
  {
    area: "Educação Física",
    disciplina: "EDUCAÇÃO FÍSICA",
    icon: "Activity",
    autorias_livro: "Prof.ª Márcio Silva | M.Sc José Eduardo Soares Jr.",
    autorias_guia: "Pedro Henrique C. Moreira Soares | Ana Paula Costa",
    autorias_audiovisual: "Vídeo Publicações | Mov et Arquieto et al",
    capitulo_3: "Getty Images | Sports Photos | Action Images",
    capitulo_4: "Shutterstock | Olympic Archives | FIFA Media",
    creditos_gerais: "Sports Illustrated | ESPN Archives | Reuters"
  },
  {
    area: "Biologia",
    disciplina: "BIOLOGIA",
    icon: "Microscope",
    autorias_livro: "Dr. Carlos Daniel E. da Silva | Dra. Patricia M. Santos",
    autorias_guia: "Prof. Lucas Lima | Bióloga Marina Ferreira",
    autorias_audiovisual: "Science Source | Nature Archives",
    capitulo_3: "Getty Images | Science Photo Library",
    capitulo_4: "Shutterstock | National Geographic | Nature",
    creditos_gerais: "Scientific American | Biology Archives | Wikimedia"
  },
  {
    area: "Física",
    disciplina: "FÍSICA",
    icon: "Beaker",
    autorias_livro: "Prof. Ricardo Mendes | Dr. Fernando Costa",
    autorias_guia: "M.Sc Roberto Silva | Física Prof. Ana Lúcia",
    autorias_audiovisual: "Physics Lab | Scientific Videos",
    capitulo_3: "Getty Images | Science Museum | MIT Archives",
    capitulo_4: "Shutterstock | NASA | CERN Media",
    creditos_gerais: "Physics Today | Nature Physics | Science Direct"
  },
  {
    area: "Química",
    disciplina: "QUÍMICA",
    icon: "Beaker",
    autorias_livro: "Dra. Mariana Oliveira | Prof. João Santos",
    autorias_guia: "Química Prof. Carlos Alberto | M.Sc Paula Dias",
    autorias_audiovisual: "Chemical Lab | Science Videos",
    capitulo_3: "Getty Images | Chemical Society | Lab Photos",
    capitulo_4: "Shutterstock | Science Source | Nature",
    creditos_gerais: "Journal of Chemistry | ACS Publications | RSC"
  },
  {
    area: "Geografia",
    disciplina: "GEOGRAFIA",
    icon: "MapPin",
    autorias_livro: "Prof. André Martins | Dra. Beatriz Lima",
    autorias_guia: "Geógrafo Roberto Costa | Prof.ª Sandra Reis",
    autorias_audiovisual: "National Geographic | GIS Resources",
    capitulo_3: "Getty Images | NASA Earth Observatory",
    capitulo_4: "Shutterstock | UN Maps | World Atlas",
    creditos_gerais: "IBGE | UN Geographic | Map Collections"
  },
  {
    area: "História",
    disciplina: "HISTÓRIA",
    icon: "History",
    autorias_livro: "Prof. Dr. Marcos Pereira | Dra. Julia Santos",
    autorias_guia: "Historiador Carlos Mendes | Prof.ª Ana Costa",
    autorias_audiovisual: "History Channel | Documentary Archives",
    capitulo_3: "Getty Images | Historical Archives | Museum Collections",
    capitulo_4: "Shutterstock | National Archives | Library of Congress",
    creditos_gerais: "Wikimedia Commons | Historical Society | Public Archives"
  },
  {
    area: "Matemática",
    disciplina: "MATEMÁTICA",
    icon: "Calculator",
    autorias_livro: "Prof. Paulo Silva | Dra. Maria Oliveira",
    autorias_guia: "Matemático José Santos | Prof. Ricardo Costa",
    autorias_audiovisual: "Math Videos | Educational Resources",
    capitulo_3: "Getty Images | Mathematical Illustrations",
    capitulo_4: "Shutterstock | Math Archives | Academic Resources",
    creditos_gerais: "Mathematics Today | Academic Publications"
  },
  {
    area: "Sociologia",
    disciplina: "SOCIOLOGIA",
    icon: "Globe",
    autorias_livro: "Prof. Dr. Antonio Silva | Dra. Carmen Rodrigues",
    autorias_guia: "Sociólogo Fernando Costa | Prof.ª Beatriz Lima",
    autorias_audiovisual: "Social Sciences Archives | Documentary",
    capitulo_3: "Getty Images | Social Studies Collection",
    capitulo_4: "Shutterstock | Academic Archives | Research Images",
    creditos_gerais: "Social Science Review | Academic Journals"
  }
];

const Index = () => {
  const [year, setYear] = useState("2025");
  const [segment, setSegment] = useState("Ensino Médio");
  const [activeVolume, setActiveVolume] = useState(1);
  const [creditsData, setCreditsData] = useState<CreditData[]>(sampleData);

  // Function to load data from Google Sheets (placeholder)
  useEffect(() => {
    // This will be replaced with actual Google Sheets API call
    // loadFromGoogleSheets();
  }, []);

  const volumes = [1, 2, 3, 4];

  return (
    <div className="credits-page">
      {/* Header */}
      <header className="credits-header">
        <div className="header-content">
          <div className="header-controls">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="year-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>

            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="segment-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                <SelectItem value="Ensino Fundamental">Ensino Fundamental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="header-logo">
            <h1 className="logo-text">Ficha de Créditos</h1>
            <div className="logo-positivo">
              <span className="positivo-text">Positivo</span>
            </div>
          </div>
        </div>

        <div className="volume-selector">
          <span className="volume-label">Volume</span>
          {volumes.map((vol) => (
            <Button
              key={vol}
              variant={activeVolume === vol ? "default" : "outline"}
              size="sm"
              className={`volume-button ${activeVolume === vol ? "active" : ""}`}
              onClick={() => setActiveVolume(vol)}
            >
              {vol}
            </Button>
          ))}
        </div>
      </header>

      {/* Main Content - Credits Grid */}
      <main className="credits-main">
        <div className="credits-grid">
          {creditsData.map((credit, index) => {
            const IconComponent = iconMap[credit.icon] || BookOpen;
            
            return (
              <div 
                key={index} 
                className="credit-card"
                data-area={credit.area}
                data-disciplina={credit.disciplina}
              >
                <div className="card-header-section">
                  <div className="card-icon">
                    <IconComponent size={28} />
                  </div>
                  <h2 className="card-title">{credit.disciplina}</h2>
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
                  </div>

                  {credit.creditos_gerais && (
                    <div className="credit-item general-credits">
                      <strong>Créditos Gerais:</strong>
                      <p>{credit.creditos_gerais}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="credits-footer">
        <div className="footer-content">
          <div className="footer-logos">
            <div className="logo-positivo-footer">
              <span className="positivo-text">Positivo</span>
            </div>
            <div className="logo-secondary">
              <span className="secondary-text">Ágape</span>
            </div>
          </div>

          <div className="footer-info">
            <p className="footer-text">
              Os dados da ficha foram atualizados a 27 de outubro de 2024 pela Editora Positivo.
            </p>
            <p className="footer-contact">
              Rua Major Heitor Guimarães, 174 | CEP: 80.440-120 | Seminário | Curitiba - PR
            </p>
            <p className="footer-contact">
              0800 725 3536 | sac@positivo.com.br | www.editorapositivo.com.br
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;