# Contratos de la fase de jugabilidad

> Lo escribe el orquestador. Todo agente lo lee **antes** de tocar código. Si algo de aquí no alcanza o choca con lo que encuentras, no decidas en silencio: márcalo como `SUPUESTO:` en tu reporte final.
> Diseño del juego: `docs/GDD.md` y `docs/features/*/design.md`. Reglas de redacción y del proyecto: `BITACORA_CONSTRUCCION.md` (sección "Reglas para todos los agentes").

## 1. Reglas comunes

- **Todo en español**: textos de pantalla, comentarios, nombres de archivos nuevos y de funciones. Los términos de póker van en inglés (Fold, Check, Call, Bet, Raise, flop, turn, river, all-in, bb).
- Nunca "jugada óptima", "correcta", "GTO" ni "hace sentido". La red es **"lo que harían jugadores de élite"**.
- **Calidad de estudio:** materiales con volumen, luz y profundidad, como en `.impeccable/mocks/decision/comp-b.png`. Nada de neón, de dorado chillón ni de interfaz plana. Animaciones de unos 0.3 s, que se reducen con `prefers-reduced-motion`.
- **No hacer commit ni push.** Lo hace el orquestador después de auditar.
- **No tocar** `data/`, `models/` ni `src/motor/` (el motor ya pasó la prueba golden). Si necesitas algo nuevo del motor, créalo en tu carpeta y úsalo desde ahí; si de verdad hace falta cambiar el motor, repórtalo sin hacerlo.
- **Dependencias nuevas:** solo el agente del curso puede agregar `marked` (versión exacta). Nadie más edita `package.json`.
- **Solo tus carpetas** (sección 2). Si un archivo de otro frente te estorba (por ejemplo, un error de tipos en algo que no es tuyo), no lo arregles: menciónalo en el reporte.
- **Pruebas:** `npm test` (Vitest) y `npm run build` deben pasar al terminar, salvo errores en archivos de otros frentes, que se reportan.
- **Ver la app:** `npm run dev` y Playwright (skill `playwright-cli`). Revisa siempre en 390×844 (celular) y 1440×900 (PC).
- **Sin cuentas:** nombre o invitado; el progreso vive en `localStorage` (envuelto en try/catch).
- No uses el navegador Chrome del usuario. Solo el frente de recursos lo usa.

## 2. Frentes y dueños de carpetas

| Frente | Carpetas y archivos que son suyos |
|---|---|
| **Juego** (mano completa) | `src/juego/**`, `src/ui/mesa/**`, `src/ui/PantallaMesa.tsx`, `src/ui/datos/**`, `src/ui/estilos.css` |
| **App** (estructura, portada, bienvenida, inicio, progreso, sonido) | `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/app/**`, `src/pantallas/**`, `src/progreso/**`, `src/sonido/**`, `src/modulos/*/Pantalla*.tsx` (solo como marcadores de posición) |
| **Curso** (lectura del contenido) | `src/curso/**`, `scripts/curso/**`, `package.json` (solo para `marked`) |
| **Contenido** (casos y evaluaciones) | `contenido_modulo1/casos/**`, `contenido_modulo1/evaluaciones/**` |
| **Recursos** (imágenes y sonidos) | `public/assets/portada/**`, `public/assets/bienvenida/**`, `public/sonidos/**`, `public/assets/originales_ia/**`, `public/assets/PROMPTS.md` |

Los módulos Retador, Instructor y Analista se construyen después, en `src/modulos/<módulo>/**`.

## 3. Interfaces entre frentes

### 3.1 Navegación (la hace App)

`src/app/navegacion.ts`, sin librerías y basada en `location.hash`, para que recargar deje al jugador donde estaba:

```ts
export type Ruta =
  | { pantalla: 'portada' }
  | { pantalla: 'bienvenida' }
  | { pantalla: 'inicio' }
  | { pantalla: 'retador' }
  | { pantalla: 'instructor'; leccion?: string }   // id de lección, p. ej. 'M04_L02'
  | { pantalla: 'analista'; mano?: number }
  | { pantalla: 'ajustes' }
  | { pantalla: 'creditos' }
export function useRuta(): [Ruta, (r: Ruta) => void]
```

