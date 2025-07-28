---
title: "Mercury Coder: Diffusion-Powered Code LLMs at Warp Speed"
description: "Deep-dive into Inception Labs’ discrete-diffusion language-model family why it’s *really* different, how it works under the hood, and what it means now that open-source diffusion LMs are popping up everywhere."
publishDate: "08 July 2025"
tags: ["Experimental 🧪", "research-paper 🔍"]
site: "https://arxiv.org/abs/2506.17298"
sitePDF: "https://arxiv.org/pdf/2506.17298"
siteLogoTitle: "Paper"
---

## 1. TL;DR  

Mercury Coder Mini (2 B) and Small (7 B) junk the left-to-right decoding loop and instead **denoise many tokens in parallel**. On one NVIDIA H100 they spit out **1 109 tok/s** and **737 tok/s** respectively around ten times quicker than GPT-4o Flash-Lite, Claude 3.5 Haiku or Codestral while matching their pass@1 on HumanEval and MBPP.

***Don't forget to checkout Ask That Llama section below!***

## 2. Why this paper matters  

Builders bleed most on **latency**, not model size. By turning generation into a **coarse-to-fine denoising** game, Mercury shows that diffusion long king in images finally wins at commercial text scale. It’s the first public demo to break the 1 000 tok/s barrier for code without quality loss.  

## 3. How diffusion text generation works (quick recap)  

1. **Forward process**: gradually replace clean tokens with a special “noise/mask” symbol until the sequence is fully blanked.  
2. **Reverse process**: at each timestep the Transformer sees the noisy sequence **and** a timestep embedding, then predicts the original tokens for $all$ masked positions at once.  
3. Repeat for roughly 20-30 steps; the sequence sharpens from gibberish to polished code.  

Because we batch the whole context, the GPU stays 100% busy and the autoregressive choke-point disappears. The backbone is a plain Transformer, so RoPE, Flash-Attention, LoRA everything you already know still plugs in.  

## 3 b. Under the hood – training & inference cookbook  

| Piece | Mercury’s recipe |
|-------|------------------|
| **Objective** | Discrete-diffusion loss (replaces next-token CE) with noise-level weighting |
| **Architecture** | Vanilla Transformer + time embeddings + adaptive LayerNorm |
| **Context window** | Native 32 k; interpolation stretches to 128 k |
| **Sampling schedule** | 12, 20 or 30 denoise passes picked on the fly to juggle load vs quality |
| **Serving stack** | Fused CUDA kernels, dynamic batching, KV-cache paging; delivers the quoted 1 109 tok/s wall-clock |
| **API surface** | /chat/completions clone just change the base URL |

## 4. Key contributions  

* First 7 B-scale diffusion LLM with public benchmarks  
* **Hard wall-clock win**: > 1 K tok/s, not just “fewer steps on paper”  
* External validation: #1 speed, #2 quality on Copilot Arena’s live leaderboard  

## 5. Results snapshot (speed ↔ quality)  

| Model (~7 B)            | HumanEval | MBPP    | Speed (tok/s) |
|-------------------------|-----------|---------|---------------|
| **Mercury Mini**        | 88.0%     | 77.1%   | **1 109**     |
| GPT-4o Mini             | 88.0%     | 74.6%   | 59            |
| Claude 3.5 Haiku        | 86.0%     | 78.0%   | 61            |
| Codestral 2501          | 85.0%     | 72.2%   | 171           |

*Benchmarked with 1 000 → 1 000 I/O tokens on a single H100.*

## 6. Pros & cons  

| 👍 What shines                                           | 🤔 What to watch                                   |
|----------------------------------------------------------|----------------------------------------------------|
| Ten-fold throughput cuts serving cost; perfect for IDE autocomplete & agent loops | ~20 + denoise steps hurt CPU/edge deployments GPUs only for now |
| Transformer-compatible → painless LoRA, RLHF, retrieval tricks | Training recipe opaque; weights closed (for now)   |
| Third-party latency & quality audits                     | Broader reasoning still trails GPT-4-class giants  |

## 7. Why the 🧪 experimental tag?  

* **Brand-new algorithm class** best practices still forming  
* **API in flux** sampling presets, prices and endpoints may shift  
* **Closed weights** you’re tied to their cloud for now  
* **Narrow eval** coding focus; safety & general-chat alignment WIP  

Use it for prototypes, but keep a fallback AR model in production.

***You can skip this section and scroll down if you're not into nerd math.***

## 8. Under-the-hood deep dive (math and intuition; I recommend reading the paper along-side this section)

