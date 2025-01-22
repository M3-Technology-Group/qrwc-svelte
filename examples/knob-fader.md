---
title: Knob/Fader Examples
group: Examples
category: Examples
---

# Knob and Fader Examples

There is no HTML Input field for a knob, so these examples use a range input field. qrwc-svelte is not opinionated in regards to the UI, so you can use any UI element you like to represent the knob or fader. (There are some great UI libraries for Svelte out there already.)

## Setup

All Examples assume a connected and ready QrwcSvelte instance provided globally.

In these examples using vanilla Svelte, this is done by creating the following file in the `lib` directory:

src/lib/qrwc-svelte.ts
```typescript
import { QrwcSvelte } from 'qrwc-svelte';

export const qrwcSvelte = new QrwcSvelte("core-ip-or-hostname");
```

## Fader

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const fader = qrwcSvelte.useKnob("testControls", "fader");
</script>

<input type="range" bind:value={fader.position} min="0" max="1" step="0.01"/>

<style>
  input[type=range] {
    writing-mode: vertical-lr;
    direction: rtl;
  }
</style>
```

This will create a vertical fader that can be controlled by the user or by setting the `position` property. The fader will also respond to changes made locally or on the Core.

The position is a value between 0 and 1, with 0 being the bottom and 1 being the top, setting the step property sets the resolution of the fader.

The range slider by default only represents whole numbers, so the step property is set to 0.01 to allow for decimal values to be set and represented. Since the position property is always a floating point number between 0 and 1, changing the step value is necessary.

The optional style block is used to make the fader vertical.

## Fader with Label

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const fader = qrwcSvelte.useKnob("testControls", "fader");
</script>


<input type="range" bind:value={fader.position} min="0" max="1" step="0.01"/>
<p>{fader.string}</p>

<style>
  input[type=range] {
    writing-mode: vertical-lr;
    direction: rtl;
  }
</style>
```

The string property of the fader can be used to display the current value of the fader. This will update as the fader is moved or the position is set. The units of the fader are determined by the control on the Core, and are displayed in the string.

## Numeric Entry

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const numericEntry = qrwcSvelte.useKnob("testControls", "int");
</script>

<input 
  type="number" 
  bind:value={numericEntry.value} 
  min={numericEntry.valueMin} 
  max={numericEntry.valueMax}
  />
```

This will create a numeric entry field that can be controlled by the user or by setting the `value` property. The field will also respond to changes made locally or on the Core. The `valueMin` and `valueMax` properties are provided by the control on the core and can be used to set the range of the field.

## Pan with Center Button

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const panKnob = qrwcSvelte.useKnob("testControls", "panKnob");
</script>

<input 
  type="range" 
  bind:value={panKnob.value} 
  min={panKnob.valueMin} 
  max={panKnob.valueMax}
  step="0.01"
  />

<button
  style="background-color: {panKnob.value === 0 ? 'green' : ''};"
  on:click={() => panKnob.value = 0}
  >Center
</button>
```

Pan controls are centered when the value is 0. Through the magic of runes, the button logic is independent of the slider, yet both will respond to changes made by each other and any changes made elsewhere (or by other UIs) on the Core.