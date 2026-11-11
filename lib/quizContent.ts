// Conteúdo do funil "Diagnóstico da Base" (VDE Carreiras Jurídicas) — perguntas de
// perfilamento, editais em andamento, rótulos e diagnósticos por momento.
// Mesma estrutura e mesmo motor de telas do quiz do VDE Tribunais; só o conteúdo
// foi adaptado pra juiz, promotor, defensor, procurador e delegado.

import type { RespostasPerfil } from './perfil'

export const CONFIG = {
  quizName: 'Diagnóstico da Base',
  // PENDENTE: confirmar o número do time de Carreiras Jurídicas (hoje é o mesmo do Tribunais).
  whatsapp: '5585999723810',
  // PENDENTE: vídeo da Ana Clara pra Carreiras Jurídicas (hoje é o mesmo do Tribunais).
  videoSrc: 'https://player-vz-246ae85e-308.tv.pandavideo.com.br/embed/?v=ceeffaff-3a26-4b53-ae04-2e52a05106e4&muted=true&mutedIndicatorIcon=true&mutedIndicatorClickRestart=true&saveProgress=false',
  editaisAtualizadosEm: '11 de novembro de 2026',
  instagram: 'https://www.instagram.com/vdeconcursos/',
}

// `aberto`: o edital já saiu (inscrições abertas ou prova marcada).
// Pesquisa de 11/11/2026 — fontes no relatório editais-carreiras.md.
export type Edital = { id: string; label: string; sub: string; aberto?: boolean }

export const EDITAIS: Record<string, Edital[]> = {
  juiz: [
    { id: 'tjsc', label: 'TJ SC', sub: 'edital publicado para juiz substituto (banca FGV); 15 vagas, inscrições até 26/11', aberto: true },
    { id: 'tjrs', label: 'TJ RS', sub: 'edital publicado para juiz substituto (banca FGV); 30 vagas, prova em 13/12', aberto: true },
    { id: 'tjap', label: 'TJ AP', sub: 'edital publicado para juiz substituto (banca FGV); 15 vagas, inscrições até 13/11', aberto: true },
    { id: 'tjdft', label: 'TJDFT', sub: 'banca definida para juiz substituto (Cebraspe); 20 vagas previstas' },
    { id: 'tjpb', label: 'TJ PB', sub: 'concurso para juiz substituto em preparação; 6 vagas previstas' },
    { id: 'tjac', label: 'TJ AC', sub: 'regulamento publicado para juiz substituto; banca a definir' },
    { id: 'trfs', label: 'TRFs (juiz federal)', sub: 'concursos previstos no orçamento de 2027 nos seis TRFs' },
  ],
  mp: [
    { id: 'mpap', label: 'MP AP', sub: 'banca definida para promotor substituto (FCC); 5 vagas previstas' },
    { id: 'mppe', label: 'MP PE', sub: 'regulamento publicado para promotor substituto; 15 vagas' },
    { id: 'mpsp', label: 'MP SP', sub: 'novo concurso para promotor em estudo; contratação da banca iniciada' },
    { id: 'mprj', label: 'MP RJ', sub: 'novo regulamento em preparação para o XL concurso de promotor' },
  ],
  defensoria: [
    { id: 'dpesp', label: 'DPE SP', sub: 'edital publicado para defensor público (banca FCC); 70 vagas, prova em 10/01/2027', aberto: true },
    { id: 'dpern', label: 'DPE RN', sub: 'banca definida para defensor público (Cebraspe); 10 vagas previstas' },
    { id: 'dpego', label: 'DPE GO', sub: 'regulamento publicado para defensor público; edital previsto' },
    { id: 'dpu', label: 'DPU', sub: 'comissão formada para contratar a banca do concurso de defensor federal' },
  ],
  procuradoria: [
    { id: 'pgeba', label: 'PGE BA', sub: 'banca contratada para procurador do estado (FCC); 20 vagas' },
    { id: 'agu', label: 'AGU', sub: 'concurso unificado autorizado; 170 vagas, banca em definição' },
    { id: 'pgers', label: 'PGE RS', sub: 'comissão formada para o 16º concurso de procurador do estado' },
  ],
  delegado: [
    { id: 'pcpe', label: 'PC PE', sub: 'edital publicado para delegado (banca Cebraspe); 45 vagas, inscrições até 16/12', aberto: true },
    { id: 'pcac', label: 'PC AC', sub: 'edital publicado para delegado (banca Idecan); 8 vagas, inscrições até 14/12', aberto: true },
    { id: 'pcap', label: 'PC AP', sub: 'edital publicado para delegado (banca Cesgranrio); prova em 06/12', aberto: true },
    { id: 'pcrj', label: 'PC RJ', sub: 'banca definida para delegado (Cesgranrio); 85 vagas' },
    { id: 'pcto', label: 'PC TO', sub: 'concurso autorizado para delegado; comissão definida, 60 vagas' },
  ],
}
EDITAIS.any = [EDITAIS.juiz[0], EDITAIS.delegado[0], EDITAIS.juiz[3], EDITAIS.mp[0], EDITAIS.defensoria[1], EDITAIS.procuradoria[1]]

