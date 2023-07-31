import { HandTool } from '../../tools';
import { Ornate } from '../../react/ornate';
import { mockShapeCollection } from '../../mocks/shape-collection';

export default {
  title: 'Ornate / 2. Tools / Hand',
  component: HandTool,
};

const Template = () => {
  return (
    <div style={{ width: '100%', height: 500 }}>
      <Ornate shapes={mockShapeCollection} activeTool="HAND" />
    </div>
  );
};

export const Primary = Template.bind({});
