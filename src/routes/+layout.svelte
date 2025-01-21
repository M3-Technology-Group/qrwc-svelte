<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types.js';
	import type { Snippet } from 'svelte';
	
	let { data, children }: { data: LayoutData, children: Snippet } = $props();

</script>

{#if data.qrwc?.isConnected}
	<p>Connected</p>
	{@render children()}
{:else}
	<p>{data.qrwc?.connectionStatus}</p>
	<p>Connection Attempt: {data.qrwc?.connectionAttemptCount}</p>
{/if}

