import React, { FunctionComponent } from 'react';
import { Colors, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import InteractiveCopy from 'components/InteractiveCopy';
import { useAppEnv } from '../../../hooks/useAppEnv';
import { getDataSetsLink } from '../../../utils/dataSetUtils';

const DatasetTooltip = styled.div`
  display: flex;
  align-items: center;
`;
const DataSetLink = styled((props) => <a {...props}>{props.children}</a>)`
  color: ${Colors.black.hex()};
  margin-right: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;
interface OwnProps {
  dataSetName: string;
  dataSetId: string;
}

type Props = OwnProps;

const DataSet: FunctionComponent<Props> = ({
  dataSetId,
  dataSetName,
}: Props) => {
  const { cdfEnv, project, origin } = useAppEnv();
  return (
    <>
      <Tooltip content={dataSetId}>
        <>
          <DatasetTooltip>
            <DataSetLink
              href={getDataSetsLink({ origin, project, cdfEnv, dataSetId })}
              target="_blank"
            >
              {dataSetName}
            </DataSetLink>
            <InteractiveCopy text={dataSetId} />
          </DatasetTooltip>
        </>
      </Tooltip>
    </>
  );
};

export default DataSet;
