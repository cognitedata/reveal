import { Text } from '../../shapes';
import { Ornate } from '../../react/ornate';

export default {
  title: 'Ornate / 1. Shapes / Text',
  component: Text,
};

const Template = () => {
  const textShape = new Text({
    id: '123',
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    fill: 'black',
    text: 'My text',
  });

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate
        shapes={[textShape]}
        activeTool="SELECT"
        onShapesReady={(ornate) => {
          ornate.zoomToID(textShape.shape.id());
        }}
      />
    </div>
  );
};

export const Primary = Template.bind({});