export const L = {
  alvo: { juiz: 'Magistratura', mp: 'Ministério Público', defensoria: 'Defensoria Pública', procuradoria: 'Advocacia Pública', delegado: 'Polícia', any: 'qualquer carreira jurídica', outro: 'outro concurso' } as Record<string, string>,
  alvoLongo: { juiz: 'a Magistratura', mp: 'o Ministério Público', defensoria: 'a Defensoria Pública', procuradoria: 'a Advocacia Pública', delegado: 'a Polícia Judiciária', any: 'a primeira carreira jurídica que abrir' } as Record<string, string>,
  // Rótulo do cargo depende da carreira (ver labelCargo): "estadual" é juiz de direito na
  // Magistratura e procurador do estado na Advocacia Pública.
  cargoPorAlvo: {
    juiz: { estadual: 'juiz de direito', federal: 'juiz federal', trabalho: 'juiz do trabalho', any: 'juiz', unsure: 'juiz' },
    mp: { estadual: 'promotor de justiça', federal: 'procurador da República', any: 'membro do MP', unsure: 'membro do MP' },
    defensoria: { estadual: 'defensor público estadual', federal: 'defensor público federal', any: 'defensor público', unsure: 'defensor público' },
    procuradoria: { estadual: 'procurador do estado', federal: 'advogado público federal', municipal: 'procurador do município', any: 'procurador', unsure: 'procurador' },
    delegado: { estadual: 'delegado de Polícia Civil', federal: 'delegado de Polícia Federal', any: 'delegado', unsure: 'delegado' },
    any: { estadual: 'carreira estadual', federal: 'carreira federal', any: 'o cargo que vier', unsure: 'um cargo ainda a definir' },
  } as Record<string, Record<string, string>>,
  dorCurta: {
    base: 'sentir que começa do zero a cada edital',
    improviso: 'estudar no improviso, sem cronograma',
    tempo: 'conciliar estudo e trabalho',
    discursiva: 'a discursiva, a peça e a sentença',
    fixar: 'ler muito e fixar pouco',
    juris: 'acompanhar jurisprudência e informativos',
    emocional: 'a ansiedade e a sensação de atraso',
    todas: 'um pouco de tudo isso ao mesmo tempo',
  } as Record<string, string>,
  momento: {
    zero: 'Começo do zero',
    sembase: 'Estudo sem base',
    plato: 'Veterano travado no corte',
    improviso: 'Ciclo do improviso',
    servidor: 'Do Direito na prática pra carreira',
  } as Record<string, string>,
  horas: {
    h0: 'menos de 1 hora por dia',
    h1: '1 a 2 horas por dia',
    h2: '2 a 3 horas por dia',
    h3: '3 a 4 horas por dia',
    h4: 'mais de 4 horas por dia',
  } as Record<string, string>,
}

export type QuestaoTeste = { disc: string; src: string; ans: string; note: string; enunciado: string; opts: string[] }

