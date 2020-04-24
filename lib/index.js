var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import createContainer from './create-container';
/**
 * This is the main function
 */
export default (function (options) {
    var dragCornerBoxSize = options.dragCornerBoxSize || 20;
    var cropImageWatcher = options.cropImageWatcher;
    var cropMaskColor = options.cropMaskColor || 'rgba(0, 0, 0, 0.5)';
    var cropCornerColor = options.cropCornerColor || 'green';
    var cropCornerLineWidth = options.cropCornerLineWidth || 5;
    var _a = createContainer(options.id, dragCornerBoxSize), imageDiv = _a.imageDiv, exportCanvas = _a.exportCanvas, imageCanvas = _a.imageCanvas, cropCanvas = _a.cropCanvas, selectionDiv = _a.selectionDiv, bottomRightCornerDiv = _a.bottomRightCornerDiv, bottomLeftCornerDiv = _a.bottomLeftCornerDiv, topLeftCornerDiv = _a.topLeftCornerDiv, topRightCornerDiv = _a.topRightCornerDiv, containerDiv = _a.containerDiv;
    var imageCanvasCtx = imageCanvas.getContext('2d');
    if (!imageCanvasCtx) {
        throw Error('Not able to create canvas');
    }
    var cropCanvasCtx = cropCanvas.getContext('2d');
    if (!cropCanvasCtx) {
        throw Error('Not able to create canvas');
    }
    var exportCanvasCtx = exportCanvas.getContext('2d');
    if (!exportCanvasCtx) {
        throw Error('Not able to create canvas');
    }
    var drawExportCanvas;
    var dragTopLeft = false;
    var dragBottomLeft = false;
    var dragTopRight = false;
    var dragBottomRight = false;
    var dragBox = false;
    var image = new Image();
    var heightNotProvided = true;
    var checkResizeFunction;
    if (imageDiv.clientHeight > 0) {
        heightNotProvided = false;
    }
    if (options.imageURL)
        image.src = options.imageURL;
    // image.crossOrigin = 'anonymous';
    image.onload = function () {
        var imgDivWidth = imageDiv.clientWidth;
        if (heightNotProvided) {
            var expectedHeight = image.height * (imgDivWidth / image.width);
            if (expectedHeight > image.height) {
                expectedHeight = image.height;
            }
            containerDiv.style.height = expectedHeight + 'px';
        }
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        cropCanvas.width = imageCanvas.clientWidth;
        cropCanvas.height = imageCanvas.clientHeight;
        cropCanvas.addEventListener('mouseup', mouseUp, false);
        cropCanvas.addEventListener('mousemove', mouseMove, false);
        imageCanvasCtx.drawImage(image, 0, 0);
        bottomLeftCornerDiv.addEventListener('mousedown', function () {
            dragBottomLeft = true;
        }, false);
        bottomLeftCornerDiv.addEventListener('mouseup', mouseUp, false);
        bottomLeftCornerDiv.addEventListener('mousemove', mouseMove, false);
        topLeftCornerDiv.addEventListener('mousedown', function () {
            dragTopLeft = true;
        }, false);
        topLeftCornerDiv.addEventListener('mouseup', mouseUp, false);
        topLeftCornerDiv.addEventListener('mousemove', mouseMove, false);
        topRightCornerDiv.addEventListener('mousedown', function () {
            dragTopRight = true;
        }, false);
        topRightCornerDiv.addEventListener('mouseup', mouseUp, false);
        topRightCornerDiv.addEventListener('mousemove', mouseMove, false);
        bottomRightCornerDiv.addEventListener('mousedown', function () {
            dragBottomRight = true;
        }, false);
        bottomRightCornerDiv.addEventListener('mouseup', mouseUp, false);
        bottomRightCornerDiv.addEventListener('mousemove', mouseMove, false);
        selectionDiv.addEventListener('mousedown', function () {
            dragBox = true;
        }, false);
        selectionDiv.addEventListener('mouseup', mouseUp, false);
        selectionDiv.addEventListener('mousemove', mouseMove, false);
        var selection = {
            x: 0,
            y: 0,
            w: imageCanvas.clientWidth,
            h: imageCanvas.clientHeight,
        };
        var preResizeState = __assign({ canvasWidth: imageCanvas.clientWidth, canvasHeight: imageCanvas.clientHeight }, selection);
        // to avoide memory leak
        if (checkResizeFunction) {
            clearInterval(checkResizeFunction);
        }
        checkResizeFunction = setInterval(function () {
            var newWidth = imageCanvas.clientWidth;
            var newHeight = imageCanvas.clientHeight;
            if (preResizeState.canvasHeight != newHeight ||
                preResizeState.canvasWidth != newWidth) {
                var xScale = newWidth / preResizeState.canvasWidth;
                var yScale = newHeight / preResizeState.canvasHeight;
                preResizeState = __assign(__assign({}, selection), { canvasHeight: newHeight, canvasWidth: newWidth });
                cropCanvas.width = newWidth;
                cropCanvas.height = newHeight;
                selection.w *= xScale;
                selection.h *= yScale;
                draw();
            }
        }, 500);
        drawExportCanvas = function () {
            var scaleX = image.width / cropCanvas.width;
            var scaleY = image.height / cropCanvas.height;
            var x = selection.x * scaleX;
            var y = selection.y * scaleY;
            var width = selection.w * scaleX;
            var height = selection.h * scaleY;
            exportCanvas.width = width;
            exportCanvas.height = height;
            exportCanvasCtx.drawImage(image, x, y, width, height, 0, 0, width, height);
            cropImageWatcher && cropImageWatcher(exportCanvas.toDataURL());
        };
        function mouseUp() {
            dragTopLeft = dragTopRight = dragBottomLeft = dragBottomRight = dragBox = false;
        }
        var mousePrevX = 0;
        var mousePrevY = 0;
        var previousX = 0;
        var previousY = 0;
        function mouseMove(e) {
            if (!imageDiv) {
                throw Error('Not able to create canvas');
            }
            var mouseX = e.pageX - imageDiv.offsetLeft;
            var mouseY = e.pageY - imageDiv.offsetTop;
            var isDraw = false;
            if (dragTopLeft) {
                selection.w += selection.x - mouseX;
                selection.h += selection.y - mouseY;
                selection.x = mouseX;
                selection.y = mouseY;
                isDraw = true;
            }
            else if (dragTopRight) {
                selection.w = Math.abs(selection.x - mouseX);
                selection.h += selection.y - mouseY;
                selection.y = mouseY;
                isDraw = true;
            }
            else if (dragBottomLeft) {
                selection.w += selection.x - mouseX;
                selection.h = Math.abs(selection.y - mouseY);
                selection.x = mouseX;
                isDraw = true;
            }
            else if (dragBottomRight) {
                selection.w = Math.abs(selection.x - mouseX);
                selection.h = Math.abs(selection.y - mouseY);
                isDraw = true;
            }
            else if (dragBox) {
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
            cropCanvasCtx.clearRect(selection.x, selection.y, selection.w, selection.h);
            cropCanvasCtx.beginPath();
            cropCanvasCtx.moveTo(selection.x, selection.y + dragCornerBoxSize);
            cropCanvasCtx.lineTo(selection.x, selection.y);
            cropCanvasCtx.lineTo(selection.x + dragCornerBoxSize, selection.y);
            cropCanvasCtx.moveTo(selection.x + selection.w - dragCornerBoxSize, selection.y);
            cropCanvasCtx.lineTo(selection.x + selection.w, selection.y);
            cropCanvasCtx.lineTo(selection.x + selection.w, selection.y + dragCornerBoxSize);
            cropCanvasCtx.moveTo(selection.x + selection.w, selection.y + selection.h - dragCornerBoxSize);
            cropCanvasCtx.lineTo(selection.x + selection.w, selection.y + selection.h);
            cropCanvasCtx.lineTo(selection.x + selection.w - dragCornerBoxSize, selection.y + selection.h);
            cropCanvasCtx.moveTo(selection.x + dragCornerBoxSize, selection.y + selection.h);
            cropCanvasCtx.lineTo(selection.x, selection.y + selection.h);
            cropCanvasCtx.lineTo(selection.x, selection.y + selection.h - dragCornerBoxSize);
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
        getImage: function () {
            return exportCanvas.toDataURL();
        },
        setImageURL: function (imageURL) {
            image.src = imageURL;
        },
    };
});
//# sourceMappingURL=index.js.map