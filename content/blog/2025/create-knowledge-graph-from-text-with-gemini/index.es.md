---
title: 'Crea un grafo de conocimiento a partir de texto con Gemini'
slug: 'create-knowledge-graph-from-text-with-gemini'
date: 2025-10-06T19:59:11-06:00
image: 'images/cover.png'
tags: [python, ai-tools, gemini]
draft: false
description: 'Aprende a crear un sistema de extracción de grafos de conocimiento usando Gemini de Google. Convierte texto no estructurado en redes visuales de conocimiento conectado con Python y Streamlit'
---

## Por qué construí esto

Hace unos cuatro meses vi el video de Thu Vu sobre cómo extraer grafos de conocimiento desde texto usando GPT-4. El concepto se me quedó grabado: con poco código, transcripciones de reuniones y contenido de podcasts sin estructura se convertían en redes visuales de conocimiento que hacían que la información compleja se entendiera al instante.

Piensa en un grafo de conocimiento como una forma de representar información tal como tu cerebro la organiza naturalmente, a través de conexiones en lugar de páginas de texto. En vez de leer un documento para entender cómo se relacionan los conceptos, ves un mapa donde todo ya está conectado. Entender información no se trata de memorizar datos, sino de ver cómo se conectan, y ese es el principio detrás de Nodus, la herramienta de este post.

## Míralo en acción

Transforma esta oración:

> Sarah trabaja en TechCorp en San Francisco y le reporta a Michael, quien es el VP of Engineering.

En este grafo estructurado:

- **Entidades**: Sarah (persona), TechCorp (organización), San Francisco (ubicación), Michael (persona), VP of Engineering (ocupación)
- **Relaciones**: Sarah WORKS_AT TechCorp, TechCorp LOCATED_IN San Francisco, Sarah REPORTS_TO Michael, Michael HAS_ROLE VP of Engineering

{{< gallery caption="Un grafo de conocimiento de ejemplo que muestra agrupación de entidades y redes de relaciones. Nota cómo los conceptos conectados se agrupan de forma natural." >}}
{{< gallery-image src="images/nodus-main-interface-kg.webp" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< /gallery >}}

## El problema, y qué cambió

El conocimiento normalmente se crea y se guarda como lenguaje natural: documentos, transcripciones, artículos. Pero es más útil cuando se estructura como un grafo. El texto tradicional es difícil de navegar: buscar entre horas de transcripción para encontrar quién mencionó una fecha límite, leer páginas de documentación para entender cómo se conectan los conceptos, o revisar wikis y docs dispersos sin una vista unificada.

Lo que volvió esto práctico es que los LLM modernos cambiaron la ecuación. Leen texto y extraen información estructurada con precisión sorprendente: entienden contexto, resuelven ambigüedades y detectan relaciones que un pipeline tradicional de NLP se perdería. Eso es lo que hace Nodus: extrae entidades y relaciones de cualquier texto, construye grafos de conocimiento visuales e interactivos, exporta a HTML, JSON o TXT, y cuesta cerca de $0.00018 por artículo, sin etiquetado manual ni un pipeline de NLP que mantener. En vez de un sistema de extracción complicado, escribes código directo contra la salida estructurada de Gemini.

<span id="quick-start"></span>

## Inicio rápido

### Obtén el código fuente

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

### Configura el proyecto

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and replace the empty GEMINI_API_KEY value with your actual key
# On Windows: notepad .env (or your preferred editor)
# On Mac/Linux: nano .env (or your preferred editor)

# Install dependencies
uv sync
```

### Lanza la aplicación

#### Opción 1: usando uv

```bash
uv run streamlit run src/nodus/main.py
```

#### Opción 2: usando Docker

```bash
# 1. Ensure Docker Desktop is running, then build the image
docker build -t nodus:latest .

# 2. Run with environment variable
docker run -p 8501:8501 -e GEMINI_API_KEY=your_key_here nodus:latest

# 3. Or use .env file
docker run -p 8501:8501 --env-file .env nodus:latest