// As 5 perguntas REAIS do teste, uma por disciplina. Texto transcrito do caderno
// oficial e gabarito conferido no gabarito definitivo (pós-recursos) de cada banca;
// URLs no relatório questoes-carreiras.md. lib/questions.ts deriva daqui o formato
// que lib/scoring.ts corrige.
export const TESTE: QuestaoTeste[] = [
  {
    disc: 'Direito Constitucional',
    src: 'FGV · TJ MT 2024 · Juiz Substituto',
    ans: 'B',
    note: 'Criar vínculo de trabalho com ajuda de custo, fora da lei federal do estágio, é legislar sobre direito do trabalho: competência privativa da União (art. 22, I). Falar em adolescente e educação não torna a competência concorrente.',
    enunciado:
      'Em razão de grave crise econômica que assola o estado-membro Alfa, João, deputado estadual, apresentou proposição legislativa disciplinando a criação de um programa de iniciação à atividade profissional, no qual seria estabelecido um vínculo direto entre o estudante adolescente e o órgão público estadual tomador do serviço, com o pagamento de uma ajuda de custo durante a duração do programa. No âmbito da Comissão de Constituição e Justiça da Assembleia Legislativa de Alfa, argumentou-se com a inconstitucionalidade da proposição, que era dissonante da lei federal sobre estágio, dissonância esta que é verdadeira. À luz da sistemática constitucional, é correto afirmar que a proposição é:',
    opts: [
      'constitucional, pois trata de matéria típica de regime jurídico, de competência estadual;',
      'inconstitucional, pois compete privativamente à União legislar sobre direito do trabalho;',
      'inconstitucional, pois compete privativamente à União legislar sobre diretrizes e bases da educação;',
      'constitucional, pois compete concorrentemente à União e aos estados legislar sobre direitos da infância e da juventude;',
      'constitucional, desde que a proposição tenha a forma de lei complementar e observe as normas gerais editadas pela União.',
    ],
  },
  {
    disc: 'Direito Administrativo',
    src: 'FGV · DPE RJ 2023 · Defensor Público',
    ans: 'E',
    note: 'O Estado limitando a atividade do particular em nome do interesse coletivo (a calçada livre) é poder de polícia. Hierárquico e disciplinar só valem pra quem tem vínculo com a Administração, e autotutela é a Administração revendo os próprios atos.',
    enunciado:
      'No curso de uma fiscalização, fiscais de determinada municipalidade identificaram que um estabelecimento comercial instalou bancos e araras de roupas na calçada para alavancar seus negócios. Os agentes municipais, considerando que estavam devidamente autorizados pela lei, no correto desempenho de suas funções, poderiam:',
    opts: [
      'aplicar multa ao estabelecimento e determinar a instauração de processo de interdição, como expressão de seu poder hierárquico;',
      'apreender os bancos e as araras e multar o estabelecimento, no exercício de seu poder disciplinar;',
      'interditar o estabelecimento e apreender todo o mobiliário da calçada, como expressão de seu poder de autotutela;',
      'interditar o estabelecimento, no exercício de seu poder de tutela administrativa;',
      'apreender os bancos e as araras de roupas irregulares e multar o estabelecimento, no exercício de seu poder de polícia.',
    ],
  },
  {
    disc: 'Direito Penal',
    src: 'FGV · PC MG 2025 · Delegado de Polícia Substituto',
    ans: 'A',
    note: 'Ajudar o autor a fugir da polícia é favorecimento pessoal (art. 348), e o irmão que presta o auxílio fica isento de pena (§2º). Favorecimento real seria guardar o proveito do crime, e tergiversação é crime de advogado.',
    enunciado:
      'Dionísio, agindo com dolo de matar, efetuou seis disparos de arma de fogo em detrimento de Lucas, atingindo-o em partes variadas do corpo, dando azo ao óbito deste. Diversas pessoas testemunharam os fatos, de forma que as autoridades públicas iniciaram, de pronto, buscas pelo autor do delito. Nesse contexto, Dionísio compareceu ao sítio de Bruno, seu irmão, que não tinha qualquer conhecimento anterior sobre o crime praticado. O autor do delito contou o ocorrido e pediu auxílio para que ele pudesse se subtrair à ação dos policiais que o procuravam, obtendo a aquiescência do seu parente. Considerando as disposições do Código Penal, a conduta de Bruno caracteriza o crime de',
    opts: [
      'favorecimento pessoal, mas, por ser irmão do autor do delito, ele fica isento de pena.',
      'favorecimento real, mas, por ser irmão do autor do delito, ele fica isento de pena.',
      'tergiversação, mas, por ser irmão do autor do delito, ele fica isento de pena.',
      'favorecimento real, não havendo hipótese de isenção de pena.',
      'favorecimento pessoal, não havendo hipótese de isenção de pena.',
    ],
  },
  {
    disc: 'Direito Processual Penal',
    src: 'Cebraspe · DPE AC 2024 · Defensor Público',
    ans: 'E',
    note: 'O art. 240, §1º, do CPP permite a busca pra achar o que é necessário "à prova de infração ou à defesa do réu". As pegadinhas: cartas "abertas ou não", CPI não determina busca domiciliar (reserva de jurisdição), busca pessoal durante a domiciliar dispensa mandado e, com consentimento do morador, a busca pode ser à noite.',
    enunciado: 'Em relação à busca e apreensão, assinale a opção correta.',
    opts: [
      'Admite-se a busca domiciliar com o objetivo de apreender cartas destinadas ao acusado ou investigado, permitida a apreensão somente daquelas que já estejam abertas.',
      'Admite-se a busca domiciliar ordenada por comissão parlamentar de inquérito (CPI).',
      'No curso de busca domiciliar, a busca pessoal só é admitida se autorizada por mandado.',
      'A busca domiciliar deverá ser realizada obrigatoriamente durante o dia.',
      'Havendo fundadas razões, é cabível a busca domiciliar necessária à defesa do réu.',
    ],
  },
  {
    disc: 'Direito Civil',
    src: 'FGV · TJ SC 2024 · Juiz Substituto',
    ans: 'E',
    note: 'É o "contrato consigo mesmo": sem permissão da lei ou do representado, é anulável (art. 117 do CC). Não é nulo nem inexistente: o vício protege Leonardo, que pode confirmar o negócio se quiser.',
    enunciado:
      'Leonardo contratou Vanessa para que ela encontrasse um inquilino para alugar seu apartamento, dando-lhe poderes para representá-lo no contrato de locação na posição de locadora. Como ninguém se apresentou interessado em alugar o imóvel, Vanessa alugou o apartamento para si própria, figurando no contrato também como locatária, em nome próprio. Diante da ausência de permissão legal ou de Leonardo, segundo o Código Civil de 2002, o contrato de locação celebrado por Vanessa consigo própria é:',
    opts: ['inexistente;', 'nulo;', 'ineficaz;', 'válido;', 'anulável.'],
  },
]

