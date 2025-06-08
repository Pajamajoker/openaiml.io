---
title: "Markdown Admonitions"
description: "This post provides a detailed demonstration of how to use the Markdown admonition feature in Astro Citrus, showcasing its ability to highlight important information, tips, warnings, and other key content types in a visually distinct and customizable format"
publishDate: "25 Aug 2024"
seriesId: "markdown-elements"
orderInSeries: 2
tags: ["markdown", "admonitions", "Production-Ready 🚀", "Hyped 🤡", "Game-Changer 🔥", "Experimental 🧪"]
---

## What are admonitions

Admonitions (also known as "asides") are useful for providing supportive and/or supplementary information related to your content.

## How to use them

To use admonitions in Astro Citrus, wrap your Markdown content in a pair of triple colons `:::`. The first pair should also include the type of admonition you want to use.

For example, with the following Markdown:

```md
:::note
Highlights information that users should take into account, even when skimming.
:::
```

Outputs:

:::note
Highlights information that users should take into account, even when skimming.
:::

## Admonition Types

The following admonitions are currently supported:

- `note`
- `tip`
- `important`
- `warning`
- `caution`

### Note

```md
:::note
Highlights information that users should take into account, even when skimming.
:::
```

:::note
Highlights information that users should take into account, even when skimming.
:::

### Tip

```md
:::tip
Optional information to help a user be more successful.
:::
```

:::tip
Optional information to help a user be more successful.
:::

### Important

```md
:::important
Crucial information necessary for users to succeed.
:::
```

:::important
Crucial information necessary for users to succeed.
:::

### Warning

```md
:::warning
Critical content demanding immediate user attention due to potential risks.
:::
```

:::warning
Critical content demanding immediate user attention due to potential risks.
:::

### Caution

```md
:::caution
Negative potential consequences of an action.
:::
```

:::caution
Negative potential consequences of an action.
:::

## Customising the admonition title

You can customise the admonition title using the following markup:

```md
:::note[My custom title]
This is a note with a custom title.
:::
```

Outputs:

:::note[My custom title]
This is a note with a custom title.
:::

<div class="my-4 p-4 border-s-[0.625rem] rounded-lg border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-sm">
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
    <div class="space-y-3">
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg">
        <span class="text-pink-800 dark:text-pink-200">Explain markdown admonitions in the style of Yoda.</span>
        <button onclick="copyText(this, 'Explain markdown admonitions in the style of Yoda.')" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg">
        <span class="text-pink-800 dark:text-pink-200">Give me examples of when to use each type of admonition.</span>
        <button onclick="copyText(this, 'Give me examples of when to use each type of admonition.')" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg">
        <span class="text-pink-800 dark:text-pink-200">Create a story using different types of admonitions to highlight key moments.</span>
        <button onclick="copyText(this, 'Create a story using different types of admonitions to highlight key moments.')" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
      <div class="flex items-center justify-between bg-white dark:bg-pink-800/30 p-3 rounded-lg">
        <span class="text-pink-800 dark:text-pink-200">Compare markdown admonitions to other documentation tools.</span>
        <button onclick="copyText(this, 'Compare markdown admonitions to other documentation tools.')" class="text-pink-600 hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200">
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