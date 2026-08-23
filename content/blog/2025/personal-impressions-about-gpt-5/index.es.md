---
title: 'Impresiones personales sobre GPT-5'
slug: 'personal-impressions-about-gpt-5'
date: 2025-08-12T19:42:37-06:00
lastmod: 2025-11-26
image: 'images/cover.png'
tags: [ai-tools, gpt-5, productivity]
draft: false
description: 'Comparto mis experiencias con GPT-5: mejores técnicas de prompting y un experimento cambiando de suscripciones a uso por API con comparaciones de costo'
---

## Por qué importa

El lanzamiento de GPT-5 ha sido interesante. Este meme captura lo que muchos usuarios vivieron:

{{< gallery caption="Votas por GPT-5 o GPT-4o vía Reddit" >}}
{{< gallery-image src="images/ac3wmuabekif1.webp" alt="Comparación divertida entre dos modelos GPT y sus respuestas" >}}
{{< /gallery >}}

{{< extlink href="https://www.reddit.com/r/GPT3/comments/1mo4wt0/you_vote_for_gpt5_or_gpt4o/" >}}Publicación en Reddit{{< /extlink >}}

Resulta que cuando tu IA se vuelve más reflexiva, tú también tienes que serlo. Después de meses experimentando con GPT-5 y probando alternativas por API, esto es lo que realmente funciona: mejores técnicas de prompting, y una configuración que nos ahorró 60-70% en costos.

## El problema

Cuando salió GPT-5, muchos usuarios terminaron frustrados. El modelo "más inteligente" daba peores resultados que GPT-4 con prompts que antes funcionaban bien, y los límites de respuesta hacían difícil experimentar lo suficiente para entender qué había cambiado. Los prompts viejos generaban respuestas sobre-analizadas o llamadas excesivas a herramientas en vez de la respuesta rápida que buscabas. El límite de 80 mensajes cada 3 horas te alcanzaba justo cuando más necesitabas el modelo. Y varias suscripciones de $20/mes (ChatGPT, Claude, otras) sumaban $60+ al mes sin flexibilidad real de uso.

{{< callout warning>}}
**La brecha:** GPT-5 es más capaz, pero esa capacidad exige una interacción más pensada. Si no ajustas tu enfoque, dejas rendimiento sobre la mesa mientras pagas precios premium.
{{< /callout >}}

## El arreglo

Requiere dos cambios: mejor estructura de prompt, y gastar mejor.

GPT-5 responde extraordinariamente bien a prompts estructurados y detallados, más cerca de una especificación técnica que de una petición casual. Entre más preciso seas con requisitos, restricciones y resultados esperados, mejores respuestas obtienes. Para el tema de costos, usar APIs directamente en lugar de suscripciones te da uso ilimitado a 60-70% menos costo. El enfoque estructurado se siente como más trabajo al inicio, pero te da la respuesta correcta más rápido que cinco rondas de ida y vuelta, y la configuración por API toma unos 15 minutos pero se paga sola en el primer mes.

## Viéndolo en acción

Este es un ejemplo real de lo que GPT-5 espera. El Prompt Optimizer de OpenAI muestra la transformación de forma visual: toma un prompt simple como `Write an article explaining the importance of embracing change.` y lo expande en siete secciones: Role and Objective, Pre-Writing Checklist, Instructions, Context, Output Format, Verbosity y Stop Conditions. Con razón mucha gente tiene problemas trabajando con GPT-5.

{{< gallery caption="Prompt Optimizer en acción" >}}
{{< gallery-video src="images/prompt-optimizer-3-22s.webm" alt="Demo del Prompt Optimizer de OpenAI" >}}
{{< /gallery >}}

