import { Puzzle } from './';
import { ENCODING } from './util/constants';
export declare function getFileChecksum(puzzle: Puzzle): number;
export declare function getHeaderChecksum(puzzle: Puzzle): number;
export declare function getICheatedChecksum(puzzle: Puzzle): Uint8Array;
export declare function getFileEncoding(puzzle: Puzzle): ENCODING;
export declare function gridNumbering(puzzle: Pick<Puzzle, 'solution' | 'width'>): (number | undefined)[];
/**
 * Get a blank working state for a given puzzle.
 *
 * @param puzzle
 * @returns Puzzle state as a single, unbroken string.
 */
export declare function getBlankState(puzzle: Pick<Puzzle, 'solution'>): string;
/**
 * Get the current working state for a given puzzle.
 *
 * @param puzzle
 * @returns Puzzle state as a single, unbroken string.  Returns the equivalent blank state if state is not supplied.
 */
export declare function getState(puzzle: Pick<Puzzle, 'solution' | 'state'>): string;
/**
 * Does the puzzle expect a rebus solution?
 *
 * @param puzzle A valid puzzle object.
 * @returns True if the puzzle expects a rebus substitation for any index.
 */
export declare function hasRebusSolution(puzzle: Puzzle): boolean;
/**
 * Has the user attempted to supply a rebus solution?
 *
 * @param puzzle A valid puzzle object.
 * @returns True if the user has entered a non-empty rebus substitution.
 */
export declare function hasRebusState(puzzle: Puzzle): boolean;
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
export declare function isCorrect(puzzle: Puzzle, ignoreRebus?: boolean): boolean;
//# sourceMappingURL=projections.d.ts.map