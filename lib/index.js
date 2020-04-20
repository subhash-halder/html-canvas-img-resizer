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
export default (function (options) {
    var dragCornerBoxSize = options.dragCornerBoxSize || 20;
    var cropImageWatcher = options.cropImageWatcher;
    var cropMaskColor = options.cropMaskColor || 'rgba(0, 0, 0, 0.5)';
    var cropCornerColor = options.cropCornerColor || 'green';
    var cropCornerLineWidth = options.cropCornerLineWidth || 5;
    var imageDiv = document.getElementById(options.id);
    if (!imageDiv) {
        throw Error('Please provide a valid html element Id to work with');
    }
    var containerDiv = document.createElement('div');
    containerDiv.setAttribute('style', 'width:100%; height:100%; position:relative');
    imageDiv.appendChild(containerDiv);
    var imageCanvas = document.createElement('canvas');
    imageCanvas.setAttribute('style', 'max-width:100%; max-height:100%; position:absolute; top:0; left:0');
    var cropCanvas = document.createElement('canvas');
    cropCanvas.setAttribute('style', 'max-width:100%; max-height:100%; position:absolute; top:0; left:0');
    var exportCanvas = document.createElement('canvas');
    exportCanvas.setAttribute('style', 'display:none');
    // div for click tracker
    var topLeftCornerDiv = document.createElement('div');
    var topRightCornerDiv = document.createElement('div');
    var bottomRightCornerDiv = document.createElement('div');
    var bottomLeftCornerDiv = document.createElement('div');
    var selectionDiv = document.createElement('div');
    bottomLeftCornerDiv.setAttribute('style', "position: absolute; width: " + dragCornerBoxSize + "px; height: " + dragCornerBoxSize + "px; top: 0px; left: 0px; cursor: sw-resize; background: transparent; stroke: transparent;");
    bottomRightCornerDiv.setAttribute('style', "position: absolute; width: " + dragCornerBoxSize + "px; height: " + dragCornerBoxSize + "px; top: 0px; left: 0px; cursor: se-resize; background: transparent; stroke: transparent;");
    topRightCornerDiv.setAttribute('style', "position: absolute; width: " + dragCornerBoxSize + "px; height: " + dragCornerBoxSize + "px; top: 0px; left: 0px; cursor: ne-resize; background: transparent; stroke: transparent;");
    topLeftCornerDiv.setAttribute('style', "position: absolute; width: " + dragCornerBoxSize + "px; height: " + dragCornerBoxSize + "px; top: 0px; left: 0px; cursor: nw-resize; background: transparent; stroke: transparent;");
    selectionDiv.setAttribute('style', "position: absolute; width: " + dragCornerBoxSize + "px; height: " + dragCornerBoxSize + "px; top: 0px; left: 0px; cursor: all-scroll; background: transparent; stroke: transparent;");
    containerDiv.appendChild(exportCanvas);
    containerDiv.appendChild(imageCanvas);
    containerDiv.appendChild(cropCanvas);
    containerDiv.appendChild(selectionDiv);
    containerDiv.appendChild(bottomLeftCornerDiv);
    containerDiv.appendChild(bottomRightCornerDiv);
    containerDiv.appendChild(topRightCornerDiv);
    containerDiv.appendChild(topLeftCornerDiv);
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
    image.src = options.imageURL;
    image.onload = function () {
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        cropCanvas.width = imageCanvas.offsetWidth;
        cropCanvas.height = imageCanvas.offsetHeight;
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
            w: imageCanvas.offsetWidth,
            h: imageCanvas.offsetHeight,
        };
        var preResizeState = __assign({ canvasWidth: imageCanvas.offsetWidth, canvasHeight: imageCanvas.offsetHeight }, selection);
        setInterval(function () {
            var newWidth = imageCanvas.offsetWidth;
            var newHeight = imageCanvas.offsetHeight;
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
            if (dragTopLeft) {
                selection.w += selection.x - mouseX;
                selection.h += selection.y - mouseY;
                selection.x = mouseX;
                selection.y = mouseY;
            }
            else if (dragTopRight) {
                selection.w = Math.abs(selection.x - mouseX);
                selection.h += selection.y - mouseY;
                selection.y = mouseY;
            }
            else if (dragBottomLeft) {
                selection.w += selection.x - mouseX;
                selection.h = Math.abs(selection.y - mouseY);
                selection.x = mouseX;
            }
            else if (dragBottomRight) {
                selection.w = Math.abs(selection.x - mouseX);
                selection.h = Math.abs(selection.y - mouseY);
            }
            else if (dragBox) {
                selection.x += mouseX - mousePrevX;
                selection.y += mouseY - mousePrevY;
            }
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
            mousePrevX = mouseX;
            mousePrevY = mouseY;
            previousX = selection.x;
            previousY = selection.y;
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
    };
});
//# sourceMappingURL=index.js.map