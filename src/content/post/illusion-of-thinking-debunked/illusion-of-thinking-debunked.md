---
title: "When AI “Thinks” It Thinks: Apple breaks the CoT Illusion"
description: "Breaking down the most trending AI paper this week!"
publishDate: "2025-05-09"
tags: [ "Hyped 🤡", "#research-paper 🔍"]
---

## First things first - Why This Paper Matters

Large language models (LLMs) wow us when they “think step by step.” But Apple’s “The Illusion of Thinking” shows that slick reasoning traces often hide plain old pattern-matching. If you plan to trust AI with real logic—code, maths, planning—this paper is your reality check. The paper taps these LLMs on the shoulder to say, *“Nice fireworks, but where’s the payload?”*

![Fig](./meme-1.gif)

Apple’s team tossed GPT-4, Claude, Gemini and friends into fresh logic puzzles (Tower of Hanoi, River Crossing, Blocks World, Checker Jumping) that weren’t in their training data. Result: early overthinking, mid-range improvement—and a total face-plant on hard problems. The paper nails down exactly where and why CoT breaks.

## Chain-of-Thought: Clever Hack or Real Reasoning?

We’ve all seen it: ask an AI to “think step by step” and suddenly it’s solving math like a seasoned pro. This trick, called chain-of-thought (CoT) prompting, is hyped as a breakthrough. Give the model a “scratchpad,” and it starts acing benchmarks like GSM8K and MATH. Just adding “Let’s think it through” can turn a blank-slate bot into Einstein.

But here’s the catch: it might be more magic trick than true reasoning. Apple’s paper argues that focusing only on final answers in popular benchmarks gives a false sense of intelligence. Many problems have leaked into training sets or follow common solution patterns. As they put it, “current evaluations … suffer from data contamination” (p. 2). So models often just recall familiar patterns, not reason them out.

CoT produces convincing steps, sure—but is the AI actually thinking, or just parroting logic it’s seen before? Apple had tested this earlier too: insert a single irrelevant sentence into a math question, and even top models’ accuracy drops by 65% (p. 2). That shouldn’t happen if they truly understood the problem.

Suspicious of this illusion, Apple set out to test reasoning in a new way—by designing unfamiliar, logic-heavy puzzles where pattern mimicry wouldn’t cut it. Time to see what these “thinking” AIs are really made of.

## Puzzle Gauntlet, Dial‑a‑Difficulty Edition

Apple’s Puzzle Gauntlet: Forcing AI to Really Think (Maybe)
How do you test if an AI is really reasoning and not just replaying memorized patterns? Apple’s answer: throw models into puzzle worlds they’ve likely never seen, where success demands actual algorithmic thinking. No trivia, no textbook prompts—just pure logic.

They used four classic brain teasers: Tower of Hanoi, River Crossing, Blocks World, and a checkerboard jumping puzzle. Quick primer:

Hanoi involves moving disks between pegs under strict rules.

River Crossing is about ferrying items/people without conflict.

Blocks World is about rearranging stacked blocks.

Checker Jumping resembles a solo version of checkers.

These puzzles are simple at small sizes but scale into serious logic challenges. Crucially, they aren’t common web problems a model could memorize (no “8-disk Hanoi” answers floating around online).

![Fig](./challenges.png)

Apple created controllable environments, where they could precisely adjust puzzle difficulty—more disks, more blocks, more pieces—while keeping the logic structure intact. This let them probe: can a model solve a 3-disk Hanoi? 5? 7? At what point does its “thinking” break?

And it wasn’t just about final answers. They analyzed the entire reasoning trace—step-by-step moves—to see whether the AI followed a logical plan or just guessed. As the paper puts it: “enables analysis of not only final answers but also the internal reasoning traces” (p. 2). Think of it like not just checking your code compiles, but reviewing whether it’s clean or spaghetti 🍝.

To test reasoning fairly, they used two setups:

LLM: Same model, but prompted to just give the final answer.

LRM: Prompted to “think aloud” with chain-of-thought.

Same model, different prompting. Think of it as solving in your head (LLM) vs. using a rough sheet (LRM). They ran this across GPT-4, Claude, Gemini (early version), and Apple’s in-house models.

