import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import { Button, Colors } from '@cognite/cogs.js';
import { createLink, getEnv } from '@cognite/cdf-utilities';
import { getContainer } from 'utils/utils';
import InfoTooltip from 'components/InfoTooltip';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { DataSetWithIntegrations } from 'actions';
import {
  EmptyLineageDot,
  LineageDot,
  LineageSubTitle,
  LineageTitle,
  NoDataText,
} from '../../../utils/styledComponents';
import { Integration } from '../../../utils/types';
import { IntegrationTableColumns } from './IntegrationTableColumns';
import { IntegrationSourceExtractorProps } from './IntegrationSourceExtractor';
import { getExtractionPipelineUIUrl } from '../../../utils/integrationUtils';

interface IntegrationTableProps extends IntegrationSourceExtractorProps {
  dataSetWithIntegrations: DataSetWithIntegrations;
}

export const INTEGRATIONS_HEADING: Readonly<string> = 'Extraction pipelines';
export const CREATE_EXTRACTION_PIPELINE: Readonly<string> =
  'Create extraction pipeline';
export const INTEGRATION_SUB_HEADING: Readonly<string> =
  'Use this section to create, troubleshoot and view details on extraction pipelines that ingest data from extractors into this data set.';
const PERMISSION_TEXT: Readonly<string> = `You must have the 'extractionPipelinesAcl:read' permission to see extraction pipelines in your project`;

const StyledButton = styled(Button)`
  margin-top: 8px;

  &:focus {
    color: ${Colors.white};
  }
`;

const IntegrationTable: FunctionComponent<IntegrationTableProps> = ({
  dataSetWithIntegrations,
}: PropsWithChildren<IntegrationTableProps>) => {
  const { integrations, dataSet } = dataSetWithIntegrations;

  const permissionsExtractionPipelines = useUserCapabilities(
    'extractionPipelinesAcl',
    'WRITE'
  );
  const canEditExtractionPipelines = permissionsExtractionPipelines.data;

  const addIntegrationLink = () => {
    return `${createLink(`${getExtractionPipelineUIUrl('/create')}`)}${
      getEnv() ? '&' : '?'
    }dataSetId=${dataSet.id}`;
  };

  const createExtpipeButton = canEditExtractionPipelines ? (
    <StyledButton href={addIntegrationLink()} type="primary" icon="Plus">
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
    <Timeline.Item
      dot={integrations.length ? <LineageDot /> : <EmptyLineageDot />}
    >
      <LineageTitle>{INTEGRATIONS_HEADING}</LineageTitle>
      <LineageSubTitle>
        <span>{INTEGRATION_SUB_HEADING}</span>
        <span css="flex-shrink: 0">{createExtpipeButton}</span>
      </LineageSubTitle>
      {!integrations ? (
        <NoDataText>{PERMISSION_TEXT}</NoDataText>
      ) : (
        <>
          <Table
            columns={IntegrationTableColumns}
            dataSource={integrations}
            pagination={{ pageSize: 5 }}
            rowKey={(record: Integration) => `${record?.id}`}
            getPopupContainer={getContainer}
          />
        </>
      )}
    </Timeline.Item>
  );
};

export default IntegrationTable;
