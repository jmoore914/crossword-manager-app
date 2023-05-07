import {DailyPuzzle, Puzzle, PuzzleName, WeeklyPuzzle, Settings} from '@/types/types';
import {format} from 'date-fns';
import {Puzzle as PuzzleMetadata} from '../../electron/preload/binaryEncoder/index';



function objIsEmpty(obj: object): boolean{
	return Object.keys(obj).length === 0;
}

export function isDailyPuzzle(puzzle: Puzzle): puzzle is DailyPuzzle {
	return puzzle.schedule === 'daily';
}

export function isWeeklyPuzzle(puzzle: Puzzle): puzzle is WeeklyPuzzle {
	return puzzle.schedule === 'weekly';
}



export const puzzles: Puzzle[] = [
	{name: 'NYT', schedule: 'daily'},
	{name: 'WSJ', schedule: 'daily', herbachName: 'wsj'},
	{name: 'NY', schedule: 'daily'},
	{name: 'JZ', schedule: 'weekly', day: 4, herbachName: 'JZ'},
	{name: 'BEQ', schedule: 'weekly', day: 4},
	{name: 'BEQ2', schedule: 'weekly', day: 1},
	{name: 'WP', schedule: 'weekly', day: 0, herbachName: 'WaPo'}
];


const herbachPuzzles = puzzles.filter(puzzle => puzzle.herbachName !== undefined).map(puzzle => puzzle.name);

export class PuzzleActions{
	downloadLocation: string;
	nytCookie: string;
	puzzleName: PuzzleName;
	date: string;
	
	constructor(settings: Settings, puzzleName: PuzzleName, date: string){
		this.downloadLocation = settings.downloadLocation;
		this.nytCookie = settings.nytCookie;
		this.puzzleName = puzzleName;
		this.date = date;
	}

	formatDate(dateFormat: string): string {
		return format(new Date(this.date + 'T12:00:00Z'), dateFormat);
	}

	formatDateShort(): string {
		return this.formatDate('yyMMdd');
	}

	formatDateLong(): string {
		return this.formatDate('EEEE, MMMM d, yyyy'); 
	}

	getFileName(): string {
		return `${this.puzzleName.toLowerCase()}_${this.formatDateShort()}.puz`;
	}

	getPuzzlePath(): string {
		return window.electronApi.path.join(this.downloadLocation, this.getFileName());
	}

	openPuzzle(): void{
		console.log(`Opening ${this.puzzleName}_${this.date}`);
		
		function getCommandLine(): string {
			switch (window.electronApi.process.platform) { 
				case 'darwin' : return 'open';
				case 'win32' : return 'start';
				case 'win64' : return 'start';
				default : return 'xdg-open';
			}
		}
	
		const puzzlePath = this.getPuzzlePath();
	
		window.electronApi.child_process.exec(`${getCommandLine()} ${puzzlePath}`);
	}



	async downloadPuzzle(): Promise<void>{
		console.log(`Downloading ${this.puzzleName}_${this.date}`);
		if(herbachPuzzles.includes(this.puzzleName)){
			await this.downloadHerbachPuzzle();
		}
		else if(this.puzzleName === 'BEQ' || this.puzzleName === 'BEQ2'){
			await this.downloadBeqPuzzle();
		}
		// else if(this.puzzleName === 'NY'){
		// 	await this.downloadNyPuzzle();
		// }
		else if(this.puzzleName === 'NYT'){
			await this.downloadNytPuzzle();
		}
		else{
			throw new Error('Unsupported puzzle.');
		}
	}

