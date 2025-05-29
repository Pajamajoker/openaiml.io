---
title: "Markdown Admonitions"
description: "This post provides a detailed demonstration of how to use the Markdown admonition feature in Astro Citrus, showcasing its ability to highlight important information, tips, warnings, and other key content types in a visually distinct and customizable format"
publishDate: "25 Aug 2024"
seriesId: "markdown-elements"
orderInSeries: 2
tags: ["markdown", "admonitions", "Production-Ready 🚀", "Hyped 🤡", "WIP ⚙️", "Game-Changer 🔥", "Experimental 🧪"]
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
    <div class="flex-1">
      <p class="font-bold text-base text-pink-700 dark:text-pink-300 mb-2">Ask That Llama!</p>
      <p class="text-pink-800 dark:text-pink-200">
        Ask your favorite LLM to re-explain the concept above in simpler terms — or try:<br />
        <em>"Explain markdown admonitions in the style of Yoda."</em>
      </p>
    </div>
  </div>
</div>