---
title: "DSPy"
publishDate: "2025-06-21T20:12:00Z"
description: "Program, not Prompt LLMs"
logo: "/logos/dspy.png"
github: "https://github.com/stanfordnlp/dspy"
site: "https://dspy.ai/"
---

## 1. What is DSPy?
DSPy is an open-source framework from Stanford for programming, rather than prompting, language-model workflows. You define small, natural-language Python modules, and DSPy compiles them into pipelines whose prompts (and even weights) are tuned automatically

**Key features**  
- **Declarative modules:** Write jobs as readable Python functions with NL “signatures”; no handcrafted prompt fiddling.  
- **Auto-optimization:** Built-in Teleprompter algorithms (e.g., BootstrapFewShot) learn optimal prompts/weights from data.  
- **Composable pipelines:** Chain modules to build RAG flows, agent loops, or evaluators out-of-the-box.  
- **Model-agnostic:** Swap backends, OpenAI, Anthropic, local Llama-family models, without code changes.  
- **Production-ready:** MIT-licensed, light-weight (`pip install dspy-ai`), latest v2.6.27 (released Jun 3 2025).  