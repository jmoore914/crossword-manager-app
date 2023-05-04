import struct, {DataType} from 'python-struct';
import * as iconv from 'iconv-lite';

export function getKeys<T>(obj: T): (keyof T)[]{
	const keys: (keyof T)[] = [];
	let key: keyof T;
	for(key in obj){
		keys.push(key);
	}
	return keys;
}

const b = new TextEncoder();

const HEADER_FORMAT = `<
             H 11s        xH
             Q       4s  2sH
             12s         BBH
             H H `;

const HEADER_CKSUM_FORMAT = '<BBH H H ';

const EXTENSION_HEADER_FORMAT = '< 4s  H H ';

const MASKSTRING = 'ICHEATED';

type Encoding = BufferEncoding | 'iso-8859-1';

const ENCODING: Encoding = 'iso-8859-1';
const ENCODING_UTF8: BufferEncoding = 'utf-8';
const ENCODING_ERRORS = 'namereplace';  


const ACROSSDOWN = iconv.encode('ACROSS&DOWN', ENCODING);
const BLACKSQUARE = '.';
const BLACKSQUARE2 = ':';


function enumFunc<T>(enums: T): T {
	return Object.freeze(enums);
}
  
const PuzzleType= enumFunc({
	Normal: 0x0001,
	Diagramless: 0x0401
});

const SolutionState = enumFunc({
	Unlocked: 0x0000,
	Locked: 0x0004
});

const GridMarkup = enumFunc({
	Default: 0x00,
	PreviouslyIncorrect: 0x10,
	Incorrect: 0x20,
	Revealed: 0x40,
	Circled: 0x80
});


const Extensions = enumFunc({
	Rebus: 'GRBS',
	RebusSolutions: 'RTBL',
	RebusFill: 'RUSR',
	Timer: 'LTIM',
	Markup: 'GEXT'
});

class PuzzleFormatError{
	message: string;    

	constructor(message = ''){
		this.message=message;
	}
}




export interface PuzzleMetadata{
	preamble: Buffer;
	postscript: Buffer;
	title: string;
	author: string;
	copyright: string;
	width: number;
	height: number;
	version: Buffer;
	fileversion: Buffer;
	encoding: Encoding;
	unk1: Buffer;
	unk2: Buffer;
	scrambledCksum: number;
	fill: string;
	solution: string;
	clues: string[];
	notes: string;
	extensions: {[key: string]: Buffer};
	extensionsOrder: string[];
	puzzleType: number;
	solutionState: number;
	helpers: Helpers;
}

interface Helpers{
	rebus?: Rebus;
	markup?: Markup;
	clues?: DefaultClueNumbering;

}

function getDefaultPuzzleMetadata(): PuzzleMetadata{
	return {
		preamble: Buffer.from(''),
		postscript: Buffer.from(''),
		title: '',
		author: '',
		copyright: '',
		width: 0,
		height: 0,
		version: Buffer.from('1.3'),
		fileversion: Buffer.from('1.3\0'),
		encoding: ENCODING,
		unk1: Buffer.alloc(2, 0),
		unk2: Buffer.alloc(12, 0),
		scrambledCksum: 0,
		fill: '',
		solution: '',
		clues: [],
		notes: '',
		extensions: {},
		extensionsOrder: [],
		puzzleType: 0x0001,
		solutionState: 0x0000,
		helpers: {},
	};
}

export class Puzzle{


	puzzleMetadata: PuzzleMetadata;

	constructor(puzzleMetadata: PuzzleMetadata){
		this.puzzleMetadata = puzzleMetadata;
	}

	encode(str: string): Buffer{
		
		return iconv.encode(str, this.puzzleMetadata.encoding);
	}

	decode(buffer: Buffer): string{
		return iconv.decode(buffer, this.puzzleMetadata.encoding);
	}

	emptyBuffer(): Buffer{
		return this.encode('');
	}

	getExtension(extension: string): Buffer{
		return extension in this.puzzleMetadata.extensions ? this.puzzleMetadata.extensions[extension] : this.emptyBuffer();
	}

