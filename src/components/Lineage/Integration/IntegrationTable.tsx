import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import { createLink, getEnv } from '@cognite/cdf-utilities';
import { getContainer } from 'utils/utils';
import {
  EmptyLineageDot,
  LineageDot,
  LineageSubTitle,
  LineageTitle,
  NoDataText,
} from '../../../utils/styledComponents';
import { DataSet, Integration } from '../../../utils/types';
import { IntegrationTableColumns } from './IntegrationTableColumns';
import { IntegrationSourceExtractorProps } from './IntegrationSourceExtractor';
import {
  fetchIntegrationsByDataSetId,
  getExtractionPipelineUIUrl,
} from '../../../utils/integrationUtils';

interface IntegrationTableProps extends IntegrationSourceExtractorProps {
  dataSet?: DataSet;
}

export const INTEGRATIONS_HEADING: Readonly<string> = 'Extraction pipelines';
export const ADD_INTEGRATION: Readonly<string> = 'Add extraction pipeline';
export const INTEGRATION_SUB_HEADING: Readonly<string> =
  'Use this section to create, troubleshoot and view details on extraction pipelines that ingest data from extractors into this data set.';
const PERMISSION_TEXT: Readonly<string> = `You must have the 'extractionPipelinesAcl:read' permission to see extraction pipelines in your project`;
const IntegrationTable: FunctionComponent<IntegrationTableProps> = ({
  dataSet,
}: PropsWithChildren<IntegrationTableProps>) => {
  const [integrationList, setIntegrationList] = useState<
    Integration[] | undefined
  >();

  useEffect(() => {
    async function fetchIntegration(dataSetId: number) {
      const res = await fetchIntegrationsByDataSetId(dataSetId);
      setIntegrationList(res);
    }
    if (dataSet?.metadata?.integrations) {
      setIntegrationList(dataSet.metadata?.integrations);
    } else if (dataSet?.id && !dataSet.metadata.integrations) {
      fetchIntegration(dataSet.id);
    }
  }, [setIntegrationList, dataSet]);

  const addIntegrationLink = () => {
    return `${createLink(`${getExtractionPipelineUIUrl('/create')}`)}${
      getEnv() ? '&' : '?'
    }dataSetId=${dataSet?.id}`;
  };

  return (
    <Timeline.Item
      dot={
        integrationList && integrationList.length ? (
          <LineageDot />
        ) : (
          <EmptyLineageDot />
        )
      }
    >
      <LineageTitle>{INTEGRATIONS_HEADING}</LineageTitle>
      <LineageSubTitle>{INTEGRATION_SUB_HEADING}</LineageSubTitle>
      {!integrationList ? (
        <NoDataText>{PERMISSION_TEXT}</NoDataText>
      ) : (
        <>
          <Table
            columns={IntegrationTableColumns}
            dataSource={integrationList}
            pagination={{ pageSize: 5 }}
            rowKey={(record: Integration) => `${record?.id}`}
            getPopupContainer={getContainer}
          />
          <a href={addIntegrationLink()} className="cogs-btn cogs-btn-primary">
            {ADD_INTEGRATION}
          </a>
        </>
      )}
    </Timeline.Item>
  );
};

export default IntegrationTable;