- Cada módulo es una pantalla con la firma `export default function PantallaX(props: { onSalir: () => void })` en `src/modulos/{retador,instructor,analista}/Pantalla{Retador,Instructor,Analista}.tsx`.
- App crea esos tres archivos como marcadores de posición con el mismo estilo, que digan "Próximamente".
- Los parámetros `?mano=<key>&d=<idx>&fuente=banco` de la mesa actual deben seguir funcionando (son para revisar). Si existen, App abre directo la mesa de revisión.

### 3.2 Progreso (lo hace App)

`src/progreso/progreso.ts` guarda todo en una sola clave de `localStorage`, `nextchip.v1`, con `version: 1`:

```ts
export interface Perfil { nombre: string; invitado: boolean }
export interface Rango { indice: number; nombre: string; ficha: 1|5|10|25|50|100; xpMin: number; xpSiguiente: number | null }
export function rangoDe(xp: number): Rango
export function useProgreso(): {
  perfil: Perfil | null
  xp: number
  rango: Rango
  racha: { actual: number; mejor: number }
  bienvenidaVista: boolean
  ajustes: { sonido: boolean; musica: boolean; mazo4colores: boolean }
  definirPerfil(p: Perfil): void
  sumarXP(puntos: number): { subioDeRango: boolean; rango: Rango }   // también marca la racha de hoy
  marcarBienvenidaVista(): void
  cambiarAjuste<K extends keyof Ajustes>(k: K, v: Ajustes[K]): void
  leerSeccion<T>(clave: 'retador' | 'instructor' | 'analista'): T | null
  guardarSeccion<T>(clave: 'retador' | 'instructor' | 'analista', datos: T): void
}
```

- Los umbrales de rango y las reglas de racha están en `docs/features/progreso/design.md`.
- Cada módulo define el tipo de su propia sección; Progreso solo la guarda.
- El ajuste del mazo de 4 colores **ya existe** en la mesa (clave propia de `localStorage`). App lo migra a Progreso y la mesa lo lee de una prop o de un contexto que App le pasa; acuérdalo leyendo `src/ui/PantallaMesa.tsx` y sin romperlo.

### 3.3 Sonido (lo hace App; los archivos los pone Recursos)

`src/sonido/sonido.ts`: `reproducir(evento: EventoSonido): void`. Respeta el ajuste `sonido`, no falla si falta un archivo y precarga en el primer toque del usuario.

```ts
export type EventoSonido =
  | 'carta' | 'volteo' | 'ficha' | 'fichas_bote' | 'check' | 'fold'
  | 'boton' | 'puntos_alto' | 'puntos_medio' | 'puntos_bajo'
  | 'ganar_bote' | 'subir_rango' | 'fin_sesion'
```

Los archivos son `public/sonidos/<evento>.mp3`. La música queda fuera por ahora (el ajuste existe y viene apagado).

### 3.4 Mesa en vivo (la hace Juego)

`src/juego/index.ts` exporta:

