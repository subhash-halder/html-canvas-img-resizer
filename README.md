# html-canvas-img-resizer
Image resizer for browser with HTML5 canvas, it uses no external library only uses the HTML5 Canvas to crop the image and output base64 image data

NOTE: the width and height of the canvas is determined by the id of the div provided
if the height of the div not provided the height will be calculated accordingly with respect to aspect ratio

## TODO
- [ ] Restructure the code for better readability
- [ ] Add support for fixed width cropping

## directly use in html
```
https://cdn.jsdelivr.net/npm/html-canvas-img-resizer@1.0.8/browser/html-canvas-img-resizer.min.js
```
## use npm or yarn
```
npm i html-canvas-img-resizer
or
yarn add html-canvas-img-resizer
```

## Example

[Click for example](https://amsubhash.github.io/html-canvas-img-resizer)

## Documentation

[Documentation](https://amsubhash.github.io/html-canvas-img-resizer/docs)

## How to use in browser

```
  const imageResizer = htmlCanvasImgResizer.default(options);
```

### options

[options](https://amsubhash.github.io/html-canvas-img-resizer/docs/interfaces/_index_.options.html)

### return

[return](https://amsubhash.github.io/html-canvas-img-resizer/docs/interfaces/_index_.returntype.html)
