# html-canvas-img-resizer
Image resizer for browser with HTML5 canvas, it uses no external library only uses the HTML5 Canvas to crop the image and output base64 image data

## directly use in html
```
https://cdn.jsdelivr.net/npm/html-canvas-img-resizer@1.0.2/browser/html-canvas-img-resizer.min.js
```
## use npm or yarn
```
npm i html-canvas-img-resizer
or
yarn add html-canvas-img-resizer
```

## Example
```
https://subhashhalder.com/html-canvas-img-resizer
```

## How to use in browser

```
  const imageResizer = htmlCanvasImgResizer.default(options);
```

### options

```
  id: string                                  // Id of the div in which the cropping canvas will be render
  imageUrl: string                            // image url or base64 image url
  cropMaskColor: string                       // the color of the portion outside the image cropper
  cropCornerColor: string                     // corner color of the image cropper
  cropCornerLineWidth: number                 
  dragCornerBoxSize: number                   // corner dragable sensitive area
  cropImageWatcher: (dataUrl: string) => void // this will result realtime image dataURL whenever cropped
```

### return
```
  getImage: () => dataURL              // get the image dataURL of the cropped part
  setImage: (imageURL: string) => void // set new image dynamically
```



