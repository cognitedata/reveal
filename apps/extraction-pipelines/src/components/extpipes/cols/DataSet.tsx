import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import LinkWithCopy from 'components/links/LinkWithCopy';
import { getDataSetsLink } from 'utils/dataSetUtils';
import { StyledTooltip } from 'components/styled';
import { useTranslation } from 'common';
interface OwnProps {
  id: string;
  dataSetName: string;
  dataSetId: number;
}

type Props = OwnProps;

export const DataSet: FunctionComponent<Props> = ({
  dataSetId,
  dataSetName,
  ...rest
}: Props) => {
  const { t } = useTranslation();

  if (!dataSetId) {
    return (
      <StyledTooltip content={t('no-data-set-info')}>
        <i data-testId="no-data-set">{t('no-data-set')}</i>
      </StyledTooltip>
    );
  }
  return (
    <DatasetTooltip>
      <LinkWithCopy
        href={getDataSetsLink(dataSetId)}
        linkText={dataSetName}
        copyText={`${dataSetId}`}
        copyType="dataSetId"
        {...rest}
      />
    </DatasetTooltip>
  );
};

const DatasetTooltip = styled.div`
  display: flex;
  align-items: center;
`;
