import styled from 'styled-components';

import { Body, Button, Flex, Skeleton } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

import { useTranslation } from '../../hooks/useTranslation';

type Props = {
  dataSets: DataSet[];
  isLoading: boolean;
  selectedDataSetId?: string;
  onDataSetClick: (dataSetId: number) => void;
};

export const SitesSidebar = ({
  isLoading,
  dataSets,
  selectedDataSetId,
  onDataSetClick,
}: Props) => {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <SCContainer data-cy="sites-side-bar">
        <Skeleton.Paragraph lines={10} />
      </SCContainer>
    );

  return (
    <SCContainer data-cy="sites-side-bar">
      <Body muted size="x-small" style={{ padding: '0 1rem' }}>
        {t('site', { count: 0 })}
      </Body>

      {dataSets.length === 0 && (
        <Body muted size="x-small">
          {t('datasets-error-nothing-found')}
        </Body>
      )}

      <SCList>
        {dataSets.map((dataSet) => (
          <Button
            onClick={() => onDataSetClick(dataSet.id)}
            key={dataSet.externalId}
            type={
              selectedDataSetId === dataSet.id.toString()
                ? 'ghost-accent'
                : 'ghost'
            }
          >
            {dataSet.name}
          </Button>
        ))}
      </SCList>
    </SCContainer>
  );
};

const SCContainer = styled(Flex)`
  padding: 2rem 0 2rem 4rem;
  height: calc(80vh - 4rem);
  width: max(260px, 20vw);
  overflow: hidden;
  flex-direction: column;
  gap: 0.5rem;
`;

const SCList = styled(Flex)`
  overflow: auto;
  .cogs-button {
    width: 100%;
    justify-content: flex-start;
    text-align: start;
  }
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
`;
