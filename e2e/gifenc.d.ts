declare module 'gifenc' {
  const gifenc: {
    quantize(rgba: Uint8Array, maxColors: number): number[][];
    applyPalette(rgba: Uint8Array, palette: number[][]): Uint8Array;
    GIFEncoder(): {
      writeFrame(
        index: Uint8Array,
        width: number,
        height: number,
        options: { palette: number[][]; delay: number },
      ): void;
      finish(): void;
      bytes(): Uint8Array;
    };
  };
  export default gifenc;
}
