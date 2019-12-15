To run the test project on a local server:

```bash
npm run serve
```

Important: Node version 10 is necessary for wasm-pack to work.

# Coordinate systems #

The data served from Cognite Data Fusion is in a right-handed coordinate system with Z up,
X to the right and Y pointing into the screen.

In Three.js, which is supported by the Reveal viewer, the coordinate system is right-handed with
Y up, X to the right and Z pointing out of the screen.

## Conversion between the different coordinate systems ##

The policy in this repository is to stick with the CDF coordinate system in any code that is not
viewer-specific.
For viewer-specific code, the conversion should happen as early as possible.
