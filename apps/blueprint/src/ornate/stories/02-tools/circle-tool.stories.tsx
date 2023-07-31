import { CircleTool } from '../../tools';
import { Ornate } from '../../react/ornate';
import { mockShapeCollection } from '../../mocks/shape-collection';

export default {
  title: 'Ornate / 2. Tools / Circle',
  component: CircleTool,
};

const Template = () => {
  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate shapes={mockShapeCollection} activeTool="CIRCLE" />
    </div>
  );
};

export const Primary = Template.bind({});
