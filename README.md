# ethblockart blockstyle advanced template

optimized for DX:

- _you do not need to use react_*
- bring your own library
- live reloading
- block number + parameters persist across reloads
- controls for changing dimensions
- you have access to blocks from api so you can test any block without testing on ethblock.art
- blocks from api are optimistically loaded so you can quickly browse without waiting for api requests
- attributes update immediately (official template currently doesn't)
- light/dark theme based on system settings :)

*Blockstyles are required to be React components, but this template is designed so you can avoid dealing with React. Just keep everything contained in CustomRenderer

## getting started

- `npm i`
- `npm start`
- edit `src/CustomRenderer.js`
- check the preset blocks in `public` to see what block data is available for your style

If you want to use React for your style, you will instead edit `src/CustomStyle.js` and update `webpack.config.js`.

## building

- `npm run build`
- this will output the component bundle `main.js`

## top bar block selection

- `<`: previous block
- `>`: next block
- `>>`: latest block
- `R`: random block
- `G`: go to block...

Choose `api` to select blocks from api (see above). The rest of the options (b0-b7) are local presets stored in `public`.

You can add more local presets by getting the block json from ethblock.art (inspect network requests to see api calls), adding the file to `public`, and updating `localBlocks` in `src/index.js`. Or just directly edit the json to create special test cases.

## ethblockart caveats

- square aspect ratio is default on eba but fullscreen/embed views may not be square, this is why there are controls for testing different aspect ratio
- not sure of the behavior of `animate`