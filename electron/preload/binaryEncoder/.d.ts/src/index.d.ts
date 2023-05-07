import { SquareMarkupKey } from './util/constants';
export declare type SquareMarkup = {
    [key in SquareMarkupKey]?: boolean;
};
export declare type Puzzle = {
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
export { parseBinaryFile } from './binary/parse';
export { printBinaryFile } from './binary/print';
export { parseTextFile } from './text/parse';
export { printTextFile } from './text/print';
export { validate } from './validate';
export * from './projections';
//# sourceMappingURL=index.d.ts.map