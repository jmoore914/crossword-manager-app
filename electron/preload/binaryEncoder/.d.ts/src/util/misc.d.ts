/// <reference types="node" />
import { Puzzle, SquareMarkup } from '../';
import { ENCODING, EXTENSION } from './constants';
import { PuzzleReader } from './PuzzleReader';
export declare function parseVersion(version?: string): [number, number, string | undefined];
/**
 * Parse a string of key-value pairs into a JavaScript object.
 *
 * @example
 * parseRebusTable(' 0:CAT;10:DOG; 4:MOUSE;')
 *   => {0: "CAT", 10: "DOG", 4: "MOUSE"}
 * @param tableString String should be semicolon terminated.
 */
export declare function parseRebusTable(tableString: string): {
    [key: number]: string;
};
/**
 * Print an object of key-value pairs as a semocolon-delimited string.
 *
 * @example
 * printRebusTable({0: "CAT", 10: "DOG", 4: "MOUSE"})
 *   => ' 0:CAT;10:DOG; 4:MOUSE;'
 *
 * @param tableObject
 * Object mapping rebus keys to expected solutions.
 * NOTE: Keys should not exceed 99.
 * @returns
 * A semicolon-delimited string. Note that there will be a trailing semicolon.
 */
export declare function printRebusTable(tableObject: {
    [key: number]: string | undefined;
}): string;
/**
 * Format an input string as a null-terminated string.
 *
 * @param input Optional string to be formatted.
 * @returns If input is non-null, appends a null character to the end.
 * If no input is supplied, returns the empty string.
 */
export declare function zstring(input?: string): string;
export declare function guessFileEncodingFromVersion(fileVersion?: string): ENCODING;
/**
 * Collect metadata text from a puzzle object as a single string. This is
 * useful for generating some PUZ file checksums.
 *
 * @param puzzle Puzzle object to collect strings from.
 * @returns A string with the text metadata fields concatenated.
 */
export declare function getMetaStrings({ title, author, copyright, clues, notepad, fileVersion, }: Puzzle): string;
/**
 * Allocate a buffer of 52 bytes and populate it with all expected data other
 * than checksums.
 *
 * @param puzzle Puzzle object to derive header for.
 * @returns Buffer of with encoded puzzle metadata.
 */
export declare function encodeHeaderWithoutChecksums(puzzle: Puzzle): Buffer;
/**
 * Encode an extension section to binary.
 *
 * @param title The four-letter section title.
 * @param data A byte array containing the extension data.
 * @returns The extension data encoded in a null-terminated byte array.
 */
export declare function encodeExtensionSection(title: EXTENSION, data: Uint8Array): Buffer;
/**
 * Given a PuzzleReader, attempts to read an extension block from the reader's
 * currect cursor position.
 *
 * Validates the format, checksum and data length of the section, then returns
 * the section title and associated data buffer.
 *
 * see extension section format documentation:
 * https://github.com/ajhyndman/puz/blob/main/PUZ%20File%20Format.md#extra-sections
 *
 * @param reader
 * A PuzzleReader instance to attempt to read an extension section from.
 * @returns An object containing the section's 'title' and 'data'.
 */
export declare function parseExtensionSection(reader: PuzzleReader): {
    title: string | undefined;
    data: Buffer;
};
export declare function squareNeedsAcrossClue({ solution, width }: Pick<Puzzle, 'solution' | 'width'>, i: number): boolean;
export declare function squareNeedsDownClue({ solution, width }: Pick<Puzzle, 'solution' | 'width'>, i: number): boolean;
export declare function divideClues(puzzle: Pick<Puzzle, 'clues' | 'solution' | 'width'>): {
    across: string[];
    down: string[];
};
export declare function mergeClues({ solution, width }: Pick<Puzzle, 'solution' | 'width'>, across: string[], down: string[]): string[];
/**
 * Decode markup bits from a one-byte integer.
 *
 * @param markup Two bute integer with bits to be decoded
 * @returns An object with boolean keys describing the markup for a square.
 */
export declare function decodeMarkup(byte: number): SquareMarkup;
/**
 * Encodes a markup object into a one-byte integer suitable for storing in
 * PUZ files.
 *
 * @param markup Object to be encoded
 * @returns a two byte integer with markup bits encoded
 */
export declare function encodeMarkup({ circled, incorrect, previouslyIncorrect, revealed, unknown_08, unknown_04, unknown_02, unknown_01, }: SquareMarkup): number;
/**
 * Get the expected substitution for a given solution index, if any.
 */
export declare function getSubstitution(puzzle: Pick<Puzzle, 'rebus' | 'solution'>, index: number): string | undefined;
//# sourceMappingURL=misc.d.ts.map