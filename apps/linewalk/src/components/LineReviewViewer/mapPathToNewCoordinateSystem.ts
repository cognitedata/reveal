import svgpath from 'svgpath';

const mapPathToNewCoordinateSystem = (
  sourceViewBox: { x: number; y: number; width: number; height: number },
  sourceBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  targetCanvas: { width: number; height: number },
  data?: string
) => ({
  x:
    ((sourceBoundingBox.x - sourceViewBox.x) / sourceViewBox.width) *
    targetCanvas.width,
  y:
    ((sourceBoundingBox.y - sourceViewBox.y) / sourceViewBox.height) *
    targetCanvas.height,
  data: data
    ? svgpath(data)
        .scale(
          (sourceBoundingBox.width / sourceViewBox.width) * targetCanvas.width,
          (sourceBoundingBox.height / sourceViewBox.height) *
            targetCanvas.height
        )
        .toString()
    : undefined,
  width: (sourceBoundingBox.width / sourceViewBox.width) * targetCanvas.width,
  height:
    (sourceBoundingBox.height / sourceViewBox.height) * targetCanvas.height,
});

export default mapPathToNewCoordinateSystem;
