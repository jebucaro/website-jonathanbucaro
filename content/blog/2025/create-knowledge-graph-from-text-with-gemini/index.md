---
title: 'Create a Knowledge Graph From Text With Gemini'
date: 2025-10-06T19:59:11-06:00
image: 'images/cover.webp'
tags: [python, streamlit, gemini]
draft: false
description: "Learn how to build a knowledge graph extraction system using Google's Gemini AI. Transform unstructured text into visual, connected knowledge networks with Python and Streamlit, understanding the core architecture without heavy frameworks"
---

About four months ago, I discovered Thu Vu's video on extracting knowledge graphs from text using GPT-4. The concept was transformative, watching minimal code convert unstructured meeting transcriptions and podcast content into visual structured knowledge networks that made complex information instantly clearer.

Think of knowledge graphs as a way to represent information the way your brain naturally organizes it, through connections and relationships. Instead of reading through pages of text to understand how concepts relate, you see a visual map where everything is connected.

> "The structure of the world is not made of atoms, but of connections".
>
> Fritjof Capra

This principle applies perfectly to knowledge management. Understanding information isn't about memorizing facts, it's about seeing how they connect.

## 📖 From text to structure: A simple example

Consider this sentence: _"Sarah works at TechCorp in San Francisco and reports to Michael, who is the VP of Engineering."_

When you read this, your brain automatically extracts:

- **Entities**: Sarah (person), TechCorp (company), San Francisco (location), Michael (person)
- **Relationships**: Sarah WORKS_AT TechCorp, TechCorp LOCATED_IN San Francisco, Sarah REPORTS_TO Michael, Michael HAS_ROLE VP of Engineering

A knowledge graph captures this structure explicitly, making it:

- **Searchable**: Find all people who work at TechCorp
- **Analyzable**: Discover reporting hierarchies
- **Connectable**: Link information across multiple documents

This becomes exponentially more valuable as your text corpus grows. What's overwhelming as unstructured text becomes navigable as a connected graph.

{{< callout note >}}

While this example is simple, knowledge graphs truly shine with scale. A graph with 100 entities and 200 relationships can reveal patterns impossible to spot in raw text. The structure makes everything from trend analysis to anomaly detection significantly easier.

{{< /callout >}}

## 🎯 Why knowledge graphs solve real problems

Traditional text processing treats documents as isolated blocks of information. Knowledge graphs transform this by making connections first-class citizens:

### **For meeting notes and transcriptions:**

Instead of searching through hours of meeting notes to remember "who mentioned that project deadline," you can query the graph: _"Show me all deadlines mentioned by Sarah in Q1 meetings."_ The relationships are already extracted and structured.

### **For research and learning:**

When watching educational content or reading technical documentation, knowledge graphs automatically build a concept map. You can see how ideas connect, which concepts are central, and what you might be missing.

### **For organizational knowledge:**

Companies have information scattered across documents, wikis, and conversations. Knowledge graphs unify this by extracting entities and relationships regardless of where they appear, creating a living map of organizational knowledge.

## 🎥 Building on proven approaches

Thu Vu's implementation demonstrates knowledge graph extraction using GPT-4 and LangChain's `LLMGraphTransformer`. The video provides valuable context for understanding how high-level abstractions simplify the extraction process through framework integration.

<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/O-T_6KOXML4?si=t954bEKM1cd6ig6h" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

Watching this implementation in action reveals both the power of abstraction layers and the questions they leave unanswered. While the code is concise and effective, understanding what happens beneath those abstractions becomes important when you need to:

- Debug unexpected extraction results
- Optimize prompts for specific domains
- Adapt the system for different LLM providers
- Control costs at scale

This article explores building a similar system from the ground up, focusing on Gemini's structured output capabilities. The goal isn't to replace framework-based approaches, but to understand the fundamental mechanisms that make knowledge graph extraction work.

## 🔄 The extraction challenge

Here's the fundamental problem: knowledge is typically created and stored as natural language (documents, transcripts, articles), but it's most useful when structured as a graph.

Traditionally, building knowledge graphs required:

- Manual annotation by domain experts
- Complex rule-based extraction systems
- Expensive natural language processing pipelines
- Continuous maintenance as information changes

Modern LLMs changed this equation. They can read text and extract structured information with surprising accuracy, understanding context, resolving ambiguities, and identifying relationships that traditional NLP systems would miss.

This is what made that initial discovery so compelling: sophisticated knowledge extraction became accessible through relatively straightforward code.

> "The gap between data and wisdom is bridged by structure, not by volume".
>
> Unknown

LLMs don't just generate text, they can impose structure on chaos, turning massive text corpora into navigable knowledge networks.

## 🛠️ Understanding knowledge graphs through direct implementation

