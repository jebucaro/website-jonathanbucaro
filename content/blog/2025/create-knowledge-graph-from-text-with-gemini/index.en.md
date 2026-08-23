---
title: 'Create a Knowledge Graph From Text With Gemini'
slug: 'create-knowledge-graph-from-text-with-gemini'
date: 2025-10-06T19:59:11-06:00
image: 'images/cover.png'
tags: [python, ai-tools, gemini]
draft: false
description: "Learn how to build a knowledge graph extraction system using Google's Gemini AI. Transform unstructured text into visual, connected knowledge networks with Python and Streamlit"
---

## Why I built this

About four months ago I watched Thu Vu's video on extracting knowledge graphs from text using GPT-4. The concept stuck with me: minimal code turning unstructured meeting transcripts and podcast content into visual, structured knowledge networks that made complex information instantly clearer.

Think of a knowledge graph as a way to represent information the way your brain naturally organizes it, through connections rather than pages of text. Instead of reading through a document to understand how concepts relate, you see a map where everything is already connected. Understanding information isn't about memorizing facts, it's about seeing how they connect, and that's the principle Nodus, the tool in this post, is built around.

## See it in action

Transform this sentence:

> Sarah works at TechCorp in San Francisco and reports to Michael, who is the VP of Engineering.

Into this structured graph:

- **Entities**: Sarah (person), TechCorp (organization), San Francisco (location), Michael (person), VP of Engineering (occupation)
- **Relationships**: Sarah WORKS_AT TechCorp, TechCorp LOCATED_IN San Francisco, Sarah REPORTS_TO Michael, Michael HAS_ROLE VP of Engineering

{{< gallery caption="A sample knowledge graph showing entity clustering and relationship networks. Notice how connected concepts naturally group together." >}}
{{< gallery-image src="images/nodus-main-interface-kg.webp" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< /gallery >}}

## The problem, and what changed

Knowledge is typically created and stored as natural language: documents, transcripts, articles. But it's most useful when structured as a graph. Traditional text is hard to navigate: searching through hours of meeting transcripts to find who mentioned a deadline, reading pages of documentation to understand how concepts connect, or hunting through wikis and docs for company knowledge that has no unified view.

What made this newly practical is that modern LLMs changed the equation. They read text and extract structured information with surprising accuracy: understanding context, resolving ambiguities, and catching relationships traditional NLP pipelines would miss. That's what Nodus does: it extracts entities and relationships from any text, builds interactive visual knowledge graphs, exports to HTML, JSON, or TXT, and costs about $0.00018 per article, with no manual tagging or NLP pipeline to maintain. Instead of a complex extraction system, you write straightforward code against Gemini's structured output.

## Quick start

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

## Results

The interface gives you four perspectives on your extracted knowledge:

{{< gallery caption="Visual exploration, raw JSON for debugging, and graph statistics for analysis" >}}
{{< gallery-image src="images/nodus-main-interface.webp" alt="Nodus tab showing a summary from the input text." >}}
{{< gallery-image src="images/nodus-main-interface-kg.webp" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< gallery-image src="images/nodus-main-interface-kg-raw.webp" alt="Nodus tab showing the details of the nodes and relationships in the knowledge graph." >}}
{{< gallery-image src="images/nodus-main-interface-kg-statistics.webp" alt="Nodus tab showing some statistics like total nodes, total relationships and total relationships types of the knowledge graph." >}}
{{< /gallery >}}

Four tabs cover the results: a structured **Summary** with key insights, an interactive physics-based **Visualization**, **Raw Data** as JSON for inspecting nodes and relationships, and **Statistics** on node count and relationship types. You can export the graph as HTML (interactive), JSON (structured data), or TXT (summary).

## How it works

I designed this implementation to prioritize clarity over abstraction. Each layer is intentionally simple, closer to a learning foundation than a production framework, so it's easy to understand, modify, and extend.

{{< gallery caption="The clean interface focuses on the core workflow: configure, input, extract, visualize" >}}
{{< gallery-image src="images/nodus-main-interface.webp" alt="Nodus Streamlit application with a sidebar to configure the Gemini API key and model selection, the main interface allows the user to upload a text file or paste the contents to generate a knowledge graph." >}}
{{< /gallery >}}

### Extraction layer

Modern LLMs with structured output support accept schema definitions directly, which eliminates manual JSON parsing and is a big part of what makes this accessible now. The extractor runs a two-phase process: first it generates a structured executive summary with five sections (Overview, Key Points, Entities, Relationships, Conclusions), then it extracts entities and relationships either from that summary (for a higher-level, focused graph) or directly from the original text (for more granular detail).

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

A few constraints keep extraction consistent: node identifiers should be semantic and lowercase with underscores (`sarah` rather than `person_1`), relationship types should be uppercase with underscores (`WORKS_AT` not `works_at`), and coreference resolution rules need to be explicit so "Michael" and "he" map to the same entity. Generic numeric IDs make troubleshooting extraction issues much harder, so these constraints pay off in debuggability.

