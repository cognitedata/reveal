import React from 'react';
import Search from 'images/illustrations/search.svg';
import { loadingState } from 'configs/global.config';
import { StatesContainer, StatesDescription, StatesTitle } from './elements';

interface Props {
  title?: string;
  disableDescriptionRotation?: boolean;
}

export const Loading: React.FC<Props> = ({
  title,
  disableDescriptionRotation,
}) => {
  const [description, setDescription] = React.useState(
    loadingState.FIRST_DESCRIPTION
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!disableDescriptionRotation) {
        setDescription(loadingState.SECOND_DESCRIPTION);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [disableDescriptionRotation]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!disableDescriptionRotation) {
        setDescription(loadingState.THIRD_DESCRIPTION);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [disableDescriptionRotation]);

  return (
    <StatesContainer>
      <img src={Search} alt="Loading illustration" />
      <StatesTitle>{title || loadingState.TITLE}</StatesTitle>
      <StatesDescription>{description}</StatesDescription>
    </StatesContainer>
  );
};