While tools like LangChain's `LLMGraphTransformer` make this process accessible, working directly with the underlying mechanisms provides deeper insight into how structured extraction actually functions. This understanding becomes valuable when you need to debug extraction issues, optimize prompt engineering, or adapt the system for specific use cases.

Modern LLM APIs now offer structured output capabilities that make knowledge graph extraction more straightforward than you might expect. Understanding these fundamentals helps you make informed decisions about when to use abstraction layers and when to work directly with the APIs.

## ❓ Why build a focused implementation?

Working with high-level abstractions is efficient for production systems, but there are specific situations where understanding the underlying mechanisms becomes essential:

### 💡 It reveals the core patterns

When you strip away multi-provider support and framework overhead, the fundamental logic of knowledge graph extraction becomes clear. You can see exactly how prompt engineering drives the quality of extracted entities and relationships.

### 🔍 It enables precise control

Direct API access lets you fine-tune every aspect of the extraction process. You can iterate on prompt design, adjust validation rules, and optimize for your specific domain without navigating through abstraction layers.

### ⚡ It builds transferable knowledge

Understanding how structured output works at the API level prepares you to work with any LLM provider. The principles remain consistent even as tools and frameworks evolve.

## 🛠️ Core architecture: Four focused layers

{{< callout tip>}}

This implementation prioritizes clarity over abstraction. Each layer is intentionally simple, making it easy to understand, modify, and extend. Think of this as a learning foundation rather than a production-ready framework.

{{< /callout >}}

### 📝 Extraction layer: Where structure meets language

Modern LLMs with structured output support can accept schema definitions directly. This eliminates manual JSON parsing and validation:

```python
class GeminiExtractor:
    def __init__(self, api_key: str, model_name: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": KnowledgeGraph  # Pydantic model
            },
            system_instruction=SYSTEM_PROMPT
        )
```

The prompt engineering component requires careful consideration:

Key requirements for consistent extraction:

- Node identifiers should be semantic (elon_musk rather than person_1)
- Relationship types should follow clear conventions (WORKS_AT not works_at)
- Coreference resolution rules must be explicit (ensuring "John" and "he" map to the same entity)
- These constraints significantly improve debuggability and graph quality. Generic numeric IDs make troubleshooting extraction issues challenging.

{{< callout warning>}}

Prompt engineering is critical here. Poor prompts lead to inconsistent entity extraction, duplicate nodes, and broken relationships. Always test your prompts with diverse text samples before scaling up. Small prompt changes can dramatically affect extraction quality.

{{< /callout >}}

### 🗂️ Data models: Defining the structure

Clear data models establish the contract between the LLM and your application:

```python
class Node(BaseModel):
    id: str  # Semantic identifier
    label: str  # Human-readable name
    type: str  # Entity category

class Relationship(BaseModel):
    id: str
    type: str  # Relationship category
    source_node_id: str
    target_node_id: str

class KnowledgeGraph(BaseModel):
    nodes: list[Node]
    relationships: list[Relationship]

```

Built-in deduplication at the model level handles cases where the LLM generates redundant relationships, a common occurrence that needs systematic handling.

### 🎨 Visualization layer: Making graphs explorable

Effective visualization transforms raw graph data into actionable insight:

**Consistency through color-coding:**
Using deterministic color assignment (hashing node types to a color palette) ensures that entity types maintain consistent visual representation across different graphs. This consistency helps users build mental models quickly.

**Interactive physics simulation:**
Graph layout algorithms like ForceAtlas2 create natural-feeling visualizations where connected nodes cluster together and isolated nodes spread apart. This spatial organization often reveals patterns not obvious in the raw data.

**Dual rendering modes:**
Supporting both HTML string generation and file output enables flexible integration - whether embedding in web applications or generating standalone visualizations.

### 💻 Interface layer: Streamlining the workflow

A clear interface flow reduces friction:

1. Configuration (API credentials)
2. Input submission
3. Multi-view results:
    - Visual graph exploration
    - Raw data inspection
    - Statistical overview

## 💰 Cost considerations for production use

Understanding the economics helps with scaling decisions:

Gemini Flash 2.5 Lite pricing structure:

- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Practical example:**
A 500-word article extraction:

- ~600 input tokens
- ~300 output tokens
- Cost: ~$0.0001 per extraction

This cost structure makes knowledge graph extraction viable for high-volume applications and real-time processing scenarios.

{{< callout note>}}

For production use, implement token counting before API calls to estimate costs. Batch processing multiple documents can optimize API usage. Consider caching extracted graphs to avoid re-processing unchanged content.

{{< /callout >}}

## 🚀 Getting started: Minimal setup

```bash
# Environment configuration
echo "GEMINI_API_KEY=your_key_here" > .env
uv sync

# Launch application
uv run streamlit run src/nodus/main.py
```

This minimal setup demonstrates a key principle: sophisticated functionality doesn't require complex deployment infrastructure.
