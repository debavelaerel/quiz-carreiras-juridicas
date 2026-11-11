// Gera os dados do serviço de PDF (Python) a partir do conteúdo do quiz (TS),
// pra os dois nunca divergirem. Rodar: node --experimental-strip-types scripts/gerar-dados-pdf.mts
import { writeFileSync, readFileSync } from 'node:fs'
import { PERFIL_SCREENS, TELA_DINHEIRO, TELA_LEITURA, EDITAIS, TESTE, CONFIG, DIAG, L } from '../lib/quizContent.ts'

const DIR = 'services/diagnostico-pdf/vendor/raio-x-da-base/diagnosis/'
const py = (v: unknown) => JSON.stringify(v, null, 4).replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')
const AVISO = 'GERADO por scripts/gerar-dados-pdf.mts a partir de lib/quizContent.ts e lib/data/blocos.json.\nNão editar à mão: mude o conteúdo no quiz e rode o gerador de novo.'

const questions: Record<string, unknown> = {}
for (const t of [...PERFIL_SCREENS, TELA_DINHEIRO, TELA_LEITURA]) {
  if (t.key === 'editais') continue
  let opcoes = typeof t.opts === 'function' ? null : t.opts
  if (t.key === 'cargo') {
    // Rótulos dependem da carreira (CARGO_POR_ALVO); aqui só a lista de valores válidos.
    const vals = new Set<string>()
    for (const m of Object.values(L.cargoPorAlvo)) for (const k of Object.keys(m)) vals.add(k)
    opcoes = [...vals].map((v) => [v, v])
  }
  questions[t.key] = { tipo: t.type, titulo: t.title, opcoes }
}
const { any: _any, ...editaisBase } = EDITAIS
const test = TESTE.map((q) => ({ disc: q.disc, fonte: q.src, gabarito: q.ans, comentario: q.note }))
// whatsapp fica com o placeholder de propósito: o link real (número + mensagem) é injetado
// por requisição em brand.cta_whatsapp_com_mensagem, sem estado global compartilhado.
const cfg = { quizName: CONFIG.quizName, whatsapp: '5500000000000', editaisAtualizadosEm: CONFIG.editaisAtualizadosEm, instagram: CONFIG.instagram }

writeFileSync(DIR + 'questions.py', `"""Perguntas, opções e editais do quiz.\n\n${AVISO}\n"""\n\nQUESTIONS = ${py(questions)}\n\nCARGO_POR_ALVO = ${py(L.cargoPorAlvo)}\n\nEDITAIS = ${py(editaisBase)}\n\nTEST = ${py(test)}\n\nCONFIG = ${py(cfg)}\n`)
writeFileSync(DIR + 'diagnoses.py', `"""O diagnóstico principal, escolhido pela última pergunta do quiz.\n\n${AVISO}\n"""\n\nDIAGNOSES = ${py(DIAG)}\n`)
const blocos = JSON.parse(readFileSync('lib/data/blocos.json', 'utf8'))
writeFileSync(DIR + 'blocks.py', `"""Os textos condicionais do laudo, com a regra que faz cada um aparecer.\n\n${AVISO}\n\nCada grupo entrega um bloco: o primeiro cuja regra bater. Regras lidas por diagnosis.rules.\n"""\n\nBLOCKS = ${py(blocos)}\n`)
console.log('ok', Object.keys(questions).length, 'perguntas,', test.length, 'questões,', blocos.length, 'grupos')
