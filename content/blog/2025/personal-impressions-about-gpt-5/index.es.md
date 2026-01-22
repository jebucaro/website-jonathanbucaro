---
title: 'Impresiones personales sobre GPT-5'
slug: 'personal-impressions-about-gpt-5'
date: 2025-08-12T19:42:37-06:00
lastmod: 2025-11-26
image: 'images/cover.webp'
tags: [ai-tools, gpt-5, productivity]
draft: false
description: 'Comparto mis experiencias con GPT-5: mejores técnicas de prompting y un experimento cambiando de suscripciones a uso por API con comparaciones de costo'
---

## 🎯 TL;DR

GPT-5 requiere prompts más estructurados que GPT-4, pero el resultado vale la pena. Además, cambiarnos a alternativas vía API nos ahorró 60-70% frente a suscripciones de ChatGPT, y eliminó los límites de mensajes.

**Elige tu ruta:**

- 🚀 [Resultados rápidos](#quick-start) (5 min) - Mejores prompts que puedes usar ya
- 👀 [Mira la diferencia](#results) (3 min) - Antes/después optimizando prompts
- 🧠 [Ideas clave](#key-insights) (20 min) - Entender patrones de comportamiento de GPT-5
- 💰 [Nuestro camino con APIs](#our-journey) (15 min) - Cómo bajamos costos 60-70%

---

## ✨ Por qué importa (30 segundos)

El lanzamiento de GPT-5 ha sido... interesante. Este meme captura perfecto lo que muchos usuarios vivieron:

{{< gallery caption="Votas por GPT-5 o GPT-4o vía Reddit" >}}
{{< gallery-image src="images/ac3wmuabekif1.webp" alt="Comparación divertida entre dos modelos GPT y sus respuestas" >}}
{{< /gallery >}}

{{< extlink href="https://www.reddit.com/r/GPT3/comments/1mo4wt0/you_vote_for_gpt5_or_gpt4o/>" >}}Publicación en Reddit{{< /extlink >}}

Resulta que cuando tu IA se vuelve más reflexiva, tú también tienes que serlo. Después de meses experimentando con GPT-5 y probando alternativas por API, esto es lo que realmente funciona: mejores técnicas de prompting y una configuración que nos ahorró 60-70% en costos.

---

## 💡 El problema (en 60 segundos)

Cuando salió GPT-5, muchos usuarios terminaron frustrados. El modelo "más inteligente" parecía dar peores resultados que GPT-4, prompts que antes funcionaban perfecto de pronto fallaban, y los límites de respuesta hacían imposible experimentar lo suficiente como para entender qué cambió.

**El reto:**

- 🤔 **Paradoja de peores resultados**: Tus prompts antiguos terminan en respuestas sobre-analizadas o llamadas excesivas a herramientas en vez de respuestas rápidas
- ⏱️ **Frustración por límites**: Chocas con el límite de 80 mensajes cada 3 horas justo cuando más necesitas la IA, matando la productividad
- 💸 **Cansancio de suscripciones**: Varias suscripciones de $20/mes (ChatGPT, Claude, otras) se convierten en $60+ mensuales sin flexibilidad de uso

> "La primera regla de cualquier tecnología usada en un negocio es que la automatización aplicada a una operación eficiente aumentará la eficiencia."
>
> {{< extlink href="https://www.brainyquote.com/quotes/bill_gates_626239>" >}}Bill Gates{{< /extlink >}}

{{< callout warning>}}

**La brecha:** GPT-5 es más capaz, pero esa capacidad exige una interacción más pensada. Si no ajustas tu enfoque, dejas rendimiento sobre la mesa mientras pagas precios premium.

{{< /callout >}}

---

## ✅ La solución

El arreglo no es complicado, pero requiere dos cambios: mejor estructura de prompt y gastar mejor.

GPT-5 responde extraordinariamente bien a prompts estructurados y detallados. Piénsalo como escribir especificaciones técnicas claras. Entre más preciso seas con requisitos, restricciones y resultados esperados, mejores respuestas obtienes. Y para el tema de costos, usar APIs directamente en lugar de suscripciones te da uso ilimitado a 60-70% menos costo.

**Lo que obtienes:**

- ✅ **Mejores respuestas**: Prompts estructurados reducen la adivinanza y el ida y vuelta
- ✅ **Resultados más rápidos**: Ajustas el esfuerzo de razonamiento a la complejidad (sin sobrepensar arreglos simples)
- ✅ **Sin límites**: Acceso por API significa mensajes ilimitados cuando lo necesitas
- ✅ **Menor costo**: Pagas solo lo que usas (~$28/mes vs $60/mes en suscripciones)
- ✅ **Acceso multi-modelo**: Cambias entre GPT-5, Claude y otros modelos desde una sola interfaz

Este enfoque puede sentirse como más trabajo al inicio, pero ahorra tiempo al darte la respuesta correcta más rápido. Y la configuración por API toma 15 minutos, pero se paga sola en el primer mes.

---

## 📸 Viéndolo en acción

Este es un ejemplo real de lo que GPT-5 espera. El Prompt Optimizer de OpenAI muestra la transformación de forma visual.

**Transforma este prompt simple:**

```text
Write an article explaining the importance of embracing change.
```

**En este enfoque estructurado:**

El optimizador agrega siete secciones clave:

- Role and Objective
- Pre-Writing Checklist
- Instructions
- Context
- Output Format
- Verbosity
- Stop Conditions

Con razón mucha gente está teniendo problemas trabajando con GPT-5 😅

{{< gallery caption="Prompt Optimizer en acción" >}}
{{< gallery-image src="images/prompt-optimizer-3-22s.gif" alt="Demo del Prompt Optimizer de OpenAI" >}}
{{< /gallery >}}

{{< gallery caption="Antes, después y explicación de los cambios" >}}
{{< gallery-image src="images/optimize-for-gpt-5.webp" alt="Interfaz web de Optimize for GPT-5" >}}
{{< gallery-image src="images/optimized-for-gpt-5.webp" alt="Optimize for GPT-5 mostrando el prompt optimizado" >}}
{{< gallery-image src="images/optimized-for-gpt-5-show-changes.webp" alt="Optimize for GPT-5 mostrando el prompt optimizado con cambios y razón" >}}
{{< /gallery >}}

¿La buena noticia? No necesitas las siete secciones para cada prompt. La sección de Resultados rápidos muestra el enfoque simplificado que funciona para la mayoría de tareas.

---

<span id="quick-start"></span>

## 🚀 Resultados rápidos

Obtén mejores resultados con GPT-5 en los próximos 5 minutos con estos tres cambios.

### Paso 1: Usa una estructura básica de prompt

En lugar de peticiones casuales, organiza tus prompts con secciones claras:

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

Esta estructura ayuda a que GPT-5 entienda exactamente qué necesitas sin sobre-analizar.

### Paso 2: Ajusta el esfuerzo de razonamiento a la complejidad

Dile a GPT-5 cuánto pensar. Para tareas simples:

```text
This is a simple syntax fix - focus on speed over analysis.
Fix this TypeScript error without refactoring the surrounding code.
```

Para decisiones complejas de arquitectura:

```text
Take time to analyze the trade-offs thoroughly.
Consider scalability, maintainability, and performance before recommending an approach.
```

### Paso 3: Prueba el Prompt Optimizer

El {{< extlink href="https://platform.openai.com/chat/edit?models=gpt-5&optimize=true>" >}}Prompt Optimizer{{< /extlink >}} de OpenAI puede mejorar tus prompts existentes. Pega cualquier prompt que uses con frecuencia y mira cómo sugiere mejoras.

Ideal para:

- Depurar prompts que dan resultados inconsistentes
- Aprender cómo se ve el prompting estructurado
- Encontrar contradicciones en tus instrucciones

{{< callout tip>}}

**Resultado rápido:** toma tus tres prompts más usados y pásalos por el optimizador. Guarda las versiones mejoradas como plantillas reutilizables.

{{< /callout >}}

---

<span id="results"></span>

## 📊 Resultados

Esto fue lo que pasó después de implementar prompting estructurado y cambiar a acceso por API.

### Resultados con mejor prompting

#### 1. Se acabó el juego de adivinar

Con prompts estructurados, GPT-5 tiene el contexto que necesita para dar respuestas relevantes y enfocadas desde el primer intento. Ya no hay que construir contexto poco a poco con cinco mensajes de seguimiento.

#### 2. Menos llamadas innecesarias a herramientas

Al controlar el esfuerzo de razonamiento, los arreglos simples se quedan simples. GPT-5 no lee 20+ archivos cuando solo necesitas corregir un error de sintaxis.

#### 3. Procesos confiables que puedes compartir

Cuando tu enfoque es sistemático, construyes plantillas de prompt reutilizables. Funcionan de forma consistente y las puedes compartir con tu equipo.

#### 4. Mejor calidad de código para desarrolladores

La estructura tipo XML en archivos `.cursor/rules` lleva a:

- Componentes modulares y reutilizables
- Patrones consistentes entre archivos
- Manejo de errores correcto por defecto

### Ahorros de costo con APIs

Así se vio nuestro uso real de la API durante varios meses:

{{< chart "monthly-costs" >}}

**Los números:**

- **Antes**: $60/mes (2 ChatGPT Plus + 1 suscripción de Claude)
- **Ahora**: ~$15-28/mes según uso
- **Ahorro**: 60-70% mensual, con cero límites de uso

Incluso en nuestro mes más pesado (mayo, ~ $28), nos mantuvimos por debajo del costo de las suscripciones.

### Lo que ganas con APIs

- **Sin límites**: Mensajes ilimitados cuando más los necesitas
- **Acceso multi-modelo**: Cambias entre GPT-5, Claude y otros en una sola interfaz
- **Pago por uso**: ¿Mes pesado? Pagas más. ¿Mes ligero? Pagas menos.
- **Control total**: Eliges qué modelo usar según costo y desempeño

{{< callout note>}}

**Beneficio inesperado:** tener plantillas libera energía mental para pensar estratégicamente y resolver problemas creativos. La estructura se vuelve automática y te permite enfocarte en el problema real.

{{< /callout >}}

---

<span id="key-insights"></span>

## 🧠 Ideas clave

Después de meses de experimentación, estos patrones fueron los más importantes para lograr mejores resultados con GPT-5.

### 1. 📝 La estructura mejora la claridad

Organizar tus solicitudes ayuda a que GPT-5 entienda lo que necesitas. Piénsalo como la diferencia entre código bien documentado y un enredo: la estructura hace que todo funcione mejor.

Los modelos modernos responden bien a solicitudes estructuradas y detalladas. Si dieras indicaciones, no dirías solo "ve a la tienda". Dirías cuál tienda, qué ruta tomar y qué hacer al llegar. GPT-5 funciona igual.

**El marco básico:**

```text
<objective>
[Your specific goal and what success looks like]
</objective>

<context>
[Relevant background, constraints, current situation]
</context>

<requirements>
[Step-by-step guidance and expected deliverables]
</requirements>
```

Esto elimina aclaraciones de ida y vuelta y te da resultados completos desde el primer intento.

### 2. 🔍 Incluye fases de análisis

Pedirle a GPT-5 que analice antes de recomendar lleva a respuestas más pensadas. Es como pedirle a alguien que entienda el problema de verdad antes de saltar a soluciones.

**Considera agregar pasos como:**

```text
Before providing recommendations:
1. Analyze the current situation and key challenges
2. Evaluate available options against the constraints
3. Consider trade-offs and potential issues
4. Validate the analysis before presenting solutions
```

Esto asegura que GPT-5 considere factores relevantes al manejar trade-offs complejos como rendimiento vs costo y seguridad vs facilidad de uso.

### 3. ✅ Integra validación

Pídele a GPT-5 que revise su propio trabajo contra tus requisitos y buenas prácticas. Esto agrega un control de calidad extra y crea flujos confiables y repetibles que puedes compartir con tu equipo.

---

### 4. 🧑‍💻 Patrones para desarrolladores (GPT-5 para programar)

Si usas GPT-5 para programación (por API, Cursor u otras herramientas), estos ajustes cambian mucho el resultado.

#### Sé preciso y evita información contradictoria

La capacidad de seguir instrucciones de GPT-5 es un arma de doble filo. Hace exactamente lo que pides, pero se complica con contradicciones o requisitos vagos.

Esto es especialmente importante en archivos de configuración:

- `.cursor/rules` files
- `AGENTS.md` files
- Project documentation

#### Ajusta el esfuerzo de razonamiento a la complejidad

GPT-5 aplica razonamiento por defecto, pero puedes controlar cuánto esfuerzo pone. Piénsalo como elegir entre un boceto rápido y un plano arquitectónico detallado.

Usa alto razonamiento para:

- Decisiones complejas de arquitectura
- Depurar problemas intrincados
- Optimización de rendimiento

Usa bajo razonamiento para:

- Arreglos simples de sintaxis
- CRUD estándar
- Formato básico

```text
// Instead of letting GPT-5 overthink this:
"Fix this simple syntax error"

// Be more specific:
"This is a simple syntax fix - focus on speed over analysis"
```

#### Estructura instrucciones de código con sintaxis tipo XML

Trabajando con Cursor, OpenAI encontró que GPT-5 responde particularmente bien a estructuras tipo XML para guías de programación:

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

Esto ayuda a que el modelo entienda jerarquía y relaciones entre distintos requisitos.

#### Baja el tono imperativo

Con modelos anteriores, quizá usabas lenguaje enfático. Con GPT-5, muchas veces eso sale mal porque el modelo naturalmente quiere ser exhaustivo.

En lugar de:

```text
Be THOROUGH when gathering information.
Make sure you have the FULL picture before replying.
You MUST follow these guidelines EXACTLY.
```

Prueba esto:

```text
Review the codebase structure before making changes.
Consider the existing patterns and maintain consistency.
Follow the established coding conventions.
```

{{< callout important >}}

**Ojo:** Un lenguaje demasiado firme puede hacer que GPT-5 sea demasiado exhaustivo, generando llamadas excesivas a herramientas o sobre-analizando solicitudes simples.

{{< /callout >}}

#### Agrega planificación en proyectos complejos

Cuando construyes algo desde cero, darle espacio a GPT-5 para planificar y validar produce mejores decisiones de arquitectura:

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

#### Controla el entusiasmo de tu coding agent

Por defecto, GPT-5 intenta ser completo. A veces eso es exactamente lo que quieres. Otras veces, es demasiado.

Dale límites claros:

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

**Ejemplo real:** en lugar de dejar que GPT-5 lea 20+ archivos para entender el proyecto, especifica qué archivos o carpetas son más relevantes. Ahorra tiempo y mantiene el enfoque.

{{< /callout >}}

---

### 5. 🔄 Controla el comportamiento del modelo con contexto

GPT-5 es naturalmente exhaustivo, lo cual ayuda, pero a veces necesitas respuestas rápidas. Puedes guiar cuánto tiempo invierte pensando.

**Cuando necesitas respuestas rápidas:**

```text
Focus on speed over completeness. Give me actionable steps quickly rather than exploring every possibility.
```

**Cuando quieres explorar a fondo:**

```text
Take the time needed to fully solve this. Don't ask for clarification. Make the most reasonable assumptions and keep working until it's complete, then document it for the user's reference.
```

Los arreglos rápidos no necesitan investigación profunda. El diseño complejo de sistemas sí. Ajustar cómo pides las cosas según tu necesidad real te da mejores resultados más rápido.

{{< callout tip>}}

Piénsalo como pedir direcciones: a veces solo necesitas "dobla a la izquierda en el semáforo", otras veces quieres la ruta completa con alternativas y tráfico.

{{< /callout >}}

---

## 🤷‍♂️ Los trade-offs honestos

Ambos cambios (prompting estructurado y acceso por API) requieren esfuerzo al inicio. Esto es lo que realmente estás intercambiando.

### Prompting estructurado

**Lo que ganas:**

- ✅ **Mejores primeras respuestas**: Respuestas completas sin 5 mensajes de ida y vuelta
- ✅ **Plantillas reutilizables**: Construyes patrones efectivos para usar repetidamente
- ✅ **Menos costo de tokens**: Un buen prompt vs múltiples aclaraciones
- ✅ **Flujos compartibles**: El equipo puede usar los mismos prompts probados

**Lo que pierdes:**

- ❌ **Preguntas casuales rápidas**: Toma más escribir prompts estructurados para consultas simples
- ❌ **Curva de aprendizaje**: Hay que entender qué estructura sirve para cada tarea
- ❌ **Se siente formal**: Se pierde lo conversacional de solo "chatear" con la IA

**Ejemplo práctico:**

Para una pregunta de 2 líneas, el prompting estructurado es demasiado. Pero para algo que requiere 3+ aclaraciones o involucra código o arquitectura, los 30 segundos estructurando ahorran 5 minutos de ida y vuelta.

### Acceso por API en lugar de suscripciones

**Lo que ganas:**

- ✅ **Control total de costos**: $15-28/mes vs $60/mes en suscripciones (60-70% de ahorro)
- ✅ **Sin límites**: Mensajes ilimitados cuando más los necesitas
- ✅ **Acceso multi-modelo**: Cambias entre GPT-5, Claude y otros en una sola interfaz
- ✅ **Pago por uso**: ¿Mes pesado? Pagas más. ¿Mes ligero? Pagas menos.

**Lo que pierdes:**

- ❌ **Manejo de API keys**: Hay que manejar cobros y monitorear uso
- ❌ **Configuración inicial**: 15-30 minutos para configurar TypingMind u Open-WebUI
- ❌ **Sin custom GPTs**: No accedes a aplicaciones GPT construidas por la comunidad

**Ejemplo práctico:**

Si usas ChatGPT de forma casual (10 mensajes por semana), quédate con el plan gratis. Pero si topas con límites aunque sea una vez por semana, el acceso por API se paga solo y elimina la frustración.

{{< callout tip>}}

**Marco de decisión:** prueba primero el prompting estructurado. Es gratis y mejora resultados de inmediato. Cambia a APIs solo si estás chocando con límites o quieres acceso multi-modelo.

{{< /callout >}}

{{< callout note >}}

**En serio:** estos enfoques no son para todos. Si prefieres simplicidad y no te importan los límites, quédate con ChatGPT Plus. Pero si quieres máximo control y menor costo, ambos cambios te cambian el juego.

{{< /callout >}}

---

<span id="our-journey"></span>

## 🏠 Nuestro camino: de suscripciones a APIs

Este fue el experimento que cambió cómo usamos herramientas de IA.

### El problema de los límites

Mi esposa y yo usábamos ChatGPT, y empezamos a toparnos con límites con frecuencia. La solución natural parecía ser pagar dos suscripciones de ChatGPT Plus ($40/mes en total), y además yo quería probar Claude, lo cual sumaría otra suscripción de $20/mes.

Eso son $60/mes con límites de uso todavía.

### El experimento con APIs

Decidí probar un enfoque distinto: **¿Y si utilizamos las APIs directamente?**

Así se vio nuestro uso real por varios meses:

{{< chart "monthly-costs" >}}

Incluso en nuestro mes más pesado (mayo, ~ $28 entre los dos), nos mantuvimos por debajo de lo que nos costarían tres suscripciones ($60/mes). La mayoría de meses, ahorramos 60-70% frente a la ruta de suscripciones.

### Las herramientas que de verdad nos funcionan

En lugar de pelear con límites, nos cambiamos a interfaces con APIs que nos dan los mismos modelos con control total.

#### TypingMind: el botón fácil

Usamos {{< extlink href="https://www.typingmind.com/>" >}}TypingMind{{< /extlink >}} por su interfaz limpia, tipo ChatGPT. Se conecta a nuestras API keys de OpenAI y Anthropic, así que podemos cambiar entre GPT-5 y Claude sin fricción.

{{< gallery caption="TypingMind" >}}
{{< gallery-image src="images/typingmind.webp" alt="Pantalla de bienvenida y landing page de TypingMind" >}}
{{< gallery-image src="images/typingmind-pricing.webp" alt="Página de precios de TypingMind con los tres niveles de licencia" >}}
{{< gallery-image src="images/typingmind-main.webp" alt="Interfaz principal de TypingMind con lista de chats y pantalla de conversación" >}}
{{< /gallery >}}

Admito que hoy la licencia de TypingMind es bastante cara. Anda por ~$99 para la versión completa. Me alegra haberlo comprado por menos de la mitad, pero incluso si lo comprara hoy, podría recuperar el costo en seis meses si lo pienso como reemplazo de la suscripción de ChatGPT.

**Lo que nos encanta:**

- Sin límites de uso
- Una sola interfaz para múltiples proveedores
- Historial y organización de conversaciones

#### Open-WebUI: para los que les gusta trastear

También configuré {{< extlink href="https://openwebui.com/>" >}}Open-WebUI{{< /extlink >}} en nuestro servidor de casa para cuando quiero experimentar con modelos distintos o probar Ollama.

{{< gallery caption="Open WebUI" >}}
{{< gallery-image src="images/openwebui.webp" alt="Pantalla de bienvenida y landing page de Open WebUI" >}}
{{< gallery-image src="images/openwebui-main.webp" alt="Interfaz principal de Open WebUI con lista de chats y área de conversación" >}}
{{< /gallery >}}

**Por qué mantenemos ambos:**

- TypingMind para el día a día
- Open-WebUI para experimentar y para hosting local

{{< callout tip >}}

**Tip por experiencia:** empieza con TypingMind si quieres algo que "simplemente funcione". Siempre puedes agregar Open-WebUI después si te da la fiebre de self-hosting como a mí. O prueba Open-WebUI si quieres experimentar sin gastar.

{{< /callout >}}

### Qué cambió para nosotros

Después de varios meses con esta configuración:

**Patrones de uso:**

- Preguntamos más (sin ansiedad por límites)
- Experimentamos más con modelos
- Cambiamos de modelo según la tarea (GPT-5 para código, Claude para escritura)

**Conciencia de costos:**

- Monitoreamos el uso, pero rara vez nos preocupa
- Los meses pesados siguen costando menos que suscripciones
- Los meses ligeros cuestan significativamente menos

**Flexibilidad:**

- Acceso desde cualquier dispositivo (TypingMind tiene web + apps de escritorio)
- Sin interrupciones de "actualiza para continuar"
- Historial completo de conversaciones entre modelos

{{< callout important >}}

**Actualización:** Sam Altman confirmó vía X que los suscriptores de ChatGPT Plus tendrán límites de uso más altos. Si ya eres Plus y estás feliz con eso, estos nuevos límites quizá te resuelvan. Pero en nuestro caso, la flexibilidad por API y el ahorro siguen teniendo más sentido.

{{< /callout >}}

---

<span id="deep-dive"></span>

## 🔗 Recursos para profundizar

OpenAI publicó guías y herramientas específicas para trabajar con GPT-5. Son especialmente útiles cuando resuelves problemas técnicos complejos o migras prompts existentes.

**Empieza con estos recursos oficiales:**

- **{{< extlink href="https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide>" >}}GPT-5 Prompting Guide{{< /extlink >}}** - Buenas prácticas para GPT-5. Se enfoca en donde GPT-5 destaca: tareas agentic, programación y control preciso del comportamiento del modelo.

- **{{< extlink href="https://platform.openai.com/chat/edit?models=gpt-5&optimize=true>" >}}Prompt Optimizer{{< /extlink >}}** - Mejora prompts identificando contradicciones, formatos faltantes e inconsistencias. Funciona en Playground y entiende la tarea específica.

- **{{< extlink href="https://cookbook.openai.com/examples/gpt-5/prompt-optimization-cookbook>" >}}Optimization Cookbook{{< /extlink >}}** - Ejemplos prácticos antes y después mostrando mejoras medibles. Excelente para aprender qué estructura funciona.

- **{{< extlink href="https://x.com/OpenAIDevs/status/1956438999364768225>" >}}GPT-5 for Developers{{< /extlink >}}** - Seis tips para programar con GPT-5, compartidos por OpenAI Developers en X. Referencia rápida para patrones de desarrollo.

**Contexto adicional:**

Ten presente que el prompting efectivo varía por caso de uso. Estas herramientas funcionan mejor combinadas con pruebas sistemáticas e iteración según tus necesidades.

Para acceso por API e interfaces:

- **{{< extlink href="https://www.typingmind.com/>" >}}TypingMind{{< /extlink >}}** - Interfaz tipo ChatGPT para múltiples proveedores
- **{{< extlink href="https://openwebui.com/>" >}}Open-WebUI{{< /extlink >}}** - Interfaz open-source auto-hospedada con soporte para Ollama

---

## 💬 ¿Qué vas a probar primero?

GPT-5 representa un cambio en cómo interactuamos con la IA. Es más capaz, pero requiere prompts más pensados. Y el ecosistema de APIs ya maduró al punto de darte más flexibilidad a menor costo.

**Tu turno:**

¿Qué te llama más? ¿Prompting estructurado para desbloquear mejores resultados, o acceso por API para eliminar límites y bajar costos? ¿O ambos?

Me encantaría escuchar tu experiencia con GPT-5 y qué te está funcionando (o no). Comparte tus ideas en {{< extlink href="https://www.linkedin.com/in/jebucaro/>" >}}LinkedIn{{< /extlink >}} o prueba las técnicas de arriba y cuéntame qué descubres.

---

Foto de {{< extlink href="https://unsplash.com/@seanwsinclair?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash>" >}}Sean Sinclair{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/a-blurry-image-of-a-rainbow-colored-background-C_NJKfnTR5A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash>" >}}Unsplash{{< /extlink >}}