export type Diagnostico = {
  titulo: string
  texto: string[]
  prescricao: string
  ordem: string[]
}

// RASCUNHO pra revisão da Ana Clara — mesma estrutura e tamanho dos diagnósticos do Tribunais.
export const DIAG: Record<string, Diagnostico> = {
  zero: {
    titulo: 'Você está no melhor momento pra fazer a coisa certa desde o início.',
    texto: [
      'Quem começa carreira jurídica sem ordem passa um ano lendo manual de mil páginas e, no primeiro edital, descobre que não sabe resolver questão de banca. Eu vejo isso todo dia.',
      'O que decide o seu caso é sequência. As disciplinas que se repetem em toda carreira, Constitucional, Administrativo, Penal, Processo Penal, Civil e Processo Civil, vêm antes de qualquer matéria específica do cargo.',
    ],
    prescricao: 'escolher um ritmo de cronograma que caiba no seu dia real, começar pelas disciplinas comuns a toda carreira e resolver questões de FGV, Cebraspe e FCC desde a primeira semana, mesmo errando.',
    ordem: [
      'Disciplinas comuns: Constitucional, Administrativo, Penal, Processo Penal, Civil e Processo Civil.',
      'Questões da banca desde a primeira semana, com caderno de erros.',
      'Lei seca e informativos junto com a teoria, não depois.',
      'Só depois as específicas da sua carreira.',
    ],
  },
  sembase: {
    titulo: 'Você já pagou o preço de estudar sem estrutura.',
    texto: [
      'Horas investidas e a sensação de que nada fixa. São mais de 20 disciplinas, e sem uma ordem clara cada uma puxa você pra um lado. A cada edital você recomeça, porque nenhum alicerce sobreviveu do concurso anterior.',
      'Mais um manual só adia. O que resolve é fechar um único caminho e medir o seu avanço por questão resolvida em cada disciplina, com número na mão.',
    ],
    prescricao: 'parar de acumular fontes, fechar um único cronograma de formação de base e medir o progresso por questões acertadas por disciplina, semana a semana.',
    ordem: [
      'Escolher uma fonte por disciplina e abandonar as outras.',
      'Fechar as disciplinas comuns em sequência, sem pular.',
      'Questões comentadas de FGV, Cebraspe e FCC como termômetro semanal.',
      'Específicas da sua carreira só com a base fechada.',
    ],
  },
  plato: {
    titulo: 'O seu ponto vaza sempre no mesmo lugar.',
    texto: [
      'Quem para perto do corte, ou passa da objetiva e cai na discursiva, não sabe menos que o aprovado. Erra em lugares específicos e repete os mesmos lugares em toda prova. Enquanto esses lugares não têm nome, a nota fica parada.',
      'Mais horas costumam ir justamente pro que você já domina. Abrir as suas provas, separar o que vazou na objetiva do que vazou na escrita e tratar cada vazamento onde ele acontece é o que destrava.',
    ],
    prescricao: 'abrir o espelho da sua última prova e separar o que você errou por não saber o conteúdo do que errou na leitura do enunciado ou na escrita. São problemas diferentes, e tratar todos do mesmo jeito é o que sustenta o platô.',
    ordem: [
      'Separar erro de conteúdo, erro de leitura e erro de escrita.',
      'Erro de conteúdo: teoria curta e questão da mesma banca, no assunto exato.',
      'Erro de escrita: uma discursiva por semana, corrigida pelo espelho.',
      'Matéria forte entra só em revisão, nunca em reestudo.',
    ],
  },
  improviso: {
    titulo: 'Você estuda no modo edital.',
    texto: [
      'Sai o concurso, corre, faz a prova, para. Na carreira jurídica, entre o edital e a prova há poucos meses, e ninguém forma em poucos meses a base que a banca cobra. Enquanto o ciclo não quebrar, cada edital vai te encontrar no mesmo lugar.',
      'A boa notícia: carreira jurídica abre o ano inteiro. São 27 Tribunais de Justiça, 27 Ministérios Públicos, 27 Defensorias, 27 Procuradorias e 27 Polícias Civis, mais a esfera federal, e a base de disciplinas é a mesma. Quem constrói essa base uma vez aproveita em todos.',
    ],
    prescricao: 'estudar agora, sem edital publicado, a base comum que cai em toda carreira jurídica, pra que o próximo edital te encontre revisando, e não começando.',
    ordem: [
      'Cronograma de base independente de edital, com data de fim.',
      'Base comum primeiro: Constitucional, Administrativo, Penal e Civil.',
      'Questões da banca como rotina, não como véspera.',
      'Quando o edital sair, só ajustar as específicas e revisar.',
    ],
  },
  servidor: {
    titulo: 'Você já tem o Direito na prática. Falta transformar em prova.',
    texto: [
      'Quem advoga, assessora ou já é servidor conhece o Direito que usa todo dia, e é justamente aí que mora a armadilha: a prova cobra o que você não usa, na profundidade da banca, com doutrina e jurisprudência dos tribunais superiores.',
      'Recomeçar do zero seria desperdício. O seu caso pede um cronograma que trate o que você já domina como revisão e concentre as horas onde a base ainda tem buraco.',
    ],
    prescricao: 'mapear por questões o que você já domina, manter isso em revisão leve e montar o cronograma em cima das disciplinas que você não pratica no trabalho.',
    ordem: [
      'Diagnóstico por questões em cada disciplina comum.',
      'O que você usa no trabalho entra só em revisão.',
      'Horas concentradas nas disciplinas que você não pratica.',
      'Atividade jurídica documentada desde já, pra inscrição definitiva.',
    ],
  },
}

