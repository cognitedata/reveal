const mapPathToNewCoordinateSystem = (
  sourceViewBox: { x: number; y: number; width: number; height: number },
  sourceBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  targetCanvas: { width: number; height: number }
) => ({
  x:
    ((sourceBoundingBox.x - sourceViewBox.x) / sourceViewBox.width) *
    targetCanvas.width,
  y:
    ((sourceBoundingBox.y - sourceViewBox.y) / sourceViewBox.height) *
    targetCanvas.height,
  scale: {
    x: (sourceBoundingBox.width / sourceViewBox.width) * targetCanvas.width,
    y: (sourceBoundingBox.height / sourceViewBox.height) * targetCanvas.height,
  },
  width: 1,
  height: 1,

  // width: (sourceBoundingBox.width / sourceViewBox.width) * targetCanvas.width,
  // height: (sourceBoundingBox.height / sourceViewBox.height) * targetCanvas.height,
  // scale: {
  //   x: 1,
  //   y: 1,
  // },
});

export default mapPathToNewCoordinateSystem;
