# qrwc-svelte LLM Documentation

## Overview

qrwc-svelte is a Svelte 5 wrapper library for the @q-sys/qrwc package that provides reactive control objects for Q-SYS components using Svelte 5 Runes. It enables real-time bidirectional communication between Svelte applications and Q-SYS cores via WebSocket connections.

**Key Features:**
- Reactive state management using Svelte 5 Runes ($state, $derived)
- Automatic connection management with reconnection support
- Redundant core failover support
- TypeScript support with full type definitions
- Simple API designed for A/V programmers

**Version:** 1.1.0 (supports QRWC 0.5.0-beta)

**Note:** This library is not sponsored, supported, or endorsed by QSC, LLC.

## Prerequisites

Before using qrwc-svelte, ensure:

1. **Q-SYS Designer 10.0 or later** is installed
2. **Q-SYS Hardware or V-Core** is available (QRWC not supported in emulation mode)
3. **Script Access** is configured: All components must have `Script Access` property set to `All` or `External` in Q-SYS Designer
4. **QRWC Service** is enabled on the core: Core Manager > Network > Services > Management > Q-SYS Remote WebSocket Control

## Installation & Setup

### Project Creation

Create a new Svelte 5 project with Vite:

```bash
npm create vite@latest my-qsys-ui -- --template svelte-ts
cd my-qsys-ui
npm install
```

### Install qrwc-svelte

```bash
npm install qrwc-svelte
```

### Create QRWC Instance

Create a file in the `src/lib` directory to provide the QRWC-Svelte instance globally:

**src/lib/qrwc.ts:**
```typescript
import { QrwcSvelte } from 'qrwc-svelte';

// Simple connection with IP address
export const qrwcSvelte = new QrwcSvelte("192.168.1.100");

// Or with connection options
export const qrwcSvelte = new QrwcSvelte({
  coreIp: "192.168.1.100",
  redundantCoreIp: "192.168.1.101", // Optional
  secure: false, // true for wss, false for ws
  poleInterval: 35, // Polling interval in milliseconds
  controlFilter: undefined // Optional filter
});
```

## Core Concepts

### Connection Lifecycle

The connection goes through three states:
- `"connecting"` - QRWC wrapper is attempting to connect
- `"connected"` - QRWC wrapper is ready to accept subscriptions
- `"disconnected"` - QRWC wrapper is not connected

**CRITICAL:** Always check `isConnected` before using any controls. Controls will throw errors if used before connection is established.

### Component and Control Hierarchy

```
QrwcSvelte Instance
  └── Component (useComponent)
      └── Control (useButton, useKnob, etc.)
```

- **Component**: Represents a Q-SYS component (identified by Code Name)
- **Control**: Represents a specific control within a component (identified by control name)

### Reactive State

All control properties use Svelte 5 Runes:
- `$state` - Mutable reactive state
- `$derived` - Computed reactive state

Control properties automatically update when values change on the Q-SYS core, and setting properties sends commands to the core.

## API Reference

### QrwcSvelte Class

Main entry point for the library.

#### Constructor

```typescript
// Simple constructor with IP address string
constructor(coreIP: string)

// Advanced constructor with connection options
constructor(connectionOptions: ConnectionOptions)
```

**Example:**
```typescript
const qrwc = new QrwcSvelte("192.168.1.100");
// or
const qrwc = new QrwcSvelte({
  coreIp: "192.168.1.100",
  redundantCoreIp: "192.168.1.101"
});
```

#### Properties

All properties are read-only `$derived` runes.

- **`isConnected: $derived<boolean>`** - `true` when connection is "connected", `false` otherwise. **Always check this before using controls.**

- **`connectionStatus: $derived<ConnectionEvent>`** - Current connection state: `"connecting" | "connected" | "disconnected"`

- **`connectionAttemptCount: $derived<number>`** - Number of connection attempts made

- **`activeCore: $derived<"primary" | "redundant">`** - Currently active core (when redundant core is configured)

- **`coreIp: $derived<string>`** - IP address of the currently connected core

#### Methods

- **`useComponent(componentId: string): Component`**
  - Fetches a component instance by Code Name
  - Throws error if component doesn't exist or is excluded by control filter
  - Returns Component instance for accessing controls

- **`getComponentList(): string[]`**
  - Returns array of component Code Names with external script access
  - Only includes components not excluded by control filter

- **`disconnect(): void`**
  - Manually disconnects and stops reconnection attempts
  - Flushes all subscriptions
  - Controls become invalid after disconnection