export type Opcao = [valor: string, texto: string, sub?: string]

export type TelaPerfil =
  | { type: 'single'; key: keyof RespostasPerfil; title: string; hint?: string | ((r: RespostasPerfil) => string); opts: Opcao[] | ((r: RespostasPerfil) => Opcao[]); after?: (r: RespostasPerfil) => 'desqualificado' | null }
  | { type: 'multi'; key: keyof RespostasPerfil; title: string; hint?: string | ((r: RespostasPerfil) => string); opts: Opcao[] | ((r: RespostasPerfil) => Opcao[]) }

// Mesmas 12 telas, na mesma ordem, do quiz do Tribunais.
export const PERFIL_SCREENS: TelaPerfil[] = [
  {
    type: 'single', key: 'alvo', title: 'Qual carreira é a sua prioridade hoje?',
    opts: [
      ['juiz', 'Magistratura', 'juiz de direito, juiz federal ou juiz do trabalho'],
      ['mp', 'Ministério Público', 'promotor de justiça ou procurador da República'],
      ['defensoria', 'Defensoria Pública', 'defensor público estadual ou federal'],
      ['procuradoria', 'Advocacia Pública', 'procurador do estado, AGU ou procurador do município'],
      ['delegado', 'Delegado de Polícia', 'Polícia Civil ou Polícia Federal'],
      ['any', 'Qualquer carreira jurídica, a que abrir primeiro'],
      ['outro', 'Outro concurso, fora das carreiras jurídicas', 'servidor de tribunal, OAB ou outra área'],
    ],
    after: (r) => (r.alvo === 'outro' ? 'desqualificado' : null),
  },
  {
    type: 'single', key: 'cargo', title: 'E em qual esfera?',
    opts: (r) => {
      const porAlvo: Record<string, Opcao[]> = {
        juiz: [['estadual', 'Juiz de Direito', 'Tribunal de Justiça'], ['federal', 'Juiz Federal', 'Tribunal Regional Federal'], ['trabalho', 'Juiz do Trabalho', 'Tribunal Regional do Trabalho']],
        mp: [['estadual', 'Promotor de Justiça', 'Ministério Público estadual'], ['federal', 'Procurador da República', 'Ministério Público Federal']],
        defensoria: [['estadual', 'Defensor Público estadual', 'DPE'], ['federal', 'Defensor Público federal', 'DPU']],
        procuradoria: [['estadual', 'Procurador do Estado', 'PGE'], ['federal', 'Advocacia-Geral da União', 'AGU'], ['municipal', 'Procurador do Município']],
        delegado: [['estadual', 'Delegado de Polícia Civil'], ['federal', 'Delegado de Polícia Federal']],
        any: [['estadual', 'Carreiras estaduais'], ['federal', 'Carreiras federais']],
      }
      return [...(porAlvo[r.alvo ?? ''] ?? porAlvo.any), ['any', 'O que abrir primeiro'], ['unsure', 'Ainda não sei a diferença entre elas']]
    },
  },
  {
    type: 'single', key: 'formacao', title: 'Qual é a sua formação hoje?',
    hint: 'Magistratura e Ministério Público exigem 3 anos de atividade jurídica depois de formado. Dá pra formar a base enquanto cumpre esse prazo.',
    opts: [
      ['direito', 'Bacharel em Direito'],
      ['cursando_direito', 'Cursando Direito'],
      ['outra', 'Superior completo em outra área'],
      ['cursando_outra', 'Cursando outra área'],
      ['medio', 'Ensino médio completo'],
    ],
    // Toda carreira jurídica exige bacharelado em Direito.
    after: (r) => (r.formacao === 'direito' || r.formacao === 'cursando_direito' ? null : 'desqualificado'),
  },
  {
    type: 'single', key: 'tempo', title: 'Há quanto tempo você estuda pra concursos?',
    opts: [
      ['t0', 'Ainda não comecei'],
      ['t1', 'Menos de 6 meses'],
      ['t2', 'Entre 6 meses e 1 ano'],
      ['t3', 'Entre 1 e 2 anos'],
      ['t4', 'Entre 2 e 4 anos'],
      ['t5', 'Mais de 4 anos'],
    ],
  },
  {
    type: 'single', key: 'provas', title: 'Quantas provas de carreira jurídica você já fez, e como foi?',
    hint: 'Prova oficial, presencial. Simulado feito em casa não entra nessa conta.',
    opts: [
      ['p0', 'Nunca fiz uma prova de carreira jurídica'],
      ['p1', 'Fiz uma ou duas e fiquei longe do corte'],
      ['p2', 'Fiz várias e continuo longe do corte'],
      ['p3', 'Fico perto do corte, ou passo da objetiva e caio na discursiva'],
      ['p4', 'Já fui aprovado(a) em concurso jurídico e quero subir de carreira'],
    ],
  },
  {
    type: 'single', key: 'metodo', title: 'Como você estudou até aqui?',
    opts: [
      ['nenhum', 'Nunca estudei com método, vou no improviso'],
      ['video', 'Videoaulas de cursinho grande, muitas horas de vídeo'],
      ['pdf', 'PDF e questões, com cronograma'],
      ['questoes', 'Só questões'],
      ['retafinal', 'Só quando sai edital, com curso de reta final'],
      ['mentoria', 'Mentoria ou coaching'],
    ],
  },
  {
    type: 'single', key: 'vde', title: 'Você já conhece o Método VDE?',
    opts: [
      ['nunca', 'Nunca ouvi falar'],
      ['insta', 'Sigo no Instagram, mas nunca estudei com vocês'],
      ['exaluno', 'Já fui aluno(a) da OAB ou de outro curso do VDE'],
      ['aluno', 'Já sou aluno(a) do VDE Concursos'],
    ],
  },
  {
    type: 'single', key: 'horas', title: 'Quantas horas por dia você consegue estudar, sendo realista?',
    hint: 'Pensa no seu dia normal, não no dia perfeito.',
    opts: [
      ['h0', 'Menos de 1 hora'],
      ['h1', 'Entre 1 e 2 horas'],
      ['h2', 'Entre 2 e 3 horas'],
      ['h3', 'Entre 3 e 4 horas'],
      ['h4', 'Mais de 4 horas'],
    ],
  },
  {
    type: 'single', key: 'edital', title: 'Você tem edital na mira?',
    opts: [
      ['reta', 'Já saiu, e a prova é em menos de 3 meses'],
      ['previsto', 'Tem edital previsto pros próximos meses'],
      ['sem', 'Não tenho um edital específico: quero estar pronto quando abrir'],
      ['nao', 'Não acompanho as previsões'],
    ],
  },
  {
    type: 'multi', key: 'editais', title: 'Estes são os concursos abertos e os que estão por vir. Em qual deles você quer estar pronto?',
    hint: (r) => `Pode marcar mais de um. Situação em ${CONFIG.editaisAtualizadosEm}.`,
    opts: (r) => {
      const lista = editaisDisponiveis(r)
      return [...lista.map((e): Opcao => [e.id, e.label, e.sub]), ['qualquer', 'Qualquer um, quero estar pronto quando abrir']]
    },
  },
  {
    type: 'single', key: 'dor', title: 'Qual é o seu maior gargalo hoje?',
    opts: [
      ['base', 'Não tenho base: sinto que começo do zero a cada edital'],
      ['improviso', 'Estudo no improviso, sem cronograma nem ordem'],
      ['tempo', 'Pouco tempo: concilio estudo com trabalho'],
      ['discursiva', 'Travo na discursiva, na peça ou na sentença'],
      ['fixar', 'Leio muito e resolvo pouco: não fixo'],
      ['juris', 'Não dou conta de acompanhar jurisprudência e informativos'],
      ['emocional', 'O emocional sabota: ansiedade, comparação, sensação de atraso'],
      ['todas', 'Todas acima'],
    ],
  },
  {
    type: 'single', key: 'momento', title: 'Última: qual dessas frases você diria pra um amigo hoje?',
    opts: [
      ['zero', 'Estou começando do zero, ainda me organizando'],
      ['sembase', 'Estudo há um tempo, mas sem base sólida: fico perdido no meio das disciplinas'],
      ['plato', 'Chego perto do corte e não passo, prova atrás de prova'],
      ['improviso', 'Só estudo quando sai edital, e recomeço do zero toda vez'],
      ['servidor', 'Já trabalho com Direito e quero migrar pra uma carreira jurídica'],
    ],
  },
]

