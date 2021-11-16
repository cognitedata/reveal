import React from 'react';
import Recent from 'images/illustrations/recent.svg';
import { StatesContainer, StatesDescription, StatesTitle } from './elements';

interface Props {
  title?: string;
  description?: string;
}
export const Empty: React.FC<Props> = ({ title, description }) => {
  return (
    <StatesContainer>
      <img src={Recent} alt="Empty illustration" />
      <StatesTitle>{title || 'You have no data in this table'}</StatesTitle>
      <StatesDescription>{description}</StatesDescription>
    </StatesContainer>
  );
};