	async downloadNytPuzzle(): Promise<void>{
		if(this.nytCookie === ''){
			throw new Error('Missing NYT cookie. Input a cookie in the settings in order to download NYT puzzles.');
		}
		const url = `https://www.nytimes.com/svc/crosswords/v6/puzzle/daily/${this.date}.json`;
		const resp = await window.electronApi.electron.fetch(url, 'GET', [{name: 'NYT-S', value: this.nytCookie}]);
		console.log(resp);
		const puzJson = JSON.parse(resp);
		const body = puzJson.body[0];

		const rebusIndex = 1;
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
				}
				if(clue.type === 3){
					markupGrid.push({circled: true});
				}
				else{
					markupGrid.push({});
				}
			}
			
		});

		const puz: PuzzleMetadata = {
			author: puzJson.constructors.join(','),
			copyright: puzJson.copyright + ', The New York Times',
			fileVersion: '1.4',
			height: body.dimensions.height,
			isScrambled: false,
			title: puzJson.title === undefined ? 'NY Times, ' + this.formatDateLong() :  puzJson.title,
			width: body.dimensions.width,
			solution: solution.join(''),
			state: state.join(''),
			clues: body.clues.map(clue => clue.text[0].plain),
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

		const buf = window.electronApi.encoder.encode(puz);
		const fileName = this.getFileName();
		const path = window.electronApi.path.join(this.downloadLocation, fileName);
		await window.electronApi.fs.writeFileSync(path, buf);
	}

	async downloadHerbachPuzzle(): Promise<void>{

		const puzzle = puzzles.find(puz => puz.name === this.puzzleName);
		if(puzzle === undefined || puzzle.herbachName === undefined){
			throw new Error('Invalid Herbach puzzle');
		}
		else{
			const url = `http://herbach.dnsalias.com/${puzzle.herbachName}/${this.puzzleName.toLowerCase()}${this.formatDateShort()}.puz`;
			console.log(url);
			const fileName = this.getFileName();
			await window.electronApi.electron.download(url, this.downloadLocation, fileName);
		}
		
		
	}

	async downloadBeqPuzzle(): Promise<void>{
		const [year, month, day] = this.date.split('-');
		const pageUrl = `https://www.brendanemmettquigley.com/${year}/${month}/${day}/index.html`;
		const resp = await window.electronApi.electron.fetch(pageUrl);
	
		const regexp = /<a href="https:\/\/(www.brendanemmettquigley.com\/files\/.*?\.puz)"> <span style="font-size: 1.4em;">ACROSS LITE<\/span><\/a>/;
		const match = resp.match(regexp);
		if(match === null){
			throw new Error('No puzzle found.');
		}
		else{
			const puzUrl = 'https://' + match[1];
			const fileName = this.getFileName();
			await window.electronApi.electron.download(puzUrl, this.downloadLocation, fileName);
		}

	}
	

	async downloadNyPuzzle(): Promise<void> {
		const [year, month, day] = this.date.split('-');
		const pageUrl = `https://www.newyorker.com/puzzles-and-games-dept/crossword/${year}/${month}/${day}`;
		const pageResp = await window.electronApi.electron.fetch(pageUrl);
		const puzUrlRegex = /data-src="(https:\/\/cdn3\.amuselabs.com\/tny\/crossword\?id=.*?)&src/;
		const puzUrlMatch = pageResp.match(puzUrlRegex);
		if(puzUrlMatch === null){
			throw new Error('Failed to find "https://cdn3.amuselabs.com..." in page.');
		}
		else{
			const puzResp = await window.electronApi.electron.fetch(puzUrlMatch[1]);
			decodeHtml(puzResp);
		}
	}

}




function decodeHtml(html: string): void{
	console.log('Decoding');
	const encodedPuzzleMatch = html.match(/window\.puzzleEnv\.rawc\s*=\s*'([^']+)'/);
	if(encodedPuzzleMatch === null){
		throw new Error('Unable to fetch encoded puzzle');
	}
	else{
		const encodedPuzzle = encodedPuzzleMatch[1].replace('window.rawc = ', '').replaceAll('\'', '');
		console.log(encodedPuzzle);
		const decodedPuzzle = window.electronApi.node.Buffer.from(encodedPuzzle, 'base64').toString('utf8');
		// console.log(decodedPuzzle);
		throw new Error('Error');
	}
}



// function convertJSON(json):
//     puzText = '<ACROSS PUZZLE V2>\n'
//     puzText += '<TITLE>\n'
//     puzText += '\t' + json['title'] + '\n'
//     puzText += '<AUTHOR>\n'
//     puzText += '\n'
//     puzText += '<COPYRIGHT>\n'
//     puzText += '\n'
//     puzText += '<SIZE>\n'
//     puzText += '\t' + str(json['w']) + 'x' + str(json['h']) + '\n'
//     puzText += '<GRID>\n'
//     zippedBoxesTuples = list(zip(*json['box']))
//     zippedBoxes = [list(x) for x in zippedBoxesTuples]

//     if 'cellInfos' in json:
//         for circled in list(filter(lambda x: x['isCircled'], json['cellInfos'])):
//             zippedBoxes[circled['y']][circled['x']
//                                       ] = zippedBoxes[circled['y']][circled['x']].lower()
//     for row in zippedBoxes:
//         puzText += '\t'
//         for letter in row:
//             puzText += letter.replace('\u0000', '.')
//         puzText += '\n'
//     puzText += '<REBUS>\n'
//     puzText += 'MARK;\n'
//     puzText += '<ACROSS>\n'
//     for across in list(filter(lambda x: x['acrossNotDown'], json['placedWords'])):
//         puzText += '\t' + across['clue']['clue'].replace(
//             '\u0000', '.').replace('\x00', '.') + '\n'
//     puzText += '<DOWN>\n'
//     for across in list(filter(lambda x: not x['acrossNotDown'], json['placedWords'])):
//         puzText += '\t' + across['clue']['clue'].replace('\u0000', '.') + '\n'
//     return(puzText)
