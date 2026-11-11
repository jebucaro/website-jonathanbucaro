---
title: 'Crea un grafo de conocimiento a partir de texto con Gemini'
slug: 'create-knowledge-graph-from-text-with-gemini'
date: 2025-10-06T19:59:11-06:00
lastmod: 2026-09-22T19:31:23-06:00
image: 'images/cover.png'
tags: [python, ai-tools, gemini]
draft: false
description: 'Aprende a crear un sistema de extracción de grafos de conocimiento usando Gemini de Google. Convierte texto no estructurado en redes visuales de conocimiento conectado con Python y Streamlit'
---

En junio de 2025 vi el video de Thu Vu sobre cómo convertir texto en un grafo de conocimiento con GPT-4 y el `LLMGraphTransformer` de LangChain. Era muy poco código, y me quedé con la curiosidad de qué hacía realmente esa llamada. Me emocioné un poco, y terminé armando Nodus, una app pequeña en Streamlit que hace la misma extracción directo contra la API de Gemini, sin ningún framework de por medio.

Un grafo de conocimiento guarda la información como conexiones en vez de párrafos. Si le das a Nodus esta oración:

> Sarah trabaja en TechCorp en San Francisco y le reporta a Michael, quien es el VP of Engineering.

Te devuelve esto:

- **Entidades**: Sarah (persona), TechCorp (organización), San Francisco (ubicación), Michael (persona), VP of Engineering (ocupación)
- **Relaciones**: Sarah WORKS_AT TechCorp, TechCorp LOCATED_IN San Francisco, Sarah REPORTS_TO Michael, Michael HAS_ROLE VP of Engineering

{{< gallery caption="Un grafo de conocimiento de ejemplo que muestra agrupación de entidades y redes de relaciones. Nota cómo los conceptos conectados se agrupan de forma natural." >}}
{{< gallery-image src="images/nodus-knowledge-graph.png" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< /gallery >}}

Con una oración es un juguete. Con una hora de transcripción de reuniones, es la diferencia entre ponerte a buscar quién mencionó la fecha de entrega y simplemente verlo en el mapa.

## Córrelo en tu máquina

El código está en mi repo `blog-code`. Con un sparse checkout te bajas solo la carpeta de Nodus:

```bash
# Clone repository without downloading all files
git clone --depth 1 --filter=blob:none --sparse git@github.com:jebucaro/blog-code.git

# Navigate to repository
cd blog-code

# Download only the folder you need
git sparse-checkout set python/Nodus

# Navigate to the Nodus project directory
cd python/Nodus
```

Agrega tu API key de Gemini e instala las dependencias:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and replace the empty GEMINI_API_KEY value with your actual key
# On Windows: notepad .env (or your preferred editor)
# On Mac/Linux: nano .env (or your preferred editor)

# Install dependencies
uv sync
```

Y levántalo con uv:

```bash
uv run streamlit run src/nodus/main.py
```

O con Docker, si prefieres:

```bash
# 1. Ensure Docker Desktop is running, then build the image
docker build -t nodus:latest .

# 2. Run with environment variable
docker run -p 8501:8501 -e GEMINI_API_KEY=your_key_here nodus:latest

# 3. Or use .env file
docker run -p 8501:8501 --env-file .env nodus:latest

# 4. Access the app at http://localhost:8501
```

## Lo que te da

{{< gallery caption="Exploración visual, JSON sin procesar para depurar, y estadísticas del grafo para analizar" >}}
{{< gallery-image src="images/nodus-summary.png" alt="Nodus tab showing a summary from the input text." >}}
{{< gallery-image src="images/nodus-knowledge-graph-results.png" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< gallery-image src="images/nodus-raw-data.png" alt="Nodus tab showing the details of the nodes and relationships in the knowledge graph." >}}
{{< gallery-image src="images/nodus-statistics.png" alt="Nodus tab showing some statistics like total nodes, total relationships and total relationships types of the knowledge graph." >}}
{{< /gallery >}}

Pegas el texto o subes un archivo `.txt`/`.md`, eliges el modelo y te salen cuatro pestañas: un **Resumen** con los puntos clave, la **Visualización** interactiva, los **Datos sin procesar** en tablas y JSON (cada nodo y relación con su contexto) y las **Estadísticas** de nodos y tipos de relación. Puedes filtrar el grafo por tipo de relación, esconder los nodos aislados y exportar todo como HTML, JSON o TXT.

## Cómo funciona

Aquí no hay ningún pipeline de NLP. Gemini soporta salida estructurada, entonces Nodus le pasa un esquema de Pydantic como `response_format` y recibe un JSON que cae directo en estos modelos:

```python
class Node(BaseModel):
    id: str  # Identificador semántico (minúsculas con guiones bajos)
    label: str | None  # Nombre legible (autogenerado desde id si se omite)
    type: str  # Categoría de entidad (p. ej., person, organization)
    context: str | None  # Detalle de apoyo breve del texto (fecha, número, razón)

class Relationship(BaseModel):
    id: str  # Identificador de la relación
    type: str  # Tipo de relación (MAYÚSCULAS con guiones bajos)
    source_node_id: str
    target_node_id: str
    context: str | None  # Detalle de apoyo breve sobre esta relación

