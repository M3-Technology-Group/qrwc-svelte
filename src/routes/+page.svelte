<script lang="ts">
	let { data } = $props();
	const routingComponent = data.qrwc!.useComponent('TestControls');

	const momentaryButton = routingComponent.useButton('MomentaryButton');
	const toggleButton = routingComponent.useButton('ToggleButton');
	const triggerButton = routingComponent.useTrigger('TriggerButton');
	const integerKnob = routingComponent.useKnob('IntegerKnob');
	const gainKnob = routingComponent.useKnob('GainKnob');
	const panKnob = routingComponent.useKnob('PanKnob');
	const textBox = routingComponent.useText('TextBox');
	const comboBox = routingComponent.useComboBox('ComboBox');
	const listBox = routingComponent.useText('ListBox');
</script>

<div class="prose">
	<h1>component</h1>
	<ul>
		<li>{routingComponent.Name}</li>
		<li>{routingComponent.Id}</li>
		<li>{routingComponent.Type}</li>
	</ul>

	<h1>controls</h1>

	<h2>Momentary Button</h2>
	<button
		style=" {momentaryButton.state ? 'background-color: green;' : 'background-color: grey;'}"
		onpointerdown={() => (momentaryButton.state = true)}
		onpointerup={() => (momentaryButton.state = false)}
		onpointerleave={() => (momentaryButton.state = false)}>Press</button
	>

	<h2>Toggle Button</h2>
	<button
		style=" {toggleButton.state ? 'background-color: green;' : 'background-color: grey;'}"
		onclick={() => toggleButton.toggle()}>Press</button
	>

	<h2>Trigger Button</h2>
	<button onclick={() => triggerButton.trigger()}>Trigger!</button>

	<h2>Integer Knob</h2>
	<input
		type="range"
		min={integerKnob.valueMin}
		max={integerKnob.valueMax}
		bind:value={integerKnob.value}
	/>

	<h2>Gain Knob</h2>
	<input type="range" min={gainKnob.valueMin} max={gainKnob.valueMax} bind:value={gainKnob.value} />

	<h2>Pan Knob</h2>
	<input
		type="range"
		bind:value={panKnob.value}
		min={panKnob.valueMin}
		max={panKnob.valueMax}
		step="0.01"
	/>

	<button
		style="background-color: {panKnob.value === 0 ? 'green' : ''};"
		onclick={() => (panKnob.value = 0)}
		>Center
	</button>

	<h2>Text Box</h2>
	<input bind:value={textBox.string} />

	<h2>Combo Box</h2>
	<select bind:value={comboBox.string}>
		{#each comboBox.choices as choice}
			<option value={choice}>{choice}</option>
		{/each}
	</select>
		

	<h2>List Box</h2>
	<input type="text" name="" id="" bind:value={listBox.string} />
</div>
