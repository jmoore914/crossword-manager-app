import invariant, { invariant as invariant$1, InvariantError } from 'ts-invariant';

/**
 * Implementation of the PUZ file checksum algorithm.
 *
 * @see {@link https://github.com/ajhyndman/puz/blob/main/PUZ%20File%20Format.md#checksums}
 *
 * @param data binary data subarray to be checksummed
 * @param initialValue optional initial checksum value; can be used to combine (chain) checksums
 * @returns 16 bit
 */
function checksum(data, initialValue = 0x0000) {
    return data.reduce((sum, byte) => {
        // rotate sum bits to the right
        const leastSignificantBit = sum & 1 /* LEAST_SIGNIFICANT_BIT */;
        sum = sum >>> 1;
        if (leastSignificantBit) {
            sum = (sum | 32768 /* MOST_SIGNIFICANT_BIT */) & 65535 /* ALL */;
        }
        // add next byte of data and re-apply mask
        return (sum + byte) & 65535 /* ALL */;
    }, initialValue);
}

// supported text encodings
var ENCODING;
(function (ENCODING) {
    ENCODING["UTF_8"] = "utf-8";
    ENCODING["ISO_8859_1"] = "latin1";
})(ENCODING || (ENCODING = {}));
var SQUARE_MARKUP_BITMASK;
(function (SQUARE_MARKUP_BITMASK) {
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["CIRCLED"] = 128] = "CIRCLED";
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["REVEALED"] = 64] = "REVEALED";
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["INCORRECT"] = 32] = "INCORRECT";
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["PREVIOUSLY_INCORRECT"] = 16] = "PREVIOUSLY_INCORRECT";
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["UNKNOWN_08"] = 8] = "UNKNOWN_08";
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["UNKNOWN_04"] = 4] = "UNKNOWN_04";
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["UNKNOWN_02"] = 2] = "UNKNOWN_02";
    SQUARE_MARKUP_BITMASK[SQUARE_MARKUP_BITMASK["UNKNOWN_01"] = 1] = "UNKNOWN_01";
})(SQUARE_MARKUP_BITMASK || (SQUARE_MARKUP_BITMASK = {}));
const squareMarkupKeys = [
    'circled',
    'incorrect',
    'previouslyIncorrect',
    'revealed',
    'unknown_08',
    'unknown_04',
    'unknown_02',
    'unknown_01',
];
const EMPTY_BUFFER = Buffer.from([]);
const NULL_BYTE = Buffer.from([0x00]);
const ICHEATED = Buffer.from('ICHEATED', 'ascii');
const FILE_SIGNATURE = 'ACROSS&DOWN\x00';
const REGEX_BLACK_SQUARE = /[.:]/;
const REGEX_REBUS_TABLE_STRING = /^([ 0-9]\d:[a-zA-Z0-9@#$%&+?]*?;)*$/;
const REGEX_TIMER_STRING = /^(\d+),([01])$/;
const REGEX_VERSION_STRING = /^(\d+)\.(\d+)([a-z])?$/;
const REGEX_SOLUTION = /^[.:A-Za-z0-9@#$%&+?]+$/;
const REGEX_STATE = /^[-.:A-Za-z0-9@#$%&+?]+$/;
const DEFAULT_FILE_VERSION = '1.4';

function parseVersion(version = DEFAULT_FILE_VERSION) {
    invariant(REGEX_VERSION_STRING.test(version), 'file version data did not match expected format');
    const [, majorVersion, minorVersion, patch] = REGEX_VERSION_STRING.exec(version);
    return [Number.parseInt(majorVersion), Number.parseInt(minorVersion), patch];
}
/**
 * Parse a string of key-value pairs into a JavaScript object.
 *
 * @example
 * parseRebusTable(' 0:CAT;10:DOG; 4:MOUSE;')
 *   => {0: "CAT", 10: "DOG", 4: "MOUSE"}
 * @param tableString String should be semicolon terminated.
 */
function parseRebusTable(tableString) {
    invariant(REGEX_REBUS_TABLE_STRING.test(tableString), `Rebus table text doesn't match expected format.`);
    return tableString
        .slice(0, -1) // drop trailing semicolon
        .split(';')
        .map((entryString) => entryString.split(':'))
        .reduce((acc, [key, value]) => (Object.assign(Object.assign({}, acc), { [Number.parseInt(key)]: value })), {});
}
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
function printRebusTable(tableObject) {
    return Object.entries(tableObject).reduce((acc, [key, value]) => `${acc}${key.padStart(2, ' ')}:${value};`, '');
}
/**
 * Format an input string as a null-terminated string.
 *
 * @param input Optional string to be formatted.
 * @returns If input is non-null, appends a null character to the end.
 * If no input is supplied, returns the empty string.
 */
function zstring(input) {
    return input != null ? input + '\x00' : '';
}
function guessFileEncodingFromVersion(fileVersion = DEFAULT_FILE_VERSION) {
    const [majorVersion] = parseVersion(fileVersion);
    return majorVersion >= 2 ? ENCODING.UTF_8 : ENCODING.ISO_8859_1;
}
/**
 * Collect metadata text from a puzzle object as a single string. This is
 * useful for generating some PUZ file checksums.
 *
 * @param puzzle Puzzle object to collect strings from.
 * @returns A string with the text metadata fields concatenated.
 */
function getMetaStrings({ title, author, copyright, clues, notepad, fileVersion, }) {
    const [majorVersion, minorVersion] = parseVersion(fileVersion);
    return (zstring(title) +
        zstring(author) +
        zstring(copyright) +
        clues.join('') +
        // include notepad in v1.3 and above
        (majorVersion >= 1 && minorVersion >= 3 ? zstring(notepad) : ''));
}
/**
 * Allocate a buffer of 52 bytes and populate it with all expected data other
 * than checksums.
 *
 * @param puzzle Puzzle object to derive header for.
 * @returns Buffer of with encoded puzzle metadata.
 */
function encodeHeaderWithoutChecksums(puzzle) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const header = Buffer.alloc(52 /* HEADER_END */);
    header.write(FILE_SIGNATURE, 2 /* FILE_SIGNATURE_START */, 'ascii');
    header.write((_a = puzzle.fileVersion) !== null && _a !== void 0 ? _a : DEFAULT_FILE_VERSION, 24 /* VERSION_START */, 'ascii');
    header.writeUInt16LE((_c = (_b = puzzle === null || puzzle === void 0 ? void 0 : puzzle.misc) === null || _b === void 0 ? void 0 : _b.unknown1) !== null && _c !== void 0 ? _c : 0x00, 28 /* RESERVED_1C_START */);
    header.writeUInt16LE((_e = (_d = puzzle === null || puzzle === void 0 ? void 0 : puzzle.misc) === null || _d === void 0 ? void 0 : _d.scrambledChecksum) !== null && _e !== void 0 ? _e : 0x00, 30 /* SCRAMBLED_CHECKSUM_START */);
    Buffer.from((_g = (_f = puzzle === null || puzzle === void 0 ? void 0 : puzzle.misc) === null || _f === void 0 ? void 0 : _f.unknown2) !== null && _g !== void 0 ? _g : NULL_BYTE).copy(header, 32 /* RESERVED_20_START */);
    header.writeUInt8(puzzle.width, 44 /* WIDTH_START */);
    header.writeUInt8(puzzle.height, 45 /* HEIGHT_START */);
    header.writeUInt16LE(puzzle.clues.length, 46 /* NUMBER_OF_CLUES_START */);
    header.writeUInt16LE((_j = (_h = puzzle === null || puzzle === void 0 ? void 0 : puzzle.misc) === null || _h === void 0 ? void 0 : _h.unknown3) !== null && _j !== void 0 ? _j : 0x00, 48 /* UNKNOWN_BITMASK_START */);
    header.writeUInt16LE(puzzle.isScrambled ? 0x04 : 0x00, 50 /* SCRAMBLED_START */);
    return header;
}
/**
 * Encode an extension section to binary.
 *
 * @param title The four-letter section title.
 * @param data A byte array containing the extension data.
 * @returns The extension data encoded in a null-terminated byte array.
 */
function encodeExtensionSection(title, data) {
    const header = Buffer.alloc(0x08);
    const dataChecksum = checksum(data);
    header.write(title, 0x00, 'ascii');
    header.writeUInt16LE(data.length, 0x04);
    header.writeUInt16LE(dataChecksum, 0x06);
    return Buffer.concat([header, data, NULL_BYTE]);
}
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
function parseExtensionSection(reader) {
    const title = reader.readString(0x04);
    const length = reader.readBytes(0x02).readUInt16LE();
    const checksum_e = reader.readBytes(0x02).readUInt16LE();
    const data = reader.readBytes(length);
    const sectionTerminator = reader.readBytes(0x01);
    invariant(checksum(data) === checksum_e, `"${title}" section data does not match checksum"`);
    invariant(NULL_BYTE.equals(sectionTerminator), `"${title}" section is missing terminating null byte`);
    return { title, data };
}
function squareNeedsAcrossClue({ solution, width }, i) {
    return (
    // square is not black square
    !REGEX_BLACK_SQUARE.test(solution[i]) &&
        // square is left edge or has black square to left
        (i % width === 0 || REGEX_BLACK_SQUARE.test(solution[i - 1])) &&
        // square is not right edge or has black square to right
        !(i % width === width - 1 || REGEX_BLACK_SQUARE.test(solution[i + 1])));
}
function squareNeedsDownClue({ solution, width }, i) {
    return (
    // square is not black square
    !REGEX_BLACK_SQUARE.test(solution[i]) &&
        // square is top edge or has black square above
        (i < width || REGEX_BLACK_SQUARE.test(solution[i - width])) &&
        // square is bottom edge or has black square below
        !(i >= solution.length - width || REGEX_BLACK_SQUARE.test(solution[i + width])));
}
function divideClues(puzzle) {
    const { clues, solution } = puzzle;
    const clueQueue = clues.slice();
    const across = [];
    const down = [];
    [...solution].forEach((square, i) => {
        if (squareNeedsAcrossClue(puzzle, i)) {
            // assign across clue to square
            across.push(clueQueue.shift());
        }
        if (squareNeedsDownClue(puzzle, i)) {
            // assign down clue to square
            down.push(clueQueue.shift());
        }
    });
    return {
        across,
        down,
    };
}
function mergeClues({ solution, width }, across, down) {
    // copy inputs into new arrays to use as queue
    const acrossQueue = across.slice();
    const downQueue = down.slice();
    // collect clues in array to return
    const clues = [];
    [...solution].forEach((square, i) => {
        if (squareNeedsAcrossClue({ solution, width }, i)) {
            clues.push(acrossQueue.shift());
        }
        if (squareNeedsDownClue({ solution, width }, i)) {
            clues.push(downQueue.shift());
        }
    });
    return clues;
}
/**
 * Decode markup bits from a one-byte integer.
 *
 * @param markup Two bute integer with bits to be decoded
 * @returns An object with boolean keys describing the markup for a square.
 */
function decodeMarkup(byte) {
    const markupObject = {};
    if ((byte & SQUARE_MARKUP_BITMASK.CIRCLED) !== 0)
        markupObject.circled = true;
    if ((byte & SQUARE_MARKUP_BITMASK.INCORRECT) !== 0)
        markupObject.incorrect = true;
    if ((byte & SQUARE_MARKUP_BITMASK.PREVIOUSLY_INCORRECT) !== 0)
        markupObject.previouslyIncorrect = true;
    if ((byte & SQUARE_MARKUP_BITMASK.REVEALED) !== 0)
        markupObject.revealed = true;
    if ((byte & SQUARE_MARKUP_BITMASK.UNKNOWN_08) !== 0)
        markupObject.unknown_08 = true;
    if ((byte & SQUARE_MARKUP_BITMASK.UNKNOWN_04) !== 0)
        markupObject.unknown_04 = true;
    if ((byte & SQUARE_MARKUP_BITMASK.UNKNOWN_02) !== 0)
        markupObject.unknown_02 = true;
    if ((byte & SQUARE_MARKUP_BITMASK.UNKNOWN_01) !== 0)
        markupObject.unknown_01 = true;
    return markupObject;
}
/**
 * Encodes a markup object into a one-byte integer suitable for storing in
 * PUZ files.
 *
 * @param markup Object to be encoded
 * @returns a two byte integer with markup bits encoded
 */
function encodeMarkup({ circled, incorrect, previouslyIncorrect, revealed, unknown_08, unknown_04, unknown_02, unknown_01, }) {
    return ((circled ? SQUARE_MARKUP_BITMASK.CIRCLED : 0) +
        (incorrect ? SQUARE_MARKUP_BITMASK.INCORRECT : 0) +
        (previouslyIncorrect ? SQUARE_MARKUP_BITMASK.PREVIOUSLY_INCORRECT : 0) +
        (revealed ? SQUARE_MARKUP_BITMASK.REVEALED : 0) +
        (unknown_08 ? SQUARE_MARKUP_BITMASK.UNKNOWN_08 : 0) +
        (unknown_04 ? SQUARE_MARKUP_BITMASK.UNKNOWN_04 : 0) +
        (unknown_02 ? SQUARE_MARKUP_BITMASK.UNKNOWN_02 : 0) +
        (unknown_01 ? SQUARE_MARKUP_BITMASK.UNKNOWN_01 : 0));
}
/**
 * Get the expected substitution for a given solution index, if any.
 */
function getSubstitution(puzzle, index) {
    var _a, _b, _c, _d;
    const substitutionKey = (_b = (_a = puzzle.rebus) === null || _a === void 0 ? void 0 : _a.grid) === null || _b === void 0 ? void 0 : _b[index];
    if (substitutionKey) {
        return (_d = (_c = puzzle.rebus) === null || _c === void 0 ? void 0 : _c.solution) === null || _d === void 0 ? void 0 : _d[substitutionKey];
    }
}

/**
 * Validate that an object describes a complete and internally consistent
 * Puzzle.
 *
 * @param puzzle The object to be validated.
 * @returns If validation succeeds, returns undefined.
 * @throws If any validation check fails, throws an InvariantError
 */
function validate(puzzle) {
    const { fileVersion, height, isScrambled, width, solution, state, clues, markupGrid, rebus } = puzzle;
    // VALIDATE REQUIRED FIELDS
    invariant(height != null, 'Puzzle is missing required field: "height"');
    invariant(width != null, 'Puzzle is missing required field: "width"');
    invariant(solution != null, 'Puzzle is missing required field: "solution"');
    invariant(clues != null, 'Puzzle is missing required field: "clues"');
    if (fileVersion != null) {
        // VALIDATE FILE VERSION STRING
        invariant(REGEX_VERSION_STRING.test(fileVersion), 'FileVersion must match the supported format: #.#[#]');
    }
    // VALIDATE SOLUTION SIZE
    invariant(solution.length === width * height, `Puzzle width & height suggest solution should be ${width * height} characters long. Found ${solution.length} characters instead.`);
    // VALIDATE SOLUTION CONTENT
    invariant(REGEX_SOLUTION.test(solution), 'Puzzle solution may only contain ., :, alphanumeric characters and the following symbols: @, #, $, %, &, +, ?');
    // VALIDATE STATE SIZE
    if (state != null) {
        invariant(state.length === width * height, `Puzzle width & height suggest state should be ${width * height} characters long. Found ${state.length} characters instead.`);
        // VALIDATE STATE MATCHES SOLUTION
        invariant([...state].every((value, i) => REGEX_BLACK_SQUARE.test(value) === REGEX_BLACK_SQUARE.test(solution[i])), 'Black Squares in solution and state must match');
        // VALIDATE STATE CONTENT
        invariant(REGEX_STATE.test(state), 'Puzzle state may only contain -, ., :, alphanumeric characters and the following symbols: @, #, $, %, &, +, ?');
    }
    // VALIDATE CLUE COUNT
    let requiredClueCount = [...solution].reduce((acc, value, i) => {
        if (squareNeedsAcrossClue({ solution, width }, i))
            acc += 1;
        if (squareNeedsDownClue({ solution, width }, i))
            acc += 1;
        return acc;
    }, 0);
    invariant(requiredClueCount === clues.length, `Puzzle solution expects ${requiredClueCount} clues, but found ${clues.length} clues`);
    // VALIDATE MARKUP GRID
    if (markupGrid != null) {
        invariant(markupGrid.length === solution.length, `Markup grid should match puzzle solution in length. Expected length ${solution.length}, but got ${markupGrid.length}`);
        invariant(markupGrid.every((value) => value != null &&
            Object.keys(value).every((key) => squareMarkupKeys.includes(key))), `Markup grid contains unsupported values`);
    }
    // VALIDATE REBUS
    if (rebus != null) {
        if (rebus.grid != null) {
            invariant(rebus.grid.length === solution.length, `Rebus grid should match puzzle solution in length.  Expected length ${solution.length}, but got ${rebus.grid.length}`);
            const gridKeys = new Set(rebus.grid.filter((a) => a != null));
            gridKeys.forEach((key) => {
                var _a;
                invariant(typeof ((_a = rebus.solution) === null || _a === void 0 ? void 0 : _a[key]) === 'string', `Rebus grid references key that is not found in solution: "${key}"`);
            });
        }
        if (rebus.state != null) {
            invariant(rebus.state.length === solution.length, `Rebus state should match puzzle solution in length.  Expected length ${solution.length}, but got ${rebus.state.length}`);
        }
    }
    // VALIDATE SCRAMBLING
    // TODO: Throw if puzzle file isn't valid in any way.
}

/**
 * Publicly-defined projections of Puzzle objects.
 *
 * "Projections" define useful operations on Puzzle objects.  Think of these as
 * the functional equivalents to "getter" methods from object-oriented software
 * patterns.
 */
function getFileChecksum(puzzle) {
    const { fileVersion, solution } = puzzle;
    const state = getState(puzzle);
    const encoding = guessFileEncodingFromVersion(fileVersion);
    const metaStrings = getMetaStrings(puzzle);
    const headerBuffer = encodeHeaderWithoutChecksums(puzzle);
    const boardStrings = solution + state;
    const checksum_h = checksum(headerBuffer.subarray(44 /* WIDTH_START */, 52 /* HEADER_END */));
    const checksum_f = checksum(Buffer.from(boardStrings + metaStrings, encoding), checksum_h);
    return checksum_f;
}
function getHeaderChecksum(puzzle) {
    const header = encodeHeaderWithoutChecksums(puzzle);
    return checksum(header.subarray(44 /* WIDTH_START */, 52 /* HEADER_END */));
}
function getICheatedChecksum(puzzle) {
    const encoding = guessFileEncodingFromVersion(puzzle.fileVersion);
    const header = encodeHeaderWithoutChecksums(puzzle);
    const checksum_h = checksum(header.subarray(44 /* WIDTH_START */, 52 /* HEADER_END */));
    const metaStrings = getMetaStrings(puzzle);
    const checksum_i1 = checksum_h;
    const checksum_i2 = checksum(Buffer.from(puzzle.solution, encoding));
    const checksum_i3 = checksum(Buffer.from(getState(puzzle), encoding));
    const checksum_i4 = checksum(Buffer.from(metaStrings, encoding));
    const checksum_i = Uint8Array.from([
        // low bytes
        checksum_i1 & 0x00ff,
        checksum_i2 & 0x00ff,
        checksum_i3 & 0x00ff,
        checksum_i4 & 0x00ff,
        // high bytes
        checksum_i1 >> 8,
        checksum_i2 >> 8,
        checksum_i3 >> 8,
        checksum_i4 >> 8,
    ], (byte, i) => byte ^ ICHEATED[i]);
    return checksum_i;
}
function getFileEncoding(puzzle) {
    return guessFileEncodingFromVersion(puzzle.fileVersion);
}
function gridNumbering(puzzle) {
    const { solution } = puzzle;
    let clueNumber = 0;
    return [...solution].map((square, i) => {
        if (squareNeedsAcrossClue(puzzle, i) || squareNeedsDownClue(puzzle, i)) {
            clueNumber += 1;
            return clueNumber;
        }
        return undefined;
    });
}
/**
 * Get a blank working state for a given puzzle.
 *
 * @param puzzle
 * @returns Puzzle state as a single, unbroken string.
 */
function getBlankState(puzzle) {
    return puzzle.solution.replace(/[^.:]/g, '-');
}
/**
 * Get the current working state for a given puzzle.
 *
 * @param puzzle
 * @returns Puzzle state as a single, unbroken string.  Returns the equivalent blank state if state is not supplied.
 */
function getState(puzzle) {
    var _a;
    return (_a = puzzle.state) !== null && _a !== void 0 ? _a : getBlankState(puzzle);
}
/**
 * Does the puzzle expect a rebus solution?
 *
 * @param puzzle A valid puzzle object.
 * @returns True if the puzzle expects a rebus substitation for any index.
 */
function hasRebusSolution(puzzle) {
    var _a;
    return ((_a = puzzle.rebus) === null || _a === void 0 ? void 0 : _a.solution) != null && Object.keys(puzzle.rebus.solution).length > 0;
}
/**
 * Has the user attempted to supply a rebus solution?
 *
 * @param puzzle A valid puzzle object.
 * @returns True if the user has entered a non-empty rebus substitution.
 */
function hasRebusState(puzzle) {
    var _a;
    return ((_a = puzzle.rebus) === null || _a === void 0 ? void 0 : _a.state) != null && puzzle.rebus.state.some((value) => value != null);
}
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
function isCorrect(puzzle, ignoreRebus = false) {
    var _a;
    validate(puzzle);
    invariant(!puzzle.isScrambled, 'Please unscramble the puzzle before checking correctness');
    // compare Rebus state to solution
    let rebusCorrect = false;
    if (!hasRebusSolution(puzzle) && hasRebusState(puzzle)) {
        // reject if user entered a rebus and none was required
        rebusCorrect = false;
    }
    else if (ignoreRebus || !hasRebusSolution(puzzle)) {
        // save to skip checking solution
        rebusCorrect = true;
    }
    else {
        // validate that every state entry matches expected solution
        const state = (_a = puzzle.rebus) === null || _a === void 0 ? void 0 : _a.state;
        rebusCorrect =
            state != null &&
                state.every((value, i) => {
                    const substitution = getSubstitution(puzzle, i);
                    return substitution != null && value === substitution;
                });
    }
    // compare simple state to solution
    const stateCorrect = puzzle.state === puzzle.solution;
    return rebusCorrect && stateCorrect;
}

/**
 * A cursor-based readeer that provides methods useful for reading strings and
 * bytes from PUZ file binary data.
 */
class PuzzleReader {
    constructor(buffer, encoding, initialCursor) {
        this.buffer = buffer;
        this.encoding = encoding;
        this.cursor = initialCursor !== null && initialCursor !== void 0 ? initialCursor : 0;
    }
    _getNextNullByte() {
        const nextNullByte = this.buffer.indexOf(0x00, this.cursor);
        return nextNullByte === -1 ? this.buffer.length - 1 : nextNullByte;
    }
    hasBytesToRead() {
        return this.cursor < this.buffer.length;
    }
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
    readString(length) {
        const end = this.cursor + length;
        if (length <= 0) {
            return undefined;
        }
        const decodedString = this.buffer.toString(this.encoding, this.cursor, end);
        this.cursor = end;
        return decodedString;
    }
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
    readNullTerminatedString() {
        const end = this._getNextNullByte();
        const length = end - this.cursor;
        const decodedString = this.readString(length);
        this.cursor += 1;
        return decodedString;
    }
    /**
     * Read bytes into a new buffer.
     *
     * Read "length" butes from the current cursor position.  Updates cursor to
     * the first unread byte.
     *
     * @param length
     * @returns The target bytes in a new Buffer instance.
     */
    readBytes(length) {
        const end = this.cursor + length;
        if (length <= 0) {
            return undefined;
        }
        const byteArray = this.buffer.subarray(this.cursor, end);
        this.cursor = end;
        return byteArray;
    }
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
    readNullTerminatedBytes() {
        const end = this._getNextNullByte();
        const length = end - this.cursor;
        const byteArray = this.readBytes(length);
        this.cursor += 1;
        return byteArray;
    }
}

function parseBinaryFile(data) {
    // Transform to Buffer class for easier binary manipulation.
    let buffer = Buffer.from(data);
    // VALIDATE FILETYPE
    // =================
    const signatureIndex = buffer.indexOf(FILE_SIGNATURE, 0, 'ascii');
    invariant(signatureIndex >= 2 /* FILE_SIGNATURE_START */, 'File does not appear to be an AcrossLite PUZ file');
    // If file contains data before the signature, extract it and shift our buffer view.
    const fileStartOffset = signatureIndex - 2 /* FILE_SIGNATURE_START */;
    let preamble;
    if (fileStartOffset > 0) {
        preamble = buffer.subarray(0, fileStartOffset);
        buffer = buffer.subarray(fileStartOffset);
    }
    // EXTRACT HEADER
    // ==============
    // try {
    const fileChecksum = buffer.readUInt16LE(0 /* FILE_CHECKSUM_START */);
    const headerChecksum = buffer.readUInt16LE(14 /* HEADER_CHECKSUM_START */);
    const iCheatedChecksum = buffer.subarray(16 /* ICHEATED_CHECKSUM_START */, 24 /* ICHEATED_CHECKSUM_END */);
    const fileVersion = buffer
        .toString('ascii', 24 /* VERSION_START */, 28 /* VERSION_END */)
        .replace(/\x00/g, '');
    const unknown1 = buffer.readUInt16LE(28 /* RESERVED_1C_START */);
    const scrambledChecksum = buffer.readUInt16LE(30 /* SCRAMBLED_CHECKSUM_START */);
    const unknown2 = buffer.subarray(32 /* RESERVED_20_START */, 44 /* RESERVED_20_END */);
    const width = buffer.readUInt8(44 /* WIDTH_START */);
    const height = buffer.readUInt8(45 /* HEIGHT_START */);
    const numberOfClues = buffer.readUInt16LE(46 /* NUMBER_OF_CLUES_START */);
    const unknown3 = buffer.readUInt16LE(48 /* UNKNOWN_BITMASK_START */);
    const scrambledTag = buffer.readUInt16LE(50 /* SCRAMBLED_START */);
    // } catch (e) {
    //   // throw error indicating corrupt header data
    // }
    // READ STRINGS
    // ============
    // Guess string encoding from file version.
    const encoding = guessFileEncodingFromVersion(fileVersion);
    // Use a cursor-based reader to traverse the rest of the binary data.
    const reader = new PuzzleReader(buffer, encoding, 52 /* HEADER_END */);
    // read solution and state
    const gridSize = width * height;
    const solution = reader.readString(gridSize);
    const state = reader.readString(gridSize);
    // read meta strings
    const title = reader.readNullTerminatedString();
    const author = reader.readNullTerminatedString();
    const copyright = reader.readNullTerminatedString();
    // read clues
    let clues = [];
    for (let i = 0; i < numberOfClues; i += 1) {
        const clue = reader.readNullTerminatedString();
        invariant(clue != null, `Failed to read clue from puzzle file`);
        clues.push(clue);
    }
    // read notepad
    const notepad = reader.readNullTerminatedString();
    // READ EXTENSION SECTIONS
    // =======================
    let markupGrid;
    let rebus;
    let timer;
    while (reader.hasBytesToRead()) {
        const { title, data } = parseExtensionSection(reader);
        switch (title) {
            case "GEXT" /* MARKUP_GRID */: {
                const grid = Array.from(data);
                // grid.forEach((entry, i) => {
                //   if (entry <= 0) delete grid[i];
                // });
                markupGrid = grid.map((markup) => decodeMarkup(markup));
                break;
            }
            case "GRBS" /* REBUS_GRID */: {
                // In the rebus data, null bytes are used to indicate squares with no
                // rebus.  All values are shifted up by one when encoded to avoid
                // collisions with the null empty byte.
                const grid = Array.from(data).map((entry) => entry - 1);
                // Improve clarity for library consumers by deleting "empty" null markers
                grid.forEach((entry, i) => {
                    if (entry < 0)
                        delete grid[i];
                });
                rebus = Object.assign(Object.assign({}, (rebus !== null && rebus !== void 0 ? rebus : {})), { grid });
                break;
            }
            case "RTBL" /* REBUS_SOLUTION */: {
                const solutionString = data.toString('ascii');
                const rebusSolution = parseRebusTable(solutionString);
                rebus = Object.assign(Object.assign({}, (rebus !== null && rebus !== void 0 ? rebus : {})), { solution: rebusSolution });
                break;
            }
            case "RUSR" /* REBUS_STATE */: {
                const rebusStateString = data.toString('ascii');
                // encoded rebus state is null-delimited with a trailing null byte
                let rebusState = rebusStateString.slice(0, -1).split('\x00');
                // Improve clarity for library consumers by deleting "empty" null markers
                rebusState.forEach((entry, i) => {
                    if (entry === '')
                        delete rebusState[i];
                });
                rebus = Object.assign(Object.assign({}, (rebus !== null && rebus !== void 0 ? rebus : {})), { state: rebusState });
                break;
            }
            case "LTIM" /* TIMER */: {
                const timerString = data.toString('ascii');
                invariant(REGEX_TIMER_STRING.test(timerString), "Timer data doesn't match expected format.");
                const [, secondsElapsed, isPaused] = REGEX_TIMER_STRING.exec(timerString);
                timer = {
                    secondsElapsed: Number.parseInt(secondsElapsed),
                    isPaused: isPaused === '1',
                };
                break;
            }
            default:
                console.warn('Unrecognized extension section:', title);
        }
    }
    const puzzle = {
        author,
        copyright,
        fileVersion,
        height,
        isScrambled: Boolean(scrambledTag),
        notepad,
        title,
        width,
        solution: solution,
        state: state,
        clues,
        rebus,
        markupGrid,
        timer,
        misc: {
            unknown1,
            unknown2,
            unknown3,
            preamble,
            scrambledChecksum,
        },
    };
    // VALIDATE CHECKSUMS
    // ==================
    // validate scrambled checksum
    // validate header checksum
    invariant(getHeaderChecksum(puzzle) === headerChecksum, "Header contents don't match checksum.  Please check that you are reading a valid PUZ file.");
    // validate file checksum
    invariant(getFileChecksum(puzzle) === fileChecksum, "File contents don't match checksum (1).  Please check that you are reading a valid PUZ file.");
    // validate "ICHEATED" checksum
    invariant(iCheatedChecksum.equals(getICheatedChecksum(puzzle)), "File contents don't match checksum (2).  Please check that you are reading a valid PUZ file.");
    return puzzle;
}

function printBinaryFile(puzzle) {
    var _a, _b, _c, _d, _e, _f;
    validate(puzzle);
    // Guess string encoding from file version.
    const encoding = guessFileEncodingFromVersion(puzzle.fileVersion);
    // ENCODE STRINGS
    // ==============
    // format solution and state
    const boardText = puzzle.solution + getState(puzzle);
    // format meta strings
    const metaText = `${(_a = puzzle.title) !== null && _a !== void 0 ? _a : ''}\x00${(_b = puzzle.author) !== null && _b !== void 0 ? _b : ''}\x00${(_c = puzzle.copyright) !== null && _c !== void 0 ? _c : ''}\x00`;
    // format clues
    const cluesText = puzzle.clues.join('\x00') + '\x00';
    // format notepad text
    const notepadText = `${(_d = puzzle.notepad) !== null && _d !== void 0 ? _d : ''}\x00`;
    // encode formatted strings
    const strings = Buffer.from(boardText + metaText + cluesText + notepadText, encoding);
    // ENCODE HEADER
    // =============
    const header = encodeHeaderWithoutChecksums(puzzle);
    // generate checksuns
    const checksum_f = getFileChecksum(puzzle);
    const checksum_h = getHeaderChecksum(puzzle);
    const checksum_i = getICheatedChecksum(puzzle);
    // write checksums
    header.writeUInt16LE(checksum_f, 0 /* FILE_CHECKSUM_START */);
    header.writeUInt16LE(checksum_h, 14 /* HEADER_CHECKSUM_START */);
    Buffer.from(checksum_i).copy(header, 16 /* ICHEATED_CHECKSUM_START */);
    // ENCODE EXTENSION SECTIONS
    // ========================
    let rebusGrid = EMPTY_BUFFER;
    let rebusSolution = EMPTY_BUFFER;
    let rebusState = EMPTY_BUFFER;
    if (puzzle.rebus) {
        if (puzzle.rebus.grid) {
            const data = Uint8Array.from(puzzle.rebus.grid, (value) => value == null ? 0x00 : value + 1);
            rebusGrid = encodeExtensionSection("GRBS" /* REBUS_GRID */, data);
        }
        if (puzzle.rebus.solution) {
            const data = Buffer.from(printRebusTable(puzzle.rebus.solution), 'ascii');
            rebusSolution = encodeExtensionSection("RTBL" /* REBUS_SOLUTION */, data);
        }
        if (puzzle.rebus.state) {
            const stateString = puzzle.rebus.state.map((value) => (value == null ? '' : value)).join('\x00') + '\x00';
            const data = Buffer.from(stateString, 'ascii');
            rebusState = encodeExtensionSection("RUSR" /* REBUS_STATE */, data);
        }
    }
    let timer = EMPTY_BUFFER;
    if (puzzle.timer != null) {
        const data = Buffer.from(`${puzzle.timer.secondsElapsed},${puzzle.timer.isPaused ? 1 : 0}`, 'ascii');
        timer = encodeExtensionSection("LTIM" /* TIMER */, data);
    }
    let markup = EMPTY_BUFFER;
    if (puzzle.markupGrid != null) {
        const data = Uint8Array.from(puzzle.markupGrid, (value) => encodeMarkup(value));
        markup = encodeExtensionSection("GEXT" /* MARKUP_GRID */, data);
    }
    // FORMAT FILE
    // ===========
    return Buffer.concat([
        // preserve preamble when round-tripping data
        (_f = (_e = puzzle === null || puzzle === void 0 ? void 0 : puzzle.misc) === null || _e === void 0 ? void 0 : _e.preamble) !== null && _f !== void 0 ? _f : EMPTY_BUFFER,
        // rquired puzzle definition
        header,
        strings,
        // extensions
        rebusGrid,
        rebusSolution,
        timer,
        markup,
        rebusState,
    ]);
}

/**
 * Simple range function.
 *
 * @returns a list containing integers from start (inclusive) to end (exclusive).
 */
function range(start, end) {
    const list = [];
    let i = start;
    while (i < end) {
        list.push(i);
        i += 1;
    }
    return list;
}

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
function compressKeys(rebusGrid, rebusSolution) {
    const suppliedKeys = Object.keys(rebusSolution)
        .map((key) => Number.parseInt(key))
        .sort((a, b) => a - b);
    const nextKeys = range(0, suppliedKeys.length);
    // if keys are already sequential, we're done!
    if (nextKeys.every((value, i) => value === suppliedKeys[i])) {
        return { rebusGrid, rebusSolution };
    }
    function getNextKey(suppliedKey) {
        return suppliedKey && nextKeys[suppliedKeys.indexOf(suppliedKey)];
    }
    // map old keys to new keys in grid
    // const nextGrid = new Array(rebusGrid.length)
    const nextGrid = rebusGrid.map((key) => getNextKey(key));
    // map old keys to new keys in solution
    const nextSolution = Object.fromEntries(Object.entries(rebusSolution).map(([key, substitution]) => [
        getNextKey(Number.parseInt(key)),
        substitution,
    ]));
    return { rebusGrid: nextGrid, rebusSolution: nextSolution };
}
function rebusKeyCharToNum(char) {
    let num;
    if (char === '0') {
        num = 10;
    }
    else if (/^[0-9]$/.test(char)) {
        num = Number.parseInt(char);
    }
    else if (/^[@#$%&+?]$/.test(char)) {
        num = { '@': 11, '#': 12, $: 13, '%': 14, '&': 15, '+': 16, '?': 17 }[char];
    }
    else if (/^[A-Z]$/.test(char)) {
        const offset = 10 + 7;
        num = offset + char.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    }
    else if (/^[a-z]$/.test(char)) {
        const offset = 10 + 7 + 26;
        num = offset + char.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
    }
    invariant$1(num != null, `encodeRebusKey: Encountered an invalid character "${char}"`);
    // shift numeric key by 1 to support 0 index
    return num - 1;
}
function rebusKeyNumToChar(num) {
    // shift numeric key by 1 to support 0 index
    num += 1;
    if (1 <= num && num <= 9) {
        return num.toString();
    }
    if (num === 10) {
        return '0';
    }
    if (11 <= num && num <= 17) {
        return { 11: '@', 12: '#', 13: '$', 14: '%', 15: '&', 16: '+', 17: '?' }[num];
    }
    // TODO: support encoding as characters that are not already in use in puzzle
    throw new InvariantError(`encodeRebusKey: Encountered an unsupported rebus key "${num}"`);
}

var SECTION;
(function (SECTION) {
    SECTION["TITLE"] = "TITLE";
    SECTION["AUTHOR"] = "AUTHOR";
    SECTION["COPYRIGHT"] = "COPYRIGHT";
    SECTION["SIZE"] = "SIZE";
    SECTION["GRID"] = "GRID";
    SECTION["ACROSS"] = "ACROSS";
    SECTION["DOWN"] = "DOWN";
    SECTION["NOTEPAD"] = "NOTEPAD";
    SECTION["REBUS"] = "REBUS";
})(SECTION || (SECTION = {}));
const SIGNATURE_V1 = /^\s*\<ACROSS PUZZLE\>\s*$/;
const SIGNATURE_V2 = /^\s*\<ACROSS PUZZLE V2\>\s*$/;
const SECTION_TAG = /^\s*\<(TITLE|AUTHOR|COPYRIGHT|SIZE|GRID|ACROSS|DOWN|NOTEPAD|REBUS)\>\s*$/;
const SOLUTION_CONTENT_V1 = /^[A-Z.:]+/;
const SOLUTION_CONTENT_V2 = /^[A-Za-z0-9@#$%&+?.:]+$/;
const SIZE_CONTENT = /^(\d+)x(\d+)$/;
const LINE_BREAK = /\r\n|\n/; // match Windows or Unix line endings
const LOWER_ALPHA = /[a-z]/;
const REBUS_MARK = /^MARK;$/i;
const REBUS_SUBSTITUTION = /^([A-Za-z0-9@#$%&+?]):([A-Z]+|\[\d+\]):([A-Za-z0-9@#$%&+?])$/;
function assertSingleLineSection(tagName, sectionLines) {
    invariant(sectionLines.length === 1, `<${tagName}> section expects exactly one line. Found ${sectionLines.length} lines.`);
}
function parseTextFile(file) {
    var _a;
    const lines = file.split(LINE_BREAK).filter((line) => line !== '');
    // VALIDATE THAT FILE SIGNATURE IS PRESENT
    const hasV1Signature = SIGNATURE_V1.test(lines[0]);
    const hasV2Signature = SIGNATURE_V2.test(lines[0]);
    invariant(hasV1Signature || hasV2Signature, 'File does not appear to be an Across Lite puzzle description');
    // DETERMINE VILE VERSION
    const fileVersion = hasV1Signature ? 0 /* V1 */ : 1 /* V2 */;
    // VALIDATE THAT REQUIRED FILE SECTIONS ARE PRESENT
    const requiredTags = [
        SECTION.TITLE,
        SECTION.AUTHOR,
        SECTION.COPYRIGHT,
        SECTION.SIZE,
        SECTION.GRID,
        SECTION.ACROSS,
        SECTION.DOWN,
    ];
    requiredTags.forEach((tag) => {
        const isTagPresent = lines.some((line) => new RegExp(`^\\s*\\<${tag}\\>\\s*$`).test(line));
        invariant(isTagPresent, `File is missing required tag: <${tag}>`);
    });
    const puzzle = {};
    let across;
    let down;
    // READ SECTIONS UNTIL FILE COMPLETE
    const unreadLineQueue = lines.slice(1);
    while (unreadLineQueue.length > 0) {
        // read section
        const sectionTag = unreadLineQueue.shift();
        invariant(SECTION_TAG.test(sectionTag), `Couldn't parse file.  Expected section tag, but got: "${sectionTag}"`);
        const [, sectionName] = SECTION_TAG.exec(sectionTag);
        const sectionLines = [];
        while (unreadLineQueue.length > 0 && !SECTION_TAG.test(unreadLineQueue[0])) {
            const line = unreadLineQueue.shift();
            sectionLines.push(line);
        }
        switch (sectionName) {
            case SECTION.TITLE: {
                assertSingleLineSection(sectionName, sectionLines);
                puzzle.title = sectionLines[0].trim();
                break;
            }
            case SECTION.AUTHOR: {
                assertSingleLineSection(sectionName, sectionLines);
                puzzle.author = sectionLines[0].trim();
                break;
            }
            case SECTION.COPYRIGHT: {
                assertSingleLineSection(sectionName, sectionLines);
                puzzle.copyright = sectionLines[0].trim();
                break;
            }
            case SECTION.SIZE: {
                assertSingleLineSection(sectionName, sectionLines);
                const sizeString = sectionLines[0].trim();
                invariant(SIZE_CONTENT.test(sizeString), `Puzzle size expected in the format "WIDTHxHEIGHT" (e.g. "15x15"). Received: "${sizeString}"`);
                const [, width, height] = SIZE_CONTENT.exec(sizeString);
                puzzle.width = Number.parseInt(width);
                puzzle.height = Number.parseInt(height);
                break;
            }
            case SECTION.GRID: {
                const trimmedLines = sectionLines.map((line) => line.trim());
                const permittedSolutionContent = fileVersion === 1 /* V2 */ ? SOLUTION_CONTENT_V2 : SOLUTION_CONTENT_V1;
                invariant(trimmedLines.every((line) => permittedSolutionContent.test(line)), '<GRID> section contains unsupported characters.');
                puzzle.solution = trimmedLines.join('');
                break;
            }
            case SECTION.ACROSS: {
                across = sectionLines.map((line) => line.trim());
                break;
            }
            case SECTION.DOWN: {
                down = sectionLines.map((line) => line.trim());
                break;
            }
            case SECTION.NOTEPAD: {
                // preserve white space, but standardize line breaks
                puzzle.notepad = sectionLines.join('\n');
                break;
            }
            case SECTION.REBUS: {
                invariant(fileVersion !== 0 /* V1 */, 'The <REBUS> tag is not supported in V1 text files.  Consider using the <ACROSS PUZZLE V2> file tag');
                let solution = puzzle.solution;
                invariant(solution != null, 'The <REBUS> tag is expected to come after <GRID> in puzzle descriptions');
                const rebusGrid = new Array(solution.length);
                const rebusSolution = {};
                sectionLines
                    .map((line) => line.trim())
                    .forEach((line) => {
                    // handle MARK; annotation
                    if (REBUS_MARK.test(line) && puzzle.markupGrid == null) {
                        const markupGrid = [...solution].map((character) => {
                            if (LOWER_ALPHA.test(character)) {
                                return { circled: true };
                            }
                            return {};
                        });
                        if (markupGrid.some(({ circled }) => circled)) {
                            puzzle.markupGrid = markupGrid;
                        }
                    }
                    // handle substitution annotations (in the format "1:ABC:A")
                    if (REBUS_SUBSTITUTION.test(line)) {
                        const [, charKey, substitution, fallback] = REBUS_SUBSTITUTION.exec(line);
                        const numKey = rebusKeyCharToNum(charKey);
                        // populate rebus grid
                        [...solution].forEach((square, i) => {
                            if (square === charKey) {
                                rebusGrid[i] = numKey;
                            }
                        });
                        // populate solution table
                        rebusSolution[numKey] = substitution;
                        // replace solution placeholders with fallback solution
                        solution = solution.replaceAll(charKey, fallback);
                    }
                });
                if (Object.keys(rebusSolution).length > 0) {
                    puzzle.solution = solution;
                    puzzle.rebus = {
                        grid: rebusGrid,
                        solution: rebusSolution,
                    };
                }
                break;
            }
            default: {
                throw new Error(`Unhandled section tag: ${sectionTag}`);
            }
        }
    }
    // normalize final puzzle solution to uppercase
    puzzle.solution = (_a = puzzle.solution) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    const { width, solution } = puzzle;
    if (width != null && solution != null && across != null && down != null) {
        puzzle.clues = mergeClues({ width, solution }, across, down);
    }
    validate(puzzle);
    return puzzle;
}

function printTextFile(puzzle, indentation = '\t', lineEndingStyle = 'Unix') {
    var _a;
    validate(puzzle);
    const lineEnding = lineEndingStyle === 'Windows' ? '\r\n' : '\n';
    function printLine(content) {
        return `${indentation}${content !== null && content !== void 0 ? content : ''}${lineEnding}`;
    }
    // PROCESS REBUS DATA
    const { markupGrid, rebus } = puzzle;
    const needsRebusSection = markupGrid != null || rebus != null;
    let grid = puzzle.solution;
    let rebusAnnotations = [];
    // encode circled squares into grid
    if (markupGrid != null) {
        grid = grid
            .split('')
            .map((character, i) => (markupGrid[i].circled ? character.toLowerCase() : character))
            .join('');
    }
    // preprocess rebus substitutions
    if ((rebus === null || rebus === void 0 ? void 0 : rebus.grid) != null && (rebus === null || rebus === void 0 ? void 0 : rebus.solution) != null) {
        const { rebusGrid, rebusSolution } = compressKeys(rebus.grid, rebus.solution);
        Object.entries(rebusSolution).forEach(([key, substitution]) => {
            let shortSolution;
            let indices = [];
            // map key to single character "marker" used in text format
            const numericKey = Number.parseInt(key);
            invariant(!Number.isNaN(numericKey), `Encoded rebus keys should be numeric. Found: ${key}`);
            const charKey = rebusKeyNumToChar(numericKey);
            // find associated grid indices (and short solution)
            rebusGrid.forEach((key, i) => {
                if (key === numericKey) {
                    indices.push(i);
                    if (shortSolution == null) {
                        shortSolution = grid[i];
                    }
                    invariant(shortSolution === grid[i], 'Text format cannot encode multiple short solutions for a single rebus substitution');
                }
            });
            invariant(shortSolution != null && indices.length > 0, `Rebus solutions should have at least one corresponding grid entry. Key: ${key} Grid: ${rebusGrid}`);
            // encode rebus substitution in grid
            grid = grid
                .split('')
                .map((character, i) => (indices.includes(i) ? charKey : character))
                .join('');
            // encode rebus substitution as annotation
            rebusAnnotations.push(`${charKey}:${substitution}:${shortSolution}`);
        });
    }
    let text = '';
    // PRINT SIGNATURE
    text += '<ACROSS PUZZLE V2>' + lineEnding;
    // PRINT TITLE
    text += '<TITLE>' + lineEnding;
    text += printLine(puzzle.title);
    // PRINT AUTHOR
    text += '<AUTHOR>' + lineEnding;
    text += printLine(puzzle.author);
    // PRINT COPYRIGHT
    text += '<COPYRIGHT>' + lineEnding;
    text += printLine(puzzle.copyright);
    // PRINT SIZE
    text += '<SIZE>' + lineEnding;
    text += printLine(`${puzzle.width}x${puzzle.height}`);
    // PRINT GRID
    text += '<GRID>' + lineEnding;
    // split puzzle solution into strings of puzzle.width length
    const gridRows = grid.match(new RegExp(`.{${puzzle.width}}`, 'g'));
    gridRows.forEach((row) => {
        text += printLine(row);
    });
    // PRINT REBUS (Optional)
    if (needsRebusSection) {
        text += '<REBUS>' + lineEnding;
        if ((_a = puzzle.markupGrid) === null || _a === void 0 ? void 0 : _a.some(({ circled }) => circled)) {
            text += printLine('MARK;');
        }
        rebusAnnotations.forEach((annotation) => {
            text += printLine(annotation);
        });
    }
    // PRINT CLUES
    const { across, down } = divideClues(puzzle);
    text += '<ACROSS>' + lineEnding;
    across.forEach((clue) => (text += printLine(clue)));
    text += '<DOWN>' + lineEnding;
    down.forEach((clue) => (text += printLine(clue)));
    // PRINT NOTEPAD
    if (puzzle.notepad != null) {
        text += '<NOTEPAD>' + lineEnding;
        text += puzzle.notepad + lineEnding;
    }
    return text;
}

export { getBlankState, getFileChecksum, getFileEncoding, getHeaderChecksum, getICheatedChecksum, getState, gridNumbering, hasRebusSolution, hasRebusState, isCorrect, parseBinaryFile, parseTextFile, printBinaryFile, printTextFile, validate };
