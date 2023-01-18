import React from 'react';
import styled from 'styled-components';
import { makeDefaultTranslations } from 'utils/translations';
import {
  InfoBoxHeadingContainer,
  InfoBoxHeadingIconRed,
  StyledError,
} from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Required fields missing',
  'Either the CDF credential option must be checked or the Client ID and Client secret need to be set'
);

type Props = {
  translations?: typeof defaultTranslations;
  errors: any;
};
const CreateMonitoringJobFormError = ({ errors, translations }: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const arr = Object.entries(errors);

  const messages = arr
    .filter(([, object]: [string, any]) => object?.message.length > 0)
    .map(([key, object]: [string, any]) => {
      return (
        <StyledErrorMessage key={key}>{object.message}</StyledErrorMessage>
      );
    });

  if (messages.length === 0) {
    return <></>;
  }
  return (
    <StyledError>
      <InfoBoxHeadingContainer>
        <InfoBoxHeadingIconRed type="ExclamationMark" />
        {t['Required fields missing']}
      </InfoBoxHeadingContainer>
      <StyledErrorMessagesContainer>{messages}</StyledErrorMessagesContainer>
    </StyledError>
  );
};

const StyledErrorMessage = styled.div`
  list-style-type: '-  ';
  display: list-item;
  margin-left: 1em;
`;

const StyledErrorMessagesContainer = styled.div`
  margin-left: 1.3em;
`;

export default CreateMonitoringJobFormError;