### Component Class

Represents a Q-SYS component instance.

#### Properties

- **`Name: string`** - User-defined name of the component
- **`Id: string`** - Code Name (ID) of the component
- **`Type: string`** - Component type as defined in Q-SYS Designer

#### Methods

- **`getControlList(): string[]`** - Returns array of control names in this component

- **`useControl(control: string): GenericControl`**
  - Generic control accessor for unsupported control types
  - Returns object with `value`, `position`, `string` properties
  - Properties may be `undefined` if control doesn't support them

- **`useButton(control: string): ButtonControl`**
  - Fetches a button control (Boolean type)
  - Returns ButtonControl with `state` and `toggle()` method

- **`useTrigger(control: string): TriggerControl`**
  - Fetches a trigger control (write-only, no feedback)
  - Returns TriggerControl with `trigger()` method

- **`useKnob(control: string): KnobControl`**
  - Fetches a knob/fader control (Float, Integer, Time, or Array type)
  - Returns KnobControl with `value`, `position`, `string`, and min/max properties

- **`useText(control: string): TextControl`**
  - Fetches a text control
  - Returns TextControl with `string` property

- **`useComboBox(control: string): TextComboBoxControl`**
  - Fetches a combo box control (Text type with choices)
  - Returns TextComboBoxControl with `string`, `option`, and `choices` properties

**All use methods throw errors if:**
- Control doesn't exist in the component
- Component doesn't exist
- Connection is not established

**Read Only Controls: LEDs, etc.**
Read only controls such as LEDs and Level Meters are supported by using the use method that most closely matches the control type. The direction property will be "Read Only".
- useButton() for LEDs
- useKnob() for Level Meters
- useText() for Text Displays

**Example:**
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
### Control Types

#### ButtonControl

For Boolean controls (toggle buttons, momentary buttons).

**Properties:**
- `state: boolean` - Current button state (read/write)
- `toggle(): void` - Toggles the button state
- `ControlName: string` - Control name
- `Direction: ControlDirection` - "Read/Write", "Read Only", or "Write Only"
- `Type: ControlType` - Control type
- `rawControl: Control | undefined` - Raw QRWC control object (not reactive)

**Example:**
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const button = component.useButton("toggleButton");
</script>

<button 
  style="background-color: {button.state ? 'green' : '#777'};"
  onclick={() => button.toggle()}
>
  Toggle!
</button>
```

#### TriggerControl

For write-only trigger controls (no feedback).

**Properties:**
- `trigger(): void` - Triggers the control
- `ControlName: string` - Control name
- `Direction: ControlDirection` - Usually "Write Only"
- `Type: ControlType` - "Trigger"
- `rawControl: Control | undefined` - Raw QRWC control object

**Example:**
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const trigger = component.useTrigger("triggerButton");
</script>

<button onclick={() => trigger.trigger()}>Trigger!</button>
```

#### KnobControl

For numeric controls (faders, gains, pans, frequency controls, etc.).

**Properties:**
- `value: number` - Numeric value (read/write)
- `valueMin: number | undefined` - Minimum value from core
- `valueMax: number | undefined` - Maximum value from core
- `position: number` - Position value 0-1 (read/write)
- `string: string` - String representation with units (read/write)
- `stringMin: string | undefined` - Minimum string value
- `stringMax: string | undefined` - Maximum string value
- `ControlName: string` - Control name
- `Direction: ControlDirection` - Control direction
- `Type: ControlType` - "Float", "Integer", "Time", or "Array"
- `rawControl: Control | undefined` - Raw QRWC control object

**Example:**
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const fader = component.useKnob("fader");
</script>

<input 
  type="range" 
  bind:value={fader.position} 
  min="0" 
  max="1" 
  step="0.01"
/>
<p>{fader.string}</p>
```

#### TextControl

For text input/output controls.

**Properties:**
- `string: string` - Text value (read/write)
- `ControlName: string` - Control name
- `Direction: ControlDirection` - Control direction
- `Type: ControlType` - "Text"
- `rawControl: Control | undefined` - Raw QRWC control object

**Example:**
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const textBox = component.useText("textBox");
</script>

<input type="text" bind:value={textBox.string} />
```

#### TextComboBoxControl

For combo box controls with predefined choices.

