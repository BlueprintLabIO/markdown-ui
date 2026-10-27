<script lang="ts">
	import { onMount } from 'svelte';
	import { MarkdownUI } from '@markdown-ui/svelte';
	import '@markdown-ui/svelte/widgets.css';

	import { Marked } from 'marked';
	import { markedUiStreamingExtension } from '@markdown-ui/marked-ext';

	import { Pane, PaneGroup, PaneResizer } from 'paneforge';

	// Setup marked with the streaming-aware markdown-ui extension
	// This extension handles incomplete widget definitions gracefully during AI streaming
	const marked = new Marked();
	marked.use(markedUiStreamingExtension);

	let streamedContent = $state('');
	let isStreaming = $state(false);
	let events = $state<Array<{id: string, value: unknown, timestamp: string}>>([]);

	const fullContent = `# Interactive Content Creation Demo

This demonstrates how markdown-ui enables real-time streaming of interactive content with **no flickering** even during AI generation.

## User Preferences

\`\`\`markdown-ui-widget
button-group theme [Light Dark Auto] Auto
\`\`\`

\`\`\`markdown-ui-widget
button-group experience [Beginner Intermediate Advanced] Intermediate
\`\`\`

## Quick Knowledge Check

Watch how the quiz renders progressively as content streams in:

\`\`\`markdown-ui-widget
quiz streaming-demo "Streaming Quiz Demo"
showScore: true
showProgress: true
mcq q1 "Which frameworks have a markdown-ui renderer?" 10 ["React" "Svelte" "Vue" "All of the above"] "All of the above"
mcq q2 "What problem does streaming-aware parsing solve?" 10 ["Flickering UI" "Slow rendering" "Memory leaks" "Network errors"] "Flickering UI"
short-answer q3 "What file extension is used for markdown-ui widgets?" 10 "" [".md" "md" "markdown"]
\`\`\`

## Notification Settings

\`\`\`markdown-ui-widget
text-input email "Email Address" "your.email@example.com"
\`\`\`

\`\`\`markdown-ui-widget
button-group frequency ["Real-time" Daily Weekly Monthly] Weekly
\`\`\`

## Why This Matters

- **Type Locking**: Once a widget type is detected, it stays locked to prevent component switching
- **Progressive Rendering**: Partial content renders with skeleton placeholders
- **Graceful Degradation**: Incomplete arrays/quotes are auto-completed for preview
- **DSL Compatibility**: Handles AI output variations like comma-separated arrays`;

	function handleWidgetEvent(event: CustomEvent<{id: string, value: unknown}>) {
		const timestamp = new Date().toLocaleTimeString();
		events = [{ id: event.detail.id, value: event.detail.value, timestamp }, ...events].slice(0, 50);
	}

	function clearEvents() {
		events = [];
	}

	async function startStreaming() {
		if (isStreaming) return;
		
		streamedContent = '';
		events = [];
		isStreaming = true;
		
		// Simulate token-like streaming with variable chunk sizes and delays
		let i = 0;
		while (i < fullContent.length && isStreaming) {
			// Choose a variable chunk size to mimic LLM tokenization
			const chunkSize = Math.max(1, Math.min(12, Math.floor(Math.random() * 10) + 1));
			const next = Math.min(fullContent.length, i + chunkSize);
			streamedContent = fullContent.slice(0, next);
			i = next;
			
			// Faster, more variable delays with occasional bursts
			const base = 12; // ms
			const jitter = Math.random() * 35; // 0-35ms
			const burstChance = Math.random() < 0.15;
			const delayMs = burstChance ? Math.random() * 10 : base + jitter;
			await new Promise((resolve) => setTimeout(resolve, delayMs / 2));
		}
		
		isStreaming = false;
	}

	function stopStreaming() {
		isStreaming = false;
	}

	function resetStream() {
		stopStreaming();
		streamedContent = '';
		events = [];
	}

	onMount(() => {
		// Auto-start streaming on page load
		setTimeout(startStreaming, 1000);
	});
</script>

