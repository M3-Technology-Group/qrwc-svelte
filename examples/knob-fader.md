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

  const TestControlsComponent = qrwcSvelte.useComponent("TestControls");

  const fader = TestControlsComponent.useKnob("fader");
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

  const TestControlsComponent = qrwcSvelte.useComponent("TestControls");

  const fader = TestControlsComponent.useKnob("fader");
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

## Fader using Value with Min/Max
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const TestControlsComponent = qrwcSvelte.useComponent("TestControls");

  const fader = TestControlsComponent.useKnob("fader");
</script>

<input type="range" min={fader.valueMin} max={fader.valueMax} bind:value={fader.value} />

<style>
  input[type=range] {
    writing-mode: vertical-lr;
    direction: rtl;
  }
</style>
```

The @Q-SYS/qrwc library also provides control metadata that is also exposed by this library. For knob type controls, this includes the min and max values that can be used to set the range of the fader.


## Numeric Entry

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const TestControlsComponent = qrwcSvelte.useComponent("TestControls");

  const numericEntry = TestControlsComponent.useKnob("int");
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

  const TestControlsComponent = qrwcSvelte.useComponent("TestControls");

  const panKnob = TestControlsComponent.useKnob("panKnob");
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
  onclick={() => panKnob.value = 0}
  >Center
</button>
```

Pan controls are centered when the value is 0. Through the magic of runes, the button logic is independent of the slider, yet both will respond to changes made by each other and any changes made elsewhere (or by other UIs) on the Core.

## Fader with Increment and Decrement buttons
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const gainComponent = qrwcSvelte.useComponent("GainWithRamp");

  const fader = gainComponent.useKnob("gain");
  const increment = gainComponent.useButton("stepper.increase");
  const decrement = gainComponent.useButton("stepper.decrease");
</script>

<!-- Decrement button -->
<button
  onpointerdown={() => (decrement.state = true)}
  onpointerup={() => (decrement.state = false)}
  onpointerleave={() => (decrement.state = false)}
  oncontextmenu={(e) => e.preventDefault()}
>Ramp Down</button>

<!-- Actual fader -->
<input type="range" bind:value={fader.position} min="0" max="1" step="0.01"/>

<!-- Increment button -->
<button
  onpointerdown={() => (increment.state = true)}
  onpointerup={() => (increment.state = false)}
  onpointerleave={() => (increment.state = false)}
  oncontextmenu={(e) => e.preventDefault()}
>Ramp Up</button>
```

In this example, we are using multiple controls within the same component, the fader is the same as the example above.
However, the increment and decrement buttons require a little extra attention as they need to transmit both press and release (momentary buttons).
Both `pointerdown` and `pointerup` up events are necessary to capture both the press and release, but the `pointerleave` event is also necessary as if a user's mouse or finger leaves the button prior to releasing the button the button would remain latched as pressed. By setting the button's state to false on `pointerleave` we cancel the ramp if the user cursor or finger leaves the bounds of the button. Finally, we need to cancel the right-click context menu on touch devices as we don't want it showing when long pressing on this button.