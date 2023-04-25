export interface Settings{
	nytCookie: string;
	downloadLocation: string;
}

export type PuzzleName = 'NYT' | 'WSJ' | 'LAT' | 'JZ' | 'BEQ' | 'BEQ2';

export type Status = 'missing' | 'downloaded' | 'played' | 'error';

export interface History{
	[date: string]: DateHistory;
}

export interface DateHistory{
	[puzzle: string]: Status;
}