:::tip[Building Intuition]  
Picture **Tom Cruise in *Mission Impossible*** staring at a CCTV frame so blurred you can’t make out a face.  
He launches an “enhance” loop: each pass removes a bit of blur **everywhere at once** and shows the new guess to the next pass, until the villain’s face snaps into perfect focus.  
Mercury’s text denoiser works the same way: each pass refines every masked token, then hands that stronger canvas to the following pass.  
:::

### 8.1  The objects we play with  

| Symbol | What it is | Plain-English meaning |
|--------|------------|-----------------------|
| $x_0$ | $(x_0^{(1)},\dots,x_0^{(L)})$ | the clean ground-truth sequence of length $L$ |
| $\langle\text{MASK}\rangle$ | special token | plays the role of “noise” for text |
| $z_t$ | noisy sequence at step $t$ | mixture of clean tokens and masks |
| $T$ | total steps (12, 20 or 30) | how many refinement passes we will do |
| $\beta_t$ | scalar in (0,1) | probability of *losing* a token at step $t$ |
| $\alpha_t$ | $\displaystyle\prod_{s=1}^t (1-\beta_s)$ | probability a token *survives* up to step $t$ |

### 8.2  Forward process $q$: how we add noise  

For each position $i$ we either keep the original token or replace it with a mask.

$$
\underbrace{q\!\bigl(z_t^{(i)} \mid x_0^{(i)}\bigr)}_{\text{probability model}}
=
\begin{cases}
x_0^{(i)} & \text{with prob. } \alpha_t, \\[6pt]
\langle\text{MASK}\rangle & \text{with prob. } 1-\alpha_t
\end{cases}
$$

**What this says**  
* After $t$ ticks of the corruption clock, each token is independently blanked out with probability $1-\alpha_t$.  
* The bigger the step index, the more blank tokens you expect to see.

:::tip[Building Intuition]  
Imagine your code is printed on paper and you slap sticky notes at random.  
Step 1: a few notes.  
Step 10: half the page is covered.  
Keep going and the page becomes a solid wall of sticky notes.  
:::

### 8.3  Reverse model $p_\theta$: how we remove noise  

A Transformer $f_\theta$ receives the current noisy sequence $z_t$ plus a learned embedding of the step index $t$.  
It outputs a full-vocabulary logit vector for **every** position, turning into a categorical distribution

$$
p_\theta(x_0 \mid z_t, t)
=
\operatorname{Cat}\!\Bigl(
x_0;\,
\operatorname{softmax}\!\bigl(f_\theta(z_t,\,e_t)\bigr)
\Bigr).
$$

**What this means**  
* Given the partially masked sentence and “how fuzzy” it currently is (the timestep), the network predicts what the original clean token was at every index.  
* All positions are predicted **in one shot**, not left-to-right.

### 8.4  Training loss: make the predictions match the truth  

$$
\mathcal{L}(\theta)
=
\mathbb{E}_{x_0,t}
\Bigl[
-\gamma(t)\,
\log p_\theta\!\bigl(x_0 \mid z_t, t\bigr)
\Bigr],
\qquad
\gamma(t)\;\propto\;\beta_t\bigl(1-\alpha_t\bigr).
$$

**Line-by-line explanation**  

1. Draw a clean sentence $x_0$ from the data set.  
2. Pick a timestep $t$ uniformly (or with a schedule).  
3. Corrupt $x_0$ into $z_t$ using the forward rule.  
4. Ask the model to reconstruct $x_0$ from $z_t$.  
5. Penalise the negative log-probability of every correct token, but scale it by $\gamma(t)$.  

*Why the weight $\gamma(t)$?*  
* Very small $t$: the task is almost trivial (hardly any masks) so we down-weight it.  
* Very large $t$: the task is hopeless (all masks) so we also down-weight it.  
* Middle $t$: the model learns the most, so we give these steps the highest weight.

### 8.5  Sampling: turning pure noise into fluent text  

1. **Initial state**  
   $z_T = (\langle\text{MASK}\rangle,\dots,\langle\text{MASK}\rangle)$.  
2. **Loop** for $t = T,\,\dots,\,1$:  
   1. Run $f_\theta(z_t,e_t)$ to get logits for every slot.  
   2. Pick the arg-max (or sample) at each masked position.  
   3. Drop those predictions into the sequence to form $z_{t-1}$.  
3. **Return** the fully denoised sequence $z_0$.

At every pass we update **all** positions, so the cost is proportional to $T$ (≈20) instead of the length $L$ (hundreds or thousands).

### 8.6  Why fewer passes can still beat left-to-right  

