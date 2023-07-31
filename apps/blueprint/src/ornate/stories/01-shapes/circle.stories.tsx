import { Circle } from '../../shapes';
import { Ornate } from '../../react/ornate';

export default {
  title: 'Ornate / 1. Shapes / Circle',
  component: Circle,
};

const Template = () => {
  const circleShape = new Circle({
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
        shapes={[circleShape]}
        activeTool="SELECT"
        onShapesReady={(ornate) => {
          ornate.zoomToID(circleShape.shape.id());
        }}
      />
    </div>
  );
};

export const Primary = Template.bind({});