	save(filename: string): void{
		console.log(this.toBuffer());
	}

	toBuffer(): Buffer{
		const s = new PuzzleBuffer(this.emptyBuffer(), this.puzzleMetadata.encoding);

		getKeys(this.puzzleMetadata.helpers).forEach(key => {
			if('save' in this.puzzleMetadata.helpers[key]!){
				this.puzzleMetadata.helpers[key]!.save();
			}
		});


		s.write(this.puzzleMetadata.preamble);

		s.pack(HEADER_FORMAT, this.globalCksum(), this.decode(ACROSSDOWN), this.headerCksum(), this.magicCksum(),
			this.decode(this.puzzleMetadata.fileversion), this.decode(this.puzzleMetadata.unk1), this.puzzleMetadata.scrambledCksum, 
			this.decode(this.puzzleMetadata.unk2), this.puzzleMetadata.width, this.puzzleMetadata.height,
			this.puzzleMetadata.clues.length, this.puzzleMetadata.puzzleType, this.puzzleMetadata.solutionState);

		s.write(this.encode(this.puzzleMetadata.solution));
		s.write(this.encode(this.puzzleMetadata.fill));

		s.writeString(this.puzzleMetadata.title);
		s.writeString(this.puzzleMetadata.author);
		s.writeString(this.puzzleMetadata.copyright);
        

		this.puzzleMetadata.clues.forEach(clue => {
			s.writeString(clue);
		});

		s.writeString(this.puzzleMetadata.notes);

		const ext = {...this.puzzleMetadata.extensions};
		for(const code in this.puzzleMetadata.extensionsOrder){
			const data = ext[code];
			delete ext[code];
			if(data){
				s.pack(EXTENSION_HEADER_FORMAT, code, data.length, dataCksum(data));
				s.write(Buffer.concat([data, this.emptyBuffer()]));
			}
		}

    
		return s.toBuffer();



	}



	encodeZstring(s: string): Buffer {
		return Buffer.concat([this.encode(s), this.emptyBuffer()]);
	}
      
	versionFloat(): number {
		return parseFloat(this.puzzleMetadata.version.toString());
	}
      
	hasRebus(): boolean {
		return this.rebus().hasRebus();
	}
      
	createEmptyRebus(): Rebus {
		const rebus = this.rebus();
		this.puzzleMetadata.extensions[Extensions.Rebus] = this.emptyBuffer();
		this.puzzleMetadata.extensions[Extensions.RebusSolutions] = this.emptyBuffer();
		rebus.fill = {};
		rebus.solutions = {};
		rebus.table = [];
		return rebus;
	}
      
	rebus(): Rebus {
		return this.puzzleMetadata.helpers.rebus || (this.puzzleMetadata.helpers.rebus = new Rebus(this));
	}
      
	hasMarkup(): boolean {
		return this.markup().hasMarkup();
	}
      
	markup(): Markup {
		return this.puzzleMetadata.helpers.markup || (this.puzzleMetadata.helpers.markup = new Markup(this));
	}
      
	clueNumbering(): DefaultClueNumbering {
		const numbering = new DefaultClueNumbering(this.puzzleMetadata.fill, this.puzzleMetadata.clues, this.puzzleMetadata.width, this.puzzleMetadata.height);
		return this.puzzleMetadata.helpers.clues || (this.puzzleMetadata.helpers.clues = numbering);
	}
      
	blackSquare(): string {
		return this.puzzleMetadata.puzzleType === PuzzleType.Diagramless ? BLACKSQUARE2 : BLACKSQUARE;
	}


      
      
	headerCksum(cksum = 0): number {
		return dataCksum(struct.pack(HEADER_CKSUM_FORMAT, this.puzzleMetadata.width, this.puzzleMetadata.height, this.puzzleMetadata.clues.length, this.puzzleMetadata.puzzleType, this.puzzleMetadata.solutionState),
			cksum);
	}
      
