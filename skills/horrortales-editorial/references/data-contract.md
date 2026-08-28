# Contrato de datos y archivos

## Identificador y slug

- `id`: cadena estable en minúsculas y guiones, por ejemplo `lars-mittank-2014`.
- `slug`: igual al `id` salvo colisión.
- No usar un título genérico como identificador.

## Expediente investigado

Guardar en:

```text
casos/investigados/<slug>/
├── investigacion.md
├── fuentes.md
└── footage.md
```

Usar las plantillas de `assets/templates/` y conservar sus apartados aunque alguno quede marcado como «no encontrado».

## Guiones

```text
guiones/borradores/<slug>.md
guiones/finales/<slug>.md
```

Un guion debe enlazar su expediente mediante una ruta relativa.

## `data/editorial-cases.json`

Array JSON. Campos obligatorios:

```json
{
  "id": "lars-mittank-2014",
  "type": "Desaparición",
  "title": "Desaparición de Lars Mittank",
  "short": "Resumen factual de 180 a 260 caracteres.",
  "place": "Bulgaria · 2014",
  "score": 89,
  "footage": 88,
  "virality": 94,
  "fit": 92,
  "status": "investigado",
  "discoveredAt": "2026-08-23",
  "trendSignals": "CCTV del aeropuerto y renovado interés mediático",
  "sources": [
    ["Nombre de la fuente", "https://...", "Tipo y procedencia"]
  ]
}
```

Valores permitidos de `type`: `Misterio`, `Terror`, `Supervivencia`, `Crimen`, `Desaparición`, `Catástrofe`, `Perturbador`.

Valores publicables de `status`: `investigado`, `listo_para_guion`, `guion_borrador`, `publicado`.

## Sincronización

Después de editar el JSON:

```text
npm run editorial:sync
npm run check
```

El primer comando valida y genera `data/editorial-cases.js`. El segundo comprueba JavaScript, datos y versión independiente.

