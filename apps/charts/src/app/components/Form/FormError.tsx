import { FieldErrors, FieldValues as FormFieldValues } from 'react-hook-form';

import styled from 'styled-components';

import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';

import {
  InfoBoxHeadingContainer,
  InfoBoxHeadingIconRed,
  StyledError,
} from './elements';

const defaultTranslation = makeDefaultTranslations('Error validating data');

type Props<FieldValues extends FormFieldValues> = {
  errors: FieldErrors<FieldValues>;
};
export const FormError = <TFieldValues extends FormFieldValues>({
  errors,
}: Props<TFieldValues>) => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'FormError').t,
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
        {t['Error validating data']}
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

export default FormError;
