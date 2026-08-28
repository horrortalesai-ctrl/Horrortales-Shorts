# Scoring HorrorTales

Calcular tres dimensiones entre 0 y 100 y aplicar penalizaciones.

```text
score_total = 40 % viralidad + 40 % footage + 20 % encaje narrativo − penalizaciones
```

## Viralidad

- Hook comprensible sin contexto: 0–20.
- Rareza, contradicción o pregunta abierta: 0–20.
- Emoción legítima —miedo, asombro, tensión o supervivencia—: 0–20.
- Actualidad o motivo próximo para volver a hablar del caso: 0–20.
- Conversación social y reconocimiento potencial: 0–20.

## Footage

- Grabación primaria del momento o protagonista: 0–30.
- Vídeo adicional —TV, CCTV, bodycam, entrevistas—: 0–20.
- Fotografías, documentos, mapas o archivo: 0–15.
- Variedad visual suficiente para toda la duración: 0–20.
- Accesibilidad, calidad y trazabilidad de los enlaces: 0–15.

No asignar más de 70 si solo se han encontrado miniaturas, recopilaciones sin procedencia o menciones de un vídeo que ya no está disponible.

## Encaje narrativo

- Protagonista y objetivo claros: 0–20.
- Cronología entendible: 0–20.
- Escalada de tensión: 0–20.
- Dos o más giros documentados: 0–20.
- Cierre fuerte, resolución o pregunta real: 0–20.

## Penalizaciones

- −10: dependencia importante de una única fuente secundaria.
- −15: footage principal no verificado.
- −15: teoría viral fácilmente confundible con un hecho.
- −20: identidad del caso dudosa o título genérico.
- −20: riesgo de difamación, explotación o daño difícil de mitigar.
- Descartar: caso inventado, fuente falsa, identidad imposible de confirmar o atractivo basado únicamente en material gráfico.

## Umbrales

- 85–100: prioridad alta.
- 75–84: buen candidato.
- 68–74: mantener en observación.
- Menos de 68: descartar salvo indicación del usuario.

Para entrar en el dashboard se exige `score_total >= 75`, `footage >= 70`, nombre identificable y dos fuentes verificadas.

