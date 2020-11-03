import React, { FunctionComponent } from 'react';

interface OwnProps {
  name: string;
  rowIndex: number;
}

type Props = OwnProps;

const Name: FunctionComponent<Props> = ({ name, rowIndex }: Props) => {
  return <label htmlFor={`radio-row-${rowIndex}`}>{name}</label>;
};

export default Name;
