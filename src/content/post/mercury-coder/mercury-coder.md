---
title: "Mercury Coder: Diffusion-Powered Code LLMs at Warp Speed"
description: "Deep-dive into Inception Labs’ discrete-diffusion language-model family—why it’s *really* different, how it works under the hood, and what it means now that open-source diffusion LMs are popping up everywhere."
publishDate: "08 July 2025"
tags: ["Experimental 🧪", "research-paper 🔍"]
site: "https://arxiv.org/abs/2506.17298"
sitePDF: "https://arxiv.org/pdf/2506.17298"
siteLogoTitle: "Paper"
---

## 1. TL;DR  

Mercury Coder Mini (2 B) and Small (7 B) junk the left-to-right decoding loop and instead **denoise many tokens in parallel**. On one NVIDIA H100 they spit out **1 109 tok/s** and **737 tok/s** respectively—around ten times quicker than GPT-4o Flash-Lite, Claude 3.5 Haiku or Codestral—while matching their pass@1 on HumanEval and MBPP.  

## 2. Why this paper matters  

Builders bleed most on **latency**, not model size. By turning generation into a **coarse-to-fine denoising** game, Mercury shows that diffusion—long king in images—finally wins at commercial text scale. It’s the first public demo to break the 1 000 tok/s barrier for code without quality loss.  

## 3. How diffusion text generation works (quick recap)  

1. **Forward process**: gradually replace clean tokens with a special “noise/mask” symbol until the sequence is fully blanked.  
2. **Reverse process**: at each timestep the Transformer sees the noisy sequence **and** a timestep embedding, then predicts the original tokens for *all* masked positions at once.  
3. Repeat for roughly 20-30 steps; the sequence sharpens from gibberish to polished code.  

Because we batch the whole context, the GPU stays 100 % busy and the autoregressive choke-point disappears. The backbone is a plain Transformer, so RoPE, Flash-Attention, LoRA—everything you already know—still plugs in.  

## 3 b. Under the hood – training & inference cookbook  

| Piece | Mercury’s recipe |
|-------|------------------|
| **Objective** | Discrete-diffusion loss (replaces next-token CE) with noise-level weighting |
| **Architecture** | Vanilla Transformer + time embeddings + adaptive LayerNorm |
| **Context window** | Native 32 k; interpolation stretches to 128 k |
| **Sampling schedule** | 12, 20 or 30 denoise passes—picked on the fly to juggle load vs quality |
| **Serving stack** | Fused CUDA kernels, dynamic batching, KV-cache paging; delivers the quoted 1 109 tok/s wall-clock |
| **API surface** | `/chat/completions` clone—just change the base URL |

## 4. Key contributions  

* First 7 B-scale diffusion LLM with public benchmarks  
* **Hard wall-clock win**: > 1 K tok/s, not just “fewer steps on paper”  
* External validation: #1 speed, #2 quality on Copilot Arena’s live leaderboard  

## 5. Results snapshot (speed ↔ quality)  

| Model (~7 B) | HumanEval | MBPP | Speed (tok/s) |
|--------------|-----------|------|---------------|
| **Mercury Mini** | 88.0 % | 77.1 % | **1 109** |
| GPT-4o Mini | 88.0 % | 74.6 % | 59 |
| Claude 3.5 Haiku | 86.0 % | 78.0 % | 61 |
| Codestral 2501 | 85.0 % | 72.2 % | 171 |

*Benchmarked with 1 000 → 1 000 I/O tokens on a single H100.*

## 6. Pros & cons  

| 👍 What shines | 🤔 What to watch |
|---------------|------------------|
| Ten-fold throughput cuts serving cost; perfect for IDE autocomplete & agent loops | ~ 20 + denoise steps hurt CPU/edge deployments—GPUs only for now |
| Transformer-compatible → painless LoRA, RLHF, retrieval tricks | Training recipe opaque; weights closed (for now) |
| Third-party latency & quality audits | Broader reasoning still trails GPT-4-class giants |

## 7. Community buzz (last 14 days)  

* *Emergent Mind*: “Mercury redraws the speed-quality Pareto”  
* *VentureBeat* on Gemini Diffusion: “1 000–2 000 tok/s heralds a new latency league”  

## 8. Hands-on: play with Mercury today 🚀  

