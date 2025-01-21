<script lang="ts">
	let { data } = $props();
	const toggleButton = data.qrwc?.useButton("testControls", "toggleButton");
</script>

<button
  style="background-color: {toggleButton?.state ? 'green' : '#777'};"
  onclick={() => toggleButton?.toggle()}>Toggle!
</button>
