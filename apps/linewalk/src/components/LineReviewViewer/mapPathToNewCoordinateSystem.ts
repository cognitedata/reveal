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
});

export default mapPathToNewCoordinateSystem;
