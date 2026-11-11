import { ORDEM_AREAS, LABEL_CURTO_AREA } from '@/lib/areasLabels'

type AreaRadarProps = {
  areas: Record<string, { pct: number }>
  // Área mais fraca (já calculada no servidor, ver calcularAreaPrioritaria
  // em lib/scoring.ts) — ganha o único ponto/rótulo em dourado do gráfico,
  // em vez de recalcular "qual é a pior" aqui de novo.
  areaPrioritaria: string | null
}

const RAIO = 70
const CENTRO = 100
// Eixo por área, na ordem fixa de ORDEM_AREAS: topo, direita, baixo,
// esquerda (sentido horário) — dx/dy é a direção unitária do eixo.
// Um eixo por área, distribuídos em círculo a partir do topo (sentido horário).
// Funciona pra qualquer quantidade de áreas (aqui são 5: pentágono).
const EIXOS = ORDEM_AREAS.map((_, i) => {
  const ang = -Math.PI / 2 + (i * 2 * Math.PI) / ORDEM_AREAS.length
  const dx = Math.cos(ang)
  const dy = Math.sin(ang)
  const anchor = dx > 0.2 ? ('start' as const) : dx < -0.2 ? ('end' as const) : ('middle' as const)
  return { dx, dy, labelX: CENTRO + dx * (RAIO + 12), labelY: CENTRO + dy * (RAIO + 12) + (dy > 0.5 ? 8 : dy < -0.5 ? -2 : 3), anchor }
})
const anel = (f: number) => EIXOS.map((e) => `${CENTRO + e.dx * RAIO * f},${CENTRO + e.dy * RAIO * f}`).join(' ')

export default function AreaRadar({ areas, areaPrioritaria }: AreaRadarProps) {
  const pontos = ORDEM_AREAS.map((area, i) => {
    const eixo = EIXOS[i]
    const pct = areas[area]?.pct ?? 0
    const r = (Math.max(0, Math.min(100, pct)) / 100) * RAIO
    return { area, x: CENTRO + eixo.dx * r, y: CENTRO + eixo.dy * r, fraco: area === areaPrioritaria }
  })
  const poligono = pontos.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    // viewBox mais largo que os 0-200 dos eixos: SVG raiz recorta por padrão
    // (overflow:hidden implícito), e os rótulos laterais ("Constitucional",
    // "Raciocínio") são longos o bastante pra estourar x=200/x=0 e sumir
    // cortados. -55/+130 de folga de cada lado dá espaço pro texto sem
    // mudar a escala nem a posição do diamante (mesmo fator 0.8 px/unidade
    // do viewBox original, só com mais canvas ao redor).
    <svg viewBox="-55 5 310 200" width={264} height={170} role="img" aria-label="Desempenho por área">
      {/* Grade de referência — 3 anéis + 2 eixos, sempre neutra (nunca a cor de dado). */}
      {[1, 0.66, 0.33].map((f) => (
        <polygon key={f} points={anel(f)} fill="none" stroke="#2A2A35" strokeWidth={1.5} />
      ))}
      {EIXOS.map((e, i) => (
        <line key={i} x1={CENTRO} y1={CENTRO} x2={CENTRO + e.dx * RAIO} y2={CENTRO + e.dy * RAIO} stroke="#2A2A35" strokeWidth={1.5} />
      ))}

      <polygon points={poligono} fill="#B7ADFD" fillOpacity={0.22} stroke="#B7ADFD" strokeWidth={2.5} />
      {pontos.map((p) => (
        <circle key={p.area} cx={p.x} cy={p.y} r={4} fill={p.fraco ? '#F5CF4A' : '#B7ADFD'} />
      ))}
      {ORDEM_AREAS.map((area, i) => (
        <text
          key={area}
          x={EIXOS[i].labelX}
          y={EIXOS[i].labelY}
          textAnchor={EIXOS[i].anchor}
          fontSize={9}
          fontWeight={area === areaPrioritaria ? 700 : 400}
          fill={area === areaPrioritaria ? '#F5CF4A' : '#B9B7C6'}
        >
          {LABEL_CURTO_AREA[area]}
        </text>
      ))}
    </svg>
  )
}
