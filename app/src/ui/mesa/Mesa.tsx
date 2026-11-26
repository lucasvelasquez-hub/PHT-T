/**
 * Mesa: la escena. Fondo cinematográfico (sala + paño + riel), logo en el paño, rivales, apuestas, tablero,
 * bote y cartas del jugador, todo colocado con las coordenadas de la imagen de la mesa (ver geometria.ts).
 *
 * Coreografía (GSAP): entrada en ~0.5 s (rivales, cartas del tablero que llegan del mazo y se voltean, bote,
 * cartas del jugador); cartas nuevas al cambiar de calle; fichas que viajan al bote; retirada de las cartas.
 * Con movimiento reducido todo es un fundido.
 */
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, type CSSProperties } from 'react'
import { Cifra } from '../Cifra.tsx'
import type { EscenarioMesa } from '../datos/escenario.ts'
import { fmtBB } from '../datos/formato.ts'
import { CURVA_GSAP, movimientoReducido } from '../movimiento.ts'
import { Asiento, rutaAvatar } from './Asiento.tsx'
import { Carta, HuecoCarta, rutaCarta } from './Carta.tsx'
import { CartasHeroe } from './CartasHeroe.tsx'
import { Fichas, cajaFichas } from './Fichas.tsx'
import { aPantalla, letra, type Escena } from './geometria.ts'

export interface VueloFichas { id: number; monto: number }
/** Fichas del bote que viajan a quien gana (0 = el jugador, 1..5 = rivales de izquierda a derecha). */
export interface PremioFichas { id: number; monto: number; hacia: number }

export interface MesaProps {
  escena: Escena
  escenario: EscenarioMesa
  cuatroColores: boolean
  /** Bote que se muestra (crece cuando el jugador paga o sube). */
  boteBB: number
  /** Stack del jugador que se muestra. */
  stackHeroeBB: number
  heroeRetirado: boolean
  vuelo: VueloFichas | null
  onLlegadaFichas: () => void
  onFinVuelo: () => void
  /** Fichas del bote que vuelan a los ganadores (showdown). */
  premios?: PremioFichas[] | null
}

const HUECOS_TABLERO = 5