**Properties:**
- `string: string` - Selected string value (read/write)
- `option: number` - Selected index in choices array (read/write, 0-based)
- `choices: string[]` - Array of available choices (read-only, reactive)
- `ControlName: string` - Control name
- `Direction: ControlDirection` - Control direction
- `Type: ControlType` - "Text"
- `rawControl: Control | undefined` - Raw QRWC control object

**Example:**
```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const comboBox = component.useComboBox("textComboBox");
</script>

<select bind:value={comboBox.string}>
  {#each comboBox.choices as choice}
    <option value={choice}>{choice}</option>
  {/each}
</select>
```

#### GenericControl

For controls without specific type support.

**Properties:**
- `value: string | number | boolean | undefined` - Value (may be undefined)
- `position: number | undefined` - Position 0-1 (may be undefined)
- `string: string | undefined` - String value (may be undefined)
- `ControlName: string` - Control name
- `Direction: ControlDirection` - Control direction
- `Type: ControlType` - Control type
- `rawControl: Control | undefined` - Raw QRWC control object

## Usage Patterns

### Connection Status Gating

**CRITICAL:** Always gate control usage behind connection check.

```svelte
<script lang="ts">
  import { qrwcSvelte } from './lib/qrwc';
</script>

{#if qrwcSvelte.isConnected}
  <!-- Use controls here -->
{:else}
  <p>Connecting... (Attempt {qrwcSvelte.connectionAttemptCount})</p>
{/if}
```

### Basic Button Toggle

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const button = component.useButton("toggleButton");
</script>

<button
  style="background-color: {button.state ? 'green' : '#777'};"
  onclick={() => button.toggle()}
>
  Toggle!
</button>
```

### Momentary Button (Press and Release)

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const momentaryButton = component.useButton("momentaryButton");
</script>

<button
  style="background-color: {momentaryButton.state ? 'green' : '#777'};"
  onpointerdown={() => momentaryButton.state = true}
  onpointerup={() => momentaryButton.state = false}
  onpointerout={() => momentaryButton.state = false}
  oncontextmenu={(e) => e.preventDefault()}
>
  Press and Hold
</button>
```

**Note:** `pointerout` ensures button releases if pointer leaves button area. `contextmenu` prevents context menu on long press.

### Fader with Range Input

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const fader = component.useKnob("fader");
</script>

<input 
  type="range" 
  bind:value={fader.position} 
  min="0" 
  max="1" 
  step="0.01"
/>

<style>
  input[type=range] {
    writing-mode: vertical-lr;
    direction: rtl;
  }
</style>
```

### Fader Using Value with Min/Max

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const fader = component.useKnob("fader");
</script>

<input 
  type="range" 
  min={fader.valueMin} 
  max={fader.valueMax} 
  bind:value={fader.value} 
/>
```

### Text Input with Submit and Cancel

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  const textBox = component.useText("textBox");
  
  let textBoxText = $state(textBox.string);
  
  $effect(() => {
    textBoxText = textBox.string;
  });
</script>

<input type="text" bind:value={textBoxText} />

<button 
  disabled={textBoxText === textBox.string} 
  onclick={() => textBox.string = textBoxText}
>
  Submit
</button>

<button
  disabled={textBoxText === textBox.string} 
  onclick={() => textBoxText = textBox.string}
>
  Cancel
</button>
```

**Note:** Without this pattern, binding directly to `textBox.string` sends updates continuously while typing.

### Multiple Controls from Same Component

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  const component = qrwcSvelte.useComponent("TestControls");
  
  const fader = component.useKnob("fader");
  const muteButton = component.useButton("mute");
  const triggerButton = component.useTrigger("reset");
</script>

<!-- Use all controls from the same component instance -->
```

### Audio Mixer Example (Real-World)

```svelte
<script lang="ts">
  import { qrwc } from "$lib/qrwc";
  
  const gain1 = qrwc.useComponent("MainVol");
  const gain2 = qrwc.useComponent("MainVol");
  const gain3 = qrwc.useComponent("MainVol");
  
  const gain1Level = gain1.useKnob("gain");
  const gain2Level = gain2.useKnob("gain");
  const gain3Level = gain3.useKnob("gain");
  
  const gain1Mute = gain1.useButton("mute");
  const gain2Mute = gain2.useButton("mute");
  const gain3Mute = gain3.useButton("mute");
</script>

<div class="flex gap-8">
  <div class="flex flex-col">
    <input
      type="range"
      min={gain1Level.valueMin}
      max={gain1Level.valueMax}
      step="0.01"
      bind:value={gain1Level.value}
    />
    <button
      class="{gain1Mute.state ? 'btn-error' : 'btn-outline'}"
      onclick={() => gain1Mute.toggle()}
    >
      {gain1Mute.state ? 'Muted' : 'Mute'}
    </button>
  </div>
  <!-- Repeat for gain2, gain3 -->
</div>
```

