---
name: horrortales-editorial
description: Descubrir, puntuar, investigar y documentar casos reales con footage, además de escribir y revisar guiones narrativos de 2 a 8 minutos para HorrorTales. Usar cuando el usuario pida buscar casos virales o tendencias, realizar una actualización semanal, investigar una historia, localizar vídeos o fotos, generar un guion, revisar su veracidad o sincronizar casos con el dashboard.
---

# HorrorTales Editorial

## Principio central

Trabajar como investigador y guionista en un único flujo. Si se solicita un guion, completar silenciosamente la investigación que falte y entregar el guion sin pedir que el usuario apruebe pasos intermedios.

No usar memoria como fuente. No inventar hechos, nombres, citas, diagnósticos, motivaciones ni enlaces.

## Elegir el flujo

- **Descubrimiento o actualización semanal:** leer `references/workflow.md`, `references/scoring.md`, `references/source-footage-policy.md` y `references/data-contract.md`.
- **Investigación de un caso:** leer `references/workflow.md`, `references/source-footage-policy.md` y `references/data-contract.md`.
- **Creación o revisión de guion:** leer `references/script-style.md`, `references/style-examples.md` y `references/source-footage-policy.md`. Leer también la investigación existente; si falta o es débil, investigarla primero.
- **Actualización del dashboard:** leer `references/data-contract.md` y ejecutar las validaciones del repositorio.

## Descubrir casos

1. Revisar los casos existentes para evitar duplicados.
2. Buscar tanto sucesos recientes como casos de archivo reactivados por aniversarios, documentales, juicios, nuevos hallazgos o tendencias sociales.
3. Obtener entre 12 y 20 candidatos salvo que el usuario indique otra cantidad.
4. Mantener variedad: ninguna categoría debe superar el 40 % de una selección normal.
5. Confirmar el nombre identificable del caso y al menos dos fuentes antes de guardarlo.
6. Puntuar con la rúbrica de `references/scoring.md`.
7. Guardar candidatos en `casos/candidatos/` y el resumen en `informes-semanales/` usando las plantillas de `assets/templates/`.

## Investigar un caso

1. Crear `casos/investigados/<slug>/investigacion.md`, `fuentes.md` y `footage.md`.
2. Reconstruir la cronología con hechos respaldados por enlaces.
3. Identificar contradicciones y atribuir cada versión.
4. Clasificar cada afirmación como confirmada, testimonio, hipótesis, rumor o refutada.
5. Verificar directamente cada recurso audiovisual y anotar si es primario, periodístico, recreación o recopilación.
6. Recomendar duración según hechos útiles, no según una duración prefijada.

## Escribir un guion

1. Investigar automáticamente si el expediente no cumple los mínimos.
2. Elegir 2–3, 3–5, 5–6 o 6–8 minutos según la historia.
3. Redactar un hook de hasta 3 segundos basado en un hecho y una imagen verificables.
4. Narrar cronológicamente, revelando la información con intención.
5. Incluir rehooks naturales cada 25–40 segundos, no frases genéricas intercambiables.
6. Añadir indicaciones visuales breves vinculadas al inventario de footage.
7. Cerrar con la resolución documentada o con la pregunta real que sigue abierta.
8. Guardar en `guiones/borradores/<slug>.md`; no mover a `guiones/finales/` sin aprobación explícita.

## Sincronizar el dashboard

1. Añadir solo casos con estado `investigado` o `listo_para_guion` a `data/editorial-cases.json`.
2. Ejecutar `npm run editorial:sync` y después `npm run check`.
3. Comprobar que los enlaces, puntuaciones y campos obligatorios sean válidos.
4. No sobrescribir favoritos locales ni guiones finales.

## Criterio de finalización

Una tarea no está terminada hasta que los archivos estén guardados, las fuentes aparezcan junto a sus afirmaciones, el footage esté descrito y las validaciones relevantes hayan pasado.