<div class="h-[calc(100vh-3.5rem)] flex flex-col">
	<div class="flex items-center justify-between px-6 py-3 bg-neutral-50 border-b border-neutral-200 gap-3 flex-wrap">
		<div class="flex items-center gap-2">
			<button onclick={startStreaming} disabled={isStreaming} class="px-3 py-1.5 rounded-md text-sm border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed">
				{isStreaming ? 'Streaming...' : 'Start Demo'}
			</button>
			<button onclick={stopStreaming} disabled={!isStreaming} class="px-3 py-1.5 rounded-md text-sm border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed">Stop</button>
			<button onclick={resetStream} class="px-3 py-1.5 rounded-md text-sm border border-neutral-300 bg-white hover:bg-neutral-50">Reset</button>
		</div>
		<div class="flex items-center gap-2 text-sm text-neutral-700 font-medium">
			{#if isStreaming}
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				Streaming ({streamedContent.length} characters)
			{:else if streamedContent}
				<span class="w-2 h-2 rounded-full bg-blue-500"></span>
				Complete ({streamedContent.length} characters)
			{:else}
				<span class="w-2 h-2 rounded-full bg-neutral-500"></span>
				Ready to stream
			{/if}
		</div>
	</div>

	<div class="flex-1 min-h-0">
		<PaneGroup direction="horizontal" class="h-full">
			<Pane defaultSize={40} minSize={20} class="flex flex-col min-h-0 border-r border-neutral-200">
				<div class="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
					<h3 class="m-0 text-[15px] font-medium text-neutral-800">Markdown Source</h3>
					<div class="text-xs text-neutral-500 italic">Raw streaming content</div>
				</div>
				<div class="flex-1 min-h-0">
					<textarea readonly value={streamedContent || '# Ready to start...\n\nClick "Start Demo" to see markdown streaming in real-time!'} class="w-full h-full p-3 text-[14px] font-mono bg-neutral-50 outline-none resize-none whitespace-pre-wrap break-words"></textarea>
				</div>
			</Pane>

			<PaneResizer class="w-2 bg-neutral-100 hover:bg-neutral-200 transition-colors" />

			<Pane defaultSize={40} minSize={20} class="flex flex-col min-h-0 border-r border-neutral-200">
				<div class="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
					<h3 class="m-0 text-[15px] font-medium text-neutral-800">Rendered Output</h3>
					<div class="text-xs text-neutral-500">Interactive widgets rendered in real-time</div>
				</div>
				<div class="flex-1 overflow-y-auto p-4 relative">
					{#if streamedContent}
						<div class="prose max-w-none w-full break-words overflow-x-hidden">
							<MarkdownUI html={marked.parse(streamedContent)} onwidgetevent={handleWidgetEvent} class="block w-full max-w-full overflow-x-hidden" />
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center text-center p-8 h-full bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg m-4">
							<h3 class="text-neutral-800 mb-2 text-xl">Streaming Demo</h3>
							<p class="text-neutral-600 mb-6 max-w-xs leading-relaxed">Click <strong>"Start Demo"</strong> to watch markdown content stream in and render interactive UI components in real-time.</p>
							<div class="flex flex-col gap-2">
								<div class="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-md text-neutral-800 text-sm">Real-time rendering</div>
								<div class="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-md text-neutral-800 text-sm">Interactive widgets</div>
								<div class="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-md text-neutral-800 text-sm">Live event handling</div>
							</div>
						</div>
					{/if}
				</div>
			</Pane>

			<PaneResizer class="w-2 bg-neutral-100 hover:bg-neutral-200 transition-colors" />
			
			<Pane defaultSize={20} minSize={10} class="flex flex-col min-h-0 bg-white">
				<div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
					<h3 class="m-0 text-[15px] font-medium text-neutral-800">Widget Events</h3>
					<button onclick={clearEvents} class="px-2.5 py-1 rounded-full bg-neutral-900 text-white text-xs">Clear</button>
				</div>
				<div class="flex-1 p-4 overflow-y-auto min-h-0">
					{#if events.length === 0}
						<div class="flex flex-col items-center justify-center h-[200px] text-neutral-500 text-center bg-neutral-50 border border-neutral-200 rounded-md p-4">
							<p class="m-1 text-sm"><strong>No events yet</strong></p>
							<p class="m-1 text-sm">Interact with widgets as they appear to see events logged here.</p>
						</div>
					{/if}
					{#each events as event}
						<div class="mb-3 p-3 bg-white border border-neutral-200 rounded-md text-sm shadow-sm">
							<div class="flex justify-between items-center mb-2">
								<span class="font-semibold text-blue-600">{event.id}</span>
								<span class="text-xs text-neutral-500">{event.timestamp}</span>
							</div>
							<div class="font-mono bg-neutral-50 p-2 rounded text-neutral-600 text-xs whitespace-pre-wrap break-words">
								{JSON.stringify(event.value, null, 2)}
							</div>
						</div>
					{/each}
				</div>
			</Pane>
		</PaneGroup>
	</div>
</div>