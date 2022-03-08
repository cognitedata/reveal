import { Body, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { makeDefaultTranslations } from 'utils/translations';

export const defaultTranslations = makeDefaultTranslations(
  'No results found',
  'Try adjusting your search or filter'
);

type EmptyResultProps = {
  translations?: typeof defaultTranslations;
};

const EmptyResult = ({ translations }: EmptyResultProps) => {
  const t = { ...defaultTranslations, ...translations };

  return (
    <ErrorMessageContainer>
      <Title level="3" style={{ color: 'var(--cogs-text-secondary)' }}>
        {t['No results found']}
      </Title>
      <Body level="3" style={{ color: 'var(--cogs-text-secondary)' }}>
        {t['Try adjusting your search or filter']}
      </Body>
    </ErrorMessageContainer>
  );
};

const ErrorMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-top: 10px;
  background-color: var(--cogs-bg-accent);
`;

export default EmptyResult;
