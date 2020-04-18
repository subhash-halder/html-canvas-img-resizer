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
        var rect = {
            x: 0,
            y: 0,
            w: imageCanvas.clientWidth,
            h: imageCanvas.clientHeight,
        };
        getCropImage = function () {
            var scaleX = image.width / cropCanvas.width;
            var scaleY = image.height / cropCanvas.height;
            var x = rect.x * scaleX;
            var y = rect.y * scaleY;
            var width = rect.w * scaleX;
            var height = rect.h * scaleY;
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
            var mouseX = e.pageX - cropCanvas.offsetLeft;
            var mouseY = e.pageY - cropCanvas.offsetTop;
            if (checkDragable(mouseX, rect.x) && checkDragable(mouseY, rect.y)) {
                dragTopLeft = true;
            }
            else if (checkDragable(mouseX, rect.x + rect.w) &&
                checkDragable(mouseY, rect.y)) {
                dragTopRight = true;
            }
            else if (checkDragable(mouseX, rect.x) &&
                checkDragable(mouseY, rect.y + rect.h)) {
                dragBottomLeft = true;
            }
            else if (checkDragable(mouseX, rect.x + rect.w) &&
                checkDragable(mouseY, rect.y + rect.h)) {
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
            var mouseX = e.pageX - cropCanvas.offsetLeft;
            var mouseY = e.pageY - cropCanvas.offsetTop;
            if (dragTopLeft) {
                rect.w += rect.x - mouseX;
                rect.h += rect.y - mouseY;
                rect.x = mouseX;
                rect.y = mouseY;
            }
            else if (dragTopRight) {
                rect.w = Math.abs(rect.x - mouseX);
                rect.h += rect.y - mouseY;
                rect.y = mouseY;
            }
            else if (dragBottomLeft) {
                rect.w += rect.x - mouseX;
                rect.h = Math.abs(rect.y - mouseY);
                rect.x = mouseX;
            }
            else if (dragBottomRight) {
                rect.w = Math.abs(rect.x - mouseX);
                rect.h = Math.abs(rect.y - mouseY);
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
            cropCanvasCtx.clearRect(rect.x, rect.y, rect.w, rect.h);
            cropCanvasCtx.beginPath();
            cropCanvasCtx.moveTo(rect.x, rect.y + dragBoxSize);
            cropCanvasCtx.lineTo(rect.x, rect.y);
            cropCanvasCtx.lineTo(rect.x + dragBoxSize, rect.y);
            cropCanvasCtx.moveTo(rect.x + rect.w - dragBoxSize, rect.y);
            cropCanvasCtx.lineTo(rect.x + rect.w, rect.y);
            cropCanvasCtx.lineTo(rect.x + rect.w, rect.y + dragBoxSize);
            cropCanvasCtx.moveTo(rect.x + rect.w, rect.y + rect.h - dragBoxSize);
            cropCanvasCtx.lineTo(rect.x + rect.w, rect.y + rect.h);
            cropCanvasCtx.lineTo(rect.x + rect.w - dragBoxSize, rect.y + rect.h);
            cropCanvasCtx.moveTo(rect.x + dragBoxSize, rect.y + rect.h);
            cropCanvasCtx.lineTo(rect.x, rect.y + rect.h);
            cropCanvasCtx.lineTo(rect.x, rect.y + rect.h - dragBoxSize);
            cropCanvasCtx.stroke();
        }
        draw();
    };
    return function () {
        return getCropImage();
    };
});
//# sourceMappingURL=index.js.map