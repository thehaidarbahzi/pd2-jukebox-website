<script lang="ts">
	import { Icon } from 'svelte-icons-pack';
	import { FaSolidPlay, FaSolidStop } from 'svelte-icons-pack/fa';

	let { data } = $props();

	let audioCtx: AudioContext;
	let introBuffer = $state<AudioBuffer | null>(null);
	let loopBuffer = $state<AudioBuffer | null>(null);

	let introSource = $state<AudioBufferSourceNode | null>(null);
	let loopSource = $state<AudioBufferSourceNode | null>(null);

	let gainNode: GainNode;

	let isPlaying = $state('');
	let shouldPlay = $state(false);
	let value = $state(50);

	let currentPlayId = 0;

	function init() {
		if (!audioCtx) {
			audioCtx = new AudioContext();
			gainNode = audioCtx.createGain();
			gainNode.connect(audioCtx.destination);
		}
	}

	async function loadAudio(url: string) {
		const res = await fetch(url);
		const arrayBuffer = await res.arrayBuffer();
		return await audioCtx.decodeAudioData(arrayBuffer);
	}

	async function play(intro: string | null, loop: string | null, name: string) {
		if (!audioCtx) {
			init();
		}

		stop();

		currentPlayId++;
		const thisPlayId = currentPlayId;

		isPlaying = name;
		shouldPlay = true;

		if (audioCtx.state === 'suspended') {
			await audioCtx.resume();
		}

		if (thisPlayId !== currentPlayId) return;

		gainNode.gain.value = value / 100;

		if (loop) {
			loopBuffer = await loadAudio(loop);
			if (thisPlayId !== currentPlayId) return;
		}

		if (intro) {
			introBuffer = await loadAudio(intro);
			if (thisPlayId !== currentPlayId) return;

			introSource = audioCtx.createBufferSource();
			introSource.buffer = introBuffer;
			introSource.connect(gainNode);

			const expectedId = thisPlayId;
			introSource.onended = () => {
				if (expectedId === currentPlayId && shouldPlay) {
					startLoop();
				}
			};

			introSource.start(0);
		} else {
			startLoop();
		}
	}

	function startLoop() {
		if (!loopBuffer) return;

		loopSource = audioCtx.createBufferSource();
		loopSource.buffer = loopBuffer;
		loopSource.loop = true;

		loopSource.connect(gainNode);
		loopSource.start(0);
	}

	function stop() {
		isPlaying = '';
		shouldPlay = false;

		currentPlayId++;

		introSource?.stop();
		loopSource?.stop();

		introSource = null;
		loopSource = null;
	}

	function changeVolume(e: Event) {
		value = Number((e.target as HTMLInputElement).value);
		if (gainNode) gainNode.gain.value = value / 100;
	}
</script>

<main class="flex flex-col gap-4 p-4 justify-center items-center">
	<h1 class="text-2xl font-bold text-center">
		{#if isPlaying != ''}
			{isPlaying}
		{/if}
	</h1>
	<input
		type="range"
		min="0"
		max="100"
		step="1"
		class="w-64 items-center justify-center"
		bind:value
		oninput={changeVolume}
	/>
	<ul class="flex flex-wrap gap-4 justify-center">
		{#each data.playlist as album (album.name)}
			<li class="flex items-center justify-between p-4 w-64 h-20 rounded-lg bg-blue-400">
				<div>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Stealth</div>
				</div>
				{#if isPlaying === album.name + ' Stealth'}
					<button class="btn btn-square btn-ghost" onclick={() => stop()}
						><Icon src={FaSolidStop} /></button
					>
				{:else}
					<button
						class="btn btn-square btn-ghost"
						onclick={() => play(album.stealthIntro, album.stealthLoop, album.name + ' Stealth')}
						><Icon src={FaSolidPlay} /></button
					>
				{/if}
			</li>

			<li class="flex items-center justify-between p-4 w-64 h-20 rounded-lg bg-blue-400">
				<div>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Control</div>
				</div>
				{#if isPlaying === album.name + ' Control'}
					<button class="btn btn-square btn-ghost" onclick={() => stop()}
						><Icon src={FaSolidStop} /></button
					>
				{:else}
					<button
						class="btn btn-square btn-ghost"
						onclick={() => play(album.controlIntro, album.controlLoop, album.name + ' Control')}
						><Icon src={FaSolidPlay} /></button
					>
				{/if}
			</li>

			<li class="flex items-center justify-between p-4 w-64 h-20 rounded-lg bg-blue-400">
				<div>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Anticipation</div>
				</div>
				{#if isPlaying === album.name + ' Anticipation'}
					<button class="btn btn-square btn-ghost" onclick={() => stop()}
						><Icon src={FaSolidStop} /></button
					>
				{:else}
					<button
						class="btn btn-square btn-ghost"
						onclick={() =>
							play(album.anticipationIntro, album.anticipationLoop, album.name + ' Anticipation')}
						><Icon src={FaSolidPlay} /></button
					>
				{/if}
			</li>

			<li class="flex items-center justify-between p-4 w-64 h-20 rounded-lg bg-blue-400">
				<div>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Assault</div>
				</div>
				{#if isPlaying === album.name + ' Assault'}
					<button class="btn btn-square btn-ghost" onclick={() => stop()}
						><Icon src={FaSolidStop} /></button
					>
				{:else}
					<button
						class="btn btn-square btn-ghost"
						onclick={() => play(album.assaultIntro, album.assaultLoop, album.name + ' Assault')}
						><Icon src={FaSolidPlay} /></button
					>
				{/if}
			</li>
		{/each}
	</ul>
</main>