	textCksum(cksumStart = 0): number {
		let cksum = cksumStart;
		// for the checksum to work these fields must be added in order with
		// null termination, followed by all non-empty clues without null
		// termination, followed by notes (but only for version >= 1.3)
		if (this.puzzleMetadata.title) {
			cksum = dataCksum(this.encodeZstring(this.puzzleMetadata.title), cksum);
		}
		if (this.puzzleMetadata.author) {
			cksum = dataCksum(this.encodeZstring(this.puzzleMetadata.author), cksum);
		}
		if (this.puzzleMetadata.copyright) {
			cksum = dataCksum(this.encodeZstring(this.puzzleMetadata.copyright), cksum);
		}
      
		for (const clue of this.puzzleMetadata.clues) {
			if (clue) {
				cksum = dataCksum(this.encode(clue), cksum);
			}
		}
      
		// notes included in global cksum starting v1.3 of format
		if (this.versionFloat() >= 1.3 && this.puzzleMetadata.notes) {
			cksum = dataCksum(this.encodeZstring(this.puzzleMetadata.notes), cksum);
		}
      
		return cksum;
	}
      
	globalCksum(): number {
		let cksum = this.headerCksum();
		cksum = dataCksum(this.encode(this.puzzleMetadata.solution), cksum);
		cksum = dataCksum(this.encode(this.puzzleMetadata.fill), cksum);
		cksum = this.textCksum(cksum);
		// extensions do not seem to be included in global cksum
		return cksum;
	}
      
	magicCksum(): number {
		const cksums = [
			this.headerCksum(),
			dataCksum(this.encode(this.puzzleMetadata.solution)),
			dataCksum(this.encode(this.puzzleMetadata.fill)),
			this.textCksum(),
		];
      
		let cksumMagic = 0;
		for (let i = 0; i < cksums.length; i++) {
			const cksum = cksums[cksums.length - i - 1];
			cksumMagic <<= 8;
			cksumMagic |= (
				MASKSTRING.charCodeAt(cksums.length - i - 1) ^ (cksum & 0x00ff)
			);
			cksumMagic |= (
				(MASKSTRING.charCodeAt(cksums.length - i - 1 + 4) ^ (cksum >> 8)) << 32
			);
		}
      
		return cksumMagic;
	}
      
   
}
    
class PuzzleBuffer {
	data: Buffer;
	encoding: Encoding;
	pos: number;
  
	constructor(data: Buffer, encoding = ENCODING) {
		this.data = data;
		this.encoding = encoding;
		this.pos = 0;
	}

	encode(s: string){
		return iconv.encode(s, this.encoding);
	}

	decode(buf: Buffer){
		return iconv.decode(buf, this.encoding);
	}
  
	canRead(nBytes = 1): boolean {
		return this.pos + nBytes <= this.data.length;
	}
  
	length(): number {
		return this.data.length;
	}
  
	read(nBytes: number): Buffer {
		const start = this.pos;
		this.pos += nBytes;
		return this.data.subarray(start, this.pos);
	}
  
	readToEnd(): Buffer {
		const start = this.pos;
		this.pos = this.length();
		return this.data.subarray(start, this.pos);
	}
  
	readString(): string {
		return this.readUntil('\0');
	}
  
	readUntil(c: string): string {
		const start = this.pos;
		this.seekTo(c.charCodeAt(0), 1);  // read past
		return new TextDecoder(this.encoding).decode(this.data.subarray(start, this.pos - 1));
	}
  
	seekTo(s: number, offset = 0): boolean {
		const index = this.data.indexOf(s, this.pos);
		if (index !== -1) {
			this.pos = index + offset;
			return true;
		} else {
			// s not found, advance to end
			this.pos = this.length();
			return false;
		}
	}
  
	write(s: Buffer): void {
		this.data = Buffer.concat([this.data, s]);
	}
  
	writeString(s: string): void {
		const str: string = s || '';
		const encoded = this.encode(str);
		this.data = Buffer.concat([this.data, encoded, this.encode('\0')]);
	}
  
	pack(structFormat: string, ...values: struct.DataType[]): void {
		console.log(structFormat);
		console.log(values);
		const packed = struct.pack(structFormat, ...values);
		this.data = Buffer.concat([this.data, packed]);
	}
  
