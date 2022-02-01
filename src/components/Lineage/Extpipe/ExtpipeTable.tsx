import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import { createLink, getEnv } from '@cognite/cdf-utilities';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { getContainer } from 'utils/utils';
import InfoTooltip from 'components/InfoTooltip';
import { DataSetWithExtpipes } from 'actions';
import {
  EmptyLineageDot,
  LineageDot,
  LineageSubTitle,
  LineageTitle,
  NoDataText,
} from '../../../utils/styledComponents';
import { Extpipe } from '../../../utils/types';
import { ExtpipeTableColumns } from './ExtpipeTableColumns';
import { ExtpipeSourceExtractorProps } from './ExtpipeSourceExtractor';
import { getExtractionPipelineUIUrl } from '../../../utils/extpipeUtils';

interface ExtpipeTableProps extends ExtpipeSourceExtractorProps {
  dataSetWithExtpipes: DataSetWithExtpipes;
  isExtpipesFetched?: boolean;
}

export const EXTPIPES_HEADING: Readonly<string> = 'Extraction pipelines';
export const CREATE_EXTRACTION_PIPELINE: Readonly<string> =
  'Create extraction pipeline';
export const EXTPIPE_SUB_HEADING: Readonly<string> =
  'Use this section to create, troubleshoot and view details on extraction pipelines that ingest data from extractors into this data set.';
const PERMISSION_TEXT: Readonly<string> = `You must have the 'extractionPipelinesAcl:read' permission to see extraction pipelines in your project`;

const StyledButton = styled(Button)`
  margin-top: 8px;

  &:focus {
    color: ${Colors.white};
  }
`;

const ExtpipeTable: FunctionComponent<ExtpipeTableProps> = ({
  dataSetWithExtpipes,
  isExtpipesFetched,
}: PropsWithChildren<ExtpipeTableProps>) => {
  const { extpipes, dataSet } = dataSetWithExtpipes;

  const { flow } = getFlow();
  const permissionsExtractionPipelines = usePermissions(
    flow,
    'extractionPipelinesAcl',
    'WRITE'
  );
  const canEditExtractionPipelines = permissionsExtractionPipelines.data;

  const addExtpipeLink = () => {
    return `${createLink(`${getExtractionPipelineUIUrl('/create')}`)}${
      getEnv() ? '&' : '?'
    }dataSetId=${dataSet.id}`;
  };

  const createExtpipeButton = canEditExtractionPipelines ? (
    <StyledButton href={addExtpipeLink()} type="primary" icon="Plus">
      {CREATE_EXTRACTION_PIPELINE}
    </StyledButton>
  ) : (
    <InfoTooltip
      showIcon={false}
      tooltipText="You have insufficient access rights to create an extraction pipeline."
    >
      <Button disabled icon="Plus">
        {CREATE_EXTRACTION_PIPELINE}
      </Button>
    </InfoTooltip>
  );

  return (
    <Timeline.Item dot={extpipes.length ? <LineageDot /> : <EmptyLineageDot />}>
      <LineageTitle>{EXTPIPES_HEADING}</LineageTitle>
      <LineageSubTitle>
        <span>{EXTPIPE_SUB_HEADING}</span>
        <span css="flex-shrink: 0">{createExtpipeButton}</span>
      </LineageSubTitle>
      {!extpipes ? (
        <NoDataText>{PERMISSION_TEXT}</NoDataText>
      ) : (
        <>
          {isExtpipesFetched ? (
            <Table
              columns={ExtpipeTableColumns}
              dataSource={extpipes}
              pagination={{ pageSize: 5 }}
              rowKey={(record: Extpipe) => `${record?.id}`}
              getPopupContainer={getContainer}
            />
          ) : (
            <Icon type="Loader" />
          )}
        </>
      )}
    </Timeline.Item>
  );
};

export default ExtpipeTable;
