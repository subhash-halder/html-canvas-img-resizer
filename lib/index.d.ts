/**
 * Argument for getting the image for specific need
 */
interface GetImageArgument {
    /**
     * type of image data to return dataURL or blob default if blob
     */
    dataType: 'dataURL' | 'blob';
    /**
     * return image type jpeg or png format
     */
    imageType?: 'image/jpeg' | 'image/png';
    /**
     * The image quality of the returned image range from 0-1
     */
    imageQuality?: number;
}
interface ImageMeta {
    width: number;
    height: number;
    mime?: string;
}
declare type ImageDataType = string | Blob | null;
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
     * The callback (cb) function is to get the image dataURL/blob according to the image type specified in option in realtime
     * this function will be called every time the resize and other update in the image is called
     * with the dataURL/blob as a string parameter
     */
    cropImageWatcher?: {
        imgArg?: GetImageArgument;
        cb?: (imageData: ImageDataType, imageMeta: ImageMeta) => unknown;
    };
    /**
     * default is  1000 if greater than zero this will check for resize of the container after every given duration (millisecond) set by this attribute
     * set 0 to deactivate
     * NOTE: if this is set call function stopContainerResizeCheck() from return object otherwise there may be a memory leak
     */
    checkForContainerResizeMS?: number;
}
interface ReturnType {
    /**
     * the callback function (cb) will get the image dataURL/blob of the current status of the image according to the argument provided
     */
    getImage: (cb: (imageData: ImageDataType, imageMeta: ImageMeta) => unknown, imgArgs?: GetImageArgument) => unknown;
    /**
     * Dynamically change the image to be cropped
     */
    setImageURL: (imageURL: string) => void;
    /**
     * If checkForContainerResizeMS is set to a value and this resizer need to be destroyed call this function to avoid memory leak
     */
    stopResizeCheck: () => void;
}
declare const _default: (options: Options) => ReturnType;
/**
 * This is the main function
 */
export default _default;
//# sourceMappingURL=index.d.ts.map