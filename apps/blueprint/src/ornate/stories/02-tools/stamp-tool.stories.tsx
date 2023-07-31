import { StampTool } from '../../tools';
import { Ornate } from '../../react/ornate';
import { mockShapeCollection } from '../../mocks/shape-collection';
import logo from '../../mocks/atlas.png';

export default {
  title: 'Ornate / 2. Tools / Stamp',
  component: StampTool,
};

const Template = () => {
  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate
        shapes={mockShapeCollection}
        activeTool="STAMP"
        onReady={(ornate) => {
          ornate.tools.STAMP.setImageURL(logo);
        }}
      />
    </div>
  );
};

export const Primary = Template.bind({});
