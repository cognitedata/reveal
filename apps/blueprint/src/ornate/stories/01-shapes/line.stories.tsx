import { Line } from '../../shapes';
import { Ornate } from '../../react/ornate';

export default {
  title: 'Ornate / 1. Shapes / Line',
  component: Line,
};

const Template = () => {
  const lineShape = new Line({
    id: '123',
    points: [0, 0, 100, 100],
    strokeWidth: 5,
    stroke: 'red',
  });

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate
        shapes={[lineShape]}
        activeTool="SELECT"
        onShapesReady={(ornate) => {
          ornate.zoomToID(lineShape.shape.id());
        }}
      />
    </div>
  );
};

export const Primary = Template.bind({});
