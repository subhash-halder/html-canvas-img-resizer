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
}

export default (options: Oprions): ReturnType => {
  const dragCornerBoxSize = options.dragCornerBoxSize || 20;
  const cropImageWatcher = options.cropImageWatcher;
  const cropMaskColor = options.cropMaskColor || 'rgba(0, 0, 0, 0.5)';
  const cropCornerColor = options.cropCornerColor || 'green';
  const cropCornerLineWidth = options.cropCornerLineWidth || 5;

  const imageDiv = document.getElementById(options.id);
  if (!imageDiv) {
    throw Error('Please provide a valid html element Id to work with');
  }
  const containerDiv = document.createElement('div');
  containerDiv.setAttribute(
    'style',
    'width:100%; height:100%; position:relative'
  );
  imageDiv.appendChild(containerDiv);
  const imageCanvas = document.createElement('canvas');
  imageCanvas.setAttribute(
    'style',
    'max-width:100%; max-height:100%; position:absolute; top:0; left:0'
  );
  const cropCanvas = document.createElement('canvas');
  cropCanvas.setAttribute(
    'style',
    'max-width:100%; max-height:100%; position:absolute; top:0; left:0'
  );
  const exportCanvas = document.createElement('canvas');
  exportCanvas.setAttribute('style', 'display:none');

  // div for click tracker
  const topLeftCornerDiv = document.createElement('div');
  const topRightCornerDiv = document.createElement('div');
  const bottomRightCornerDiv = document.createElement('div');
  const bottomLeftCornerDiv = document.createElement('div');
  const selectionDiv = document.createElement('div');
  bottomLeftCornerDiv.setAttribute(
    'style',
    `position: absolute; width: ${dragCornerBoxSize}px; height: ${dragCornerBoxSize}px; top: 0px; left: 0px; cursor: sw-resize; background: transparent; stroke: transparent;`
  );
  bottomRightCornerDiv.setAttribute(
    'style',
    `position: absolute; width: ${dragCornerBoxSize}px; height: ${dragCornerBoxSize}px; top: 0px; left: 0px; cursor: se-resize; background: transparent; stroke: transparent;`
  );
  topRightCornerDiv.setAttribute(
    'style',
    `position: absolute; width: ${dragCornerBoxSize}px; height: ${dragCornerBoxSize}px; top: 0px; left: 0px; cursor: ne-resize; background: transparent; stroke: transparent;`
  );
  topLeftCornerDiv.setAttribute(
    'style',
    `position: absolute; width: ${dragCornerBoxSize}px; height: ${dragCornerBoxSize}px; top: 0px; left: 0px; cursor: nw-resize; background: transparent; stroke: transparent;`
  );
  selectionDiv.setAttribute(
    'style',
    `position: absolute; width: ${dragCornerBoxSize}px; height: ${dragCornerBoxSize}px; top: 0px; left: 0px; cursor: all-scroll; background: transparent; stroke: transparent;`
  );

  containerDiv.appendChild(exportCanvas);
  containerDiv.appendChild(imageCanvas);
  containerDiv.appendChild(cropCanvas);
  containerDiv.appendChild(selectionDiv);
  containerDiv.appendChild(bottomLeftCornerDiv);
  containerDiv.appendChild(bottomRightCornerDiv);
  containerDiv.appendChild(topRightCornerDiv);
  containerDiv.appendChild(topLeftCornerDiv);
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
  image.src = options.imageURL;
  image.onload = () => {
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;
    cropCanvas.width = imageCanvas.offsetWidth;
    cropCanvas.height = imageCanvas.offsetHeight;
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
      w: imageCanvas.offsetWidth,
      h: imageCanvas.offsetHeight,
    };

    let preResizeState = {
      canvasWidth: imageCanvas.offsetWidth,
      canvasHeight: imageCanvas.offsetHeight,
      ...selection,
    };

    setInterval(() => {
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

    drawExportCanvas = () => {
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
      cropImageWatcher && cropImageWatcher(exportCanvas.toDataURL());
    };

    function mouseUp() {
      dragTopLeft = dragTopRight = dragBottomLeft = dragBottomRight = dragBox = false;
    }

    let mousePrevX = 0;
    let mousePrevY = 0;

    function mouseMove(e: MouseEvent) {
      if (!imageDiv) {
        throw Error('Not able to create canvas');
      }
      let mouseX = e.pageX - imageDiv.offsetLeft;
      let mouseY = e.pageY - imageDiv.offsetTop;
      if (dragTopLeft) {
        selection.w += selection.x - mouseX;
        selection.h += selection.y - mouseY;
        selection.x = mouseX;
        selection.y = mouseY;
      } else if (dragTopRight) {
        selection.w = Math.abs(selection.x - mouseX);
        selection.h += selection.y - mouseY;
        selection.y = mouseY;
      } else if (dragBottomLeft) {
        selection.w += selection.x - mouseX;
        selection.h = Math.abs(selection.y - mouseY);
        selection.x = mouseX;
      } else if (dragBottomRight) {
        selection.w = Math.abs(selection.x - mouseX);
        selection.h = Math.abs(selection.y - mouseY);
      } else if (dragBox) {
        selection.x += mouseX - mousePrevX;
        selection.y += mouseY - mousePrevY;
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
      mousePrevX = mouseX;
      mousePrevY = mouseY;
      draw();
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
    getImage: () => {
      return exportCanvas.toDataURL();
    },
  };
};
