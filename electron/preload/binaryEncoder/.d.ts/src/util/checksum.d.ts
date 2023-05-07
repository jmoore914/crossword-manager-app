/**
 * Implementation of the PUZ file checksum algorithm.
 *
 * @see {@link https://github.com/ajhyndman/puz/blob/main/PUZ%20File%20Format.md#checksums}
 *
 * @param data binary data subarray to be checksummed
 * @param initialValue optional initial checksum value; can be used to combine (chain) checksums
 * @returns 16 bit
 */
export declare function checksum(data: Uint8Array, initialValue?: number): number;
//# sourceMappingURL=checksum.d.ts.map