{{< gallery caption="Antes, después y explicación de los cambios" >}}
{{< gallery-image src="images/optimize-for-gpt-5.webp" alt="Interfaz web de Optimize for GPT-5" >}}
{{< gallery-image src="images/optimized-for-gpt-5.webp" alt="Optimize for GPT-5 mostrando el prompt optimizado" >}}
{{< gallery-image src="images/optimized-for-gpt-5-show-changes.webp" alt="Optimize for GPT-5 mostrando el prompt optimizado con cambios y razón" >}}
{{< /gallery >}}

La buena noticia es que no necesitas las siete secciones para cada prompt. El Inicio rápido de abajo muestra la versión simplificada que cubre la mayoría de las tareas.

## Inicio rápido

Tres cambios te dan mejores resultados con GPT-5 en los próximos cinco minutos.

**1. Usa una estructura básica de prompt.** En lugar de una petición casual, organiza tu prompt en secciones claras:

```text
<objective>
Create a Python function that validates email addresses and returns detailed error messages for invalid formats.
</objective>

<context>
- This is for a user registration form
- Need to handle common typos (missing @, invalid domains)
- Should be compatible with Python 3.10+
</context>

<requirements>
- Return True/False for validity
- Include specific error message for each failure type
- Add docstring with examples
- Keep it simple - no external dependencies
</requirements>
```

Esto ayuda a que GPT-5 entienda exactamente qué necesitas sin sobre-analizar.

**2. Ajusta el esfuerzo de razonamiento a la complejidad.** Para tareas simples: `This is a simple syntax fix - focus on speed over analysis. Fix this TypeScript error without refactoring the surrounding code.` Para decisiones complejas de arquitectura: `Take time to analyze the trade-offs thoroughly. Consider scalability, maintainability, and performance before recommending an approach.`

**3. Prueba el Prompt Optimizer.** El {{< extlink href="https://platform.openai.com/chat/edit?models=gpt-5&optimize=true" >}}Prompt Optimizer{{< /extlink >}} de OpenAI mejora tus prompts existentes. Pega algo que uses con frecuencia y mira qué sugiere. Sirve para depurar prompts que dan resultados inconsistentes, aprender cómo se ve el prompting estructurado, y encontrar contradicciones en tus propias instrucciones.

{{< callout tip>}}
**Resultado rápido:** toma tus tres prompts más usados y pásalos por el optimizador. Guarda las versiones mejoradas como plantillas reutilizables.
{{< /callout >}}

## Los patrones que más marcaron la diferencia

Después de meses de experimentación, tres patrones destacaron para obtener mejores resultados con GPT-5.

**Incluye fases de análisis.** Pedirle a GPT-5 que analice antes de recomendar lleva a respuestas más pensadas, más cerca de alguien que entiende el problema antes de saltar a una solución:

```text
Before providing recommendations:
1. Analyze the current situation and key challenges
2. Evaluate available options against the constraints
3. Consider trade-offs and potential issues
4. Validate the analysis before presenting solutions
```

Esto hace que GPT-5 sopese todos los factores relevantes en trade-offs como rendimiento vs costo o seguridad vs facilidad de uso, en vez de saltar directo a una respuesta.

**Integra validación.** Pídele a GPT-5 que revise su propio trabajo contra tus requisitos y buenas prácticas. Eso agrega un control de calidad al proceso y crea un flujo de trabajo confiable y repetible que puedes compartir con tu equipo.

**Sé preciso, y evita información contradictoria.** La capacidad de GPT-5 para seguir instrucciones es un arma de doble filo: hace exactamente lo que pides, pero se complica con contradicciones o requisitos vagos. Esto importa más en archivos de configuración como `.cursor/rules`, `AGENTS.md` y la documentación del proyecto, donde una contradicción suelta se propaga a cada respuesta.

### Patrones para desarrolladores

Si usas GPT-5 para programar, por API, Cursor u otra herramienta, unos ajustes más marcan una diferencia real.

