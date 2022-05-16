import { Rect } from '../../shapes';
import { Ornate } from '../../react/ornate';

export default {
  title: 'Ornate / 1. Shapes / Rect',
  component: Rect,
};

const Template = () => {
  const rectShape = new Rect({
    id: '123',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    fill: 'red',
  });

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate
        shapes={[rectShape]}
        activeTool="SELECT"
        onShapesReady={(ornate) => {
          ornate.zoomToID(rectShape.shape.id());
        }}
      />
    </div>
  );
};

export const Primary = Template.bind({});
