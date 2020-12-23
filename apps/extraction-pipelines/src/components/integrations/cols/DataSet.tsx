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

const DataSet: FunctionComponent<Props> = ({
  dataSetId,
  dataSetName,
  ...rest
}: Props) => {
  const { cdfEnv, project, origin } = useAppEnv();
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

export default DataSet;
