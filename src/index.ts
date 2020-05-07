import createContainer from './create-container';

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

type ImageDataType = string | Blob | null;

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
}

interface ReturnType {
  /**
   * the callback function (cb) will get the image dataURL/blob of the current status of the image according to the argument provided
   */
  getImage: (
    cb: (imageData: ImageDataType, imageMeta: ImageMeta) => unknown,
    imgArgs?: GetImageArgument
  ) => unknown;
  /**
   * Dynamically change the image to be cropped
   */
  setImageURL: (imageURL: string) => void;
}

/**
 * This is the main function
 */
export default (options: Options): ReturnType => {
  const dragCornerBoxSize = options.dragCornerBoxSize || 20;
  const cropImageWatcher = options.cropImageWatcher;
  const cropMaskColor = options.cropMaskColor || 'rgba(0, 0, 0, 0.5)';
  const cropCornerColor = options.cropCornerColor || 'green';
  const cropCornerLineWidth = options.cropCornerLineWidth || 5;

  const {
    imageDiv,
    exportCanvas,
    imageCanvas,
    cropCanvas,
    selectionDiv,
    bottomRightCornerDiv,
    bottomLeftCornerDiv,
    topLeftCornerDiv,
    topRightCornerDiv,
    containerDiv,
  } = createContainer(options.id, dragCornerBoxSize);

  const imageCanvasCtx = imageCanvas.getContext('2d');
  if (!imageCanvasCtx) {
    throw Error('Not able to create canvas');
  }
  const cropCanvasCtx = cropCanvas.getContext('2d');
  if (!cropCanvasCtx) {
    throw Error('Not able to create canvas');
  }
  const exportCanvasCtx = exportCanvas.getContext('2d');
  if (!exportCanvasCtx) {
    throw Error('Not able to create canvas');
  }
  let drawExportCanvas: () => void;
  let dragTopLeft = false;
  let dragBottomLeft = false;
  let dragTopRight = false;
  let dragBottomRight = false;
  let dragBox = false;
  const image = new Image();
  let checkResizeFunction: NodeJS.Timeout;
  if (options.imageURL) image.src = options.imageURL;
  // image.crossOrigin = 'anonymous';

  const getImageData = async (
    cb: (data: ImageDataType, imageMeta: ImageMeta) => unknown,
    args: GetImageArgument = {
      dataType: 'dataURL',
      imageType: 'image/jpeg',
      imageQuality: 1,
    }
  ) => {
    const imageMeta: ImageMeta = {
      width: exportCanvas.width,
      height: exportCanvas.height,
      mime: args.imageType,
    };
    if (args.dataType === 'blob') {
      return exportCanvas.toBlob(
        data => {
          cb(data, imageMeta);
        },
        args.imageType,
        args.imageQuality
      );
    } else {
      cb(exportCanvas.toDataURL(args.imageType, args.imageQuality), imageMeta);
    }
  };

  image.onload = () => {
    const imgDivWidth = imageDiv.clientWidth;
    let expectedHeight = image.height * (imgDivWidth / image.width);
    if (expectedHeight > image.height) {
      expectedHeight = image.height;
    }
    containerDiv.style.height = expectedHeight + 'px';
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;
    cropCanvas.width = imageCanvas.clientWidth;
    cropCanvas.height = imageCanvas.clientHeight;
    cropCanvas.addEventListener('mouseup', mouseUp, false);
    cropCanvas.addEventListener('mousemove', mouseMove, false);
    imageCanvasCtx.drawImage(image, 0, 0);
    bottomLeftCornerDiv.addEventListener(
      'mousedown',
      () => {
        dragBottomLeft = true;
      },
      false
    );
    bottomLeftCornerDiv.addEventListener('mouseup', mouseUp, false);
    bottomLeftCornerDiv.addEventListener('mousemove', mouseMove, false);
    topLeftCornerDiv.addEventListener(
      'mousedown',
      () => {
        dragTopLeft = true;
      },
      false
    );
    topLeftCornerDiv.addEventListener('mouseup', mouseUp, false);
    topLeftCornerDiv.addEventListener('mousemove', mouseMove, false);
    topRightCornerDiv.addEventListener(
      'mousedown',
      () => {
        dragTopRight = true;
      },
      false
    );
    topRightCornerDiv.addEventListener('mouseup', mouseUp, false);
    topRightCornerDiv.addEventListener('mousemove', mouseMove, false);
    bottomRightCornerDiv.addEventListener(
      'mousedown',
      () => {
        dragBottomRight = true;
      },
      false
    );
    bottomRightCornerDiv.addEventListener('mouseup', mouseUp, false);
    bottomRightCornerDiv.addEventListener('mousemove', mouseMove, false);
    selectionDiv.addEventListener(
      'mousedown',
      () => {
        dragBox = true;
      },
      false
    );
    selectionDiv.addEventListener('mouseup', mouseUp, false);
    selectionDiv.addEventListener('mousemove', mouseMove, false);

    const selection = {
      x: 0,
      y: 0,
      w: imageCanvas.clientWidth,
      h: imageCanvas.clientHeight,
    };

    let preResizeState = {
      canvasWidth: imageCanvas.clientWidth,
      canvasHeight: imageCanvas.clientHeight,
      ...selection,
    };

    // to avoide memory leak
    if (checkResizeFunction) {
      clearInterval(checkResizeFunction);
    }

    checkResizeFunction = setInterval(() => {
      const newWidth = imageCanvas.offsetWidth;
      const newHeight = imageCanvas.offsetHeight;
      if (
        preResizeState.canvasHeight != newHeight ||
        preResizeState.canvasWidth != newWidth
      ) {
        const xScale = newWidth / preResizeState.canvasWidth;
        const yScale = newHeight / preResizeState.canvasHeight;

        preResizeState = {
          ...selection,
          canvasHeight: newHeight,
          canvasWidth: newWidth,
        };
        cropCanvas.width = newWidth;
        cropCanvas.height = newHeight;
        selection.w *= xScale;
        selection.h *= yScale;
        draw();
      }
    }, 500);

    drawExportCanvas = async () => {
      const scaleX = image.width / cropCanvas.width;
      const scaleY = image.height / cropCanvas.height;
      const x = selection.x * scaleX;
      const y = selection.y * scaleY;
      const width = selection.w * scaleX;
      const height = selection.h * scaleY;
      exportCanvas.width = width;
      exportCanvas.height = height;
      exportCanvasCtx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );
      if (cropImageWatcher && cropImageWatcher.cb) {
        getImageData(cropImageWatcher.cb, cropImageWatcher.imgArg);
      }
    };

    function mouseUp() {
      dragTopLeft = dragTopRight = dragBottomLeft = dragBottomRight = dragBox = false;
    }

    let mousePrevX = 0;
    let mousePrevY = 0;
    let previousX = 0;
    let previousY = 0;

    function mouseMove(e: MouseEvent) {
      if (!imageDiv) {
        throw Error('Not able to create canvas');
      }
      let canvasRect = cropCanvas.getBoundingClientRect();
      let mouseX = e.clientX - canvasRect.x;
      let mouseY = e.clientY - canvasRect.y;
      let isDraw = false;
      if (dragTopLeft) {
        selection.w += selection.x - mouseX;
        selection.h += selection.y - mouseY;
        selection.x = mouseX;
        selection.y = mouseY;
        isDraw = true;
      } else if (dragTopRight) {
        selection.w = Math.abs(selection.x - mouseX);
        selection.h += selection.y - mouseY;
        selection.y = mouseY;
        isDraw = true;
      } else if (dragBottomLeft) {
        selection.w += selection.x - mouseX;
        selection.h = Math.abs(selection.y - mouseY);
        selection.x = mouseX;
        isDraw = true;
      } else if (dragBottomRight) {
        selection.w = Math.abs(selection.x - mouseX);
        selection.h = Math.abs(selection.y - mouseY);
        isDraw = true;
      } else if (dragBox) {
        selection.x += mouseX - mousePrevX;
        selection.y += mouseY - mousePrevY;
        isDraw = true;
      }
      if (isDraw) {
        if (selection.w < 2 * dragCornerBoxSize) {
          selection.w = 2 * dragCornerBoxSize;
          selection.x = previousX;
        }
        if (selection.h < 2 * dragCornerBoxSize) {
          selection.h = 2 * dragCornerBoxSize;
          selection.y = previousY;
        }
        if (selection.x < 0) {
          selection.x = 0;
        }
        if (selection.x + selection.w > cropCanvas.width) {
          selection.x = cropCanvas.width - selection.w;
        }
        if (selection.y < 0) {
          selection.y = 0;
        }
        if (selection.y + selection.h > cropCanvas.height) {
          selection.y = cropCanvas.height - selection.h;
        }
        draw();
      }
      mousePrevX = mouseX;
      mousePrevY = mouseY;
      previousX = selection.x;
      previousY = selection.y;
    }

    function draw() {
      if (!cropCanvasCtx) {
        throw Error('Not able to create canvas');
      }
      cropCanvasCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
      cropCanvasCtx.fillStyle = cropMaskColor;
      cropCanvasCtx.strokeStyle = cropCornerColor;
      cropCanvasCtx.lineWidth = cropCornerLineWidth;
      cropCanvasCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
      cropCanvasCtx.clearRect(
        selection.x,
        selection.y,
        selection.w,
        selection.h
      );
      cropCanvasCtx.beginPath();
      cropCanvasCtx.moveTo(selection.x, selection.y + dragCornerBoxSize);
      cropCanvasCtx.lineTo(selection.x, selection.y);
      cropCanvasCtx.lineTo(selection.x + dragCornerBoxSize, selection.y);
      cropCanvasCtx.moveTo(
        selection.x + selection.w - dragCornerBoxSize,
        selection.y
      );
      cropCanvasCtx.lineTo(selection.x + selection.w, selection.y);
      cropCanvasCtx.lineTo(
        selection.x + selection.w,
        selection.y + dragCornerBoxSize
      );
      cropCanvasCtx.moveTo(
        selection.x + selection.w,
        selection.y + selection.h - dragCornerBoxSize
      );
      cropCanvasCtx.lineTo(
        selection.x + selection.w,
        selection.y + selection.h
      );
      cropCanvasCtx.lineTo(
        selection.x + selection.w - dragCornerBoxSize,
        selection.y + selection.h
      );
      cropCanvasCtx.moveTo(
        selection.x + dragCornerBoxSize,
        selection.y + selection.h
      );
      cropCanvasCtx.lineTo(selection.x, selection.y + selection.h);
      cropCanvasCtx.lineTo(
        selection.x,
        selection.y + selection.h - dragCornerBoxSize
      );
      cropCanvasCtx.stroke();
      topLeftCornerDiv.style.top = topRightCornerDiv.style.top =
        selection.y + 'px';
      topLeftCornerDiv.style.left = bottomLeftCornerDiv.style.left =
        selection.x + 'px';
      topRightCornerDiv.style.left = bottomRightCornerDiv.style.left =
        selection.x + selection.w - dragCornerBoxSize + 'px';
      bottomLeftCornerDiv.style.top = bottomRightCornerDiv.style.top =
        selection.y + selection.h - dragCornerBoxSize + 'px';
      selectionDiv.style.top = selection.y + 'px';
      selectionDiv.style.left = selection.x + 'px';
      selectionDiv.style.width = selection.w + 'px';
      selectionDiv.style.height = selection.h + 'px';
      drawExportCanvas();
    }

    draw();
  };

  return {
    getImage: async (
      cb: (imageData: ImageDataType, imageMeta: ImageMeta) => unknown,
      imgArgs?: GetImageArgument
    ) => {
      getImageData(cb, imgArgs);
    },
    setImageURL: (imageURL: string) => {
      image.src = imageURL;
    },
  };
};
