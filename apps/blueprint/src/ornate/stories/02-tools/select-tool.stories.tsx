import { SelectTool } from '../../tools';
import { Ornate } from '../../react/ornate';
import { mockShapeCollection } from '../../mocks/shape-collection';

export default {
  title: 'Ornate / 2. Tools / Select',
  component: SelectTool,
};

const Template = () => {
  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate shapes={mockShapeCollection} activeTool="SELECT" />
    </div>
  );
};

export const Primary = Template.bind({});