# 4. Access the app at http://localhost:8501
```

<span id="results"></span>

## Resultados

La interfaz te da cuatro perspectivas del conocimiento extraído:

{{< gallery caption="Exploración visual, JSON sin procesar para depurar, y estadísticas del grafo para analizar" >}}
{{< gallery-image src="images/nodus-main-interface.webp" alt="Nodus tab showing a summary from the input text." >}}
{{< gallery-image src="images/nodus-main-interface-kg.webp" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< gallery-image src="images/nodus-main-interface-kg-raw.webp" alt="Nodus tab showing the details of the nodes and relationships in the knowledge graph." >}}
{{< gallery-image src="images/nodus-main-interface-kg-statistics.webp" alt="Nodus tab showing some statistics like total nodes, total relationships and total relationships types of the knowledge graph." >}}
{{< /gallery >}}

Cuatro pestañas cubren los resultados: un **Resumen** estructurado con los insights clave, una **Visualización** interactiva con layout basado en física, **Datos sin procesar** en JSON para inspeccionar nodos y relaciones, y **Estadísticas** con la cantidad de nodos y tipos de relaciones. Puedes exportar el grafo como HTML (interactivo), JSON (datos estructurados) o TXT (resumen).

<span id="how-it-works-architecture"></span>

## Cómo funciona

Diseñé esta implementación para priorizar claridad sobre abstracción. Cada capa es intencionalmente simple, más cerca de una base de aprendizaje que de un framework listo para producción, así que es fácil de entender, modificar y extender.

{{< gallery caption="Una interfaz limpia que se enfoca en el flujo principal: configurar, ingresar, extraer, visualizar" >}}
{{< gallery-image src="images/nodus-main-interface.webp" alt="Nodus Streamlit application with a sidebar to configure the Gemini API key and model selection, the main interface allows the user to upload a text file or paste the contents to generate a knowledge graph." >}}
{{< /gallery >}}

### Capa de extracción

Los LLM modernos con soporte de salida estructurada aceptan definiciones de esquema directamente, lo que elimina el parseo manual de JSON y es buena parte de lo que hace esto accesible hoy. El extractor corre un proceso en dos fases: primero genera un resumen ejecutivo estructurado con cinco secciones (Overview, Key Points, Entities, Relationships, Conclusions), y luego extrae entidades y relaciones desde ese resumen (para un grafo más enfocado y de alto nivel) o directamente desde el texto original (para más detalle).

```python
class GeminiExtractor:
    def extract_with_summary(
        self,
        text: str,
        use_summary_for_kg: bool = True
    ) -> ExtractionResult:
        # Generate summary first
        summary = self.summarize(text)

        # Extract KG from summary or original text
        source = summary.content if use_summary_for_kg else text
        kg = self.extract(source)

        return ExtractionResult(summary=summary, knowledge_graph=kg)
```

Algunas reglas mantienen la extracción consistente: los identificadores de nodo deben ser semánticos y en minúsculas con guiones bajos (`sarah` en lugar de `person_1`), los tipos de relación en MAYÚSCULAS con guiones bajos (`WORKS_AT` y no `works_at`), y las reglas de correferencia deben ser explícitas para que "Michael" y "he" apunten a la misma entidad. Los IDs numéricos genéricos hacen mucho más difícil resolver problemas de extracción, así que estas reglas se pagan solas en depuración.

{{< callout warning>}}
La ingeniería de prompts es crítica aquí. Prompts malos generan extracción inconsistente de entidades, nodos duplicados y relaciones rotas. Siempre prueba tus prompts con muestras de texto diversas antes de escalar, cambios pequeños en el prompt pueden afectar de forma drástica la calidad de extracción.
{{< /callout >}}

### Modelos de datos

Modelos de datos claros establecen el contrato entre el LLM y tu aplicación. Uso modelos de Pydantic para definir exactamente qué estructura espero de vuelta de Gemini:

```python
class Node(BaseModel):
    id: str  # Semantic identifier (lowercase with underscores)
    label: str  # Human-readable name (auto-generated from id if not provided)
    type: str  # Entity category (e.g., person, organization)

class Relationship(BaseModel):
    id: str  # Relationship identifier
    type: str  # Relationship type (UPPERCASE with underscores)
    source_node_id: str
    target_node_id: str

class KnowledgeGraph(BaseModel):
    nodes: list[Node]
    relationships: list[Relationship]

class ExecutiveSummary(BaseModel):
    overview: str
    key_points: list[str]
    entities: list[str]
    relationships: list[str]
    conclusions: str

class ExtractionResult(BaseModel):
    summary: ExecutiveSummary
    knowledge_graph: KnowledgeGraph
