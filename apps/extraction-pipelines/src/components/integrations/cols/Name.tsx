import React, { FunctionComponent } from 'react';

interface OwnProps {
  name: string;
}

type Props = OwnProps;

const Name: FunctionComponent<Props> = ({ name }: Props) => {
  return <>{name}</>;
};

export default Name;
