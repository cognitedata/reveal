import { TextTool } from '../../tools';
import { Ornate } from '../../react/ornate';
import { mockShapeCollection } from '../../mocks/shape-collection';

export default {
  title: 'Ornate / 2. Tools / Text',
  component: TextTool,
};

const Template = () => {
  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate shapes={mockShapeCollection} activeTool="TEXT" />
    </div>
  );
};

export const Primary = Template.bind({});
