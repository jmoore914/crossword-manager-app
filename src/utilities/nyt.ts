import {Puzzle as PuzzleMetadata} from '../../electron/preload/binaryEncoder';
import {cloneObj, objIsEmpty} from './shared';

export interface NytJson{
	body: Body[];
	constructors: string[];
	copyright?: string;
	title?: string;
	notes: Note[];
}

interface Body{
	cells: (Cell | Empty)[];
	clues: Clue[];
	dimensions: Dimensions;
}

type Empty = Record<string, never>;

interface Cell {
	answer: string;
	type: number;
}

interface Clue{
	direction: 'Across' | 'Down';
	label: string;
	text: {plain: string}[];
}

interface Dimensions {
	height: number;
	width: number;
}

interface Note {
	text: string[];
	platforms: boolean[];
}

export function nytJsonToPuzzle(puzJson: NytJson, dateLong: string): PuzzleMetadata {
	const body = puzJson.body[0];

	let rebusIndex = 1;
	const solution: string[] = [];
	const state: string[] = [];
	const rebus: PuzzleMetadata['rebus'] = {grid: [], solution: {}};
	const markupGrid: PuzzleMetadata['markupGrid'] = [];

	body.cells.forEach((clue, index) => {
		if(objIsEmpty(clue)){
			solution.push('.');
			state.push('.');
			rebus.grid!.push(undefined);
			markupGrid.push({});
		}
		else{
			solution.push(clue.answer.charAt(0));
			state.push('-');
			if(clue.answer.length === 1){
				rebus.grid!.push(undefined);
			}
			else{
				rebus.grid!.push(rebusIndex);
				rebus.solution![rebusIndex] = clue.answer;
				rebusIndex = rebusIndex + 1;
			}
			if(clue.type === 3){
				markupGrid.push({circled: true});
			}
			else{
				markupGrid.push({});
			}
		}
			
	});

	const clues = cloneObj(body.clues);
	clues.sort((a, b) => {
		const aNum = parseInt(a.label);
		const bNum = parseInt(b.label);
		if(aNum === bNum){
			return a.direction === 'Across' ? -1 : 1;
		}
		else{
			return aNum - bNum;
		}
	});

	const puz: PuzzleMetadata = {
		author: puzJson.constructors.join(','),
		copyright: puzJson.copyright + ', The New York Times',
		fileVersion: '1.4',
		height: body.dimensions.height,
		isScrambled: false,
		title: puzJson.title === undefined ? 'NY Times, ' + dateLong :  puzJson.title,
		width: body.dimensions.width,
		solution: solution.join(''),
		state: state.join(''),
		clues: clues.map(clue => clue.text[0].plain),
		misc: {
			unknown1: 0,
			unknown2: new Uint8Array(12),
			unknown3: 1,
			scrambledChecksum: 0

		}
	};
	if(puzJson.notes !== undefined){
		puz.notepad = puzJson.notes.map(note => note.text).join(' ');
	}
	if(!objIsEmpty(rebus!.solution!)){
		puz.rebus = rebus;
	}
	if(markupGrid.length > 0){
		puz.markupGrid = markupGrid;
	}
	return puz;
}

interface NytAuthResponse{
	data: {
		cookies: {name: string; cipheredValue: string}[];
	};
}

export async function authenticate(username: string, password: string): Promise<string>{
	const url = 'https://myaccount.nytimes.com/svc/ios/v2/login';
	const data = {'login': username, 'password': password};
	const headers = [
		{name: 'User-Agent', value: 'Crossword/1844.220922 CFNetwork/1335.0.3 Darwin/21.6.0'},
		{name: 'client_id', value: 'ios.crosswords'}
	];
		
	const resp = await window.electronApi.electron.fetch(url, 'POST', headers, JSON.stringify(data));

	const authResp = JSON.parse(resp) as unknown as NytAuthResponse;

	const nytS = authResp.data.cookies.find(cookie => cookie.name === 'NYT-S');
	if(nytS === undefined){
		throw new Error('Unable to find cookie in authentication response.');
	}
	else{
		return nytS.cipheredValue;
	}

        
}