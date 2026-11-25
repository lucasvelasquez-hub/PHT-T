/** CartasHeroe: las dos cartas del jugador, grandes, en abanico sobre el riel inferior. */
import { Carta } from './Carta.tsx'
import type { Escena } from './geometria.ts'
import { aPantalla } from './geometria.ts'

export interface CartasHeroeProps {
  cartas: [string, string]
  escena: Escena
  cuatroColores: boolean
}

export function CartasHeroe({ cartas, escena, cuatroColores }: CartasHeroeProps) {
  const { heroe } = escena.plano
  return (
    <div className="heroe" data-e="heroe">
      {cartas.map((c, i) => {
        const p = aPantalla(escena, { x: heroe.cx[i]!, y: heroe.yb })
        return (
          <Carta
            key={c}
            carta={c}
            ancho={heroe.w * escena.s}
            inclinacion={heroe.inclinacion}
            giro={heroe.giro[i]}
            cuatroColores={cuatroColores}
            x={p.x}
            y={p.y}
            dato={`heroe-${i}`}
            etiqueta={`Tu carta ${i + 1}: ${c}`}
            className="carta--heroe"
            style={{ zIndex: 3 + i }}
          />
        )
      })}
    </div>
  )
}
