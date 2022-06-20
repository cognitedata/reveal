import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import LinkWithCopy from 'components/links/LinkWithCopy';
import { getDataSetsLink } from 'utils/dataSetUtils';
import {
  NO_DATA_SET_ID_SET,
  NO_DATA_SET_ID_SET_TOOLTIP,
} from 'utils/constants';
import { StyledTooltip } from 'styles/StyledToolTip';

const DatasetTooltip = styled.div`
  display: flex;
  align-items: center;
`;

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
  if (!dataSetId) {
    return (
      <StyledTooltip content={NO_DATA_SET_ID_SET_TOOLTIP}>
        <i>{NO_DATA_SET_ID_SET}</i>
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
