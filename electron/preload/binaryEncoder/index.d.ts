/// <reference types="node" />
declare enum ENCODING {
    UTF_8 = "utf-8",
    ISO_8859_1 = "latin1"
}
declare const squareMarkupKeys: readonly ["circled", "incorrect", "previouslyIncorrect", "revealed", "unknown_08", "unknown_04", "unknown_02", "unknown_01"];
declare type SquareMarkupKey = typeof squareMarkupKeys[number];

declare function parseBinaryFile(data: Uint8Array): Puzzle;

declare function printBinaryFile(puzzle: Puzzle): Uint8Array;

declare function parseTextFile(file: string): Puzzle;

declare type LineEndingStyle = 'Windows' | 'Unix';
declare type Indentation = '' | '  ' | '    ' | '\t';
declare function printTextFile(puzzle: Puzzle, indentation?: Indentation, lineEndingStyle?: LineEndingStyle): string;

/**
 * Validate that an object describes a complete and internally consistent
 * Puzzle.
 *
 * @param puzzle The object to be validated.
 * @returns If validation succeeds, returns undefined.
 * @throws If any validation check fails, throws an InvariantError
 */
declare function validate(puzzle: Partial<Puzzle>): asserts puzzle is Puzzle;

declare function getFileChecksum(puzzle: Puzzle): number;
declare function getHeaderChecksum(puzzle: Puzzle): number;
declare function getICheatedChecksum(puzzle: Puzzle): Uint8Array;
declare function getFileEncoding(puzzle: Puzzle): ENCODING;
declare function gridNumbering(puzzle: Pick<Puzzle, 'solution' | 'width'>): (number | undefined)[];
/**
 * Get a blank working state for a given puzzle.
 *
 * @param puzzle
 * @returns Puzzle state as a single, unbroken string.
 */
declare function getBlankState(puzzle: Pick<Puzzle, 'solution'>): string;
/**
 * Get the current working state for a given puzzle.
 *
 * @param puzzle
 * @returns Puzzle state as a single, unbroken string.  Returns the equivalent blank state if state is not supplied.
 */
declare function getState(puzzle: Pick<Puzzle, 'solution' | 'state'>): string;
/**
 * Does the puzzle expect a rebus solution?
 *
 * @param puzzle A valid puzzle object.
 * @returns True if the puzzle expects a rebus substitation for any index.
 */
declare function hasRebusSolution(puzzle: Puzzle): boolean;
/**
 * Has the user attempted to supply a rebus solution?
 *
 * @param puzzle A valid puzzle object.
 * @returns True if the user has entered a non-empty rebus substitution.
 */
declare function hasRebusState(puzzle: Puzzle): boolean;
/**
 * Check whether the current puzzle is solved!
 *
 * @param puzzle
 * A complete, valid puzzle object. The puzzle should not be scrambled.
 * @param ignoreRebus
 * Set this to true to check a puzzle for correctness ignoring expected rebus
 * substitutions. This is useful when an application does not support rebus
 * user input.
 *
 * @returns If the puzzle is correct, returns true
 * @throws InvariantViolation if the puzzle is scrambled or invalid.
 */
declare function isCorrect(puzzle: Puzzle, ignoreRebus?: boolean): boolean;

declare type SquareMarkup = {
    [key in SquareMarkupKey]?: boolean;
};
declare type Puzzle = {
    author?: string;
    copyright?: string;
    fileVersion?: string;
    height: number;
    isScrambled?: boolean;
    notepad?: string;
    title?: string;
    width: number;
    solution: string;
    state?: string;
    clues: string[];
    markupGrid?: SquareMarkup[];
    rebus?: {
        grid?: (number | undefined)[];
        solution?: {
            [key: number]: string;
        };
        state?: (string | undefined)[];
    };
    timer?: {
        secondsElapsed: number;
        isPaused: boolean;
    };
    misc?: {
        unknown1?: number;
        unknown2?: Uint8Array;
        unknown3?: number;
        preamble?: Uint8Array;
        scrambledChecksum?: number;
    };
};

export { Puzzle, SquareMarkup, getBlankState, getFileChecksum, getFileEncoding, getHeaderChecksum, getICheatedChecksum, getState, gridNumbering, hasRebusSolution, hasRebusState, isCorrect, parseBinaryFile, parseTextFile, printBinaryFile, printTextFile, validate };
