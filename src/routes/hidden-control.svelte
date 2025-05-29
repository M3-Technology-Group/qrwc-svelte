<script lang="ts">
	import type { QrwcSvelte } from '$lib/index.js';
	let { qrwc }: { qrwc: QrwcSvelte } = $props();

	const routingComponent = qrwc!.useComponent('TestControls');

	const toggleButton = routingComponent.useButton('ToggleButton');
</script>

<button
	style=" {toggleButton.state ? 'background-color: green;' : 'background-color: grey;'}"
	onclick={() => toggleButton.toggle()}>Press</button
>
