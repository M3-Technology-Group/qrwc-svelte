<script lang="ts">
	let { data } = $props();
	const textComboBox = data.qrwc?.useControl("testControls", "textComboBox");
</script>

{textComboBox?.rawControl?.Type}