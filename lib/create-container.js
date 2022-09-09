export default (function (containerId, dragCornerBoxSize) {
    var imageDiv = document.getElementById(containerId);
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
    bottomLeftCornerDiv.setAttribute('style', "position: absolute; width: ".concat(dragCornerBoxSize, "px; height: ").concat(dragCornerBoxSize, "px; top: 0px; left: 0px; cursor: sw-resize; background: transparent; stroke: transparent;"));
    bottomRightCornerDiv.setAttribute('style', "position: absolute; width: ".concat(dragCornerBoxSize, "px; height: ").concat(dragCornerBoxSize, "px; top: 0px; left: 0px; cursor: se-resize; background: transparent; stroke: transparent;"));
    topRightCornerDiv.setAttribute('style', "position: absolute; width: ".concat(dragCornerBoxSize, "px; height: ").concat(dragCornerBoxSize, "px; top: 0px; left: 0px; cursor: ne-resize; background: transparent; stroke: transparent;"));
    topLeftCornerDiv.setAttribute('style', "position: absolute; width: ".concat(dragCornerBoxSize, "px; height: ").concat(dragCornerBoxSize, "px; top: 0px; left: 0px; cursor: nw-resize; background: transparent; stroke: transparent;"));
    selectionDiv.setAttribute('style', "position: absolute; width: ".concat(dragCornerBoxSize, "px; height: ").concat(dragCornerBoxSize, "px; top: 0px; left: 0px; cursor: all-scroll; background: transparent; stroke: transparent;"));
    containerDiv.appendChild(exportCanvas);
    containerDiv.appendChild(imageCanvas);
    containerDiv.appendChild(cropCanvas);
    containerDiv.appendChild(selectionDiv);
    containerDiv.appendChild(bottomLeftCornerDiv);
    containerDiv.appendChild(bottomRightCornerDiv);
    containerDiv.appendChild(topRightCornerDiv);
    containerDiv.appendChild(topLeftCornerDiv);
    return {
        exportCanvas: exportCanvas,
        imageCanvas: imageCanvas,
        cropCanvas: cropCanvas,
        selectionDiv: selectionDiv,
        bottomRightCornerDiv: bottomRightCornerDiv,
        bottomLeftCornerDiv: bottomLeftCornerDiv,
        topLeftCornerDiv: topLeftCornerDiv,
        topRightCornerDiv: topRightCornerDiv,
        imageDiv: imageDiv,
        containerDiv: containerDiv,
    };
});
//# sourceMappingURL=create-container.js.map