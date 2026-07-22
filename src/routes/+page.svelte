<script lang="ts">
	import { Icon } from 'svelte-icons-pack';
	import {
		FaSolidStop,
		FaSolidVolumeHigh,
		FaSolidVolumeLow,
		FaSolidVolumeOff
	} from 'svelte-icons-pack/fa';

	let { data } = $props();

	let audioCtx: AudioContext;
	let introBuffer = $state<AudioBuffer | null>(null);
	let loopBuffer = $state<AudioBuffer | null>(null);

	let introSource = $state<AudioBufferSourceNode | null>(null);
	let loopSource = $state<AudioBufferSourceNode | null>(null);

	let gainNode: GainNode;

	let isPlaying = $state('');
	let shouldPlay = $state(false);
	let volumeValue = $state(50);

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

		gainNode.gain.value = volumeValue / 100;

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

	function toggle(intro: string | null, loop: string | null, name: string) {
		if (isPlaying === name) {
			stop();
		} else {
			play(intro, loop, name);
		}
	}

	function changeVolume(e: Event) {
		volumeValue = Number((e.target as HTMLInputElement).value);
		if (gainNode) gainNode.gain.value = volumeValue / 100;
	}
</script>

<div class="flex flex-col min-h-screen">
	<main class="flex-1 pt-8 px-3 pb-28 sm:px-8 overflow-y-auto pd2-scroll">
		<div class="pd2-panel corner-border">
			{#each data.playlist as album (album.name)}
				<div
					class="heist-row flex-col sm:flex-row gap-3 sm:gap-0"
					class:bg-pd2-row-selected={isPlaying.startsWith(album.name)}
				>
					<span
						class="font-heading text-pd2-white text-sm sm:text-base uppercase tracking-wider shrink-0 sm:w-60"
					>
						{album.name}
					</span>

					<div class="flex gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
						<button
							class="phase-btn corner-border"
							class:playing={isPlaying === album.name + ' (Stealth)'}
							onclick={() =>
								toggle(album.stealthIntro, album.stealthLoop, album.name + ' (Stealth)')}
						>
							Stealth
						</button>
						<button
							class="phase-btn corner-border"
							class:playing={isPlaying === album.name + ' (Control)'}
							onclick={() =>
								toggle(album.controlIntro, album.controlLoop, album.name + ' (Control)')}
						>
							Control
						</button>
						<button
							class="phase-btn corner-border"
							class:playing={isPlaying === album.name + ' (Anticipation)'}
							onclick={() =>
								toggle(
									album.anticipationIntro,
									album.anticipationLoop,
									album.name + ' (Anticipation)'
								)}
						>
							Anticipation
						</button>
						<button
							class="phase-btn corner-border"
							class:playing={isPlaying === album.name + ' (Assault)'}
							onclick={() =>
								toggle(album.assaultIntro, album.assaultLoop, album.name + ' (Assault)')}
						>
							Assault
						</button>
					</div>
				</div>
			{/each}
		</div>
	</main>

	<!-- Bottom player bar - grid layout with centered stop -->
	<footer class="player-bar fixed bottom-0 right-0 left-0 z-50">
		<div class="player-grid px-5 py-3.5 sm:px-8 sm:py-4">
			<!-- Left: track info -->
			<div class="flex items-center gap-3 min-w-0 justify-self-start">
				{#if isPlaying}
					<span
						class="text-pd2-accent text-xs sm:text-sm uppercase tracking-widest font-bold shrink-0"
						>Now Playing</span
					>
					<span
						class="font-heading text-pd2-white text-sm sm:text-base truncate uppercase tracking-wide"
						>{isPlaying}</span
					>
				{:else}
					<span class="font-heading text-pd2-disabled text-sm sm:text-base uppercase tracking-wider"
						>No track selected</span
					>
				{/if}
			</div>

			<!-- Center: stop button -->
			<div class="flex items-center justify-center justify-self-center">
				<button
					class="stop-btn corner-border cursor-pointer disabled:text-pd2-disabled disabled:cursor-default"
					disabled={!isPlaying}
					onclick={() => stop()}
				>
					<Icon src={FaSolidStop} size="1.25em" />
				</button>
			</div>

			<!-- Right: volume -->
			<div class="flex items-center gap-2.5 sm:gap-3 justify-self-end">
				{#if volumeValue === 0}
					<Icon src={FaSolidVolumeOff} size="1em" />
				{:else if volumeValue < 50}
					<Icon src={FaSolidVolumeLow} size="1em" />
				{:else}
					<Icon src={FaSolidVolumeHigh} size="1em" />
				{/if}
				<input
					type="range"
					min="0"
					max="100"
					step="1"
					class="volume-slider w-20 sm:w-32"
					style="--value: {volumeValue}%"
					bind:value={volumeValue}
					oninput={changeVolume}
				/>
			</div>
		</div>
	</footer>
</div>
