import { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface CreditData {
  anoColecao?: string;
  volume?: number;
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

interface RawGeneralCreditRow {
  ano_colecao?: number | string;
  volume?: number | string;
  disciplina?: string;
  bloco_creditos?: string;
  area_principal?: string;
  "área_principal"?: string;
  funcao_exibida?: string;
  "função_exibida"?: string;
  [key: string]: unknown;
}

interface GeneralCreditRow {
  anoColecao: string;
  volume: number;
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
  "SOCIOLOGIA": "soc"
};

// Sample data structure - will be replaced by Google Sheets data
const sampleData: CreditData[] = [
  {
    area: "Língua Portuguesa",
    disciplina: "LÍNGUA PORTUGUESA",
    icon: "por",
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
    icon: "lit",
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
    icon: "ing",
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
    icon: "esp",
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
    icon: "art",
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
    icon: "fil",
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
    icon: "edf",
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
    icon: "bio",
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
    icon: "fis",
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
    icon: "qui",
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
    icon: "geo",
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
    icon: "his",
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
    icon: "mat",
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
    icon: "soc",
    autorias_livro: "Prof. Dr. Antonio Silva | Dra. Carmen Rodrigues",
    autorias_guia: "Sociólogo Fernando Costa | Prof.ª Beatriz Lima",
    autorias_audiovisual: "Social Sciences Archives | Documentary",
    capitulo_3: "Getty Images | Social Studies Collection",
    capitulo_4: "Shutterstock | Academic Archives | Research Images",
    creditos_gerais: "Social Science Review | Academic Journals"
  }
];

// Helper function to get asset path with base URL
const getAssetPath = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL;
  // Remove leading slash from path if present, baseUrl already has trailing slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}`;
};

const Index = () => {
  const [year, setYear] = useState("2025");
  const [segment, setSegment] = useState("Ensino Médio");
  const [activeVolume, setActiveVolume] = useState(1);
  const [allCreditsData, setAllCreditsData] = useState<CreditData[]>([]);
  const [generalCredits, setGeneralCredits] = useState<GeneralCreditRow[]>([]);
  const [allSoundMusicCredits, setAllSoundMusicCredits] = useState<Record<string, string>>({});

  // Function to load data from Google Sheets (placeholder)
  useEffect(() => {
    // This will be replaced with actual Google Sheets API call
    // loadFromGoogleSheets();
  }, []);

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch(getAssetPath("CreditosSPE.xlsx"));
        if (!response.ok) {
          throw new Error("Não foi possível carregar a planilha de créditos.");
        }

        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as (RawGeneralCreditRow &
          RawDisciplineRow)[];

        const normalizedGeneral: GeneralCreditRow[] = rows
          .filter((row) => String(row.disciplina).toLowerCase() === "todos")
          .map((row) => ({
            anoColecao: String(row.ano_colecao ?? "").trim(),
            volume: Number(row.volume ?? 0),
            disciplina: String(row.disciplina ?? "").trim(),
            areaPrincipal: String(row["área_principal"] ?? row.area_principal ?? "").trim(),
            funcaoExibida: String(row["função_exibida"] ?? row.funcao_exibida ?? "").trim(),
            blocoCreditos: String(row.bloco_creditos ?? "").trim()
          }));

        const normalizedDiscipline = buildDisciplineCredits(rows);

        // Filtrar créditos de Sons e Música por ano e volume
        const soundMusicMap: Record<string, string> = {};
        rows.forEach((row) => {
          const disciplina = String(row.disciplina ?? "").toLowerCase();
          const areaPrincipal = String(row["área_principal"] ?? row.area_principal ?? "").toLowerCase();
          const funcaoExibida = String(row["função_exibida"] ?? row.funcao_exibida ?? "").toLowerCase();
          const ano = String(row.ano_colecao ?? "").trim();
          const volume = String(row.volume ?? "").trim();
          
          if (
            disciplina === "gerais" &&
            (areaPrincipal.includes("sons") || areaPrincipal.includes("música")) &&
            (funcaoExibida.includes("créditos") || funcaoExibida.includes("sons") || funcaoExibida.includes("música"))
          ) {
            const key = `${ano}-${volume}`;
            soundMusicMap[key] = String(row.bloco_creditos ?? "").trim();
          }
        });

        setGeneralCredits(normalizedGeneral);
        setAllCreditsData(normalizedDiscipline.length > 0 ? normalizedDiscipline : []);
        setAllSoundMusicCredits(soundMusicMap);
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

      const key = `${row.ano_colecao}-${row.volume}-${disciplina}`.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          anoColecao: String(row.ano_colecao ?? "").trim(),
          volume: Number(row.volume ?? 0),
          area: String(row["área_principal"] ?? row.area_principal ?? ""),
          disciplina,
          icon: iconMap[disciplina.toUpperCase()] || "placeholder"
        };
      }

      const funcao = String(row["função_exibida"] ?? row.funcao_exibida ?? "").toLowerCase();

      if (funcao.includes("livro")) {
        acc[key].autorias_livro = row.bloco_creditos as string;
      } else if (funcao.includes("guia")) {
        acc[key].autorias_guia = row.bloco_creditos as string;
      } else if (funcao.includes("audiovisual")) {
        acc[key].autorias_audiovisual = row.bloco_creditos as string;
      } else if (funcao.includes("capítulo 3")) {
        acc[key].capitulo_3 = row.bloco_creditos as string;
      } else if (funcao.includes("capítulo 4")) {
        acc[key].capitulo_4 = row.bloco_creditos as string;
      } else if (funcao.includes("capítulo 5")) {
        acc[key].capitulo_5 = row.bloco_creditos as string;
      } else if (funcao.includes("capítulo 6")) {
        acc[key].capitulo_6 = row.bloco_creditos as string;
      } else if (funcao.includes("capítulo 7")) {
        acc[key].capitulo_7 = row.bloco_creditos as string;
      } else if (funcao.includes("capítulo 8")) {
        acc[key].capitulo_8 = row.bloco_creditos as string;
      } else if (funcao.includes("créditos gerais") || funcao.includes("créditos - imagens")) {
        acc[key].creditos_gerais = row.bloco_creditos as string;
      }

      return acc;
    }, {});

    return Object.values(grouped);
  };

  const areaOrder = ["Geral", "Núcleo de Arte", "Núcleo de Conteúdo Educacional"];

  const filteredGeneralCredits = useMemo(() => {
    const byYearAndVolume = generalCredits.filter(
      (item) =>
        item.anoColecao === year &&
        item.volume === activeVolume &&
        item.disciplina.toLowerCase() === "todos"
    );

    const grouped = byYearAndVolume.reduce<Record<string, GeneralGroup["items"]>>((acc, item) => {
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
  }, [generalCredits, year, activeVolume]);

  const filteredCreditsData = useMemo(() => {
    return allCreditsData.filter(
      (credit) =>
        (!credit.anoColecao || credit.anoColecao === year) &&
        (!credit.volume || credit.volume === activeVolume)
    );
  }, [allCreditsData, year, activeVolume]);

  const filteredSoundMusicCredits = useMemo(() => {
    const key = `${year}-${activeVolume}`;
    return allSoundMusicCredits[key] || "";
  }, [allSoundMusicCredits, year, activeVolume]);

  const hasDataForCurrentSelection = useMemo(() => {
    return (
      filteredGeneralCredits.length > 0 ||
      filteredCreditsData.length > 0 ||
      filteredSoundMusicCredits.length > 0
    );
  }, [filteredGeneralCredits, filteredCreditsData, filteredSoundMusicCredits]);

  const volumes = [1, 2, 3, 4];

  return (
    <div className="credits-page">
      {/* Header */}
      <header className="credits-header">
        <div className="header-content">
          <h1 className="header-title">Ficha de Créditos</h1>
          
          <div className="header-logo-section">
            <div className="header-divider"></div>
            <img 
              src={getAssetPath("logo-positivo.png")} 
              alt="Logo Positivo" 
              className="logo-positivo-image"
            />
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="filters-section">
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
      </div>

      {/* Volume Selector Section */}
      <div className="volume-section">
        <div className="volume-selector">
          {volumes.map((vol) => (
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

            <div className="general-grid">
              {filteredGeneralCredits
                .filter((group) => group.area !== "Geral")
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
          </div>
        </section>
      )}

      {/* Main Content - Credits Grid */}
      <main className="credits-main">
        {!hasDataForCurrentSelection ? (
          <div className="empty-state">
            <p className="empty-state-message">
              Não há créditos disponíveis para a Coleção {year}, Volume {activeVolume}.
            </p>
          </div>
        ) : (
          <div className="credits-grid">
            {filteredCreditsData.map((credit, index) => {
            // Obtém a sigla do ícone baseado na disciplina ou usa o icon do credit
            const iconSlug = iconMap[credit.disciplina] || credit.icon;
            const iconPath = getAssetPath(`${iconSlug}.png`);
            
            return (
              <div 
                key={index} 
                className="credit-card"
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
              src={getAssetPath("logo-positivo_white.png")} 
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
    </div>
  );
};

export default Index;