export function Mesa({ escena, escenario, cuatroColores, boteBB, stackHeroeBB, heroeRetirado, vuelo, onLlegadaFichas, onFinVuelo, premios = null }: MesaProps) {
  const raiz = useRef<HTMLDivElement>(null)
  const montado = useRef(false)
  const previas = useRef(0)
  const apuestasPrevias = useRef<Record<number, number>>({})
  const entrada = useRef<gsap.core.Timeline | null>(null)
  const { plano, s } = escena
  const tablero = escenario.tablero
  const { heroe } = escenario

  useEffect(() => () => { montado.current = false }, [])

  // --- Entrada y reparto de cartas nuevas ---------------------------------------------------------------------
  useGSAP(
    () => {
      const el = raiz.current
      if (!el) return
      const slots = gsap.utils.toArray<HTMLElement>('[data-carta^="tablero"]', el)
      const repartir = (tl: gsap.core.Timeline, nuevas: HTMLElement[], inicio: number) => {
        nuevas.forEach((slot, k) => {
          const i = Number(slot.dataset.carta!.split('-')[1])
          const dx = (plano.mazo.x - plano.tablero.cx[i]!) * s
          const dy = (plano.mazo.y - plano.tablero.yb) * s
          const t0 = inicio + k * 0.05
          tl.fromTo(slot, { x: dx, y: dy, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.32, ease: CURVA_GSAP }, t0)
          const g = slot.querySelector<HTMLElement>('[data-giro]')
          if (g) tl.fromTo(g, { rotationY: 180, transformPerspective: 900 }, { rotationY: 0, duration: 0.32, ease: 'power2.out' }, t0)
        })
      }

      if (!montado.current) {
        montado.current = true
        previas.current = tablero.length
        const tl = gsap.timeline()
        entrada.current = tl
        if (movimientoReducido()) {
          tl.fromTo(
            el.querySelectorAll('[data-e="asiento"], [data-e="bote"], [data-e="apuesta"], [data-carta]'),
            { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 0,
          )
          return
        }
        tl.fromTo(el.querySelectorAll('[data-e="asiento"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: CURVA_GSAP }, 0)
        tl.fromTo(el.querySelectorAll('[data-e="apuesta"]'), { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.26, ease: CURVA_GSAP }, 0.18)
        repartir(tl, slots, 0.06)
        tl.fromTo(el.querySelectorAll('[data-e="bote"]'), { autoAlpha: 0, scale: 0.94, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.26, ease: CURVA_GSAP }, 0.2)
        tl.fromTo(el.querySelectorAll('[data-carta^="heroe"]'), { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05, ease: CURVA_GSAP }, 0.12)
        return
      }

      // Calle nueva: solo las cartas añadidas se reparten.
      if (tablero.length > previas.current) {
        const nuevas = slots.slice(previas.current, tablero.length)
        previas.current = tablero.length
        if (movimientoReducido()) gsap.fromTo(nuevas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' })
        else repartir(gsap.timeline(), nuevas, 0)
      }
    },
    { scope: raiz, dependencies: [tablero.length] },
  )

  // --- Las cartas del jugador se retiran al hacer fold ----------------------------------------------------------
  useGSAP(
    () => {
      const el = raiz.current
      if (!el || !heroeRetirado) return
      // Si la entrada todavía corre, se termina de golpe: la retirada parte de las cartas ya colocadas y no se pisan
      entrada.current?.progress(1)
      const cartas = el.querySelectorAll('[data-carta^="heroe"]')
      if (movimientoReducido()) gsap.to(cartas, { autoAlpha: 0, duration: 0.2, ease: 'none' })
      else gsap.to(cartas, { autoAlpha: 0, y: -(plano.heroe.w * s * 0.35), duration: 0.32, ease: CURVA_GSAP, stagger: 0.03 })
    },
    { scope: raiz, dependencies: [heroeRetirado] },
  )

  // --- Fichas que viajan al bote -----------------------------------------------------------------------------------
  useGSAP(
    () => {
      const el = raiz.current
      if (!el || !vuelo) return
      const nodo = el.querySelector<HTMLElement>('[data-e="vuelo"]')
      if (!nodo) return
      if (movimientoReducido()) {
        gsap.fromTo(nodo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none', onComplete: () => { onLlegadaFichas(); onFinVuelo() } })
        return
      }
      const dx = (plano.heroePildora.x - plano.bote.x) * s
      const dy = (plano.heroePildora.y - plano.bote.y) * s
      const tl = gsap.timeline()
      tl.fromTo(nodo, { x: dx, y: dy, autoAlpha: 0, scale: 0.9 }, { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.42, ease: CURVA_GSAP })
      tl.add(onLlegadaFichas, '>-0.02')
      tl.to(nodo, { autoAlpha: 0, duration: 0.14, ease: 'none', onComplete: onFinVuelo })
    },
    { scope: raiz, dependencies: [vuelo?.id] },
  )

  // --- Las apuestas de los rivales aparecen delante de su asiento ---------------------------------------------------
  const claveApuestas = escenario.rivales.map((r) => r.apuestaBB).join(',')
  useGSAP(
    () => {
      const el = raiz.current
      if (!el) return
      const previas = apuestasPrevias.current
      const nuevas: HTMLElement[] = []
      for (const r of escenario.rivales) {
        if (r.apuestaBB > (previas[r.indice] ?? 0)) {
          const nodo = el.querySelector<HTMLElement>(`[data-e="apuesta"][data-i="${r.indice}"]`)
          if (nodo && montado.current && previas[r.indice] !== undefined) nuevas.push(nodo)
        }
        previas[r.indice] = r.apuestaBB
      }
      if (nuevas.length === 0) return
      if (movimientoReducido()) gsap.fromTo(nuevas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' })
      else gsap.fromTo(nuevas, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.26, ease: CURVA_GSAP })
    },
    { scope: raiz, dependencies: [claveApuestas] },
  )

  // --- Las fichas del bote vuelan a los ganadores -------------------------------------------------------------------
  const claveBote = premios?.map((p) => p.id).join('-') ?? ''
  useGSAP(
    () => {
      const el = raiz.current
      if (!el || !premios || premios.length === 0) return
      for (const p of premios) {
        const nodo = el.querySelector<HTMLElement>(`[data-e="premio-${p.hacia}"]`)
        if (!nodo) continue
        const destino = p.hacia === 0 ? plano.heroePildora : plano.asientos[p.hacia - 1]!
        if (movimientoReducido()) {
          gsap.fromTo(nodo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' })
          continue
        }
        const tl = gsap.timeline()
        tl.fromTo(nodo, { x: 0, y: 0, autoAlpha: 1, scale: 1 }, { x: (destino.x - plano.bote.x) * s, y: (destino.y - plano.bote.y) * s, scale: 0.9, duration: 0.5, ease: CURVA_GSAP })
        tl.to(nodo, { autoAlpha: 0, duration: 0.12, ease: 'none' })
      }
    },
    { scope: raiz, dependencies: [claveBote] },
  )

  // --- Precarga de las caras en uso ---------------------------------------------------------------------------------
  useEffect(() => {
    const enlaces: HTMLLinkElement[] = []
    for (const c of [...escenario.cartasHeroe, ...tablero]) {
      const l = document.createElement('link')
      l.rel = 'preload'
      l.as = 'image'
      l.href = rutaCarta(c, cuatroColores)
      document.head.appendChild(l)
      enlaces.push(l)
    }
    return () => enlaces.forEach((l) => l.remove())
  }, [escenario.cartasHeroe, tablero, cuatroColores])

  const fuente = letra(escena)
  const d = plano.avatar * s
  const anchoCartaTablero = plano.tablero.w * s
  const apuestasRivales = escenario.rivales.reduce((t, r) => t + r.apuestaBB, 0)
  const boteCentral = Math.max(0, boteBB - apuestasRivales)
  const centroBote = aPantalla(escena, plano.bote)
  const cajaBote = cajaFichas(plano.fichaBote * s)
  const pildoraBote = aPantalla(escena, plano.botePildora)
  const pildoraHeroe = aPantalla(escena, plano.heroePildora)
  const logo = aPantalla(escena, plano.logo)
  const avatarHeroe = rutaAvatar(heroe.nombre, 0)
  const cajaPos = { left: centroBote.x - cajaBote.w / 2, top: centroBote.y - cajaBote.h * 0.58 }

  return (
    <div
      ref={raiz}
      className={`mesa mesa--${plano.modo}`}
      style={{ '--s': s } as CSSProperties}
      role="img"
      aria-label={`Mesa de póker. Bote de ${fmtBB(boteBB)} BB. Tus cartas: ${escenario.cartasHeroe.join(' y ')}. Tablero: ${tablero.join(', ') || 'sin cartas'}.`}
    >
      <img
        className="mesa__fondo"
        src={plano.src}
        width={plano.W}
        height={plano.H}
        alt=""
        decoding="async"
        fetchPriority="high"
        draggable={false}
        style={{ left: escena.ox, top: escena.oy, width: plano.W * s, height: plano.H * s }}
      />

      <div
        className="mesa__logo"
        style={{ left: logo.x - (plano.logo.w * s) / 2, top: logo.y, width: plano.logo.w * s, fontSize: plano.logo.w * s * 0.15 }}
        aria-hidden="true"
      >
        NEXT CHIP
      </div>

      {/* Rivales (de izquierda a derecha) */}
      {escenario.rivales.map((r, i) => {
        const p = aPantalla(escena, plano.asientos[i]!)
        return <Asiento key={r.indice} datos={r} indiceRival={i} x={p.x} y={p.y} d={d} fuente={fuente} anchoViewport={escena.anchoViewport} cuatroColores={cuatroColores} />
      })}

      {/* Apuestas de los rivales delante de su asiento */}
      {escenario.rivales.map((r, i) =>
        r.apuestaBB > 0 ? (
          <ApuestaRival key={`ap-${r.indice}`} indice={r.indice} monto={r.apuestaBB} centro={aPantalla(escena, plano.apuestas[i]!)} ancho={plano.fichaApuesta * s} fuente={fuente} />
        ) : null,
      )}

      {/* Tablero: 5 huecos; flop = 1-3, turn = 4, river = 5 */}
      {Array.from({ length: HUECOS_TABLERO }, (_, i) => {
        const p = aPantalla(escena, { x: plano.tablero.cx[i]!, y: plano.tablero.yb })
        return i < tablero.length ? (
          <Carta
            key={`t-${i}-${tablero[i]}`}
            carta={tablero[i]!}
            ancho={anchoCartaTablero}
            inclinacion={plano.tablero.inclinacion}
            cuatroColores={cuatroColores}
            x={p.x}
            y={p.y}
            dato={`tablero-${i}`}
            etiqueta={`${['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta'][i]} carta del tablero: ${tablero[i]}`}
            className="carta--tablero"
            style={{ zIndex: 2 }}
          />
        ) : (
          <HuecoCarta key={`h-${i}`} ancho={anchoCartaTablero} inclinacion={plano.tablero.inclinacion} x={p.x} y={p.y} />
        )
      })}

      {/* Bote: fichas y píldora */}
      <div className="bote" data-e="bote">
        <Fichas monto={boteCentral} ancho={plano.fichaBote * s} style={cajaPos} />
        <div className="pildora pildora--bote" style={{ left: pildoraBote.x, top: pildoraBote.y, '--f': `${fuente * 1.12}px` } as CSSProperties}>
          <span className="pildora__rotulo">POT</span>
          <strong className="pildora__valor"><Cifra valor={boteBB} formato={fmtBB} /> BB</strong>
        </div>
      </div>

      {vuelo ? <Fichas key={vuelo.id} dato="vuelo" monto={vuelo.monto} ancho={plano.fichaBote * s} className="fichas--vuelo" style={cajaPos} /> : null}

      {premios?.map((p) => (
        <Fichas key={`premio-${p.id}`} dato={`premio-${p.hacia}`} monto={p.monto} ancho={plano.fichaBote * s} className="fichas--vuelo" style={cajaPos} />
      ))}

      <CartasHeroe cartas={escenario.cartasHeroe} escena={escena} cuatroColores={cuatroColores} />

      {/* Jugador: nombre y stack sobre el riel */}
      <div
        className={`pildora pildora--heroe ${heroeRetirado ? 'pildora--retirada' : ''}`}
        style={{ left: pildoraHeroe.x, top: pildoraHeroe.y, '--f': `${fuente}px` } as CSSProperties}
        data-e="heroe-pildora"
      >
        {avatarHeroe ? <img className="pildora__avatar" src={avatarHeroe} width={64} height={64} alt="" decoding="async" /> : null}
        <span className="asiento__nombre">{heroe.nombre}</span>
        <span className="asiento__stack"><Cifra valor={stackHeroeBB} formato={fmtBB} /> BB</span>
        {heroe.esBoton ? <span className="asiento__boton asiento__boton--en-linea" aria-label="Botón del repartidor">D</span> : null}
      </div>
    </div>
  )
}

function ApuestaRival({ indice, monto, centro, ancho, fuente }: { indice: number; monto: number; centro: { x: number; y: number }; ancho: number; fuente: number }) {
  const caja = cajaFichas(ancho)
  return (
    <div className="apuesta" data-e="apuesta" data-i={indice}>
      <Fichas monto={monto} ancho={ancho} style={{ left: centro.x - caja.w / 2, top: centro.y - caja.h * 0.58 }} />
      <span className="apuesta__monto" style={{ left: centro.x, top: centro.y + ancho * 0.62, fontSize: fuente * 0.92 }}>{fmtBB(monto)} BB</span>
    </div>
  )
}
