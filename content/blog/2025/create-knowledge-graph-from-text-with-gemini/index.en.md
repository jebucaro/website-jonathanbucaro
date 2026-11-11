---
title: 'Create a Knowledge Graph From Text With Gemini'
slug: 'create-knowledge-graph-from-text-with-gemini'
date: 2025-10-06T19:59:11-06:00
lastmod: 2026-09-22T19:31:23-06:00
image: 'images/cover.png'
tags: [python, ai-tools, gemini]
draft: false
description: "Learn how to build a knowledge graph extraction system using Google's Gemini AI. Transform unstructured text into visual, connected knowledge networks with Python and Streamlit"
---

In June 2025 I watched Thu Vu's video on turning text into a knowledge graph with GPT-4 and LangChain's `LLMGraphTransformer`. It took very little code, and I wanted to understand what that one call was actually doing. I got a bit carried away, and it ended up as Nodus, a small Streamlit app that does the same extraction straight against the Gemini API, with no framework in between.

A knowledge graph keeps information as connections instead of paragraphs. Give Nodus this sentence:

> Sarah works at TechCorp in San Francisco and reports to Michael, who is the VP of Engineering.

And you get this back:

- **Entities**: Sarah (person), TechCorp (organization), San Francisco (location), Michael (person), VP of Engineering (occupation)
- **Relationships**: Sarah WORKS_AT TechCorp, TechCorp LOCATED_IN San Francisco, Sarah REPORTS_TO Michael, Michael HAS_ROLE VP of Engineering

{{< gallery caption="A sample knowledge graph showing entity clustering and relationship networks. Notice how connected concepts naturally group together." >}}
{{< gallery-image src="images/nodus-knowledge-graph.png" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< /gallery >}}

With one sentence that's a toy. With an hour of meeting transcripts, it's the difference between searching for who mentioned a deadline and just looking at the map.

## Run it locally

The code lives in my `blog-code` repo. A sparse checkout grabs only the Nodus folder:

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

Add your Gemini API key and install the dependencies:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and replace the empty GEMINI_API_KEY value with your actual key
# On Windows: notepad .env (or your preferred editor)
# On Mac/Linux: nano .env (or your preferred editor)

# Install dependencies
uv sync
```

Then start it with uv:

```bash
uv run streamlit run src/nodus/main.py
```

Or with Docker, if you prefer:

```bash
# 1. Ensure Docker Desktop is running, then build the image
docker build -t nodus:latest .

# 2. Run with environment variable
docker run -p 8501:8501 -e GEMINI_API_KEY=your_key_here nodus:latest

# 3. Or use .env file
docker run -p 8501:8501 --env-file .env nodus:latest

# 4. Access the app at http://localhost:8501
```

## What you get

{{< gallery caption="Visual exploration, raw JSON for debugging, and graph statistics for analysis" >}}
{{< gallery-image src="images/nodus-summary.png" alt="Nodus tab showing a summary from the input text." >}}
{{< gallery-image src="images/nodus-knowledge-graph-results.png" alt="Nodus tab showing a knowledge graph created by extracting the entities and relationships from the input text." >}}
{{< gallery-image src="images/nodus-raw-data.png" alt="Nodus tab showing the details of the nodes and relationships in the knowledge graph." >}}
{{< gallery-image src="images/nodus-statistics.png" alt="Nodus tab showing some statistics like total nodes, total relationships and total relationships types of the knowledge graph." >}}
{{< /gallery >}}

You paste text or upload a `.txt`/`.md` file, pick a model, and get four tabs: a **Summary** with the key points, an interactive **Visualization**, the **Raw Data** as tables and JSON (each node and relationship with its supporting context), and **Statistics** on nodes and relationship types. You can filter the graph by relationship type, hide isolated nodes, and export everything as HTML, JSON, or TXT.

## How it works

There's no NLP pipeline here. Gemini supports structured output, so Nodus passes it a Pydantic schema as the `response_format` and gets back JSON that maps straight onto these models:

```python
class Node(BaseModel):
    id: str  # Semantic identifier (lowercase with underscores)
    label: str | None  # Human-readable name (auto-generated from id if omitted)
    type: str  # Entity category (e.g., person, organization)
    context: str | None  # Short supporting detail from the text (date, number, reason)