## Connection Options

### ConnectionOptions Interface

```typescript
interface ConnectionOptions {
  coreIp: string;                    // Required: IP/hostname of primary core
  redundantCoreIp?: string;           // Optional: IP/hostname of redundant core
  secure?: boolean;                   // Optional: true for wss, false for ws (default: false)
  poleInterval?: number;              // Optional: Polling interval in ms (default: 35)
  controlFilter?: string[] | ComponentFilter; // Optional: Filter components
}
```

### Core IP Configuration

- **Single Core:** Set only `coreIp`
- **Redundant Cores:** Set both `coreIp` (primary) and `redundantCoreIp` (secondary)
  - Library automatically fails over to redundant core if primary goes offline
  - Alternates between cores on reconnection attempts

### Secure Connection (WSS)

```typescript
const qrwc = new QrwcSvelte({
  coreIp: "192.168.1.100",
  secure: true  // Uses wss:// instead of ws://
});
```

**Important:** Ensure certificates are trusted by the client. Self-signed certificates must be trusted before the UI loads.

### Polling Interval

```typescript
const qrwc = new QrwcSvelte({
  coreIp: "192.168.1.100",
  poleInterval: 35  // Milliseconds (default: 35)
});
```

Uses change groups under the hood. Generally leave at default unless you have many frequently-changing controls.

### Control Filter

Filter which components are subscribed to:

**Array of Component Names:**
```typescript
const qrwc = new QrwcSvelte({
  coreIp: "192.168.1.100",
  controlFilter: ["testControls", "myOtherControl"]
});
```

**Warning:** If no components match the filter, connection will fail. At least one component must match.

**Function Filter:**
```typescript
const qrwc = new QrwcSvelte({
  coreIp: "192.168.1.100",
  controlFilter: (component) => {
    return component.ID.match(/^testControl[0-9A-Fa-f]{2}/gm) !== null;
  }
});
```

## SvelteKit Integration

qrwc-svelte is **not compatible with server-side rendering**. It must run in the browser only.

### Recommended: Vanilla Svelte

For embedded A/V UIs, vanilla Svelte with Vite is recommended (routing not needed on touch screens).

### Using with SvelteKit

If using SvelteKit, disable SSR and create instance in layout:

**src/routes/+layout.ts:**
```typescript
import { QrwcSvelte } from 'qrwc-svelte';
import type { LayoutLoad } from './$types.js';
import { PUBLIC_COREIP } from '$env/static/public';
import { browser } from '$app/environment';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async ({ params }) => {
  if (browser) {
    return {
      qrwc: new QrwcSvelte(PUBLIC_COREIP)
    };
  }
};
```

**src/routes/+layout.svelte:**
```svelte
<script lang="ts">
  import type { LayoutData } from './$types.js';
  import type { Snippet } from 'svelte';
  
  let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

{#if data.qrwc?.isConnected}
  {@render children()}
{:else}
  <p>{data.qrwc?.connectionStatus}</p>
  <p>Connection Attempt: {data.qrwc?.connectionAttemptCount}</p>
{/if}
```

**src/routes/+page.svelte:**
```svelte
<script lang="ts">
  let { data } = $props();
  const component = data.qrwc!.useComponent("testControls");
  const button = component.useButton("toggleButton");
</script>

<button
  style="background-color: {button?.state ? 'green' : '#777'};"
  onclick={() => button?.toggle()}
>
  Toggle!
</button>
```

## Troubleshooting Guide

### Common Errors

#### "Component not found"

**Error:** `Component ${componentId} not found`

**Causes:**
- Component Code Name is incorrect
- Component Script Access is not set to "All" or "External"
- Component is excluded by controlFilter

**Solutions:**
1. Verify Code Name in Q-SYS Designer (Properties > Script Access > Code Name)
2. Set Script Access to "All" or "External"
3. Check controlFilter configuration
4. Use `getComponentList()` to see available components

#### "Control not found"

**Error:** `Control ${control} not found in component ${componentId}`

**Causes:**
- Control name is incorrect
- Control doesn't exist in component

