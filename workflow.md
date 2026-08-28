# Flujo editorial

## Estados

```text
detectado → candidato → investigado → listo_para_guion → guion_borrador → publicado
                  ↘ descartado
```

- `detectado`: señal encontrada, todavía sin identidad o fuentes suficientes.
- `candidato`: caso real identificado, con dos fuentes y footage probable.
- `investigado`: cronología y footage comprobados.
- `listo_para_guion`: existe suficiente material factual y visual.
- `guion_borrador`: guion escrito y fact-check realizado.
- `publicado`: marcado manualmente por los socios.
- `descartado`: no alcanza el mínimo o presenta un riesgo editorial insalvable.

## Actualización semanal

1. Leer `data/editorial-cases.json`, `data/weekly-cases.json`, `casos/` y `guiones/` para evitar duplicados.
2. Buscar sucesos de los últimos 7–14 días y oportunidades futuras de los próximos 1–3 meses: aniversarios, estrenos documentales, reapertura de casos, juicios, nuevas búsquedas o publicación de material.
3. Explorar fuentes informativas, organismos oficiales, archivos audiovisuales, YouTube, Reddit y señales públicas de redes sociales. Una publicación social solo es una señal, no una confirmación.
4. Dar nombre real al caso. Si no puede identificarse, dejarlo como `detectado` y no mostrarlo en el dashboard.
5. Verificar enlaces y scoring.
6. Guardar un informe `informes-semanales/YYYY-MM-DD.md` con selección, descartes y recomendaciones.
7. Guardar una ficha por candidato.
8. Sincronizar el dashboard solo cuando se solicite o cuando la petición incluya «actualización semanal completa».

## Investigación automática al pedir un guion

No pedir al usuario que apruebe una investigación. Aplicar esta secuencia:

1. Buscar el expediente existente.
2. Comprobar si tiene dos fuentes independientes, cronología, controversias y footage verificable.
3. Completar automáticamente lo que falte.
4. Guardar o actualizar el expediente.
5. Escribir el guion.
6. Entregar una nota breve con duración, fuentes principales y posibles riesgos; no interrumpir el flujo con una aprobación.

## Decisión de duración

- 2–3 minutos: un único incidente, pocos protagonistas y giro central claro.
- 3–5 minutos: cronología con antecedentes y dos o tres giros.
- 5–6 minutos: varias versiones, investigación o consecuencias relevantes.
- 6–8 minutos: historia densa con etapas diferenciadas y suficiente footage para sostenerlas.

No alargar una historia con contexto genérico. Si solo existen 90 segundos de hechos sólidos, recomendar no producirla o buscar otra perspectiva documentada.

