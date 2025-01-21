---
title: Button Examples
group: Examples
category: Examples
---

# Button Examples

## Setup

All Examples assume a connected and ready QrwcSvelte instance provided globally.

In these examples using vanilla Svelte, this is done by creating the following file in the `lib` directory:

src/lib/qrwc-svelte.ts
```typescript
import { QrwcSvelte } from 'qrwc-svelte';

export const qrwcSvelte = new QrwcSvelte("core-ip-or-hostname");
```

## Toggle Button

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const toggleButton = qrwcSvelte.useButton("testControls", "toggleButton");
</script>

<button
    style="background-color: {toggleButton.state ? 'green' : '#777'};"
    onclick={() => toggleButton.toggle()}
    >Toggle!
</button>
```

This will toggle the button state between `true` and `false` when clicked. The button will change color based on the state, when set locally or on the Core.

## Set Button State

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const toggleButton = qrwcSvelte.useButton("testControls", "toggleButton");
</script>

<button
    style="background-color: {toggleButton.state ? 'green' : '#777'};"
    onclick={() => toggleButton.state = true}
    >ON
</button>

<button
    style="background-color: {toggleButton.state ? '#777' : 'red'};"
    onclick={() => toggleButton.state = false}
    >OFF
</button>
```

Each button will set the state of the button to `true` or `false` respectively. The buttons will change color based on the state, when set locally or on the Core. Both buttons will react to the state of the control regardless of where it was set.

## Momentary Button (Press and Release)

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const momentaryButton = qrwcSvelte.useButton("testControls", "momentaryButton");
</script>

<button
  style="background-color: {momentaryButton.state ? 'green' : '#777'};"
  onpointerdown={() => momentaryButton.state = true}
  onpointerup={() => momentaryButton.state = false}
  onpointerout={() => momentaryButton.state = false}
  oncontextmenu={(e) => e.preventDefault()}
  >Press and Hold
</button>
```
In addition to the `pointerdown` and `pointerup` events, the `pointerout` event is used to ensure the button state is set to `false` when the pointer leaves the button. The `contextmenu` event is used to prevent the context menu from appearing when the button is long pressed on touch based devices.

## Trigger Button

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const triggerButton = qrwcSvelte.useTrigger("testControls", "triggerButton");
</script>

<button onclick={() => triggerButton.trigger()}>Trigger!</button>
```

In this example, the useTrigger method is used to create the button. Since triggers are write only and don't have feedback, the triggerButton object only contains the generic metadata and a trigger method. When the button is clicked, the trigger method is called, sending the trigger command to the Core.