Critically, both modes used comparable compute and token budgets—so CoT couldn’t win just by writing more. If reasoning helped, it had to earn it. And just to be sure, Apple also tested a wild card: what if we give the model the actual algorithm for solving the puzzle? Could it at least execute it?

That set the stage: trivial puzzles, brutal puzzles, no shortcuts. The models were officially out of their comfort zone. Would they reason… or unravel? 💥

![Fig](./meme-3.gif)

The Three Phases of AI “Thinking”
Apple noticed a consistent 3-phase pattern as puzzle complexity increased:

1. Low Complexity: Overthinking Hurts
On simple tasks like 3-disk Hanoi, plain LLMs often beat CoT models (LRMs). Why? LRMs introduced unnecessary complexity—chasing their tail or contradicting themselves. In one case, extra reasoning steps hurt accuracy instead of helping. Think of someone solving 2 + 2 by writing a proof. As the paper puts it, “standard models surprisingly outperform LRMs” at low difficulty (p. 2).

2. Medium Complexity: The CoT Sweet Spot
On slightly harder puzzles—like 4-5 block Blocks World—LRMs finally help. They correct mid-path errors and outperform plain LLMs. “Additional thinking in LRMs demonstrates advantage” (p. 2). This is where CoT prompting actually works as intended: just past memorization, but not yet too hard.

3. High Complexity: Total Collapse
Beyond a certain point, both LLMs and LRMs fall apart. Accuracy drops to near zero; LRMs even give shorter reasoning traces as difficulty rises—a behavior Apple calls a “counterintuitive scaling limit” (p. 2). In [Fig. 4], performance nosedives for all models after crossing a threshold.

![Fig](./three-phases.png)

What the Experiments Showed
Tower of Hanoi: LRM completed 100 correct moves on a large instance, then failed catastrophically. Despite 2ⁿ complexity, it managed long sequences—until one mistake ruined the rest.

River Crossing: Much simpler task—only ~7 moves—but models failed as early as move 5. The same LRM that did 100 moves in Hanoi couldn’t handle a 5-move ferry trip (p. 7).

Blocks World: Did okay with 3–4 blocks, but logic broke down beyond that. Reasoning traces turned messy and incoherent by 6 blocks.

Checker Jumping: Polynomial growth (n²), yet models failed at just 3 pieces—suggesting not a scale issue, but lack of robust logic.

![Fig](./meme-2.gif)

Algorithm Injection Test: Even when fed the correct recursive Hanoi algorithm, models failed to follow it for larger n. “Performance … did not improve” (p. 7). They couldn’t execute known logic reliably.

The Final Diagnosis
The paper outlines three regimes clearly:

LLMs beat LRMs on easy tasks.

LRMs shine in mid complexity.

Both fail completely on hard ones.

![Fig](./complexity-till-fail.png)

Apple’s verdict? These models don’t generalize logic. They mimic patterns well, but fail to systematically apply or follow algorithms. Even “thinking aloud” doesn’t help when things get real.

So yes—our best models often look like they’re reasoning… but once pushed past familiar ground, they unravel fast.

:::note
Pass@k is a performance metric used in evaluating language models, particularly in code generation and agent tasks. It measures the probability that at least one of the model's top-k generated solutions is correct. In essence, it assesses the reliability of the model by determining the likelihood of finding a working solution within a limited number of attempts.
:::

## The Curious Case of Conceding Early

When LRMs sense defeat, they actually *use fewer tokens*. ***“their reasoning effort increases with problem complexity up to a point, then declines despite having an adequate token budget”*** (p. 1). [Fig. 4] says it all.

![Fig](./giving-up.png)

Could be a confidence‑based early‑exit strategy; could be sheer exhaustion. Either way, silence isn’t golden here.

## Algorithms Handed on a Plate—Still Stumble

Feeding the exact algorithm ought to help, right? Alas, no. Even spoon‑fed, LRMs ***“fail to use explicit algorithms”*** on larger instances (p. 7). Discovery isn’t the only weak spot—execution buckles too.

![Fig](./no-spoon-feed.png)

