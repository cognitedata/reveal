import React from 'react';
import Recent from 'src/images/illustrations/recent.svg';
import {
  StatesContainer,
  StatesDescription,
  StatesTitle,
  Image,
} from './elements';

interface Props {
  title?: string;
  description?: string;
}
export const Empty: React.FC<Props> = ({ title, description }) => {
  return (
    <StatesContainer>
      <Image src={Recent} alt="Empty illustration" />
      <StatesTitle>{title || 'You have no data in this table'}</StatesTitle>
      <StatesDescription>{description}</StatesDescription>
    </StatesContainer>
  );
};