// Mesmas posições fixas do Tribunais: dinheiro depois do vídeo, leitura depois da correção.
export const TELA_DINHEIRO: TelaPerfil = {
  type: 'single', key: 'dinheiro', title: 'Quanto você receberia a mais por mês se fosse aprovado(a) hoje na carreira que você mira?',
  hint: 'Juiz, promotor e defensor começam perto de R$ 37 mil; procurador do estado, perto de R$ 36 mil; delegado, até R$ 31 mil. Compare com o que você ganha hoje.',
  opts: [
    ['120', 'Uns R$ 10 mil a mais por mês', 'R$ 120 mil por ano'],
    ['180', 'Uns R$ 15 mil a mais por mês', 'R$ 180 mil por ano'],
    ['240', 'Uns R$ 20 mil a mais por mês', 'R$ 240 mil por ano'],
    ['300', 'Uns R$ 25 mil a mais por mês', 'R$ 300 mil por ano'],
    ['360', 'R$ 30 mil ou mais a mais por mês', 'R$ 360 mil por ano'],
  ],
}

export const TELA_LEITURA: TelaPerfil = {
  type: 'single', key: 'leitura', title: 'Quer que eu inclua no seu resultado o que priorizar no seu momento?',
  opts: [
    ['completa', 'Inclui, por favor'],
    ['basica', 'Só o diagnóstico já basta'],
  ],
}

