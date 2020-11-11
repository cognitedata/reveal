import React, { FunctionComponent } from 'react';
import { Colors, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import InteractiveCopy from 'components/InteractiveCopy';
import { useAppEnv } from '../../../hooks/useAppEnv';

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
  dataSetId: string;
}

type Props = OwnProps;

const DataSetId: FunctionComponent<Props> = ({ dataSetId }: Props) => {
  const { cdfEnv, project } = useAppEnv();
  return (
    <>
      <Tooltip content={dataSetId}>
        <>
          <DatasetTooltip>
            <DataSetLink
              href={`${cdfEnv}/${project}/data-sets/data-set/${dataSetId}`}
              target="_blank"
            >
              {dataSetId}
            </DataSetLink>
            <InteractiveCopy text={dataSetId} />
          </DatasetTooltip>
        </>
      </Tooltip>
    </>
  );
};

export default DataSetId;
