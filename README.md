# HorrorTales Story Intelligence

## Sistema editorial sin clave API

Esta versión está preparada para trabajar desde un chat de Codex. Al abrir el repositorio, `AGENTS.md` carga el método HorrorTales y dirige a Codex hacia el skill, las reglas de verificación, los ejemplos de estilo y las plantillas.

Uso rápido:

1. Abre esta carpeta en Codex o en Visual Studio Code con la extensión de Codex.
2. Escribe: **«Lee AGENTS.md y realiza la actualización semanal de HorrorTales.»**
3. Para un guion, escribe: **«Investiga y crea el guion de [nombre del caso].»**
4. Codex guarda automáticamente el expediente en `casos/investigados/` y el guion en `guiones/borradores/`.
5. Ejecuta **«Sincroniza el dashboard y valida el proyecto.»** para incorporar los casos aprobados editorialmente.

Consulta [COMANDOS.md](COMANDOS.md) para copiar peticiones listas para usar.

Dashboard compartido para descubrir historias reales con potencial viral y abundante material audiovisual. Incluye 21 casos curados y una capa automática de tendencias que se renueva cada viernes.

## Qué hace esta versión

- Busca señales recientes en Google News, GDELT y comunidades temáticas de Reddit.
- Puede consultar YouTube si se configura una clave opcional.
- Prioriza titulares que mencionan vídeo, CCTV, bodycam, grabaciones, emisiones o fotografías.
- Calcula viralidad, footage potencial y encaje narrativo de 0 a 100.
- Descarta automáticamente candidatos débiles o excesivamente gráficos.
- Agrupa resultados similares y conserva hasta ocho semanas de descubrimientos.
- Mantiene los 21 casos curados aunque una actualización semanal falle.
- Publica la misma versión para ambos socios mediante GitHub Pages.

Los casos automáticos son una **cola editorial**, no hechos listos para publicar. Antes de producir un guion hay que abrir las fuentes, confirmar la identidad del caso y verificar la cronología.

## Abrir en el ordenador

Primero hay que descomprimir el ZIP completo y después abrir `index.html` con Chrome, Edge o Firefox. Si `index.html` se abre directamente dentro del ZIP, Windows puede copiarlo a una carpeta temporal sin los estilos ni los datos.

Como alternativa, `horrortales.html` es una versión independiente con todo incorporado y funciona directamente con doble clic.

Para ejecutar las comprobaciones o lanzar una búsqueda manual necesitas Node.js 20 o posterior:

```bash
npm run check
npm run discover
```

## Publicar en GitHub

1. Crea un repositorio vacío en GitHub, por ejemplo `horrortales`.
2. Sube todos los archivos de esta carpeta a la rama `main`.
3. En **Settings → Pages**, selecciona **GitHub Actions** como fuente.
4. Abre la pestaña **Actions** y ejecuta manualmente `Publicar dashboard` la primera vez.
5. Comparte con tu socio la dirección que mostrará el workflow, normalmente `https://USUARIO.github.io/horrortales/`.

Cada cambio enviado a `main` se publica automáticamente. Así los dos usáis siempre la misma versión.

## Actualización de los viernes

El workflow `.github/workflows/weekly-discovery.yml` se ejecuta cada viernes a las 07:15 UTC. El proceso:

1. Consulta fuentes de los últimos ocho días.
2. Busca señales de misterio, desaparición, crimen, supervivencia o sucesos perturbadores.
3. Exige una señal explícita de footage.
4. Puntúa y deduplica los candidatos.
5. Actualiza `data/weekly-cases.json` y `data/weekly-cases.js`.
6. Guarda el cambio en GitHub y vuelve a publicar el dashboard.

También puede ejecutarse desde **Actions → Descubrimiento semanal → Run workflow**.

## Fuentes y credenciales

Funcionan sin credenciales:

- Google News RSS.
- GDELT.
- Reddit público, cuando no bloquea consultas automatizadas.

YouTube es opcional. Para activarlo, crea una clave de YouTube Data API y guárdala en:

```text
Settings → Secrets and variables → Actions → New repository secret
Nombre: YOUTUBE_API_KEY
```

No pegues claves privadas dentro del código. TikTok e Instagram no se consultan directamente en esta versión porque sus APIs y condiciones de acceso requieren cuentas, permisos y una estrategia de cumplimiento específica. Sus tendencias pueden incorporarse posteriormente mediante proveedores autorizados o una bandeja manual.

## Scoring automático

```text
score = 40% viralidad + 40% footage + 20% encaje narrativo - penalizaciones
```

- **Viralidad:** actualidad, rareza, tensión, conversación social y fuerza del titular.
- **Footage:** menciones de vídeo, CCTV, bodycam, emisión, fotos y presencia en plataformas audiovisuales.
- **Encaje:** conflicto reconocible, protagonista o caso identificable y posibilidad de estructurar un relato.
- **Penalizaciones:** material gráfico explícito y señales editoriales de alto riesgo.

El score de footage de un caso automático expresa **probabilidad de encontrar material**, no derechos de uso ni verificación definitiva.

## Guiones de 2 a 8 minutos

El dashboard no fabrica un guion genérico. El botón **Crear guion con Codex** prepara una petición con el nombre real del caso, resumen y fuentes detectadas. Al pegarla en un chat de Codex abierto sobre este repositorio, Codex:

1. Investiga automáticamente sin solicitar una aprobación intermedia.
2. Guarda cronología, fuentes, teorías y footage.
3. Elige una duración justificada entre 2 y 8 minutos.
4. Escribe hook, narrativa cronológica, rehooks y cierre.
5. Guarda el resultado como borrador con notas de fact-check.

## Estructura

```text
AGENTS.md                      instrucciones que carga Codex
COMANDOS.md                    peticiones listas para copiar
skills/horrortales-editorial/  método, estilo, scoring y plantillas
casos/                         candidatos, expedientes y descartes
guiones/                       borradores y guiones finales
informes-semanales/            resultados de cada actualización
app.js                          dashboard y casos curados
data/editorial-cases.json       casos investigados incorporados por Codex
data/weekly-cases.json          datos semanales legibles
data/weekly-cases.js            datos que carga el navegador
scripts/discover-weekly.mjs     motor de descubrimiento
scripts/sync-editorial.mjs      valida y sincroniza casos editoriales
config/discovery.json           fuentes, búsquedas y umbrales
.github/workflows/              automatización y publicación
```

## Límites actuales

- El guardado de favoritos utiliza el navegador de cada socio y todavía no se sincroniza.
- El descubrimiento automático detecta señales; no sustituye una investigación humana.
- Sin API, la generación se ejecuta manualmente desde un chat de Codex. El botón del dashboard prepara la petición, pero no puede abrir ni controlar el chat por sí solo.
- La disponibilidad de una grabación no implica permiso para reutilizarla comercialmente.