**Solutions:**
1. View Component Controls Info in Q-SYS Designer (Tools > View Component Controls Info...)
2. Verify exact control name (case-sensitive)
3. Use `component.getControlList()` to see available controls

#### Connection Failures

**Symptoms:**
- `connectionStatus` stays "connecting" or "disconnected"
- `connectionAttemptCount` keeps increasing

**Causes:**
- Incorrect core IP address
- QRWC service not enabled on core
- Network connectivity issues
- Firewall blocking WebSocket connections
- No components match controlFilter

**Solutions:**
1. Verify core IP address is correct
2. Enable QRWC: Core Manager > Network > Services > Management > Q-SYS Remote WebSocket Control
3. Test network connectivity (ping core IP)
4. Check firewall rules for WebSocket ports
5. Verify at least one component matches controlFilter
6. Check browser console for detailed error messages

#### Controls Not Updating

**Symptoms:**
- UI doesn't reflect changes from Q-SYS
- Setting values doesn't affect Q-SYS

**Causes:**
- Using controls before connection is established
- Control is read-only
- Component/control doesn't exist

**Solutions:**
1. **Always check `isConnected` before using controls**
2. Verify control Direction is "Read/Write" (not "Read Only")
3. Check component and control names are correct
4. Verify Script Access is set correctly

#### Read-Only Control Errors

**Error:** `Attempted to set a read-only control`

**Cause:** Trying to write to a read-only control

**Solution:** Check control Direction property. Only "Read/Write" controls can be written to.

### Debugging Tips

1. **Monitor Connection Status:**
```svelte
<script lang="ts">
  import { qrwcSvelte } from './lib/qrwc';
</script>

<p>Status: {qrwcSvelte.connectionStatus}</p>
<p>Connected: {qrwcSvelte.isConnected}</p>
<p>Attempts: {qrwcSvelte.connectionAttemptCount}</p>
<p>Active Core: {qrwcSvelte.activeCore}</p>
<p>Core IP: {qrwcSvelte.coreIp}</p>
```

2. **List Available Components:**
```typescript
const components = qrwcSvelte.getComponentList();
console.log("Available components:", components);
```

3. **List Controls in Component:**
```typescript
const component = qrwcSvelte.useComponent("MyComponent");
const controls = component.getControlList();
console.log("Available controls:", controls);
```

4. **Check Browser Console:** All connection events and errors are logged to console

5. **Verify Q-SYS Design:**
   - Open Component Controls Info dialog
   - Verify Script Access settings
   - Check Code Names match exactly

## Best Practices

### 1. Always Check Connection Status

**CRITICAL:** Never use controls without checking `isConnected` first.

```svelte
{#if qrwcSvelte.isConnected}
  <!-- Safe to use controls here -->
{/if}
```

### 2. Create Instance in lib Directory

Create a single shared instance:

```typescript
// src/lib/qrwc.ts
import { QrwcSvelte } from 'qrwc-svelte';
export const qrwcSvelte = new QrwcSvelte("192.168.1.100");
```

### 3. Use Connection Status Gating

Gate all control usage behind connection check in templates:

```svelte
{#if qrwcSvelte.isConnected}
  <MyComponent />
{:else}
  <ConnectionStatus />
{/if}
```

### 4. Handle Reconnection Scenarios

The library automatically reconnects. Show connection status to users:

```svelte
{#if !qrwcSvelte.isConnected}
  <div class="connection-status">
    <p>Connecting... (Attempt {qrwcSvelte.connectionAttemptCount})</p>
  </div>
{/if}
```

### 5. Use Component Filters for Performance

If you have many components but only need a few:

```typescript
const qrwc = new QrwcSvelte({
  coreIp: "192.168.1.100",
  controlFilter: ["AudioMixer", "VideoRouter"] // Only subscribe to these
});
```

**Note:** Camera components can transfer large amounts of data. Consider filtering them out or using USB Video Bridge component instead.

### 6. Error Handling Patterns