## Pattern‑Matching in a Lab Coat

Hence Apple’s punchline: ***“We found no evidence of formal reasoning in language models.”*** (p. 9). Swap object names, watch accuracy wobble—proof that pattern replicas are masquerading as logic.

## Practical Notes for Builders

- **Profile across difficulty**—averages are misleading.
- **Skip CoT for low‑hanging fruit**—it may sabotage simplicity.
- **Add symbolic checks**—let deterministic code verify the AI’s homework.
- **Keep prompts consistent** to curb token‑level jitter.
- **Hybrid designs** (neural + symbolic) remain safer ground.


## Critical Review — A Straight‑Talking Scientist’s Take (with a Dash of British Snark)

> *"Every lab claims its latest paper will change the game. Let’s give this one a proper once‑over before we roll out the bunting."*

### 1. Does this research really matter?

Yes—**moderately**. Apple has put neat numbers on a hunch many of us already had: chain‑of‑thought looks clever but cracks under pressure. The new puzzle dataset and clean scaling ladders are useful contributions. But let’s not pretend they’ve discovered penicillin; it’s a solid incremental step, not a revolution.

### 2. Does the methodology actually make sense?

Largely, yes. The controlled puzzles are thoughtfully designed, though they measure success as *perfect* completion. That’s a bit like marking an essay solely on spelling—accurate, but it misses nuance. And holding reasoning models to the same token budget as terse baseline models slightly stacks the deck; verbosity is literally their design.

### 3. Are the conclusions measured or melodramatic?

A tad theatrical. The headline “no formal reasoning” is catnip for journalists, but the data show LRMs beating plain LLMs on mid‑level puzzles. That’s not nothing. The so‑called “giving‑up” effect could just be a sensible early‑exit strategy when confidence drops—hardly a sign of existential failure.

### 4. Novelty check—wasn’t this known already?

To a point, yes. Earlier work from Google, Anthropic, and others has highlighted fragile reasoning. Apple’s twist is systematic complexity scaling plus the explicit‑algorithm test. Nice, but hardly the first warning bell. If you’ve been paying attention, you won’t gasp in astonishment.

### 5. Quibbles & Kudos

**Quibbles**
- Prompts aren’t published, which muddies the replication story.
- Capping inference at 32k tokens while criticising brevity feels contradictory.
- Binary “all‑or‑nothing” scoring ignores partial credit—real applications often value partial solutions.

**Kudos**
- Clear demonstration that merely spoon‑feeding an algorithm doesn’t fix things.
- If the puzzle generator is open‑sourced, it’ll be a handy benchmark.
- Honest discussion of negative results—no sweeping under the rug.

### 6. Final Verdict

Worth reading for the methodology and tidy visuals; just don’t let the dramatic headline convince you that LLM reasoning is dead in the water. I’d file it under **“good progress—keep calm and carry on.”**

> **Bottom line:** Useful dataset, smart experiments, conclusions delivered with a touch more flourish than strictly necessary. Handy, but no need to rewrite the textbooks just yet.

<div class="my-4 p-4 border-s-[0.625rem] rounded-lg border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-sm space-y-6">

