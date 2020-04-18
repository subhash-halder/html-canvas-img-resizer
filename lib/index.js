export default (function (options) {
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
    containerDiv.appendChild(imageCanvas);
    containerDiv.appendChild(cropCanvas);
    containerDiv.appendChild(exportCanvas);
    var imageCtx = imageCanvas.getContext('2d');
    if (!imageCtx) {
        throw Error('Not able to create canvas');
    }
    var cropCanvasCtx = cropCanvas.getContext('2d');
    if (!cropCanvasCtx) {
        throw Error('Not able to create canvas');
    }
    var getCropImage = function () { return ''; };
    var dragTopLeft = false;
    var dragBottomLeft = false;
    var dragTopRight = false;
    var dragBottomRight = false;
    var dragBoxSize = 20;
    var image = new Image();
    image.src = options.imageURL;
    image.onload = function () {
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        cropCanvas.width = imageCanvas.clientWidth;
        cropCanvas.height = imageCanvas.clientHeight;
        imageCtx.drawImage(image, 0, 0);
        cropCanvas.addEventListener('mousedown', mouseDown, false);
        cropCanvas.addEventListener('mouseup', mouseUp, false);
        cropCanvas.addEventListener('mousemove', mouseMove, false);
        var selection = {
            x: 0,
            y: 0,
            w: imageCanvas.clientWidth,
            h: imageCanvas.clientHeight,
        };
        getCropImage = function () {
            var scaleX = image.width / cropCanvas.width;
            var scaleY = image.height / cropCanvas.height;
            var x = selection.x * scaleX;
            var y = selection.y * scaleY;
            var width = selection.w * scaleX;
            var height = selection.h * scaleY;
            exportCanvas.width = width;
            exportCanvas.height = height;
            var expCanvasCtx = exportCanvas.getContext('2d');
            if (!expCanvasCtx) {
                throw Error('Not able to create canvas');
            }
            expCanvasCtx.drawImage(image, x, y, width, height, 0, 0, width, height);
            return exportCanvas.toDataURL('image/jpeg');
        };
        function mouseDown(e) {
            if (!imageDiv) {
                throw Error('Not able to create canvas');
            }
            var mouseX = e.pageX - imageDiv.offsetLeft;
            var mouseY = e.pageY - imageDiv.offsetTop;
            window.cropCanvas = cropCanvas;
            if (checkDragable(mouseX, selection.x) &&
                checkDragable(mouseY, selection.y)) {
                dragTopLeft = true;
            }
            else if (checkDragable(mouseX, selection.x + selection.w) &&
                checkDragable(mouseY, selection.y)) {
                dragTopRight = true;
            }
            else if (checkDragable(mouseX, selection.x) &&
                checkDragable(mouseY, selection.y + selection.h)) {
                dragBottomLeft = true;
            }
            else if (checkDragable(mouseX, selection.x + selection.w) &&
                checkDragable(mouseY, selection.y + selection.h)) {
                dragBottomRight = true;
            }
            draw();
        }
        function checkDragable(p1, p2) {
            return Math.abs(p1 - p2) < dragBoxSize;
        }
        function mouseUp() {
            dragTopLeft = dragTopRight = dragBottomLeft = dragBottomRight = false;
        }
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
            draw();
        }
        function draw() {
            if (!cropCanvasCtx) {
                throw Error('Not able to create canvas');
            }
            cropCanvasCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
            cropCanvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            cropCanvasCtx.strokeStyle = '#00ff00';
            cropCanvasCtx.lineWidth = 5;
            cropCanvasCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
            cropCanvasCtx.clearRect(selection.x, selection.y, selection.w, selection.h);
            cropCanvasCtx.beginPath();
            cropCanvasCtx.moveTo(selection.x, selection.y + dragBoxSize);
            cropCanvasCtx.lineTo(selection.x, selection.y);
            cropCanvasCtx.lineTo(selection.x + dragBoxSize, selection.y);
            cropCanvasCtx.moveTo(selection.x + selection.w - dragBoxSize, selection.y);
            cropCanvasCtx.lineTo(selection.x + selection.w, selection.y);
            cropCanvasCtx.lineTo(selection.x + selection.w, selection.y + dragBoxSize);
            cropCanvasCtx.moveTo(selection.x + selection.w, selection.y + selection.h - dragBoxSize);
            cropCanvasCtx.lineTo(selection.x + selection.w, selection.y + selection.h);
            cropCanvasCtx.lineTo(selection.x + selection.w - dragBoxSize, selection.y + selection.h);
            cropCanvasCtx.moveTo(selection.x + dragBoxSize, selection.y + selection.h);
            cropCanvasCtx.lineTo(selection.x, selection.y + selection.h);
            cropCanvasCtx.lineTo(selection.x, selection.y + selection.h - dragBoxSize);
            cropCanvasCtx.stroke();
            options.cropImageRLT && options.cropImageRLT(getCropImage());
        }
        draw();
    };
    return function () {
        return getCropImage();
    };
});
//# sourceMappingURL=index.js.map