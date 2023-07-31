import { useState } from 'react';

import { StyleSelector, NodeStyle } from '../../react/components';

export default {
  title: 'Ornate / 3. React / Style Selector',
};

const Template = (defaultStyle: NodeStyle) => {
  const [style, setStyle] = useState<NodeStyle>(defaultStyle);
  return (
    <div>
      <StyleSelector style={style} onChange={setStyle} />
    </div>
  );
};

export const Fill = Template.bind({}, { fill: 'red' });
export const Stroke = Template.bind({}, { stroke: 'red', strokeWidth: 8 });
export const Text = Template.bind({}, { fill: 'red', fontSize: '16' });
