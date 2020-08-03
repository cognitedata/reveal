import React from 'react';

export type Props = {
  text?: string;
  // Insert your props here.
};

export const {{ properCase simpleName }} = ({ text = 'Hello, world!' }: Props) => {
  return <h1>{text}</h1>;
};

export default {{ properCase simpleName }};