// Prefixa uma frase com o primeiro nome, minúscula a primeira letra que
// sobrou ("Qual concurso..." -> "Maria, qual concurso..."). Sem nome, devolve
// a frase original intacta.
export function comNome(nome: string, frase: string): string {
  if (!nome) return frase
  return `${nome}, ${frase.charAt(0).toLowerCase()}${frase.slice(1)}`
}

export function labelCargo(r: RespostasPerfil): string {
  const mapa = L.cargoPorAlvo[r.alvo ?? ''] ?? L.cargoPorAlvo.any
  return mapa[r.cargo ?? ''] ?? ''
}

export function editaisDisponiveis(r: RespostasPerfil): Edital[] {
  return EDITAIS[r.alvo ?? ''] ?? EDITAIS.any
}

export function editaisEscolhidos(r: RespostasPerfil): Edital[] {
  const lista = editaisDisponiveis(r)
  return (r.editais ?? []).filter((x) => x !== 'qualquer').map((id) => lista.find((e) => e.id === id)).filter((e): e is Edital => Boolean(e))
}

// Frase da tela de correção, indexada pelo número de acertos (0 a 5).
export const MENSAGENS_CORRECAO: string[] = [
  'Nenhuma das cinco. E tudo bem: é exatamente esse tipo de questão que a sua base precisa dar conta.',
  'Uma das cinco. O nível da banca já está claro, e ele é alcançável com base bem construída.',
  'Duas das cinco. Você tem alicerce em pé, e ele ainda não sustenta a régua de uma carreira jurídica.',
  'Três das cinco. Metade do caminho, e a régua da carreira jurídica ainda está acima.',
  'Quatro das cinco. Está perto do corte, e o corte só paga quem passa dele.',
  'As cinco. Nível bom de partida, e a prova real cobra isso em 100 questões seguidas, depois discursiva e oral.',
]

export function mensagemWhatsapp(r: RespostasPerfil, classe: string, cursoCod: string, nivel: string, acertos: number, total: number): string {
  const cargo = labelCargo(r)
  const ref = `VDE-CJ ${classe} | ${cursoCod} | ${r.momento} | ${r.dor} | ${L.horas[r.horas ?? '']} | edital:${r.edital} | teste ${acertos}/${total} | vde:${r.vde}`
  return `Oi! Fiz o ${CONFIG.quizName} do VDE Carreiras Jurídicas agora. Deu ${L.momento[r.momento ?? '']}, nível ${nivel} no teste, mirando ${cargo} (${L.alvo[r.alvo ?? '']}). Queria ver os horários pra montar o meu plano de ação.\n\n(ref ${ref})`
}

export function waLink(nome: string, r: RespostasPerfil, classe: string, cursoCod: string, nivel: string, acertos: number, total: number): string {
  const msg = mensagemWhatsapp(r, classe, cursoCod, nivel, acertos, total)
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`
}