* **Browser playground** – chat.inceptionlabs.ai (just email in)  
* **Poe.com** – search *Mercury Coder Small*  
* **OpenAI-style API** – `https://api.inceptionlabs.ai/v1` (≈10 k free tok/day, streaming ready)  
* **Enterprise on-prem** – private weights + SLA via sales  

## 9. Why the 🧪 experimental tag?  

* **Brand-new algorithm class**—best practices still forming  
* **API in flux**—sampling presets, prices and endpoints may shift  
* **Closed weights**—you’re tied to their cloud for now  
* **Narrow eval**—coding focus; safety & general-chat alignment WIP  

Use it for prototypes, but keep a fallback AR model in production.

## 10. Under-the-hood deep-dive (full maths & intuition)  

:::tip[Building Intuition]  
Picture **Tom Cruise in *Mission Impossible*** staring at a CCTV frame so blurred you can barely spot shapes. He runs a high-tech “enhance” loop: each pass removes a slice of blur **across the whole image**, until the villain’s face snaps into razor-sharp focus. Mercury does the same for text—every pass guesses all hidden tokens at once, using new guesses as context for the next clean-up, until the sequence pops out pristine.  
:::

### 10.1 Notation  

* Sequence \(x_0 = (x_0^{(1)},\dots,x_0^{(L)})\)  
* Mask symbol \(\langle\text{MASK}\rangle\)  
* Timesteps \(t = 1,\dots,T\) (Mercury: \(T∈\{12,20,30\}\))  
* Noise rate \(\beta_t\) and retention \(\alpha_t = \prod_{s=1}^{t}(1-\beta_s)\)

### 10.2 Forward (noising) process  

\[
q(z_t^{(i)} \mid x_0^{(i)}) =
\begin{cases}
x_0^{(i)} & \text{w.p. } \alpha_t,\\
\langle\text{MASK}\rangle & \text{w.p. } 1-\alpha_t.
\end{cases}
\]

:::tip[Building Intuition]  
Think of your source code as a page gradually covered with sticky notes. The forward process is you slapping notes on randomly; more steps, more notes.  
:::

### 10.3 Reverse (denoising) model  

\[
\mathcal{L}(\theta)=
\mathbb{E}_{x_0,t}
\bigl[-\,\gamma(t)\,\log p_\theta(x_0\mid z_t,t)\bigr],\quad
\gamma(t)\propto\beta_t(1-\alpha_t).
\]

:::tip[Building Intuition]  
Early steps are trivial (few notes, easy guess); late steps are hopeless (all hidden). Mid-noise steps give the model the hardest yet most informative puzzles, so the loss weights them higher.  
:::

### 10.4 Sampling  

Start with full masks \(z_T\); loop backward, replace masked spots with predictions until \(z_0\) is fully clean.

### 10.5 Why it’s faster  

Only \(T\) full-sequence passes vs \(L\) single-token passes. With \(T=20\) and \(L=512\), that’s a 25× step reduction plus higher GPU utilisation.

### 10.6 Self-conditioning  

Logits from step \(t+1\) feed into step \(t\), acting like a residual highway across time.

### 10.7 AR as a limit case  

As \(\beta_t→0\) and \(T→L\), diffusion degenerates to classic autoregressive decoding—one token per step.

## 11. Competitor spotlight – Mercury vs Gemini Diffusion  

| Feature | **Mercury Mini** | **Gemini Diffusion** |
|---------|------------------|----------------------|
| Speed (H100 / TPU-v5e) | 1 109 tok/s | **1 479 tok/s** (lab) |
| Focus | Code & agents | General + code |
| API | Public, OpenAI-compatible | Wait-list |
| Sizes | 2 B / 7 B | ≈7–10 B (est.) |
| Open weights | ✘ | ✘ |

***Gemini is faster on paper, but Mercury is the diffusion LM you can call *and* fine-tune today.***

## 12. Open-source diffusion LMs you can self-host  

| Model | Size | What you get | Licence |
|-------|------|--------------|---------|
| **LLaDA-8B** | 8 B | Base & Instruct checkpoints | MIT |
| **DiffuLLaMA-7B** | 7 B | Continual-PT LLaMA-2 + LoRA | Apache-2.0 |
| **BD3-LM** | 1.3–6.7 B | Variable block sizes | Apache-2.0 |
| **DiffuGPT / DiffuLLaMA-LoRA** | 125 M–7 B | Retrofit adapters | Apache-2.0 |

Speeds hover in the 100–300 tok/s band on A100—great for experimentation, slower than Mercury.

