---
title: "Unsloth"
description: "Fastest QLoRA Fine-tuning for LLMs"
publishDate: "2025-06-23T18:26:00Z"
logo: "/logos/unsloth.png"
github: "https://github.com/unslothai/unslot"
site: "https://unsloth.ai"
tags: ["Tool Stack 🧰", "Production-Ready 🚀"]

**What it is**  
Unsloth is an open-source library designed to make QLoRA fine-tuning of LLaMA models 2x faster and memory-efficient. Ideal for running on Colab, Kaggle, or low-VRAM machines.

**Key features**  
- **Up to 2x speedup:** Optimized CUDA kernels and attention rewrites.  
- **Low RAM/GPU support:** Fine-tune LLaMA 2/3 on 8GB or even 4GB GPUs.  
- **QLoRA optimized:** Flash-attn, 4-bit quantization, paged attention built-in.  
- **Trainer integration:** Works with Hugging Face `transformers` and `trl`.  
- **Colab/Kaggle-ready:** Official notebooks and support for budget training.