import * as React from 'react';

import { Textarea } from '@cognite/cogs.js';

import Header from 'components/Header/Header';

export const LayersCreate: React.FC = () => {
  const [text, setText] = React.useState('');

  return (
    <>
      <Header title="Layers" description="" />
      <Textarea
        style={{ width: '400px', height: '200px' }}
        value={text}
        placeholder="Enter layer GeoJSON"
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
    </>
  );
};