```

El modelo `KnowledgeGraph` deduplica automáticamente, tanto por ID de relación (duplicados exactos) como por tripleta semántica (`source_node_id`, `type`, `target_node_id`) para relaciones funcionalmente equivalentes. Eso cubre el caso común en el que el LLM genera la misma relación varias veces con IDs distintos.

### Capa de visualización

Los datos de grafo sin procesar son útiles, pero la visualización es donde los patrones invisibles en el texto se vuelven visibles. La asignación determinística de colores (hashear los tipos de nodo a una paleta) mantiene la representación visual consistente entre grafos, lo que te ayuda a formar un modelo mental más rápido. Un layout basado en fuerzas (ForceAtlas2) agrupa los nodos conectados y separa los aislados, y suele revelar estructura que no es obvia en los datos crudos. El renderizador soporta tanto generación de HTML como salida a archivo, así que funciona igual de bien incrustado en una app web o como visualización independiente.

### Capa de interfaz

La interfaz de Streamlit mantiene el flujo simple: configura las credenciales de la API y el modelo, envía texto directamente o sube un archivo `.txt`/`.md`, elige si construir el grafo desde el resumen ejecutivo o desde el texto original, explora los resultados en las cuatro pestañas, y exporta como HTML, JSON o TXT.

## Consideraciones de costo

Este enfoque es lo bastante accesible como para importar. Gemini 2.5 Flash Lite (tier de pago) cobra $0.10 por 1M de tokens de entrada y $0.40 por 1M de tokens de salida. Extraer un artículo de 500 palabras usa cerca de 600 tokens de entrada y 300 de salida: (600 / 1,000,000) × $0.10 = $0.00006 de entrada, (300 / 1,000,000) × $0.40 = $0.00012 de salida, un total cercano a $0.00018 por extracción. Gemini 2.5 Flash Lite también tiene un free tier generoso, sin costo de entrada ni salida, suficiente para pruebas y uso a pequeña escala.

{{< callout note>}}
Para producción, cuenta los tokens antes de llamar la API para estimar costos, procesa documentos en lote para optimizar el uso de la API, y cachea los grafos extraídos para evitar reprocesar contenido sin cambios.
{{< /callout >}}

## Aplicaciones en el mundo real

Las notas y transcripciones de reuniones son el caso obvio: en vez de buscar entre horas de notas para recordar quién mencionó una fecha límite, consultas el grafo directamente ("muéstrame todas las fechas límite mencionadas por Sarah en reuniones de Q1"), porque las relaciones ya están extraídas y estructuradas. La misma idea aplica a investigación y aprendizaje, donde un grafo construido mientras lees documentación técnica muestra cómo se conectan las ideas y cuáles conceptos son centrales. A nivel organizacional, puede unificar información dispersa en documentos, wikis y conversaciones en un solo mapa, sin importar dónde vivía cada pieza originalmente.

Desde aquí podrías conectarlo a una base de datos de documentos para extracción automática, construir una interfaz de consulta conversacional sobre los grafos, combinar grafos de varias fuentes, o agregar seguimiento temporal para ver cómo evoluciona el conocimiento.

{{< callout note >}}
Los ejemplos simples se entienden rápido, pero los grafos de conocimiento brillan más con escala. Un grafo con 100 entidades y 200 relaciones puede revelar patrones casi imposibles de notar en texto crudo, desde análisis de tendencias hasta detección de anomalías.
{{< /callout >}}

<span id="explore-the-code"></span>

## Explora el código

La implementación completa está disponible {{< extlink href="https://github.com/jebucaro/blog-code" >}}en GitHub{{< /extlink >}}. Mantuve el código intencionalmente minimal y documentado para que puedas entender cada pieza y adaptarla. Empieza con `models.py` (modelos Pydantic con validación y deduplicación automática), `extractor.py` (la lógica de extracción en dos fases y los prompts), `visualizer.py` (renderizado del grafo con PyVis), `app.py` (la interfaz de Streamlit), `settings.py` (configuración de entorno y selección de modelo), y `errors.py` (una jerarquía de excepciones para mensajes de error amigables).

## Por qué lo construí desde cero

La implementación original de Thu Vu usa GPT-4 y `LLMGraphTransformer` de LangChain, y vale la pena verla para entender cómo una abstracción de alto nivel simplifica la extracción:

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/O-T_6KOXML4?si=t954bEKM1cd6ig6h" title="YouTube video player" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

Esa abstracción es poderosa, pero también esconde las preguntas que necesitas responder cuando estás depurando resultados de extracción inesperados, optimizando prompts para un dominio específico, adaptando el sistema a otro proveedor de LLM, o controlando costos a escala. Trabajar directo con la API de Gemini, en vez de a través de un framework, me mostró el patrón central con más claridad: quita el soporte multi-proveedor y el overhead del framework, y ves exactamente cómo el diseño del prompt impulsa la calidad de las entidades y relaciones extraídas. También significa que puedo afinar cada parte del pipeline directamente, y que el conocimiento de cómo funciona la salida estructurada a nivel de API se transfiere a cualquier otro proveedor de LLM que use después.

El objetivo aquí no es argumentar en contra de los enfoques basados en frameworks, solo entender el mecanismo que hay debajo.

## ¿Qué vas a extraer?

Los grafos de conocimiento cambian cómo interactúas con la información, ya sea que estés gestionando investigación, organizando notas de reuniones o construyendo aplicaciones de IA sobre datos estructurados. ¿Cuál es el primer texto que vas a convertir en un grafo de conocimiento? Comparte tu caso de uso o tus preguntas en LinkedIn, me encantaría ver lo que construyes con esto.
