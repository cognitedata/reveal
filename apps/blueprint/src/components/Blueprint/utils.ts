import { Timeseries } from '@cognite/sdk';
import Konva from 'konva';
import { TimeSeriesTag } from 'typings';
import { CogniteOrnate } from '@cognite/ornate';
import z from 'utils/z';

const LINE_TAG_POS_PADDING = 48;

export const makeKonvaTimeSeries = (
  timeSeriesDetails: TimeSeriesTag,
  timeSeries: Timeseries,
  ornate: CogniteOrnate,
  setTagPosition: ({ x, y }: { x: number; y: number }) => void
) => {
  const { tagPosition, pointerPosition, color } = timeSeriesDetails;
  const { stage } = ornate;
  const line = new Konva.Line({
    stroke: color,
    strokeWidth: 2,
    points: [
      tagPosition.x + LINE_TAG_POS_PADDING,
      tagPosition.y + LINE_TAG_POS_PADDING,
      pointerPosition.x,
      pointerPosition.y,
    ],
    zIndex: z.MAXIMUM,
  });

  const tag = new Konva.Shape({
    x: tagPosition.x,
    y: tagPosition.y,
    fill: 'rgba(255, 0, 0, 0)',
    scale: { x: 1 / stage.scaleX(), y: 1 / stage.scaleY() },
    width: 100,
    height: 100,
    id: `ts-${timeSeries.externalId}`,
    draggable: true,
    unselectable: true,
    sceneFunc: (context, shape) => {
      context.beginPath();
      context.rect(0, 0, 64, 64);
      context.fillStrokeShape(shape);

      // Keep the scale of the shape to 1 always, regardless of scaling
      const absoluteScale = shape.getAbsoluteScale();

      const deltaX = 1 / absoluteScale.x;
      const deltaY = 1 / absoluteScale.y;

      shape.scaleX(shape.scaleX() * deltaX);
      shape.scaleY(shape.scaleY() * deltaY);

      setTagPosition(shape.absolutePosition());
    },
  });

  // NEXT: Maybe make this size absolute 32px
  const point = new Konva.Circle({
    x: pointerPosition.x,
    y: pointerPosition.y,
    fill: color,
    width: 48,
    height: 48,
    id: `ts-${timeSeries.externalId}-point`,
    draggable: true,
    unselectable: true,
    opacity: 0.6,
    zIndex: z.MAXIMUM,
  });
  point.on('dragmove', (e) => {
    const prevPoints = line.points();
    line.points([prevPoints[0], prevPoints[1], e.target.x(), e.target.y()]);
  });

  tag.on('dragmove', (e) => {
    const prevPoints = line.points();
    const absoluteScale = tag.getAbsoluteScale();

    const deltaX = 1 / absoluteScale.x;
    const deltaY = 1 / absoluteScale.y;

    line.scaleX(line.scaleX() * deltaX);
    line.scaleY(line.scaleY() * deltaY);
    line.points([
      e.target.x() + LINE_TAG_POS_PADDING,
      e.target.y() + LINE_TAG_POS_PADDING,
      prevPoints[2],
      prevPoints[3],
    ]);
  });

  return { tag, line, point };
};