	canUnpack(structFormat: string): boolean {
		return this.canRead(struct.sizeOf(structFormat));
	}
  
	unpack(structFormat: string): string | DataType {
		const start = this.pos;
		try {
			const res = struct.unpackFrom(structFormat, Buffer.from(this.data.buffer), undefined, this.pos);
			this.pos += struct.sizeOf(structFormat);
			return res;
		} catch (e) {
			const message = `could not unpack values at ${start} for format ${structFormat}`;
			throw new PuzzleFormatError(message);
		}
	}

  
	toBuffer(): Buffer {
		return this.data;
	}
}
              
class DefaultClueNumbering {
	grid: string;
	clues: string[];
	width: number;
	height: number;
	across: any[];
	down: any[];

	constructor(grid: string, clues: string[], width: number, height: number) {
		this.grid = grid;
		this.clues = clues;
		this.width = width;
		this.height = height;

		// compute across & down
		const across: any[] = [];
		const down: any[] = [];
		let clueIndex = 0;
		let num = 1;
		for (let i = 0; i < grid.length; i++) {
			if (!isBlackSquare(grid[i])) {
				const lastClueIndex = clueIndex;
				const isAcross = this.col(i) === 0 || isBlackSquare(grid[i - 1]);
				if (isAcross && this.lenAcross(i) > 1) {
					across.push({
						'num': num,
						'clue': clues[clueIndex],
						'clueIndex': clueIndex,
						'cell': i,
						'len': this.lenAcross(i)
					});
					clueIndex += 1;
				}
				const isDown = this.row(i) === 0 || isBlackSquare(grid[i - width]);
				if (isDown && this.lenDown(i) > 1) {
					down.push({
						'num': num,
						'clue': clues[clueIndex],
						'clueIndex': clueIndex,
						'cell': i,
						'len': this.lenDown(i)
					});
					clueIndex += 1;
				}
				if (clueIndex > lastClueIndex) {
					num += 1;
				}
			}
		}
		this.across = across;
		this.down = down;
	}

	col(index: number): number {
		return index % this.width;
	}

	row(index: number): number {
		return Math.floor(index / this.width);
	}

	lenAcross(index: number): number {
		let len = 0;
		for (let i = 0; i < this.width - this.col(index); i++) {
			if (isBlackSquare(this.grid[index + i])) {
				return len;
			}
			len++;
		}
		return len + 1;
	}

	lenDown(index: number): number {
		let len = 0;
		for (let i = 0; i < this.height - this.row(index); i++) {
			if (isBlackSquare(this.grid[index + i * this.width])) {
				return len;
			}
			len++;
		}
		return len + 1;
	}
}

class Rebus {
	puzzle: Puzzle;
	temp: any;
	table: any;
	solutions: any;
	fill: any;
  
	constructor(puzzle: Puzzle) {
		this.puzzle = puzzle;
		this.temp = {};
		// parse rebus data
		const rebusData = this.puzzle.getExtension(Extensions.Rebus);
		this.table = parseBuffer(rebusData);
		const rSolData = this.puzzle.getExtension(Extensions.RebusSolutions);
		const solutionsStr = this.puzzle.decode(rSolData);
		const fillData = this.puzzle.getExtension(Extensions.RebusFill);
		const fillStr =  this.puzzle.decode(fillData);
		this.solutions = Object.fromEntries(Object.entries(parseDict(solutionsStr)).map(([k, v]) => [
			parseInt(k, 10),
			v,
		]));
		this.fill = Object.fromEntries(Object.entries(parseDict(fillStr)).map(([k, v]) => [
			parseInt(k, 10),
			v,
		]));
	}
  
	addRebus(answer: string | null): void {
		if (answer === null) {
			this.table.push(0);
		} else {
			if (!(answer in this.temp)) {
				this.temp[answer] = Object.keys(this.temp).length + 1;
			}
			this.solutions[`${this.temp[answer].toString().padStart(2, '0')}`] =
          answer;
			this.table.push(this.temp[answer] + 1);
		}
	}
  