Handle errors gracefully:

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc";
  
  let component;
  let button;
  let error = $state<string | null>(null);
  
  try {
    component = qrwcSvelte.useComponent("TestControls");
    button = component.useButton("toggleButton");
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
</script>

{#if error}
  <p class="error">Error: {error}</p>
{:else if button}
  <button onclick={() => button.toggle()}>Toggle</button>
{/if}
```

### 7. Use Appropriate Control Types

- Use `useButton()` for Boolean controls
- Use `useKnob()` for numeric controls (Float, Integer, Time)
- Use `useText()` for text controls
- Use `useComboBox()` for combo boxes
- Use `useTrigger()` for write-only triggers
- Use `useControl()` only for unsupported types

### 8. Momentary Button Pattern

For press-and-hold buttons:

```svelte
<button
  onpointerdown={() => button.state = true}
  onpointerup={() => button.state = false}
  onpointerout={() => button.state = false}
  oncontextmenu={(e) => e.preventDefault()}
>
  Press and Hold
</button>
```

### 9. Text Input with Submit/Cancel

Avoid continuous updates while typing:

```svelte
<script lang="ts">
  let localValue = $state(control.string);
  $effect(() => {
    localValue = control.string; // Sync from core
  });
</script>

<input bind:value={localValue} />
<button onclick={() => control.string = localValue}>Submit</button>
<button onclick={() => localValue = control.string}>Cancel</button>
```

### 10. Multiple Component Instances

You can create multiple instances of the same component:

```typescript
const gain1 = qrwc.useComponent("MainVol");
const gain2 = qrwc.useComponent("MainVol");
const gain3 = qrwc.useComponent("MainVol");
```

Each instance is independent and can access different controls.

## Real-World Examples

### Page Navigation with Button Selectors

```svelte
<script lang="ts">
  import { qrwc } from "$lib/qrwc";
  
  const pageComponent = qrwc.useComponent("PageFlip");
  const splashPage = pageComponent.useButton("selector.0");
  const loadingPage = pageComponent.useButton("selector.1");
</script>

{#if splashPage.state === true}
  <SplashPage />
{:else if loadingPage.state === true}
  <LoadingPage />
{:else}
  <MainPage />
{/if}
```

### Camera Preview (Experimental)

**Warning:** This is experimental and only provides 1 frame per second.

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";
  
  const videoBridgeComponent = qrwcSvelte.useComponent("USB_Video_Bridge_NickPs-NV-32");
  const cameraImage = videoBridgeComponent.useText("jpeg.data");
  
  let jpegData = $derived(JSON.parse(cameraImage.string).IconData as string);
</script>

<img src="data:image/jpeg;base64,{jpegData}" alt="Camera Preview">
```

**Note:** Consider using USB Video Bridge component instead of direct camera components to reduce WebSocket traffic. Set camera components to "Internal" or "None" script access.

### Shutdown Confirmation Dialog

```svelte
<script lang="ts">
  import { qrwc } from "$lib/qrwc";
  
  const shutdownComponent = qrwc.useComponent("StartShutdown");
  const shutdown = shutdownComponent.useTrigger("trigger.2");
  
  let showDialog: HTMLDialogElement;
</script>

<button onclick={() => showDialog.showModal()}>Shutdown</button>

<dialog bind:this={showDialog} class="modal">
  <div class="modal-box">
    <h3>Are you sure you want to shutdown?</h3>
    <div class="modal-action">
      <button onclick={() => showDialog.close()}>NO</button>
      <button onclick={() => { shutdown.trigger(); showDialog.close(); }}>
        YES
      </button>
    </div>
  </div>
</dialog>
```

## Q-SYS Designer Configuration

### Script Access Settings

1. Select component in Q-SYS Designer
2. Open Properties panel
3. Find "Script Access" property
4. Set to "All" or "External"
5. Note the "Code Name" - this is used in `useComponent()`

### Finding Control Names

1. Select component in Q-SYS Designer
2. Go to Tools menu
3. Select "View Component Controls Info..."
4. Dialog shows all control names
5. Use exact control names (case-sensitive) in `useButton()`, `useKnob()`, etc.

### Component Code Names

- Code Name is set in Properties > Script Access > Code Name
- This is the identifier used in `useComponent("CodeName")`
- Must be unique within the design
- Case-sensitive

## Additional Resources

- **Full Documentation:** https://m3-technology-group.github.io/qrwc-svelte/
- **Video Tutorial:** https://youtu.be/Tk9L1A867KY
- **Q-SYS Help:** https://help.qsys.com/
- **@q-sys/qrwc Documentation:** See node_modules/@q-sys/qrwc for underlying library docs

## Version History

- **1.1.0** - Updated to support QRWC 0.5.0-beta. Position Setter uses direct position setter API instead of scaling value.
- **1.0.2** - Added more descriptive error messages for control not found errors. Changed startup logic to ensure that controls are not subscribed to until the core is ready to provide updates.
- **1.0.1** - Initial release

