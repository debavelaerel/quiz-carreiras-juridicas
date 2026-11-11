// Cálculo de perfil do funil "Diagnóstico da Base" — puro, sem I/O.
// Não é a nota do teste graduado (isso é lib/scoring.ts) — é a classificação
// de qualificação comercial (classe A/B, curso indicado, ritmo de estudo)
// a partir das respostas de perfilamento, não graduadas.

export type RespostasPerfil = {
  alvo?: string
  cargo?: string
  formacao?: string
  tempo?: string
  provas?: string
  metodo?: string
  vde?: string
  horas?: string
  edital?: string
  editais?: string[]
  dor?: string
  momento?: string
  dinheiro?: string
  leitura?: string
  // Motivo de desqualificação, só pro fluxo padrão e só quando não tem CTA
  // próprio (outro/cargo_baixo) — marca direto na sessão que já existe, sem
  // formulário na tela (ver components/Quiz.tsx, tela 'desqualificado'). O
  // motivo 'juridica' NUNCA usa este campo: tem CTA próprio que grava em
  // leads_desqualificados (ver lib/server/leadsDesqualificados.ts).
  desqualificadoMotivo?: string
}

export type PerfilCalculado = {
  classe: 'A' | 'B'
  pontos: number
  curso: string
  cursoCod: string
  ritmo: string
}

// Igual a RITMOS em reference/raio-x-da-base/diagnosis/profile.py — mesmo
// texto pros dois cursos (não diferencia por quantidade de temas). Antes
// este arquivo tinha RITMOS_TRT/RITMOS_TJTRF, mais granular (o TRT tem 168
// temas contra 231 do TJ/TRF, então o mesmo tanto de horas por dia de fato
// rende ritmos diferentes) — mais preciso, mas divergia do texto do pacote
// de referência, que é tratado como copy aprovada e não deve ser reescrita.
const RITMOS: Record<string, string> = {
  // PENDENTE: confirmar com o time os prazos reais do cronograma de Carreiras Jurídicas.
  h0: 'abaixo do cronograma mínimo; o ideal é chegar a 2h por dia',
  h1: 'cronograma padrão, desenhado pra quem trabalha',
  h2: 'acima do padrão: a base fecha antes',
  h3: 'ritmo forte: a base fecha bem antes do padrão',
  h4: 'ritmo intensivo: o cronograma mais curto',
}

export function calcularPerfil(r: RespostasPerfil, acertosTeste: number): PerfilCalculado {
  let pontos = 0
  if (r.cargo === 'estadual' || r.cargo === 'federal' || r.cargo === 'trabalho' || r.cargo === 'municipal') pontos += 2
  else if (r.cargo === 'any' || r.cargo === 'unsure') pontos += 1

  if (r.formacao === 'direito') pontos += 2
  else pontos += 1

  if (r.horas === 'h1') pontos += 1
  else if (r.horas === 'h2' || r.horas === 'h3' || r.horas === 'h4') pontos += 2

  if (r.edital === 'previsto' || r.edital === 'sem') pontos += 2
  else if (r.edital === 'nao') pontos += 1

  if (r.dor === 'base' || r.dor === 'improviso' || r.dor === 'juris' || r.dor === 'todas') pontos += 1

  const classe: 'A' | 'B' = pontos >= 7 ? 'A' : 'B'
  const curso = 'Formação de Base · Carreiras Jurídicas (23 disciplinas, 420+ temas)'
  const cursoCod = 'CJ-BASE'
  const ritmo = (r.horas && RITMOS[r.horas]) || ''

  // acertosTeste não entra na pontuação (o teste é diagnóstico, não classificatório
  // no funil original) — mantido como parâmetro explícito para deixar isso claro
  // no call site e permitir uso futuro sem mudar a assinatura.
  void acertosTeste

  return { classe, pontos, curso, cursoCod, ritmo }
}

export function nivelTeste(acertos: number): string {
  const niveis: Record<number, string> = { 0: 'inicial', 1: 'inicial', 2: 'intermediário', 3: 'intermediário', 4: 'avançado', 5: 'avançado' }
  return niveis[acertos] ?? 'inicial'
}

const ANOS_POR_TEMPO: Record<string, number> = { t0: 0, t1: 0.5, t2: 0.75, t3: 1.5, t4: 3, t5: 5 }
const ROTULO_POR_TEMPO: Record<string, string> = { t1: 'seis meses', t2: 'quase um ano', t3: 'um ano e meio', t4: 'três anos', t5: 'cinco anos' }

// `destaque` é o trecho do valor em R$ — separado do resto pra quem
// renderiza poder dar um leve realce (negrito, ver components/Quiz.tsx) sem
// precisar fatiar a frase de novo lá.
export type Conta = { titulo: string; antes: string; destaque: string; depois: string }

// Calculadora de custo da espera (tela "conta") — texto muda conforme o
// tempo de estudo já investido (retrospectivo) ou não (prospectivo). `nome`
// é opcional (toque pontual de personalização) e some da frase sem quebrar
// nada quando não informado.
export function calcularConta(r: RespostasPerfil, nome?: string): Conta {
  const anual = Number(r.dinheiro || 120)
  const anos = ANOS_POR_TEMPO[r.tempo ?? ''] ?? 0
  const rotulo = ROTULO_POR_TEMPO[r.tempo ?? ''] ?? ''
  const acumulado = Math.round(anual * anos)
  const retro = anos > 0
  // Sem nome, a frase abre com maiúscula normal ("Você estuda..."); com nome,
  // vira aposto minúsculo depois da vírgula ("Maria, você estuda...").
  const abre = (frase: string) => (nome ? `${nome}, ${frase}` : `${frase.charAt(0).toUpperCase()}${frase.slice(1)}`)

  if (retro) {
    return {
      titulo: 'O que a espera já te custou.',
      antes: `${abre(`você estuda há ${rotulo}`)}. Nesse tempo, a diferença entre o que você ganha hoje e o salário do cargo que você mira soma perto de `,
      destaque: `R$ ${acumulado} mil`,
      depois: ' que já não entraram na sua conta.',
    }
  }
  return {
    titulo: 'O que a espera custa.',
    antes: abre('cada ano que você adia o começo custa cerca de '),
    destaque: `R$ ${anual} mil`,
    depois: ', a diferença entre o que você ganha hoje e o salário do cargo que você mira.',
  }
}
