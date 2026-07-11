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

	function changeVolume(e: Event) {
		volumeValue = Number((e.target as HTMLInputElement).value);
		if (gainNode) gainNode.gain.value = volumeValue / 100;
	}
</script>

<main>
	<ul class="flex flex-wrap gap-4 p-8 justify-center">
		{#each data.playlist as album (album.name)}
			<li>
				<button
					class="cursor-pointer shadow-[0_6px_0_#1e3a8a] transition-all duration-100 hover:-translate-y-1 hover:shadow-[0_8px_0_#1e3a8a] active:translate-y-1 active:shadow-[0_4px_0_#1e3a8a] p-4 w-xs h-20 rounded-lg bg-blue-400"
					onclick={() => play(album.stealthIntro, album.stealthLoop, album.name + ' (Stealth)')}
				>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Stealth</div>
				</button>
			</li>

			<li>
				<button
					class="cursor-pointer shadow-[0_6px_0_#1e3a8a] transition-all duration-100 hover:-translate-y-1 hover:shadow-[0_8px_0_#1e3a8a] active:translate-y-1 active:shadow-[0_4px_0_#1e3a8a] p-4 w-xs h-20 rounded-lg bg-blue-400"
					onclick={() => play(album.controlIntro, album.controlLoop, album.name + ' (Control)')}
				>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Control</div>
				</button>
			</li>

			<li>
				<button
					class="cursor-pointer shadow-[0_6px_0_#1e3a8a] transition-all duration-100 hover:-translate-y-1 hover:shadow-[0_8px_0_#1e3a8a] active:translate-y-1 active:shadow-[0_4px_0_#1e3a8a] p-4 w-xs h-20 rounded-lg bg-blue-400"
					onclick={() =>
						play(album.anticipationIntro, album.anticipationLoop, album.name + ' (Anticipation)')}
				>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Anticipation</div>
				</button>
			</li>

			<li>
				<button
					class="cursor-pointer shadow-[0_6px_0_#1e3a8a] transition-all duration-100 hover:-translate-y-1 hover:shadow-[0_8px_0_#1e3a8a] active:translate-y-1 active:shadow-[0_4px_0_#1e3a8a] p-4 w-xs h-20 rounded-lg bg-blue-400"
					onclick={() => play(album.assaultIntro, album.assaultLoop, album.name + ' (Assault)')}
				>
					<div class="font-medium">{album.name}</div>
					<div class="text-xs uppercase font-semibold opacity-70">Assault</div>
				</button>
			</li>
		{/each}
	</ul>

	<div class="grid grid-cols-3 items-center h-16 px-8 bg-blue-800 sticky bottom-0">
		<h1 class="justify-self-start truncate text-xl font-bold">
			{isPlaying}
		</h1>

		<div class="justify-self-center">
			<button
				class={`btn btn-square btn-ghost ${isPlaying == '' ? 'btn-disabled' : ''}`}
				onclick={() => stop()}
			>
				<Icon src={FaSolidStop} />
			</button>
		</div>

		<div class="justify-self-end flex gap-4 items-center">
			<div class="flex gap-4 items-center">
				{#if volumeValue === 0}
					<Icon src={FaSolidVolumeOff} size="1.25em" />
				{:else if volumeValue > 0 && volumeValue < 50}
					<Icon src={FaSolidVolumeLow} size="1.25em" />
				{:else if volumeValue >= 50}
					<Icon src={FaSolidVolumeHigh} size="1.25em" />
				{/if}
				<input
					type="range"
					min="0"
					max="100"
					step="1"
					class="slider w-32"
					bind:value={volumeValue}
					oninput={changeVolume}
				/>
			</div>
		</div>
	</div>
</main>