class Relationship(BaseModel):
    id: str  # Relationship identifier
    type: str  # Relationship type (UPPERCASE with underscores)
    source_node_id: str
    target_node_id: str
    context: str | None  # Short supporting detail about this relationship

class KnowledgeGraph(BaseModel):
    nodes: list[Node]
    relationships: list[Relationship]

class ExecutiveSummary(BaseModel):
    summary: str  # Structured briefing text with the five section headings
    key_points: list[str] | None  # Optional 3-7 executive-level highlights

class ExtractionResult(BaseModel):
    summary: ExecutiveSummary | None
    knowledge_graph: KnowledgeGraph
```

That schema is the contract with the model, and it's most of the trick. The summary and the graph are two calls that run in parallel over the original text. You can build the graph from the summary instead for a higher-level view, but you lose most of the detail and it costs two sequential calls. There's also a thinking level (default, low, medium, high) for harder text.

The rest is prompt rules, and small changes to them made a big difference in quality. Node IDs are semantic and lowercase (`sarah`, not `person_1`), relationship types are uppercase (`WORKS_AT`), and coreference is explicit so "Michael" and "he" end up as the same node. The semantic IDs paid off the most: when an extraction goes wrong, `sarah` tells you a lot more than `person_1`. Test your prompts with different kinds of text before you trust them.

Even with strict prompts, the model sometimes returns a relationship pointing at a node it never defined, or spells it slightly differently. Instead of silently dropping those edges, a repair pass tries an exact match, then a normalized match, then a fuzzy match with a high cutoff, and if nothing fits it creates a placeholder node so the edge survives. The UI tells you what it repaired. The graph also deduplicates relationships, both exact copies and the same source, type, and target with different IDs.

The input text is untrusted, so Nodus wraps it in delimiters and tells the model to treat it as data, not instructions. It's a first line of defense against prompt injection, not a guarantee. One caveat: the Interactions API doesn't expose the adjustable safety filters, so only Gemini's always-on core protections apply.

For the graph itself, PyVis renders it with a ForceAtlas2 layout, so connected nodes cluster together, and node types hash to a fixed color so the same type looks the same in every graph.

## Chat with your document

After extracting, you can ask questions about the document. Answers come from the original text, and each one ends with an `### Evidence` section quoting the document, plus a "From the relationships:" line when it used the graph. The model writes those quotes, so they can be slightly off; check anything important against the source.

{{< gallery caption="Ask a question and get an answer grounded in the source text, with quoted evidence" >}}
{{< gallery-image src="images/nodus-chat.png" alt="Nodus Chat section showing a question about the document, a prose answer, and an Evidence block with a verbatim quote and a relationship line." >}}
{{< /gallery >}}

{{< callout warning>}}
Chat makes a privacy tradeoff extraction doesn't. Extraction calls use `store=False`, but Chat uses `store=True` and sends the full original source text on the first question, so Gemini retains the conversation and your document for the Interactions API retention window (55 days on the paid tier, 1 day on the free tier). This applies only while you're using Chat, and it resets whenever you re-extract or click Clear.
{{< /callout >}}

## What it costs

Almost nothing. Nodus offers `gemini-3.5-flash-lite` (cheapest), `gemini-3.8-flash` (the default), and `gemini-3.1-pro-preview` (most capable). On Flash-Lite's paid tier, $0.30 per 1M input tokens and $2.50 per 1M output tokens, a 500-word article is about 600 tokens in and 300 out, around $0.0009 per extraction. Building the graph from the summary roughly doubles that. Flash-Lite also has a free tier, which is plenty for trying it out.

## Why not just use LangChain

LangChain's abstraction is great when you want a result fast, and Thu Vu's video is worth watching for exactly that:

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/O-T_6KOXML4?si=t954bEKM1cd6ig6h" title="YouTube video player" style="border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

But it hides the part I wanted to learn. Calling Gemini directly showed me that the core is structured output plus good prompts, and that carries over to any other provider. It also made debugging a weird extraction a lot easier, because there was nothing between me and the model. I'm not arguing against frameworks, I just wanted to see what's underneath.

The full code is {{< extlink href="https://github.com/jebucaro/blog-code" >}}on GitHub{{< /extlink >}}. Start with `extractor.py` for the prompts and injection guards, `models.py` for the schema, and `repair.py` for the repair pass.
