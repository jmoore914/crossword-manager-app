/// <reference types="node" />
import { ENCODING } from './constants';
/**
 * A cursor-based readeer that provides methods useful for reading strings and
 * bytes from PUZ file binary data.
 */
export declare class PuzzleReader {
    private buffer;
    private encoding;
    cursor: number;
    constructor(buffer: Buffer, encoding: ENCODING, initialCursor?: number);
    private _getNextNullByte;
    hasBytesToRead(): boolean;
    /**
     * Decodes bytes as a string using the specified encoding.
     *
     * Read "length" butes from the current cursor position.  Updates cursor to
     * the first unread byte.
     *
     * @param length The number of bytes to be read.
     * @returns
     * The string that results from decoding the target bytes.
     *
     * If length specified is zero, returns undefined.
     */
    readString(length: number): string | undefined;
    /**
     * Decodes bytes as a string using the specified encoding.
     *
     * Reads all bytes from the current cursor position until the next null
     * character.  Omits the null character.  Updates cursor to the byte
     * *following* the null character.
     *
     * If there is no remaining null character, reads to the end of the string.
     *
     * @returns The string that results from decoding the target bytes.
     *
     * If no null bytes remain, reads to the end of the string.
     *
     * If there are no bytes between the cursor and the next null byte (or EOF),
     * returns undefined.
     */
    readNullTerminatedString(): string | undefined;
    /**
     * Read bytes into a new buffer.
     *
     * Read "length" butes from the current cursor position.  Updates cursor to
     * the first unread byte.
     *
     * @param length
     * @returns The target bytes in a new Buffer instance.
     */
    readBytes(length: number): Buffer | undefined;
    /**
     * Read bytes into a new buffer.
     *
     * Reads all bytes from the current cursor position until the next null
     * character.  Omits the null character.  Updates cursor to the byte
     * *following* the null character.
     *
     * @returns The target bytes in a new Buffer instance.
     *
     * If no null bytes remain, reads to the end of the string.
     *
     * If there are no bytes between the cursor and the next null byte (or EOF),
     * returns undefined.
     */
    readNullTerminatedBytes(): Buffer | undefined;
}
//# sourceMappingURL=PuzzleReader.d.ts.map