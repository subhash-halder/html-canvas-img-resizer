interface Oprions {
    id: string;
    imageURL: string;
    cropImageRLT: (imageURL: string) => void;
    cropMaskColor?: string;
    cropCornerColor?: string;
    cropCornerLineWidth?: number;
    dragCornerBoxSize?: number;
}
declare const _default: (options: Oprions) => CanvasRenderingContext2D;
export default _default;
//# sourceMappingURL=index.d.ts.map