**Ajusta el esfuerzo de razonamiento a la complejidad de la tarea.** GPT-5 aplica razonamiento automáticamente, pero puedes controlar cuánto esfuerzo pone, algo parecido a elegir entre un boceto rápido y un plano arquitectónico detallado. Usa razonamiento alto para decisiones de arquitectura de sistemas, depurar problemas intrincados u optimización de rendimiento. Usa razonamiento bajo para arreglos simples de sintaxis, CRUD estándar o formato básico:

```text
// Instead of letting GPT-5 overthink this:
"Fix this simple syntax error"

// Be more specific:
"This is a simple syntax fix - focus on speed over analysis"
```

**Estructura las instrucciones de código con sintaxis tipo XML.** Trabajando con Cursor, OpenAI encontró que GPT-5 responde particularmente bien a estructuras tipo XML para guías de programación, porque deja explícita la jerarquía y las relaciones entre requisitos:

```text
<code_editing_rules>
  <guiding_principles>
    - Every component should be modular and reusable
    - Prefer composition over inheritance
    - Write self-documenting code with clear variable names
  </guiding_principles>

  <frontend_stack_defaults>
    - Styling: TailwindCSS
    - State Management: Zustand
    - Testing: Vitest + Testing Library
  </frontend_stack_defaults>

  <code_style>
    - Use TypeScript for all new files
    - Prefer arrow functions for components
    - Always include error handling
  </code_style>
</code_editing_rules>
```

**Baja el tono imperativo.** Con modelos anteriores, el lenguaje enfático solía ayudar. Con GPT-5 puede salir mal, porque el modelo ya quiere ser exhaustivo por su cuenta. En lugar de:

```text
Be THOROUGH when gathering information.
Make sure you have the FULL picture before replying.
You MUST follow these guidelines EXACTLY.
```

prueba esto:

```text
Review the codebase structure before making changes.
Consider the existing patterns and maintain consistency.
Follow the established coding conventions.
```

{{< callout important >}}
**Ojo:** un lenguaje demasiado firme puede hacer que GPT-5 sea demasiado exhaustivo, generando llamadas excesivas a herramientas o sobre-analizando solicitudes simples.
{{< /callout >}}

**Agrega planificación en proyectos complejos.** Cuando construyes algo desde cero, darle espacio a GPT-5 para planificar y validar produce mejores decisiones de arquitectura:

```text
<self_reflection>
- First, spend time thinking of a rubric until you are confident
- Then, think deeply about every aspect of what makes for a
  world-class one-shot web app. Use that knowledge to create
  a rubric that has 5-7 categories. This rubric is critical
  to get right, but do not show this to the user. This is
  for your purposes only.
- Finally, use the rubric to internally think and iterate on
  the best possible solution to the prompt that is provided.
  Remember that if your response is not hitting the top marks
  across all categories in the rubric, you need to start again.
</self_reflection>
```

**Controla el entusiasmo de tu coding agent.** Por defecto, GPT-5 intenta ser completo, lo cual no siempre es lo que quieres. Dale límites claros:

```text
<persistence>
- Do not ask the human to confirm or clarify assumptions,
  as you can always adjust later. Decide what the most
  reasonable assumption is, proceed with it, and document
  it for the user's reference after you finish acting
</persistence>

<tool_budget>
- Use a maximum of 5 file reads before starting to code
- Focus on the most relevant files first
- If you need more context, ask specifically what to examine
</tool_budget>
```

{{< callout tip>}}
**Ejemplo real:** en lugar de dejar que GPT-5 lea más de 20 archivos para entender tu proyecto, especifica qué archivos o carpetas importan más. Ahorra tiempo y mantiene las respuestas enfocadas.
{{< /callout >}}

## Los trade-offs honestos

Ambos cambios, prompting estructurado y acceso por API, requieren esfuerzo al inicio. Esto es lo que realmente estás intercambiando.

