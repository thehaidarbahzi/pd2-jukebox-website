import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

function isWav(file: string) {
	return extname(file).toLowerCase() === '.flac';
}

function findMatch(files: string[], keywords: string[]) {
	return files.find((f) => {
		const name = f.toLowerCase();
		return keywords.every((k) => name.includes(k.toLowerCase()));
	});
}

export async function load() {
	const base = join(process.cwd(), 'static', 'ost');
	const folders = await readdir(base, { withFileTypes: true });

	const playlist = [];

	for (const folder of folders) {
		if (!folder.isDirectory()) continue;

		const files = (await readdir(join(base, folder.name))).filter(isWav);

		const stealthIntro = findMatch(files, ['stealth', 'intro']);
		const stealthLoop = findMatch(files, ['stealth', 'loop']);
		const controlIntro = findMatch(files, ['control', 'intro']);
		const controlLoop = findMatch(files, ['control', 'loop']);
		const anticipationIntro = findMatch(files, ['anticipation', 'intro']);
		const anticipationLoop = findMatch(files, ['anticipation', 'loop']);
		const assaultIntro = findMatch(files, ['assault', 'intro']);
		const assaultLoop = findMatch(files, ['assault', 'loop']);

		playlist.push({
			name: folder.name,
			stealthIntro: stealthIntro ? `/ost/${folder.name}/${stealthIntro}` : null,
			stealthLoop: stealthLoop ? `/ost/${folder.name}/${stealthLoop}` : null,
			controlIntro: controlIntro ? `/ost/${folder.name}/${controlIntro}` : null,
			controlLoop: controlLoop ? `/ost/${folder.name}/${controlLoop}` : null,
			anticipationIntro: anticipationIntro ? `/ost/${folder.name}/${anticipationIntro}` : null,
			anticipationLoop: anticipationLoop ? `/ost/${folder.name}/${anticipationLoop}` : null,
			assaultIntro: assaultIntro ? `/ost/${folder.name}/${assaultIntro}` : null,
			assaultLoop: assaultLoop ? `/ost/${folder.name}/${assaultLoop}` : null
		});
	}

	return { playlist };
}
