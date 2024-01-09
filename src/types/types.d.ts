export interface Settings{
	nytCookie: string;
	downloadLocation: string;
	backupLocation?: string;
}

export type PuzzleName = 'NYT' | 'WSJ' | 'NY' | 'JZ' | 'BEQ' | 'BEQ2' | 'WP';

export type Schedule = 'daily' | 'weekly';

export interface BasePuzzle{
	name: PuzzleName;
	herbachName?: string;
}

export interface DailyPuzzle extends BasePuzzle {
	schedule: 'daily';
}

export interface WeeklyPuzzle extends BasePuzzle {
	schedule: 'weekly';
	day: number;
}

export type Puzzle = DailyPuzzle | WeeklyPuzzle;


export type Status = 'missing' | 'downloaded' | 'played' | 'error';

export interface History{
	[date: string]: DateHistory;
}

export interface DateHistory{
	[puzzle: string]: Status;
}