```ts
export function crearAzar(semilla: number): () => number          // número pseudoaleatorio en [0, 1), repetible
export interface LecturaDecision {
  equityPct: number; equityMinimaPct: number | null
  elite: { fold: number; checkCall: number; betRaise: number }    // probabilidades de la red, suman 1
  codigo: string                                                   // CodigoLectura de src/motor/lectura.ts
}
export interface DecisionHeroe {
  accion: 'f' | 'cc' | 'cbr'; hasta?: number                      // hasta: total en la calle, en fichas
  calle: 0 | 1 | 2 | 3; posicion: 'UTG'|'HJ'|'CO'|'BTN'|'SB'|'BB'
  lectura: LecturaDecision
}
export interface ResultadoMano {
  netoBB: number                       // fichas ganadas (+) o perdidas (−) por el héroe
  ganadores: number[]                  // asientos
  cartas: Record<number, [string, string]>
  historial: unknown                   // lo que necesite el visor del Analista; documéntalo
}
export interface PropsMesaEnVivo {
  semilla: number                      // fija las cartas y los sorteos de los rivales
  boton: number                        // asiento del botón (rota entre manos)
  escenarioInicial?: EscenarioInicial  // para casos del Instructor: arrancar desde un estado dado
  guion?: GuionMano                    // para la mano guiada: cartas y acciones fijas, con textos de ayuda
  mostrarLecturas: 'siempre' | 'despues-de-decidir' | 'nunca'
  retroalimentacion?: (d: DecisionHeroe) => React.ReactNode        // el Retador pinta aquí los puntos que saltan
  onDecisionHeroe?: (d: DecisionHeroe) => void
  onFinMano?: (r: ResultadoMano) => void
  onSiguienteMano?: () => void
}
export function MesaEnVivo(props: PropsMesaEnVivo): React.JSX.Element
export function ManoGuiada(props: { onTerminar: () => void }): React.JSX.Element   // la mano de práctica de la bienvenida
```

- `EscenarioInicial` y `GuionMano` los define Juego y los documenta en el mismo archivo. `EscenarioInicial` debe poder construirse a partir de un estado del motor (`EstadoMano`), las cartas del héroe y el tablero, porque el frente del Curso arma los casos con el motor (ver 3.5).
- El héroe siempre se dibuja abajo, sobre el riel, como en el comp.
- La barra de acciones solo se activa cuando la lectura de esa decisión está lista, porque el Retador la necesita para puntuar.

### 3.5 Curso (lo hace Curso; el contenido lo escribe Contenido)

`src/curso/index.ts` exporta:

```ts
export interface Curso { modulos: Modulo[] }
export interface Modulo { id: string /* 'M04' */; numero: number; titulo: string; lecciones: Leccion[]; evaluacion: Pregunta[]; casos: Caso[] }
export interface Leccion { id: string /* 'M04_L02' */; modulo: number; numero: number; titulo: string; minutos: number; pantallas: Pantalla[] }
export interface Pantalla { titulo: string; html: string }          // un apartado "## ..." de la lección, ya convertido
export interface Pregunta { id: string; leccion: string; enunciado: string; formato: 'opciones' | 'numero'; opciones?: string[]; correcta: string | number; tolerancia?: number; unidad?: string; explicacion: string }
export interface Caso { id: string; titulo: string; tipo: 'matematica' | 'concepto'; /* resto de campos de REQUISITOS §5 */ }
export function cargarCurso(): Promise<Curso>
export function construirEscenarioCaso(c: Caso): { estado: EstadoMano; asientoHeroe: number; cartasHeroe: [string, string]; tablero: string[] }
export function validarCaso(c: Caso): string[]                      // lista de errores; vacía si está bien
```

- **Lecciones:** se leen tal cual de `contenido_modulo1/curso/lecciones/MNN_LNN.md`. Están aprobadas por el usuario: **no se editan**. Cada `## Título` es una pantalla. La primera línea es `# N.M Título` y la segunda `*Módulo N · Lección M · X minutos*`.
- **Casos:** `contenido_modulo1/casos/MNN_casos.md`, con bloques ` ```caso ` en el formato de `contenido_modulo1/REQUISITOS_CONTENIDO_MODULO1.md` §5. Los ids son `mNN-cMM`. Las cantidades van en bb.
- **Evaluaciones:** `contenido_modulo1/evaluaciones/MNN_evaluacion.md`, con un bloque por pregunta:

````
```pregunta
id: m04-p02
leccion: M04_L02
formato: numero
enunciado: Bote de $60, tu rival apuesta $30. ¿Qué equity necesitas para pagar?
correcta: 25
tolerancia: 1
unidad: %
explicacion: 30 ÷ (60 + 30 + 30) = 30 ÷ 120 = **25 %**.
```
````

  Con `formato: opciones` se agrega `opciones: [texto A, texto B, texto C]` y `correcta` es el texto exacto de una opción. Cada campo ocupa una sola línea; se admite markdown en línea.