## 13. So why get excited about Mercury if OSS options already exist?  

1. **Order-of-magnitude speed jump**—1 K + tok/s dwarfs today’s OSS diffusion LMs  
2. **Serious system engineering**—kernels, KV-paging, auto-step scheduling turn theory into wall-clock wins  
3. **Third-party validation**—Copilot Arena & Artificial Analysis rank Mercury #1 in latency  
4. **Vertical focus**—trained for code, supports fill-in-the-middle, already ships IDE plug-ins  
5. **Bridge from lab to prod**—SLAs, on-prem, familiar API while diffusion tooling matures

## 14. Why this belongs on your watch-list  

Diffusion LMs just crossed from neat research to **real-world latency killers**. Mercury proves parallel denoising can outrun every mainstream AR trick, and Gemini’s numbers show Big Tech smells the same opportunity. Whether you’re building an IDE copilot, chain-of-thought agent or multimodal RAG stack, watching Mercury (and the OSS projects chasing it) could hand you a **ten-fold latency dividend** the moment open weights—or bigger checkpoints—drop.  

*Ping me if you benchmark Mercury or any OSS diffusion LMs. I’d love to swap notes and plug the fastest one into my ML pipelines!*  

---

<div class="my-4 p-4 border-s-[0.625rem] rounded-lg border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-sm space-y-6">
  <div class="flex items-center gap-3">
    <img src="/icons/llama.png" alt="Llama Icon" class="w-8 h-8" />
    <div>
      <p class="font-bold text-base text-pink-700 dark:text-pink-300">Ask That Llama!</p>
    </div>
  </div>
  <div class="-mt-2">
    <p class="text-pink-800 dark:text-pink-200 mb-4">
      Try these prompts on your favorite LLM to explore more about this topic by yourself:
    </p>
    <div>
      <p class="text-pink-800 dark:text-pink-200 font-semibold">🤔 1.Does diffusion in text even make sense?</p>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
        <span class="text-pink-800 dark:text-pink-200 text-sm">
          Language is intrinsically sequential—so aren’t autoregressors the “natural” fit? What hidden advantages (or blind spots) does a parallel denoiser reveal?
        </span>
        <button onclick="copyText(this, `Language is intrinsically sequential—so aren’t autoregressors the “natural” fit? What hidden advantages (or blind spots) does a parallel denoiser reveal?`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
    <div>
      <p class="text-pink-800 dark:text-pink-200 font-semibold">🧠 2. Chain-of-thought impact</p>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
        <span class="text-pink-800 dark:text-pink-200 text-sm">
         When a model rewrites every token in bulk, does its reasoning trace become sharper, blurrier, or just different? Explain which internal signals you’d probe to judge “quality of thought.”
        </span>
        <button onclick="copyText(this, `When a model rewrites every token in bulk, does its reasoning trace become sharper, blurrier, or just different? Explain which internal signals you’d probe to judge “quality of thought.”`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
    <div>
      <p class="text-pink-800 dark:text-pink-200 font-semibold">⚠️ 3. Three big drawbacks</p>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
        <span class="text-pink-800 dark:text-pink-200 text-sm">
          Identify the top-three pain points that still keep diffusion LMs off the main production path, and suggest one experiment to tackle each.
        </span>
        <button onclick="copyText(this, `Identify the top-three pain points that still keep diffusion LMs off the main production path, and suggest one experiment to tackle each.`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
     <div>
      <p class="text-pink-800 dark:text-pink-200 font-semibold">4. Beyond autoregression toward AGI</p>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
        <span class="text-pink-800 dark:text-pink-200 text-sm">
          If AGI demands more than next-token guessing—and diffusion feels closer to an energy-based view—how might text denoisers sidestep the classic pitfalls of energy models (mode dropping, slow sampling) while scaling toward general intelligence?
        </span>
        <button onclick="copyText(this, `If AGI demands more than next-token guessing—and diffusion feels closer to an energy-based view—how might text denoisers sidestep the classic pitfalls of energy models (mode dropping, slow sampling) while scaling toward general intelligence?`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>

  </div>
</div>

<script>
function copyText(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    const originalIcon = button.innerHTML;
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    `;
    button.classList.add('text-green-500');
    setTimeout(() => {
      button.innerHTML = originalIcon;
      button.classList.remove('text-green-500');
    }, 2000);
  });
}
</script>