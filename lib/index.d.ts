/**
 * This is the options
 */
interface Options {
    /**
     * Id of the html div where the cropper will be placed
     */
    id: string;
    /**
     * Image url or base64 image url
     * NOTE: If rendered image from other domain exporting from canvas will give error
     */
    imageURL?: string;
    /**
     * The color of the portion outside the image cropper
     * default: rgba(0, 0, 0, 0.5)
     */
    cropMaskColor?: string;
    /**
     * Color of the corner part
     * default: green
     */
    cropCornerColor?: string;
    /**
     * Line width of the corner cropper indicator
     * default 5
     */
    cropCornerLineWidth?: number;
    /**
     * Sensible sqare portion for resizing at each corner
     * default: 20
     */
    dragCornerBoxSize?: number;
    /**
     * This function is to get the image dataURL in realtime
     * this function will be called every time the resize and other update in the image is called
     * with the dataURL as a string parameter
     */
    cropImageWatcher?: (dataURL: string) => void;
}
interface ReturnType {
    /**
     * Get the image dataURL of the current status of the image
     */
    getImage: (dataType?: string) => any;
    /**
     * Dynamically change the image to be cropped
     */
    setImageURL: (imageURL: string) => void;
}
declare const _default: (options: Options) => ReturnType;
/**
 * This is the main function
 */
export default _default;
//# sourceMappingURL=index.d.ts.map