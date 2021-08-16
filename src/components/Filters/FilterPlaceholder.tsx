import React from 'react';
import { Body, Colors } from '@cognite/cogs.js';

type Props = {
  text: string;
};

export const FilterPlaceholder = (props: Props) => {
  const { text } = props;
  return (
    <Body
      level={2}
      style={{
        fontFamily: 'Inter',
        color: Colors['greyscale-grey6'].hex(),
        margin: 0,
        padding: 0,
      }}
    >
      {text}
    </Body>
  );
};
