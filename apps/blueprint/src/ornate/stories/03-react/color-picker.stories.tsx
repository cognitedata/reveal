import { useState } from 'react';

import { ColorPicker } from '../../react/components';

export default {
  title: 'Ornate / 3. React / Color Picker',
};

const Template = () => {
  const [color, setColor] = useState('red');
  return (
    <div>
      <ColorPicker color={color} onColorChange={setColor} />
    </div>
  );
};

export const Primary = Template.bind({});
