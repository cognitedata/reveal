import React from 'react';
import { CardContainer } from './elements';

const Card = ({ children }: { children: any }) => (
  <CardContainer>{children}</CardContainer>
);

export default Card;