* Autoregressive decoding does one token per forward pass → $L$ passes.  
* Diffusion does $T$ passes on the whole sequence → roughly 20 passes.  
* Each pass is heavier, but GPUs love large matrix multiplies more than many small ones, so utilisation jumps from ~40 % to ~90 %.

**Net outcome on an H100**: more than ten-fold increase in tokens per second.

### 8.7  Self-conditioning trick  

After each step we cache the logits and feed them (concatenated) back into the next step.  
Think of it as giving the model a *sketch* of its previous guess so it can refine instead of restarting.

### 8.8  Autoregression as a special case  

If you let $\beta_t \to 0$ (almost no masking) and set $T = L$ (one step per position), the process reduces to standard left-to-right language modelling:  
mask a single future slot, predict it, move on.  
Classical autoregression is just the infinite-step, zero-noise corner of this broader diffusion family.


## 9. Competitor spotlight – Mercury vs Gemini Diffusion  

| Feature                     | **Mercury Mini** | **Gemini Diffusion** |
|-----------------------------|------------------|----------------------|
| Speed (H100 / TPU-v5e)      | 1 109 tok/s      | **1 479 tok/s** (lab)|
| Focus                       | Code & agents    | General + code       |
| API                         | Public, OpenAI-compatible | Wait-list |
| Sizes                       | 2 B / 7 B         | ≈7–10 B (est.)      |
| Open weights                | ✘                | ✘                    |

***Gemini is faster on paper, but Mercury is the diffusion LM you can call and fine-tune today.***

## 10. Open-source diffusion LMs you can self-host  

| Model                      | Size         | What you get               | Licence    |
|----------------------------|--------------|----------------------------|------------|
| **LLaDA-8B**               | 8 B          | Base & Instruct checkpoints | MIT        |
| **DiffuLLaMA-7B**         | 7 B          | Continual-PT LLaMA-2 + LoRA | Apache-2.0 |
| **BD3-LM**                 | 1.3–6.7 B    | Variable block sizes        | Apache-2.0 |
| **DiffuGPT / DiffuLLaMA-LoRA** | 125 M–7 B | Retrofit adapters            | Apache-2.0 |

Speeds hover in the 100–300 tok/s band on A100 great for experimentation, slower than Mercury.

## 11. So why get excited about Mercury if OSS options already exist?  

1. **Order-of-magnitude speed jump** 1 K + tok/s dwarfs today’s OSS diffusion LMs  
2. **Serious system engineering** kernels, KV-paging, auto-step scheduling turn theory into wall-clock wins  
3. **Third-party validation** Copilot Arena & Artificial Analysis rank Mercury #1 in latency  
4. **Vertical focus** trained for code, supports fill-in-the-middle, already ships IDE plug-ins  
5. **Bridge from lab to prod** SLAs, on-prem, familiar API while diffusion tooling matures

## 12. Why this belongs on your watch-list  

Diffusion LMs just crossed from neat research to **real-world latency killers**. Mercury proves parallel denoising can outrun every mainstream AR trick, and Gemini’s numbers show Big Tech smells the same opportunity. Whether you’re building an IDE copilot, chain-of-thought agent or multimodal RAG stack, watching Mercury (and the OSS projects chasing it) could hand you a **ten-fold latency dividend** the moment open weights or bigger checkpoints drop.  

*Ping me if you benchmark Mercury or any OSS diffusion LMs. I’d love to swap notes and plug the fastest one into my ML pipelines!*

---

<div class="my-4 p-4 border-s-[0.625rem] rounded-lg border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-sm space-y-6">
  <div class="flex items-center gap-3">
    <picture>
      <source srcset="/icons/optimized/llama-32.png" media="(max-width: 639px)">
      <source srcset="/icons/optimized/llama-40.png" media="(min-width: 640px)">
      <img src="/icons/llama.png" alt="Llama Icon" class="w-8 h-8" loading="lazy" decoding="async" />
    </picture>
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
          Language is intrinsically sequential, so aren’t autoregressors the “natural” fit? What hidden advantages (or blind spots) does a parallel denoiser reveal?
        </span>
        <button onclick="copyText(this, `Language is intrinsically sequential, so aren’t autoregressors the “natural” fit? What hidden advantages (or blind spots) does a parallel denoiser reveal?`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
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
          If AGI demands more than next-token guessing and diffusion feels closer to an energy-based view, how might text denoisers sidestep the classic pitfalls of energy models (mode dropping, slow sampling) while scaling toward general intelligence?
        </span>
        <button onclick="copyText(this, `If AGI demands more than next-token guessing and diffusion feels closer to an energy-based view, how might text denoisers sidestep the classic pitfalls of energy models (mode dropping, slow sampling) while scaling toward general intelligence?`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
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