{{< callout warning>}}
Prompt engineering is critical here. Poor prompts lead to inconsistent entity extraction, duplicate nodes, and broken relationships. Always test your prompts with diverse text samples before scaling up, small prompt changes can dramatically affect extraction quality.
{{< /callout >}}

### Data models

Clear data models establish the contract between the LLM and your application. I use Pydantic models to define exactly what structure I expect back from Gemini:

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

The `KnowledgeGraph` model deduplicates automatically, both by relationship ID (exact duplicates) and by semantic triplet (`source_node_id`, `type`, `target_node_id`) for functionally equivalent relationships. That handles the common case where the LLM generates the same relationship more than once with different IDs.

### Visualization layer

Raw graph data is useful, but visualization is where patterns that were invisible in the text become visible. Deterministic color assignment (hashing node types to a color palette) keeps entity types visually consistent across different graphs, which helps you build a mental model quickly. A force-directed layout (ForceAtlas2) clusters connected nodes together and spreads isolated ones apart, often surfacing structure that isn't obvious in the raw data. The renderer supports both HTML string generation and file output, so it works equally well embedded in a web app or as a standalone visualization.

### Interface layer

The Streamlit interface keeps the flow simple: configure API credentials and model, submit text directly or upload a `.txt`/`.md` file, choose whether to build the graph from the executive summary or the original text, browse results across the four tabs, and export as HTML, JSON, or TXT.

## Cost considerations

This approach is affordable enough to matter. Gemini 2.5 Flash Lite (paid tier) charges $0.10 per 1M input tokens and $0.40 per 1M output tokens. A 500-word article extraction runs roughly 600 input tokens and 300 output tokens: (600 / 1,000,000) × $0.10 = $0.00006 for input, (300 / 1,000,000) × $0.40 = $0.00012 for output, for a total around $0.00018 per extraction. Gemini 2.5 Flash Lite also has a generous free tier with no cost for input or output tokens, which is enough for testing and small-scale use.

{{< callout note>}}
For production use, count tokens before API calls to estimate costs, batch multiple documents to optimize API usage, and cache extracted graphs to avoid re-processing unchanged content.
{{< /callout >}}

## Real-world applications

Meeting notes and transcripts are the obvious case: instead of searching through hours of notes for who mentioned a deadline, you query the graph directly ("show me all deadlines mentioned by Sarah in Q1 meetings"), since the relationships are already extracted and structured. The same idea applies to research and learning, where a knowledge graph built while you read technical documentation shows how ideas connect and which concepts are central. At an organizational level, it can unify information scattered across documents, wikis, and conversations into one map, regardless of where each piece originally lived.

From here you could connect it to a document database for automatic extraction, build a conversational query interface over the graphs, merge graphs from multiple sources, or add temporal tracking to see how knowledge evolves over time.

{{< callout note >}}
Simple examples are easy to grasp, but knowledge graphs shine more with scale. A graph with 100 entities and 200 relationships can reveal patterns that are nearly impossible to spot in raw text, from trend analysis to anomaly detection.
{{< /callout >}}

## Explore the code

The complete implementation is available {{< extlink href="https://github.com/jebucaro/blog-code" >}}on GitHub{{< /extlink >}}. I kept the codebase intentionally minimal and documented so you can understand every piece and adapt it. Start with `models.py` (Pydantic data models with validation and auto-deduplication), `extractor.py` (the two-phase extraction logic and prompts), `visualizer.py` (PyVis-based graph rendering), `app.py` (the Streamlit interface), `settings.py` (environment configuration and model selection), and `errors.py` (a custom exception hierarchy for user-friendly errors).

## Why I built it from scratch

Thu Vu's original implementation uses GPT-4 and LangChain's `LLMGraphTransformer`, and it's worth watching for how a high-level abstraction simplifies extraction:

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/O-T_6KOXML4?si=t954bEKM1cd6ig6h" title="YouTube video player" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

That abstraction is powerful, but it also hides the questions you need answered when you're debugging unexpected extraction results, optimizing prompts for a specific domain, adapting the system to a different LLM provider, or controlling costs at scale. Working directly with the Gemini API instead of through a framework showed me the core pattern more clearly: strip away multi-provider support and framework overhead, and you can see exactly how prompt design drives the quality of extracted entities and relationships. It also means I can tune every part of the pipeline directly, and the knowledge of how structured output works at the API level carries over to any other LLM provider I use later.

The goal here isn't to argue against framework-based approaches, just to understand the mechanism underneath them.

## What will you extract?

Knowledge graphs change how you interact with information, whether you're managing research, organizing meeting notes, or building AI applications on top of structured data. What's the first text you'll try converting into a knowledge graph? Share your use case or questions on LinkedIn, I'd love to hear what you build with this.
