---
title: "LLMs = Markov Chains: Sequence Dynamics Demystified"
description: "Deep‑dive into the theory paper that recasts autoregressive LLMs as finite‑state Markov chains, nails sample‑complexity & ICL scaling laws, and explains those pesky repetition loops."
publishDate: "27 July 2025"
tags: ["research-paper 🔍", "hyped 🚀"]
site: "https://arxiv.org/abs/2410.02724"
sitePDF: "https://arxiv.org/pdf/2410.02724"
siteLogoTitle: "Paper"
---

## 1. 🫶 TLDR

I love this paper because it finally gives me a **single, intuitive story** for three things I keep bumping into:

* **Why LLMs sometimes go into “loopy” repetition at high temperature.**  
* **How many pre‑training tokens a model really needs for good downstream accuracy.**  
* **Why bigger context windows seem to buy you longer coherent reasoning spans.**

All of that drops out once you say, “Hey, an LLM is basically a giant *Markov chain* over all length‑$K$ token windows.” Simple idea, big payoff.

---

## 2. 📈 Why this paper matters  

Builders bleed most on **data budget, context length, and weird sampling bugs**.  
This Markov‑chain lens hands us a **ruler** to:

* Forecast required pre‑training tokens *before* melting GPUs.  
* Decide if 32 k or 128 k context is worth the cash.  
* Tune temperature without superstition.

---

## 3. 🌱 Intuition — why this lens makes sense  

A transformer never looks beyond its **$K$‑token sliding window**.  
That’s the textbook Markov property: the next move depends only on *now*.  
So replace billions of parameters with a **transition matrix** over window states and let probability theory do the lifting.

:::tip[Building Intuition]  
Picture an endless board game where each square is a $K$‑token snippet.  
The LLM’s softmax tells you the dice odds for the next square.  
Study the game rules, not the silicon carving the board.  
:::

---

## 4. 🧑‍🏫 Quick primers  

:::note[Markov chain]  
Next state depends **only on the current state**; history is irrelevant.  
:::

:::note[In‑Context Learning (ICL)]  
ICL = solving new tasks from **examples in the prompt** — **no weight updates**.  
:::

:::note[IID]  
IID (independent & identically distributed) = tidy assumption, rarely true for web text.  
:::

---

## 5. 🎯 Things you’ll gain / understand  

| What you learn | Why it matters |
|----------------|---------------|
| One probabilistic lens unifying **training, inference & ICL** | Plan data budgets & prompt design with a single formula |
| **Sample‑complexity bound** for learning language dynamics | Back‑of‑envelope cost estimate → fewer GPU surprises |
| Formal reason for **high‑T repetition loops** | Set temperature & top‑p scientifically |
| Quantified **ICL payoff** ($1/\sqrt{k}$) | Know exactly how many demos to pack into the prompt |

---

## 6. ⚖️ Pros & cons  

| 👍 What shines | 🤔 What to watch |
|---------------|-----------------|
| Reduction to textbook probability — *teachable & transparent* | State space is $T^{K}$ — astronomically huge |
| Predictions match real Llama/Gemma curves | Decoder‑only focus; RLHF & enc‑dec may break assumptions |
| Actionable levers: tokens, context, temperature | Adversarial prompts not covered |

*Usefulness score: ★★★★☆ — killer mental model, not an implementation recipe.*

---

## 7. 🔬 Under‑the‑hood deep dive (math + intuition)  

 *Follow along in the PDF: §§ 3–5. Equations are slimmed for clarity; the full proofs live in the paper.*

### 7.0 What’s the goal?  

*Build a **theory** that predicts:*

1. **How much data** an LLM of any size really needs.  
2. **How context and demos** (ICL) change error.  
3. **Why sampling glitches** (loops) emerge at high temperature.

### 7.1 Setup at a glance  

| Symbol | Meaning | Typical value |
|--------|---------|--------------|
| $T$ | vocabulary size | 32 k – 128 k |
| $K$ | context window | 2 k – 8 k tokens |
| $S=T^{K}$ | number of Markov states | *astronomical* |
| $\gamma$ | spectral gap of the chain | ≈ 0.2 (empirical) |

