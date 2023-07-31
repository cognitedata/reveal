import logo from '../../mocks/atlas.png';
import { Ornate } from '../../react/ornate';
import { Image } from '../../shapes/image';

export default {
  title: 'Ornate / 1. Shapes / Image',
  component: Image,
};

const Template = () => {
  const imageShape = new Image({
    id: '123',
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    imageURL: logo,
  });

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate
        shapes={[imageShape]}
        onShapesReady={(ornate) => {
          ornate.zoomToID(imageShape.shape.id());
        }}
      />
    </div>
  );
};

export const Primary = Template.bind({});
