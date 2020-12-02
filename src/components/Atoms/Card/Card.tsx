import React from 'react';
import { CardContainer } from './elements';

const Card = ({ children }: { children: any }) => {
  return <CardContainer>{children}</CardContainer>;
};

export default Card;