class KnowledgeGraph(BaseModel):
    nodes: list[Node]
    relationships: list[Relationship]

class ExecutiveSummary(BaseModel):
    summary: str  # Texto de briefing estructurado con las cinco secciones
    key_points: list[str] | None  # 3-7 puntos ejecutivos opcionales

class ExtractionResult(BaseModel):
    summary: ExecutiveSummary | None
    knowledge_graph: KnowledgeGraph
```

Ese esquema es el contrato con el modelo, y es la mayor parte del truco. El resumen y el grafo son dos llamadas que corren en paralelo sobre el texto original. Si quieres una vista de más alto nivel puedes armar el grafo desde el resumen, pero pierdes casi todo el detalle y son dos llamadas una tras otra. También hay un nivel de razonamiento (el default, bajo, medio o alto) para textos más complicados.

Lo demás son reglas en el prompt, y cualquier cambio pequeño ahí se nota en la calidad. Los IDs de los nodos son semánticos y en minúsculas (`sarah`, no `person_1`), los tipos de relación van en mayúsculas (`WORKS_AT`) y la correferencia es explícita para que "Michael" y "he" terminen siendo el mismo nodo. Lo que más me sirvió fueron los IDs semánticos: cuando una extracción sale mal, `sarah` te dice mucho más que `person_1`. Prueba tus prompts con distintos tipos de texto antes de confiar en ellos.

Aun con prompts estrictos, a veces el modelo devuelve una relación que apunta a un nodo que nunca definió, o lo escribe un poco distinto. En vez de botar esas aristas sin decir nada, un paso de reparación busca una coincidencia exacta, luego una normalizada y luego una difusa con un umbral alto, y si nada encaja crea un nodo temporal para que la arista no se pierda. La interfaz te dice qué reparó. El grafo además elimina relaciones duplicadas, tanto las copias exactas como las que tienen el mismo origen, tipo y destino con IDs distintos.

El texto de entrada no es de confianza, entonces Nodus lo envuelve en delimitadores y le dice al modelo que lo trate como datos, no como instrucciones. Es una primera línea de defensa contra la inyección de prompts, no una garantía. Ojo con un detalle: la Interactions API no expone los filtros de seguridad ajustables, así que solo aplican las protecciones base que Gemini siempre tiene activas.

El grafo lo dibuja PyVis con un layout ForceAtlas2, así que los nodos conectados se juntan solos, y cada tipo de nodo tiene un color fijo para que se vea igual en todos los grafos.

## Platica con tu documento

Después de extraer, puedes hacerle preguntas al documento. Las respuestas salen del texto original y cada una termina con una sección `### Evidence` que cita el documento, más una línea "From the relationships:" cuando usó el grafo. Esas citas las escribe el modelo, así que a veces no son exactas; si algo es importante, verifícalo contra la fuente.

{{< gallery caption="Haz una pregunta y obtén una respuesta anclada en el texto original, con evidencia citada" >}}
{{< gallery-image src="images/nodus-chat.png" alt="Nodus Chat section showing a question about the document, a prose answer, and an Evidence block with a verbatim quote and a relationship line." >}}
{{< /gallery >}}

{{< callout warning>}}
El Chat hace un compromiso de privacidad que la extracción no. Las llamadas de extracción usan `store=False`, pero el Chat usa `store=True` y envía el texto original completo en la primera pregunta, así que Gemini retiene la conversación y tu documento durante la ventana de retención de la Interactions API (55 días en el tier de pago, 1 día en el gratuito). Esto solo aplica mientras usas el Chat, y se reinicia cada vez que vuelves a extraer o presionas Clear.
{{< /callout >}}

## Cuánto cuesta

Casi nada. Nodus trae `gemini-3.5-flash-lite` (el más barato), `gemini-3.8-flash` (el default) y `gemini-3.1-pro-preview` (el más capaz). En el tier de pago de Flash-Lite, a $0.30 por 1M de tokens de entrada y $2.50 por 1M de salida, un artículo de 500 palabras son más o menos 600 tokens de entrada y 300 de salida, como $0.0009 por extracción. Armar el grafo desde el resumen lo duplica, más o menos. Flash-Lite también tiene tier gratuito, que te alcanza de sobra para probarlo.

## Por qué no usar LangChain y ya

La abstracción de LangChain está buenísima cuando quieres un resultado rápido, y para eso vale la pena ver el video de Thu Vu:

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/O-T_6KOXML4?si=t954bEKM1cd6ig6h" title="YouTube video player" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

Pero esconde justo lo que yo quería aprender. Llamar a Gemini directo me enseñó que el centro de todo es la salida estructurada más buenos prompts, y eso te sirve con cualquier otro proveedor. También me facilitó mucho depurar una extracción rara, porque no había nada entre el modelo y yo. No estoy en contra de los frameworks, solo quería ver qué hay debajo.

El código completo está {{< extlink href="https://github.com/jebucaro/blog-code" >}}en GitHub{{< /extlink >}}. Empieza por `extractor.py` para los prompts y las protecciones contra inyección, `models.py` para el esquema y `repair.py` para el paso de reparación.
