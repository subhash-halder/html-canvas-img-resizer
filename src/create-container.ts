export default (containerId: string, dragCornerBoxSize: number) => {
  const imageDiv = document.getElementById(containerId);
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

  return {
    exportCanvas,
    imageCanvas,
    cropCanvas,
    selectionDiv,
    bottomRightCornerDiv,
    bottomLeftCornerDiv,
    topLeftCornerDiv,
    topRightCornerDiv,
    imageDiv,
  };
};
