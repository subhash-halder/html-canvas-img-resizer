interface Oprions {
    id: string;
    imageURL: string;
    cropMaskColor?: string;
    cropCornerColor?: string;
    cropCornerLineWidth?: number;
    dragCornerBoxSize?: number;
    cropImageWatcher?: (dataURL: string) => void;
}
interface ReturnType {
    getImage: (dataType?: string) => any;
    setImageURL: (imageURL: string) => void;
}
declare const _default: (options: Oprions) => ReturnType;
export default _default;
//# sourceMappingURL=index.d.ts.map