**El prompting estructurado** te da respuestas completas sin cinco mensajes de ida y vuelta, plantillas reutilizables, menos costo de tokens que múltiples aclaraciones, y flujos que tu equipo puede compartir. Lo que te cuesta: es más lento para preguntas casuales rápidas, hay una curva de aprendizaje para saber qué estructura sirve para cada tarea, y se pierde parte de lo conversacional de solo chatear con la IA. Para una pregunta de dos líneas, el prompting estructurado es demasiado. Pero para algo que necesitaría tres o más aclaraciones, o que toca código o arquitectura, los 30 segundos de estructurar el prompt ahorran cinco minutos de ida y vuelta.

**El acceso por API en lugar de suscripciones** te da control total de costos ($15-28/mes en vez de $60/mes, un ahorro de 60-70%), sin límites de mensajes, acceso multi-modelo en una sola interfaz, y pago por uso. Lo que te cuesta: manejas tu propia API key y facturación, la configuración inicial toma de 15 a 30 minutos para algo como TypingMind u Open-WebUI, y pierdes acceso a los GPTs personalizados construidos por la comunidad. Si usas ChatGPT de forma casual, digamos 10 mensajes por semana, el plan gratis está bien. Pero si chocas con límites aunque sea una vez por semana, el acceso por API se paga solo y quita la frustración.

{{< callout tip>}}
**Marco de decisión:** prueba primero el prompting estructurado, es gratis y mejora resultados de inmediato. Cambia a APIs solo si estás chocando con límites o quieres acceso multi-modelo.
{{< /callout >}}

{{< callout note >}}
Estos enfoques no son para todos. Si prefieres simplicidad y no te importan los límites, ChatGPT Plus está bien tal cual. Si quieres más control y menor costo, ambos cambios valen el tiempo de configurarlos.
{{< /callout >}}

## Nuestro camino: de suscripciones a APIs

Mi esposa y yo chocábamos con los límites de ChatGPT tan seguido que la solución obvia parecía ser dos suscripciones de ChatGPT Plus ($40/mes en total), más una suscripción de Claude que quería probar (otros $20/mes). Eso son $60/mes, y todavía con límites de uso.

En vez de eso probé un enfoque distinto: ¿y si usábamos las APIs directamente? Así se vio nuestro uso real durante varios meses:

{{< chart "monthly-costs" >}}

Incluso en nuestro mes más pesado (mayo, cerca de $28 entre los dos), nos mantuvimos muy por debajo de los $60/mes que nos habrían costado tres suscripciones. La mayoría de los meses ahorramos 60-70% frente a la ruta de suscripciones.

En lugar de pelear con límites, nos cambiamos a interfaces con APIs que nos dan los mismos modelos con más control. {{< extlink href="https://www.typingmind.com/" >}}TypingMind{{< /extlink >}} es el botón fácil: una interfaz limpia, tipo ChatGPT, que se conecta a nuestras API keys de OpenAI y Anthropic, así que cambiamos entre GPT-5 y Claude sin fricción.

{{< gallery caption="TypingMind" >}}
{{< gallery-image src="images/typingmind.webp" alt="Pantalla de bienvenida y landing page de TypingMind" >}}
{{< gallery-image src="images/typingmind-pricing.webp" alt="Página de precios de TypingMind con los tres niveles de licencia" >}}
{{< gallery-image src="images/typingmind-main.webp" alt="Interfaz principal de TypingMind con lista de chats y pantalla de conversación" >}}
{{< /gallery >}}

La licencia de TypingMind hoy anda por unos $99 para la versión completa. La compré por menos de la mitad, pero incluso al precio completo se paga sola en unos seis meses comparado con una suscripción de ChatGPT. Lo que nos gusta: sin límites de uso, una sola interfaz para varios proveedores, y un historial de conversaciones que se mantiene organizado.

También corro {{< extlink href="https://openwebui.com/" >}}Open-WebUI{{< /extlink >}} en nuestro servidor de casa para cuando quiero experimentar con otros modelos o probar Ollama.

