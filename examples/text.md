---
title: Text Examples
group: Examples
category: Examples
---

# Text Examples

## Setup

All Examples assume a connected and ready QrwcSvelte instance provided globally.

In these examples using vanilla Svelte, this is done by creating the following file in the `lib` directory:

src/lib/qrwc-svelte.ts
```typescript
import { QrwcSvelte } from 'qrwc-svelte';

export const qrwcSvelte = new QrwcSvelte("core-ip-or-hostname");
```

## Display Text

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const textBox = qrwcSvelte.useText("testControls", "textBox");
</script>

<p>{textBox.string}</p>
```

This will display the text value of the `textBox` control. The text will update when changed on the core. The P tag is optional and any element can be used to display the text.

## Set Text

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const textBox = qrwcSvelte.useText("testControls", "textBox");
</script>

<input type="text" bind:value={textBox.string}/>
```

This will create an input field that can be used to set the text value of the `textBox` control. The text will update when changed locally or on the core. Updated values will be sent to the core continuously while the input field is being edited.


## Set Text With Submit and Cancel Buttons

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const textBox = qrwcSvelte.useText("testControls", "textBox");

  let textBoxText = $state(textBox.string);

  $effect(() => {
    textBoxText = textBox.string;
  });

</script>

<input type="text" bind:value={textBoxText}/>

<!--The Submit button takes what the user entered and sends it to the Core-->
<button 
    disabled={textBoxText === textBox.string} 
    onclick={() => textBox.string = textBoxText}
    >Submit
</button>

<!--The Cancel Button takes the last state from the core and overwrites any user changes-->
<button
    disabled={textBoxText === textBox.string} 
    onclick={() => textBoxText = textBox.string}
    >Cancel
</button>
```

If you simply bind the sting rune provided by the control to an input field, the value will be sent to the core continuously while the input field is being edited. This example shows how to create a submit and cancel button to control when the value is sent to the core. The cancel button will revert the input field to the last value sent by the core. The submit button will send the value to the core. The buttons are disabled when the input field matches the value on the core. The Effect function is used to allow one-way updated from the core to update the input field.

For more information on the Effect function, see the [Svelte documentation](https://svelte.dev/docs/svelte/$effect).


## ComboBox

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const comboBox = qrwcSvelte.useComboBox("testControls", "textComboBox");

</script>

<select bind:value={comboBox.string}>
  {#each comboBox.choices as choice}
    <option value={choice}>{choice}</option>
  {/each}
</select>
```

A Separate dedicated use method is provided specifically for combo boxes that will read the available choices and provide them as an array. The value of the combo box is bound to the string value of the control. The choices are displayed as options in a select element. The value of the control will update when the user selects a new option. The control will update when the value is changed on the core. The combo box selection can also be made by 0 based index by binding to the `comboBox.option` property.