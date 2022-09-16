import React from 'react';
import styled from 'styled-components';
import LinkWithCopy from 'components/links/LinkWithCopy';
import { getDataSetsLink } from 'utils/dataSetUtils';
import { StyledTooltip } from 'components/styled';
import { useTranslation } from 'common';
import { useDataSet } from 'hooks/useDataSets';
type Props = {
  dataSetId: number;
};

export const DataSet = ({ dataSetId }: Props) => {
  const { t } = useTranslation();

  const { data: dataSet } = useDataSet(dataSetId);

  if (!dataSetId) {
    return (
      <StyledTooltip content={t('no-data-set-info')}>
        <i data-testid="no-data-set">{t('no-data-set')}</i>
      </StyledTooltip>
    );
  }
  return (
    <DatasetTooltip>
      <LinkWithCopy
        href={getDataSetsLink(dataSetId)}
        linkText={dataSet?.name || `${dataSetId}`}
        copyText={`${dataSetId}`}
        copyType="dataSetId"
      />
    </DatasetTooltip>
  );
};

const DatasetTooltip = styled.div`
  display: flex;
  align-items: center;
`;
