// O app roda em https://viciodeumaestudante.com.br/quiz-cj (mesmo domínio do
// OAB e do Tribunais). O Next prefixa sozinho <Link>, router.push/replace e
// redirect(); `fetch`, <a href> e <img src> com caminho absoluto NÃO — use
// comBase() neles. Mudar aqui exige novo build (o valor vai para o bundle).
export const BASE_PATH = '/quiz-cj'

export function comBase(caminho: string): string {
  return `${BASE_PATH}${caminho}`
}