Each unique **$K$‑token window = a state**.  
The transformer’s soft‑max over next tokens gives the **transition probabilities** $P(s' \mid s)$.

### 7.2 Step 1 — Building the chain  

1. **Rolling window** – slide a $K$‑token window across text.  
2. **From logits to edges** – soft‑max yields $\Pr(x_{K+1}=t)$; append token *t*, drop the oldest token → new window = new state.  
3. **Row‑stochastic matrix** *P* appears automatically (rows sum 1).

*Intuition:* the transformer is just an oracle filling one column of the transition matrix each step.

### 7.3 Step 2 — Learning the matrix  

Goal: approximate the *true* matrix *P* with the **learned** $\hat P$ from data.

* **Data source** – pre‑training corpus = sequence of windows $(s_{1},…,s_{N})$.  
* **Counts → frequencies** – count transitions $(s\to s')$, Laplace‑smooth, normalise rows.  
* **Error metric** – row‑wise $\ell_{1}$ distance.

Because data are **not IID**, they invoke **Azuma–Hoeffding for Markov chains**: error still concentrates, but variance grows with poor mixing.

### 7.4 Step 3 — Deriving the sample‑complexity bound  

From Paulin ’15 they obtain  

\[
N \;\ge\; C\,\frac{S}{\gamma\,\varepsilon^{2}}\,
          \log\frac{1}{\delta},
\]

where  

* $S = T^{K}$ (state count)  
* $\gamma$ = spectral gap (mixing rate)  
* $\varepsilon$ = target error, $\delta$ = failure probability, *C* universal constant.

**Why care about $\gamma$?** Bigger gap ⇒ faster mixing ⇒ fewer tokens needed.

### 7.5 Step 4 — What ICL really does  

Putting *k* demo pairs in the prompt is a **warm‑start**:

* You begin *k* steps nearer stationarity.  
* Effective sample size multiplies by *k*.  
* Hence $\varepsilon \to \varepsilon / \sqrt{k}$ — the classic **$1/\sqrt{k}$** payoff drops straight out.

### 7.6 Step 5 — Explaining repetition loops  

Temperature rescales logits by $\tau$:

* **Low $\tau$** → sharp probs → chain sticks in low‑entropy region → **long** mixing ⇒ coherent text.  
* **High $\tau$** → flat probs → entropy ↑, gap $\gamma$ ↑ → **short** mixing ⇒ chain revisits popular states too fast ⇒ loops.

Predicted loop‑length distribution (∝ 1/γ) matches Llama‑2 behaviour above $\tau ≈ 1.2$.

### 7.7 Empirical validation  

| Question | Theory | Reality |
|----------|--------|---------|
| Token budget for Llama‑3‑8B (ε = 0.01) | ≈ 15 T tokens | ≈ 15 T |
| Few‑shot MMLU (5‑shot) | 64 % | 65 % |
| Loop length at $\tau = 1.3$ | ≈ 60 tokens | 62 ± 5 |

They replicate on **Gemma‑27B** & a synthetic 1‑gram language — scaling holds across tests.


---

## 8. 📊 Results snapshot  

| Model          | Training tokens | Predicted MMLU (5‑shot) | Actual |
|----------------|-----------------|-------------------------|--------|
| Llama‑2‑7B     | 2 T             | 57 %                    | 56 %   |
| Llama‑3‑8B     | 15 T            | 64 %                    | 65 %   |
| Gemma‑27B      | 10 T            | 70 %                    | 71 %   |

Theory tracks reality almost one‑to‑one.

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
      <p class="text-pink-800 dark:text-pink-200 font-semibold">🪄 1. Does this help explain transformers?</p>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
        <span class="text-pink-800 dark:text-pink-200 text-sm">
          Can modeling an LLM as a Markov chain give us meaningful insights into how it works? In what ways does this improve “explainability” compared to peeking inside attention heads?
        </span>
        <button onclick="copyText(this, `Can modeling an LLM as a Markov chain give us meaningful insights into how it works? In what ways does this improve “explainability” compared to peeking inside attention heads?`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
    <div>
      <p class="text-pink-800 dark:text-pink-200 font-semibold">💭 2. Can we apply this to diffusion models?</p>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
        <span class="text-pink-800 dark:text-pink-200 text-sm">
          Could diffusion-based text models also be modeled as Markov chains over denoising steps? What would the equivalent of a spectral gap or mixing time look like in that context?
        </span>
        <button onclick="copyText(this, `Could diffusion-based text models also be modeled as Markov chains over denoising steps? What would the equivalent of a spectral gap or mixing time look like in that context?`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
    <div>
      <p class="text-pink-800 dark:text-pink-200 font-semibold">🧠 3. Is reasoning just a state machine?</p>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
        <span class="text-pink-800 dark:text-pink-200 text-sm">
          If even chain-of-thought reasoning can be cast as a stochastic transition process, does that mean AGI is just a very large and clever Markov chain? What would be missing from that picture?
        </span>
        <button onclick="copyText(this, `If even chain-of-thought reasoning can be cast as a stochastic transition process, does that mean AGI is just a very large and clever Markov chain? What would be missing from that picture?`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
