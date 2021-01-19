import React, { FunctionComponent } from 'react';
import { Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import LinkWithCopy from 'components/links/LinkWithCopy';
import { useAppEnv } from '../../../hooks/useAppEnv';
import { getDataSetsLink } from '../../../utils/dataSetUtils';

const DatasetTooltip = styled.div`
  display: flex;
  align-items: center;
`;

interface OwnProps {
  id: string;
  dataSetName: string;
  dataSetId: string;
}

type Props = OwnProps;

export const NO_DATA_SET_ID_SET: Readonly<string> = 'No data set';
const NO_DATA_SET_ID_SET_TOOLTIP: Readonly<string> = 'No data set registered';

export const DataSet: FunctionComponent<Props> = ({
  dataSetId,
  dataSetName,
  ...rest
}: Props) => {
  const { cdfEnv, project, origin } = useAppEnv();
  if (!dataSetId) {
    return (
      <Tooltip content={NO_DATA_SET_ID_SET_TOOLTIP}>
        <i>{NO_DATA_SET_ID_SET}</i>
      </Tooltip>
    );
  }
  return (
    <Tooltip content={dataSetId}>
      <>
        <DatasetTooltip>
          <LinkWithCopy
            href={getDataSetsLink({ origin, project, cdfEnv, dataSetId })}
            linkText={dataSetName}
            copyText={dataSetId}
            {...rest}
          />
        </DatasetTooltip>
      </>
    </Tooltip>
  );
};