{{< gallery caption="Open WebUI" >}}
{{< gallery-image src="images/openwebui.webp" alt="Pantalla de bienvenida y landing page de Open WebUI" >}}
{{< gallery-image src="images/openwebui-main.webp" alt="Interfaz principal de Open WebUI con lista de chats y área de conversación" >}}
{{< /gallery >}}

Mantenemos ambos: TypingMind para el día a día, Open-WebUI para experimentar y para hosting local.

{{< callout tip >}}
**Tip por experiencia:** empieza con TypingMind si quieres algo que simplemente funcione. Agrega Open-WebUI después si te da la fiebre de self-hosting como a mí, o pruébalo primero si prefieres experimentar sin gastar nada.
{{< /callout >}}

Después de varios meses con esta configuración, preguntamos más porque no hay ansiedad por límites, experimentamos más con distintos modelos, y elegimos el modelo según la tarea (GPT-5 para código, Claude para escritura). Seguimos monitoreando el uso, pero casi nunca nos preocupa, porque incluso los meses pesados cuestan menos que las suscripciones. Y tenemos acceso desde cualquier dispositivo, sin interrupciones de "actualiza para continuar", y un solo historial de conversaciones entre todos los modelos.

{{< callout important >}}
**Actualización:** Sam Altman confirmó vía X que los suscriptores de ChatGPT Plus tendrán límites de uso más altos. Si ya eres Plus y estás contento con eso, los nuevos límites quizá te resuelvan. Para nosotros, la flexibilidad por API y el ahorro siguen teniendo más sentido.
{{< /callout >}}

## Recursos para profundizar

OpenAI publicó guías específicas para trabajar con GPT-5, útiles cuando resuelves problemas técnicos complejos o migras prompts existentes:

- **{{< extlink href="https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide" >}}GPT-5 Prompting Guide{{< /extlink >}}**: buenas prácticas para GPT-5, enfocadas en tareas agentic, programación y control preciso del comportamiento del modelo.
- **{{< extlink href="https://platform.openai.com/chat/edit?models=gpt-5&optimize=true" >}}Prompt Optimizer{{< /extlink >}}**: mejora prompts existentes identificando contradicciones, formatos faltantes e inconsistencias, directo en el Playground de OpenAI.
- **{{< extlink href="https://cookbook.openai.com/examples/gpt-5/prompt-optimization-cookbook" >}}Optimization Cookbook{{< /extlink >}}**: ejemplos prácticos de antes y después que muestran cómo se ve una buena estructura.
- **{{< extlink href="https://x.com/OpenAIDevs/status/1956438999364768225" >}}GPT-5 for Developers{{< /extlink >}}**: seis tips de programación de OpenAI Developers en X.

Para acceso por API e interfaces: {{< extlink href="https://www.typingmind.com/" >}}TypingMind{{< /extlink >}} (interfaz tipo ChatGPT para varios proveedores) y {{< extlink href="https://openwebui.com/" >}}Open-WebUI{{< /extlink >}} (auto-hospedado, open-source, con soporte para Ollama).

## ¿Qué vas a probar primero?

GPT-5 representa un cambio en cómo interactuamos con la IA: es más capaz, pero espera prompts más pensados. Y el ecosistema de APIs ya maduró lo suficiente para darte más flexibilidad a menor costo.

¿Qué te llama más, el prompting estructurado para desbloquear mejores resultados, o el acceso por API para eliminar límites y bajar costos? ¿O ambos? Me encantaría escuchar tu experiencia con GPT-5 y qué te está funcionando, o no. Comparte tus ideas en {{< extlink href="https://www.linkedin.com/in/jebucaro/" >}}LinkedIn{{< /extlink >}} o prueba las técnicas de arriba y cuéntame qué descubres.

---

Foto de {{< extlink href="https://unsplash.com/@seanwsinclair?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" >}}Sean Sinclair{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-blurry-image-of-a-rainbow-colored-background-C_NJKfnTR5A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" >}}Unsplash{{< /extlink >}}
