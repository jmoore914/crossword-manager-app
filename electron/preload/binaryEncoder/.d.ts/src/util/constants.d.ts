/// <reference types="node" />
export declare enum ENCODING {
    UTF_8 = "utf-8",
    ISO_8859_1 = "latin1"
}
export declare const enum HEADER_OFFSET {
    FILE_CHECKSUM_START = 0,
    FILE_SIGNATURE_START = 2,
    FILE_SIGNATURE_END = 14,
    HEADER_CHECKSUM_START = 14,
    HEADER_END = 52,
    ICHEATED_CHECKSUM_START = 16,
    ICHEATED_CHECKSUM_END = 24,
    VERSION_START = 24,
    VERSION_END = 28,
    RESERVED_1C_START = 28,
    SCRAMBLED_CHECKSUM_START = 30,
    RESERVED_20_START = 32,
    RESERVED_20_END = 44,
    WIDTH_START = 44,
    HEIGHT_START = 45,
    NUMBER_OF_CLUES_START = 46,
    UNKNOWN_BITMASK_START = 48,
    SCRAMBLED_START = 50
}
export declare enum SQUARE_MARKUP_BITMASK {
    CIRCLED = 128,
    REVEALED = 64,
    INCORRECT = 32,
    PREVIOUSLY_INCORRECT = 16,
    UNKNOWN_08 = 8,
    UNKNOWN_04 = 4,
    UNKNOWN_02 = 2,
    UNKNOWN_01 = 1
}
export declare const enum EXTENSION {
    MARKUP_GRID = "GEXT",
    REBUS_GRID = "GRBS",
    REBUS_SOLUTION = "RTBL",
    REBUS_STATE = "RUSR",
    TIMER = "LTIM"
}
export declare const squareMarkupKeys: readonly ["circled", "incorrect", "previouslyIncorrect", "revealed", "unknown_08", "unknown_04", "unknown_02", "unknown_01"];
export declare type SquareMarkupKey = typeof squareMarkupKeys[number];
export declare const EMPTY_BUFFER: Buffer;
export declare const NULL_BYTE: Buffer;
export declare const ICHEATED: Buffer;
export declare const FILE_SIGNATURE = "ACROSS&DOWN\0";
export declare const REGEX_BLACK_SQUARE: RegExp;
export declare const REGEX_REBUS_TABLE_STRING: RegExp;
export declare const REGEX_TIMER_STRING: RegExp;
export declare const REGEX_VERSION_STRING: RegExp;
export declare const REGEX_SOLUTION: RegExp;
export declare const REGEX_STATE: RegExp;
export declare const DEFAULT_FILE_VERSION = "1.4";
//# sourceMappingURL=constants.d.ts.map