	hasRebus(): boolean {
		return Extensions.Rebus in this.puzzle.puzzleMetadata.extensions;
	}
  
	isRebusSquare(index: number): boolean {
		return Boolean(this.table[index]);
	}
  
	getRebusSquares(): number[] {
		return this.table
			.map((val, index) => (val ? index : null))
			.filter((val) => val !== null);
	}
  
	getRebusSolution(index: number): string | null {
		if (this.isRebusSquare(index)) {
			return this.solutions[this.table[index] - 1];
		}
		return null;
	}
  
	getRebusFill(index: number): string | null {
		if (this.isRebusSquare(index)) {
			return this.fill[this.table[index] - 1];
		}
		return null;
	}
  
	setRebusFill(index: number, value: string): void {
		if (this.isRebusSquare(index)) {
			this.fill[this.table[index] - 1] = value;
		}
	}
  
	save(): void {
		if (this.hasRebus()) {
			// commit changes back to puzzle.extensions
			this.puzzle.puzzleMetadata.extensions[Extensions.Rebus] = packBuffer(this.table);
			const rebusSolutions = this.puzzle.encode(dictToString(this.solutions));
			this.puzzle.puzzleMetadata.extensions[Extensions.RebusSolutions] = rebusSolutions;
			// const rebusFill = this.puzzle.encode(dictToString(this.fill));
			// this.puzzle.extensions[Extensions.RebusFill] = rebusFill
		}
	}
}
  

class Markup {
	puzzle: Puzzle;
	markup: boolean[];

	constructor(puzzle: Puzzle) {
		this.puzzle = puzzle;
		// parse markup data
		const markupData = this.puzzle.getExtension(Extensions.Markup);
		this.markup = this.parseBuffer(markupData);
	}

	hasMarkup(): boolean {
		return this.markup.some(Boolean);
	}

	getMarkupSquares(): number[] {
		return this.markup.flatMap((b, i) => b ? [i] : []);
	}

	isMarkupSquare(index: number): boolean {
		return Boolean(this.markup[index]);
	}

	save(): void {
		if (this.hasMarkup()) {
			this.puzzle.puzzleMetadata.extensions[Extensions.Markup] = this.packBuffer(this.markup);
		}
	}

	private parseBuffer(buffer: Buffer): boolean[] {
		return Array.from(buffer, b => Boolean(b));
	}

	private packBuffer(arr: boolean[]): Buffer {
		const buffer = Buffer.alloc(Math.ceil(arr.length / 8));
		for (let i = 0; i < arr.length; i++) {
			if (arr[i]) {
				buffer[Math.floor(i / 8)] |= 1 << (i % 8);
			}
		}
		return buffer;
	}
}

function dataCksum(data: string | Buffer, defaultCksum = 0): number {
	let cksum = defaultCksum;
	for (let b of data) {
		if (typeof b === 'string') {
			b = b.charCodeAt(0);
		}
		// right-shift one with wrap-around
		const lowbit = cksum & 0x0001;
		cksum = cksum >> 1;
		if (lowbit) {
			cksum = cksum | 0x8000;
		}
  
		// then add in the data and clear any carried bit past 16
		cksum = (cksum + b) & 0xffff;
	}
	return cksum;
}
 

function isBlackSquare(c: string): boolean {
	return [BLACKSQUARE, BLACKSQUARE2].includes(c);
}
          


function parseBuffer(s: Buffer): number[] | DataType[] {
	return struct.unpack('B'.repeat(s.length), s);
}

     
function packBuffer(a: number[]): Buffer {
	return struct.pack('B'.repeat(a.length), ...a);
}
          
function parseDict(s: string): { [key: string]: string } {
	const dict = {};
	s.slice(0, -1).split(';').forEach((pair) => {
		const [key, value] = pair.split(':');
		dict[key] = value;
	});
	return dict;
}
          
function dictToString(d: { [key: string]: string }): string {
	return Object.entries(d).map(([k, v]) => `${k}:${v}`).join(';') + ';';
}
          