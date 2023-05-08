import {Puzzle as PuzzleMetadata} from '../../electron/preload/binaryEncoder';
import {cloneObj, objIsEmpty, range} from './shared';

interface AmuselabsJson{
	author: string;
	box: string[][];
	description: string;
	h: number;
	w: number;
	title: string;
	placedWords: AmuselabsClue[];
	
}

interface AmuselabsClue{
	clue: {clue: string};
	acrossNotDown: boolean;
	clueNum: string;
}

export async function decodeAmuseLabsPuzzle(puzUrl: string): Promise<PuzzleMetadata>{
	const puzResp = await window.electronApi.electron.fetch(puzUrl);
	const encodedPuzzleMatch = puzResp.match(/window\.puzzleEnv\.rawc\s*=\s*'([^']+)'/);
	if(encodedPuzzleMatch === null){
		throw new Error('Unable to fetch encoded puzzle');
	}
	else{
		const rawc = encodedPuzzleMatch[1].replace('window.rawc = ', '').replaceAll('\'', '');
		const m1 = puzResp.match(/"([^"]+c-min.js[^"]+)"/);
		const jsResp = await window.electronApi.electron.fetch('https://cdn3.amuselabs.com/tny/' + m1![1]);


		const m2 = jsResp.match(/="([0-9a-f]{7})"/);

		const amuseKey = m2 === null? null : m2[1];


		const amuseLabsJson = loadRawc(rawc, amuseKey) as unknown as AmuselabsJson;
		return amuselabsJsonToPuzzle(amuseLabsJson);

	}
}

function loadRawc(rawc: string, amuseKey: string | null = null): JSON {
	try {
		return b64ToJson(rawc);
	} catch {
		try {
			const E = rawc.split('.');
			const A = Array.from(E[0]);
			const H = E[1].split('').reverse().join('');
			const F = Array.from(H).map(c => parseInt(c, 16) + 2);
			let B = 0; let G = 0;
			while (B < A.length - 1) {
				const C = Math.min(F[G % F.length], A.length - B);
				for (let D = 0; D < Math.floor(C / 2); D++) {
					[A[B + D], A[B + C - D - 1]] = [A[B + C - D - 1], A[B + D]];
				}
				B += C;
				G += 1;
			}
			const newRawc = A.join('');
			return b64ToJson(newRawc);
		} catch {
			const newRawC = loadRawcWithKey(rawc, amuseKey);
			return b64ToJson(newRawC);
		}
	}
}

function b64ToJson(b64String: string): JSON{
	return JSON.parse(window.atob(b64String));
}

function loadRawcWithKey(e: string, amuseKey: string | null): string {
	const E = Array.from(e);
	const H = Array.from(amuseKey || '');
	const F = H.map(c => parseInt(c, 16));
	let G = 0; const I = E.length - 1;
	for (let A = 0; A < I; ) {
		const B = F[G % F.length] + 2;
		const L = I - A + 1;
		let C = A;
		let D = A + Math.min(B, L) - 1;
		while (C < D) {
			[E[C], E[D]] = [E[D], E[C]];
			C += 1;
			D -= 1;
		}
		A += B;
		G += 1;
	}
	return E.join('');
}

export function amuselabsJsonToPuzzle(puzJson: AmuselabsJson): PuzzleMetadata {


	const flatCells: string[] = [];
	range(puzJson.box[0].length).forEach(rowNum => {
		puzJson.box.forEach(col => {
			flatCells.push(col[rowNum].replace('\u0000', '.'));
		});
	});



	const solution = flatCells.map(cell => cell.charAt(0)).join('');
	const state = flatCells.map(cell => cell === '.' ? '.' : '-').join('');
    
    
	let rebusIndex = 1;
	const rebus: PuzzleMetadata['rebus'] = {grid: [], solution: {}};
	// const markupGrid: PuzzleMetadata['markupGrid'] = [];

	flatCells.forEach(cell => {
		if(cell.length === 1){
			rebus.grid!.push(undefined);
		}
		else{
			rebus.grid!.push(rebusIndex);
			rebus.solution![rebusIndex] = cell;
			rebusIndex = rebusIndex + 1;
		}
	});

	const markupGrid = flatCells.map(cell =>  {return {};});

	const clues = cloneObj(puzJson.placedWords);
	clues.sort((a, b) => {
		const aNum = parseInt(a.clueNum);
		const bNum = parseInt(b.clueNum);
		if(aNum === bNum){
			return a.acrossNotDown ? -1 : 1;
		}
		else{
			return aNum - bNum;
		}
	});


	const puz: PuzzleMetadata = {
		author: puzJson.author,
		copyright: '2023, AL',
		fileVersion: '1.4',
		height: puzJson.h,
		isScrambled: false,
		title: puzJson.title || 'Title',
		width: puzJson.w,
		solution: solution,
		state: state,
		clues: clues.map(placedWord => placedWord.clue.clue.replace('<span>', '').replace('</span>', '').replace(/[^\x00-\x7F]/g, '')),
		misc: {
			unknown1: 0,
			unknown2: new Uint8Array(12),
			unknown3: 1,
			scrambledChecksum: 0

		},
		markupGrid: markupGrid
	};
	if(puzJson.description !== undefined && puzJson.description !== ''){
		puz.notepad = puzJson.description;
	}
	if(!objIsEmpty(rebus!.solution!)){
		puz.rebus = rebus;
	}
	console.log(puz);
	return puz;
}