---
title: 'Create a Knowledge Graph From Text With Gemini'
slug: 'create-knowledge-graph-from-text-with-gemini'
date: 2025-10-06T19:59:11-06:00
image: 'images/cover.webp'
tags: [python, ai-tools, gemini]
draft: false
description: "Learn how to build a knowledge graph extraction system using Google's Gemini AI. Transform unstructured text into visual, connected knowledge networks with Python and Streamlit"
---

## 🎯 TL;DR

Nodus extracts knowledge graphs from text using Gemini AI, turning meeting notes and articles into visual networks of connected concepts. See relationships at a glance instead of searching through pages of text. Costs ~$0.00018 per 500-word article.

**Choose your path:**

- 🚀 [Use it now](#quick-start) (5 min)
- 👀 [See results](#results) (2 min)
- 🧠 [How it works](#how-it-works-architecture) (15 min)
- 🔧 [Deep dive](#explore-the-code) (30 min)

---

## 🌟 Why I Built This

About four months ago, I discovered Thu Vu's video on extracting knowledge graphs from text using GPT-4. The concept was transformative: watching minimal code convert unstructured meeting transcriptions and podcast content into visual structured knowledge networks that made complex information instantly clearer.

Think of knowledge graphs as a way to represent information the way your brain naturally organizes it, through connections and relationships. Instead of reading through pages of text to understand how concepts relate, you see a visual map where everything is connected.

> from seeing the world as a machine to understanding it as a network
>
> {{< extlink href="https://ourpermaculturelife.com/episode-7-systems-view-fritjof-capra/>" >}}Fritjof Capra{{< /extlink >}}

This principle applies perfectly to knowledge management. Understanding information isn't about memorizing facts, it's about seeing how they connect.

---

## 📸 See It In Action

Transform this sentence:

> Sarah works at TechCorp in San Francisco and reports to Michael, who is the VP of Engineering.

Into this structured graph:

- **Entities**: Sarah (person), TechCorp (organization), San Francisco (location), Michael (person), VP of Engineering (occupation)
- **Relationships**: Sarah WORKS_AT TechCorp, TechCorp LOCATED_IN San Francisco, Sarah REPORTS_TO Michael, Michael HAS_ROLE VP of Engineering

{{< gallery caption="A sample knowledge graph showing entity clustering and relationship networks. Notice how connected concepts naturally group together." >}}
{{< gallery-image src="images/nodus-main-interface-kg.webp" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< /gallery >}}

---

## 💡 The Problem (In 60 Seconds)

Here's the fundamental challenge: knowledge is typically created and stored as natural language (documents, transcripts, articles), but it's most useful when structured as a graph.

**Traditional text is hard to navigate:**

- 📝 **Meeting notes chaos**: Searching through hours of transcripts to find "who mentioned that project deadline"
- 🔍 **Research overwhelm**: Reading pages of documentation to understand how concepts connect
- 🏢 **Scattered knowledge**: Company information trapped across wikis, docs, and conversations with no unified view

> Data isn't information. Information, unlike data, is useful. While there's a gulf between data and information, there's a wide ocean between information and knowledge. What turns the gears in our brains isn't information, but ideas, inventions, and inspiration
>
> {{< extlink href="https://todayinsci.com/S/Stoll_Clifford/StollClifford-Quotations.htm>" >}}Clifford Stoll{{< /extlink >}}

---

## ✨ The Solution

This is what made that initial discovery so compelling: modern LLMs changed the equation. They can read text and extract structured information with surprising accuracy, understanding context, resolving ambiguities, and identifying relationships that traditional NLP systems would miss.

LLMs don't just generate text. They can impose structure on chaos, turning massive text corpora into navigable knowledge networks.

**What Nodus does:**

- ✅ Extracts entities and relationships from any text
- ✅ Creates interactive, visual knowledge graphs
- ✅ Supports multiple export formats (HTML, JSON, TXT)
- ✅ Costs pennies per extraction (~$0.00018 per article)
- ✅ No manual tagging or complex NLP pipelines required

Instead of building complex extraction systems, you write straightforward code that leverages Gemini's structured output capabilities. Sophisticated knowledge extraction became accessible through relatively simple implementation.

---

<span id="quick-start"></span>

## 🚀 Quick Start

### Get the source code

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

### Configure the project

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and replace the empty GEMINI_API_KEY value with your actual key
# On Windows: notepad .env (or your preferred editor)
# On Mac/Linux: nano .env (or your preferred editor)

# Install dependencies
uv sync
```

### Launch the application

#### Option 1: Using uv

```bash
uv run streamlit run src/nodus/main.py
```

#### Option 2: Using Docker

```bash
# 1. Ensure Docker Desktop is running, then build the image
docker build -t nodus:latest .

# 2. Run with environment variable
docker run -p 8501:8501 -e GEMINI_API_KEY=your_key_here nodus:latest

# 3. Or use .env file
docker run -p 8501:8501 --env-file .env nodus:latest

# 4. Access the app at http://localhost:8501
```

---

<span id="results"></span>

## 📊 Results

The interface provides four perspectives on your extracted knowledge:

{{< gallery caption="Visual exploration, raw JSON for debugging, and graph statistics for analysis" >}}
{{< gallery-image src="images/nodus-main-interface.webp" alt="Nodus tab showing a summary from the input text." >}}
{{< gallery-image src="images/nodus-main-interface-kg.webp" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< gallery-image src="images/nodus-main-interface-kg-raw.webp" alt="Nodus tab showing the details of the nodes and relationships in the knowledge graph." >}}
{{< gallery-image src="images/nodus-main-interface-kg-statistics.webp" alt="Nodus tab showing some statistics like total nodes, total relationships and total relationships types of the knowledge graph." >}}
{{< /gallery >}}

### What You Get

**Four-tab results view:**

1. **Summary**: Structured executive briefing with key insights
2. **Visualization**: Interactive graph exploration with physics-based layout
3. **Raw Data**: JSON inspection of nodes and relationships
4. **Statistics**: Graph metrics (node count, relationship types, etc.)

**Export options:**

- HTML (interactive graph)
- JSON (structured data)
- TXT (summary)

---

<span id="how-it-works-architecture"></span>

## 🏗️ How It Works (Architecture)

I designed this implementation to prioritize clarity over abstraction. Each layer is intentionally simple, making it easy to understand, modify, and extend. Think of this as a learning foundation rather than a production-ready framework.

The system uses four focused layers:

{{< gallery caption="The clean interface focuses on the core workflow: configure, input, extract, visualize" >}}
{{< gallery-image src="images/nodus-main-interface.webp" alt="Nodus Streamlit application with a sidebar to configure the Gemini API key and model selection, the main interface allows the user to upload a text file or paste the contents to generate a knowledge graph." >}}
{{< /gallery >}}

### 1. 📝 Extraction Layer: Where Structure Meets Language

Modern LLMs with structured output support can accept schema definitions directly, eliminating manual JSON parsing. This is one of the most powerful features that makes knowledge graph extraction so accessible now.

The extractor implements a **two-phase extraction process**:

**Phase 1: Executive Summary Generation**
The system first generates a structured executive summary with five key sections (Overview, Key Points, Entities, Relationships, Conclusions). This optional summary provides high-level context.

**Phase 2: Knowledge Graph Extraction**
The system then extracts entities and relationships, either from the executive summary (for higher-level, focused graphs) or directly from the original text (for more granular detail).

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

**Key requirements for consistent extraction:**

- Node identifiers should be semantic and lowercase with underscores (`sarah` rather than `person_1`)
- Relationship types should be uppercase with underscores (`WORKS_AT` not `works_at`)
- Coreference resolution rules must be explicit (ensuring "Michael" and "he" map to the same entity)

These constraints significantly improve debuggability and graph quality. Generic numeric IDs make troubleshooting extraction issues challenging.

{{< callout warning>}}

Prompt engineering is critical here. Poor prompts lead to inconsistent entity extraction, duplicate nodes, and broken relationships. Always test your prompts with diverse text samples before scaling up. Small prompt changes can dramatically affect extraction quality.

{{< /callout >}}

### 2. 🗂️ Data Models: Defining the Structure

Clear data models establish the contract between the LLM and your application. I use `Pydantic` models to define exactly what structure I expect back from Gemini:

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

**Automatic semantic deduplication:** The `KnowledgeGraph` model includes built-in deduplication that removes redundant relationships in two ways:

- By relationship ID (exact duplicates)
- By semantic triplet: `(source_node_id, type, target_node_id)` (functionally equivalent relationships)

This handles the common case where LLMs generate the same relationship multiple times with different IDs, ensuring clean, efficient graphs.

### 3. 🎨 Visualization Layer: Making Graphs Explorable

Raw graph data is useful, but visualization is where the magic happens. You can suddenly see patterns that were invisible in the text:

**Consistency through color-coding:**
Using deterministic color assignment (hashing node types to a color palette) ensures that entity types maintain consistent visual representation across different graphs. This consistency helps users build mental models quickly.

**Interactive physics simulation:**
Graph layout algorithms like ForceAtlas2 create natural-feeling visualizations where connected nodes cluster together and isolated nodes spread apart. This spatial organization often reveals patterns not obvious in the raw data.

**Dual rendering modes:**
Supporting both HTML string generation and file output enables flexible integration, whether embedding in web applications or generating standalone visualizations.

### 4. 💻 Interface Layer: Streamlining the Workflow

A clear interface flow reduces friction:

1. **Configuration**: API credentials and model selection
2. **Input submission**: Direct text input or file upload (.txt, .md)
3. **Pipeline options**: Build knowledge graph from executive summary or original text
4. **Multi-view results** across four tabs (Summary, Visualization, Raw Data, Statistics)
5. **Export options**: Download results as HTML, JSON, or TXT

---

## 💰 Cost Considerations

One of the best parts about this approach is how affordable it is. Let me break down the economics:

**Gemini 2.5 Flash Lite pricing (paid tier):**

- Input: $0.10 per 1M tokens
- Output: $0.40 per 1M tokens

**Practical example:**
A 500-word article extraction:

- ~600 input tokens
- ~300 output tokens
- Input cost: (600 / 1,000,000) × $0.10 = $0.00006
- Output cost: (300 / 1,000,000) × $0.40 = $0.00012
- **Total cost: ~$0.00018 per extraction**

This cost structure makes knowledge graph extraction viable for high-volume applications and real-time processing scenarios.

**Note:** Gemini 2.5 Flash Lite also includes a generous free tier with no cost for both input and output tokens, making it perfect for testing and small-scale use.

{{< callout note>}}

For production use, implement token counting before API calls to estimate costs. Batch processing multiple documents can optimize API usage. Consider caching extracted graphs to avoid re-processing unchanged content.

{{< /callout >}}

---

## 🎯 Real-World Applications

**Where you can use this today:**

- 📝 **Meeting notes and transcriptions**: Instead of searching through hours of notes to remember "who mentioned that project deadline," you can query the graph: "Show me all deadlines mentioned by Sarah in Q1 meetings." The relationships are already extracted and structured.

- 📚 **Research and learning**: When watching educational content or reading technical documentation, knowledge graphs automatically build a concept map. You can see how ideas connect, which concepts are central, and what you might be missing.

- 🏢 **Organizational knowledge**: Companies have information scattered across documents, wikis, and conversations. Knowledge graphs unify this by extracting entities and relationships regardless of where they appear, creating a living map of organizational knowledge.

**What you can build from here:**

- Connect to document databases for automatic knowledge extraction
- Build query interfaces to explore your graphs conversationally
- Implement graph merging to combine knowledge from multiple sources
- Add temporal tracking to see how knowledge evolves over time

{{< callout note >}}

While simple examples are easy to grasp, knowledge graphs truly shine with scale. A graph with 100 entities and 200 relationships can reveal patterns impossible to spot in raw text. The structure makes everything from trend analysis to anomaly detection significantly easier.

{{< /callout >}}

---

<span id="explore-the-code"></span>

## 🔗 Explore the Code

The complete implementation is available {{< extlink href="https://github.com/jebucaro/blog-code>" >}}on GitHub{{< /extlink >}}. I've kept the codebase intentionally minimal and well-documented so you can understand every piece and adapt it to your needs.

**Start with these files:**

- `models.py` - Pydantic data models with validation and auto-deduplication
- `extractor.py` - Two-phase extraction logic and prompt engineering
- `visualizer.py` - PyVis-based graph rendering and layout algorithms
- `app.py` - Streamlit interface with session state management
- `settings.py` - Environment configuration and model selection
- `errors.py` - Custom exception hierarchy for user-friendly error messages

---

## 🎓 Learning From Thu Vu's Approach

Thu Vu's implementation demonstrates knowledge graph extraction using GPT-4 and LangChain's `LLMGraphTransformer`. The video provides valuable context for understanding how high-level abstractions simplify the extraction process:

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/O-T_6KOXML4?si=t954bEKM1cd6ig6h" title="YouTube video player" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

Watching this implementation in action reveals both the power of abstraction layers and the questions they leave unanswered. While the code is concise and effective, understanding what happens beneath those abstractions becomes important when you need to:

- Debug unexpected extraction results
- Optimize prompts for specific domains
- Adapt the system for different LLM providers
- Control costs at scale

### Why I Built From Scratch

While tools like LangChain's `LLMGraphTransformer` make this process accessible, I wanted to understand the underlying mechanisms. Working directly with the APIs provides deeper insight into how structured extraction actually functions.

**It reveals the core patterns:**
When you strip away multi-provider support and framework overhead, the fundamental logic becomes clear. You can see exactly how prompt engineering drives the quality of extracted entities and relationships.

**It enables precise control:**
Direct API access lets you fine-tune every aspect of the extraction process. You can iterate on prompt design, adjust validation rules, and optimize for your specific domain without navigating through abstraction layers.

**It builds transferable knowledge:**
Understanding how structured output works at the API level prepares you to work with any LLM provider. The principles remain consistent even as tools and frameworks evolve.

This article explores building a similar system from the ground up, focusing on Gemini's structured output capabilities. The goal isn't to replace framework-based approaches, but to understand the fundamental mechanisms that make knowledge graph extraction work.

---

## 💬 What Will You Extract?

Knowledge graphs transform how you interact with information. Whether you're managing research, organizing meeting notes, or building AI applications, structured knowledge extraction opens new possibilities.

I'm curious: what's the first text you'll convert into a knowledge graph? Share your use case or questions on LinkedIn. I'd love to hear what you build with this.
