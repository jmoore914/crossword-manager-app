/**
 * Compress the keys used in a puzzle rebus to the smallest integer range.
 *
 * i.e. if puzzle uses sparse integer keys, like [1, 6, 240, 10020], compress
 * these to sequential integers: [0, 1, 2, 3]
 *
 * This is useful when writing a binary puzzle to text.
 *
 * NOTE: This function does not validate that the grid and solution correspond.
 *
 * @param rebusGrid A non-empty rebus grid, as specified in a Puzzle object
 * @param rebusSolution A non-empty rebus solution, as sepcified in a Puzzle object
 *
 * @returns An equivalent rebus grid and solution with normalized key values.
 */
export declare function compressKeys(rebusGrid: (number | undefined)[], rebusSolution: {
    [key: number]: string;
}): {
    rebusGrid: (number | undefined)[];
    rebusSolution: {
        [key: number]: string;
    };
};
export declare function rebusKeyCharToNum(char: string): number;
export declare function rebusKeyNumToChar(num: number): string;
//# sourceMappingURL=rebusKey.d.ts.map