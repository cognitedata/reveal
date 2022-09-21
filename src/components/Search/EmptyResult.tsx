import { Body, Graphic, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { makeDefaultTranslations } from 'utils/translations';

export const defaultTranslations = makeDefaultTranslations(
  'No results found for',
  'Try adjusting your query and filters',
  'Equipment tags',
  'Timeseries',
  'Use tab above and check results for '
);

type EmptyResultProps = {
  translations?: typeof defaultTranslations;
  itemType: 'assets' | 'timeseries';
};

const EmptyResult = ({ translations, itemType }: EmptyResultProps) => {
  const t = { ...defaultTranslations, ...translations };

  return (
    <ErrorMessageContainer>
      <Graphic type="Search" />
      <InfoMessageTitle
        level="4"
        style={{ color: 'var(--cogs-text-secondary)' }}
      >
        {t['No results found for']}
        <AssetTypeDisplayer>
          {itemType === 'assets' ? t['Equipment tags'] : t.Timeseries}
        </AssetTypeDisplayer>
      </InfoMessageTitle>
      <InfoMessage level="2" style={{ color: 'var(--cogs-text-secondary)' }}>
        {t['Try adjusting your query and filters']}
      </InfoMessage>
      <Body level="2" style={{ color: 'var(--cogs-text-secondary)' }}>
        {t['Use tab above and check results for ']}
        {itemType === 'timeseries' ? t['Equipment tags'] : t.Timeseries}
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

const AssetTypeDisplayer = styled.span`
  font-weight: bold;
  margin-left: 3pt;
`;

const InfoMessage = styled(Body)`
  margin-top: 4pt;
  margin-bottom: 1pt;
`;

const InfoMessageTitle = styled(Title)`
  margin-top: 10pt;
`;

export default EmptyResult;