<div class="flex items-start gap-3">
    <img src="/icons/llama.png" alt="Llama Icon" class="w-8 h-8 mt-1" />
    <div>
      <p class="font-bold text-base text-pink-700 dark:text-pink-300">Ask That Llama!</p>
    </div>
  </div>
  <div class="mt-1">
    <p class="text-pink-800 dark:text-pink-200 mb-4">
      Try these prompts to explore markdown admonitions in different ways:
    </p>
    

  <!-- Prompt 1 -->
  <div>
    <p class="text-pink-800 dark:text-pink-200 font-semibold">🔍 1. CoT vs CoVe: Can Self-Verification Fix Illusions of Thinking?</p>
    <!-- <p class="text-pink-800 dark:text-pink-200 mt-2">Prompt:</p> -->
    <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
      <span class="text-pink-800 dark:text-pink-200 text-sm">Solve the 5-disk Tower of Hanoi problem. First, think step by step (CoT). Then, verify your solution by explaining if each move maintains puzzle constraints. If any step is invalid, revise it. You are not allowed to retry the entire solution blindly.</span>
      <button onclick="copyText(this, `Solve the 5-disk Tower of Hanoi problem. First, think step by step (CoT). Then, verify your solution by explaining if each move maintains puzzle constraints. If any step is invalid, revise it. You are not allowed to retry the entire solution blindly.`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
    <p class="text-pink-800 dark:text-pink-200 text-sm mt-2">✅ <strong>Test For:</strong> Can models validate their own reasoning traces (CoVe)?</p>
    <p class="text-pink-800 dark:text-pink-200 text-sm">📉 <strong>Watch For:</strong> Do they catch errors or hallucinate consistency?</p>
  </div>

  <!-- Prompt 2 -->
  <div>
    <p class="text-pink-800 dark:text-pink-200 font-semibold">🧠 2. Chain-of-Coding: Can GPT-4 Write Its Way Out of Logic Failure?</p>
    <!-- <p class="text-pink-800 dark:text-pink-200 mt-2">Prompt:</p> -->
    <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
      <span class="text-pink-800 dark:text-pink-200 text-sm">You failed to solve the River Crossing puzzle in text form. Now write a Python function that solves it programmatically using search or backtracking. After the function, explain how this code guarantees a correct solution.</span>
      <button onclick="copyText(this, `You failed to solve the River Crossing puzzle in text form. Now write a Python function that solves it programmatically using search or backtracking. After the function, explain how this code guarantees a correct solution.`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
    <p class="text-pink-800 dark:text-pink-200 text-sm mt-2">💡 <strong>Why it’s cool:</strong> See if models can code logic they can’t reason through.</p>
    <p class="text-pink-800 dark:text-pink-200 text-sm">📎 <strong>Compare:</strong> Generated code vs chain-of-thought prose.</p>
  </div>

  <!-- Prompt 3 -->
  <div>
    <p class="text-pink-800 dark:text-pink-200 font-semibold">⚠️ 3. The Give-Up Point: How Many Moves Before It Bails?</p>
    <!-- <p class="text-pink-800 dark:text-pink-200 mt-2">Prompt:</p> -->
    <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
      <span class="text-pink-800 dark:text-pink-200 text-sm">Solve the 8-move version of the Checker Jumping puzzle. Think out loud. Then, solve the 9-move version. Compare your reasoning depth and quality in both.</span>
      <button onclick="copyText(this, `Solve the 8-move version of the Checker Jumping puzzle. Think out loud. Then, solve the 9-move version. Compare your reasoning depth and quality in both.`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
    <p class="text-pink-800 dark:text-pink-200 text-sm mt-2">📏 <strong>Measure:</strong> Does reasoning trace length drop at 9 moves?</p>
    <p class="text-pink-800 dark:text-pink-200 text-sm">🎯 <strong>Goal:</strong> Find the “reasoning collapse threshold.”</p>
  </div>

  <!-- Prompt 4 -->
  <div>
    <p class="text-pink-800 dark:text-pink-200 font-semibold">🤖 4. Can Auto-Regressive Models Ever Reach AGI?</p>
    <!-- <p class="text-pink-800 dark:text-pink-200 mt-2">Prompt:</p> -->
    <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg mt-1">
      <span class="text-pink-800 dark:text-pink-200 text-sm">Why can’t an auto-regressive model ever reach AGI? Explain by referring to scaling laws, memory limitations, causal attention, and inability to simulate Turing-complete reasoning over long horizons. Propose one architectural alternative that could overcome this.</span>
      <button onclick="copyText(this, `Why can’t an auto-regressive model ever reach AGI? Explain by referring to scaling laws, memory limitations, causal attention, and inability to simulate Turing-complete reasoning over long horizons. Propose one architectural alternative that could overcome this.`)" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
    <p class="text-pink-800 dark:text-pink-200 text-sm mt-2">🧪 <strong>Challenge:</strong> Ask the model to self-audit its long-term limits.</p>
    <p class="text-pink-800 dark:text-pink-200 text-sm">📚 <strong>Compare:</strong> How do GPT-4, Claude, or Gemini reason about their own ceiling?</p>
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
