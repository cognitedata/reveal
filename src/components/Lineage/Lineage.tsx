import React, { useCallback, useEffect, useState } from 'react';
import { RawTable } from 'utils/types';
import Table from 'antd/lib/table';
import Spin from 'antd/lib/spin';
import Timeline from 'antd/lib/timeline';
import Typography from 'antd/lib/typography';
import sdk from '@cognite/cdf-sdk-singleton';
import { getJetfireUrl, getContainer } from 'utils/utils';
import { JetfireApi } from 'jetfire/JetfireApi';
import {
  ContentView,
  LineageDot,
  LineageSubTitle,
  LineageTitle,
  NoDataText,
} from 'utils/styledComponents';
import { trackEvent } from '@cognite/cdf-route-tracker';
import { useFlag } from '@cognite/react-feature-flags';
import { IntegrationRawTables } from 'components/Lineage/Integration/IntegrationRawTables';

import handleError from 'utils/handleError';
import transformationsColumns from 'components/Lineage/transformationColumns';
import ConsumerTable from 'components/Lineage/ConsumerTable';
import IntegrationTable from 'components/Lineage/Integration/IntegrationTable';
import { Source, SOURCE_TEXT } from 'components/Lineage/Source/Source';
import {
  Extractor,
  EXTRACTOR_TEXT,
} from 'components/Lineage/Extractor/Extractor';
import * as Sentry from '@sentry/browser';
import { DataSetWithIntegrations } from 'actions';

const jetfire = new JetfireApi(sdk, sdk.project, getJetfireUrl());

interface LineageProps {
  dataSetWithIntegrations?: DataSetWithIntegrations;
}

export interface RawWithUpdateTime extends RawTable {
  lastUpdate: string;
}

const Lineage = ({ dataSetWithIntegrations }: LineageProps) => {
  const [transformationsData, setTransformationsData] = useState<any[]>([]);
  const [disableTransformations, setDisableTransformations] =
    useState<boolean>(false);

  const isFlagConsumers = useFlag('EXTPIPES_CONSUMERS_allowlist', {
    fallback: false,
    forceRerender: true,
  });
  useEffect(() => {
    trackEvent('DataSets.LineageFlow.Enters lineage flow');
  }, []);

  const getExternalTransformations = () => {
    const transformations =
      dataSetWithIntegrations?.dataSet.metadata.transformations;
    if (Array.isArray(transformations)) {
      const externalTransformation = transformations.filter(
        (trans) => trans.type === 'external'
      );

      if (externalTransformation && externalTransformation[0]) {
        return (
          <span>
            <strong>External transformation documentation</strong>
            <Typography.Paragraph ellipsis={{ rows: 1, expandable: true }}>
              {externalTransformation[0].details}
            </Typography.Paragraph>
          </span>
        );
      }
    }
    return false;
  };

  const getTransformations = useCallback(async () => {
    try {
      const transformationList = await jetfire.transformConfigs({
        includePublic: true,
      });
      const jetfiretransformations =
        dataSetWithIntegrations?.dataSet?.metadata?.transformations?.filter(
          (tr) => tr.type === 'jetfire'
        ) || [];
      const mappedTransformations = jetfiretransformations.map(
        (transformationItem) => {
          const currentTransformation = transformationList.find(
            (item) => String(item.id) === String(transformationItem.name)
          );
          if (currentTransformation) return currentTransformation;
          return {
            storedData: transformationItem,
            hidden: true,
          };
        }
      );
      setTransformationsData(mappedTransformations);
    } catch (e) {
      setDisableTransformations(true);
      if (
        (e as any)?.requestStatus !== 401 &&
        (e as any)?.requestStatus !== 403
      ) {
        handleError({
          message: 'Failed to fetch transformations',
          ...(e as any),
        });
      } else {
        Sentry.captureException({
          message: 'Failed to fetch transformations',
          ...(e as any),
        });
      }
    }
  }, [dataSetWithIntegrations]);

  useEffect(() => {
    getTransformations();
  }, [getTransformations]);

  if (dataSetWithIntegrations) {
    const { dataSet } = dataSetWithIntegrations;
    const sourceNames = dataSet.metadata.consoleSource?.names;
    const extractorAccounts =
      dataSet.metadata.consoleExtractors &&
      Array.isArray(dataSet.metadata.consoleExtractors.accounts)
        ? dataSet.metadata.consoleExtractors.accounts
        : [];
    const usedTransformations =
      Array.isArray(dataSet.metadata.transformations) &&
      dataSet.metadata.transformations.length;
    const hasSources = Array.isArray(sourceNames) && sourceNames.length >= 1;
    const hasExtractorAccounts =
      extractorAccounts != null && extractorAccounts.length >= 1;
    return (
      <ContentView>
        <Timeline>
          {hasSources ? (
            <Timeline.Item dot={<LineageDot />}>
              <LineageTitle>Source</LineageTitle>
              <LineageSubTitle>{SOURCE_TEXT}</LineageSubTitle>
              <Source sourceNames={sourceNames} />
            </Timeline.Item>
          ) : null}
          {hasExtractorAccounts ? (
            <Timeline.Item dot={<LineageDot />}>
              <LineageTitle>Extractor</LineageTitle>
              <LineageSubTitle>{EXTRACTOR_TEXT}</LineageSubTitle>
              <Extractor extractorAccounts={extractorAccounts} />
            </Timeline.Item>
          ) : null}
          <IntegrationTable
            dataSetWithIntegrations={dataSetWithIntegrations}
            extractorAccounts={extractorAccounts}
            sourceNames={sourceNames}
          />
          <IntegrationRawTables dataSet={dataSetWithIntegrations} />
          {usedTransformations && (
            <Timeline.Item dot={<LineageDot />}>
              <LineageTitle>Transformations</LineageTitle>
              <LineageSubTitle>
                The below transformations modify data to fit into the Cognite
                Data Fusion data model in this data set.
              </LineageSubTitle>
              <strong>CDF SQL transformations</strong>

              {disableTransformations ? (
                <NoDataText>
                  You must be in the IAM group &apos;transformations&apos; in
                  order to be able to see transformations in your project.
                </NoDataText>
              ) : (
                <Table
                  columns={transformationsColumns(
                    dataSetWithIntegrations.dataSet
                  )}
                  dataSource={transformationsData}
                  pagination={{ pageSize: 5 }}
                  rowKey="id"
                  getPopupContainer={getContainer}
                />
              )}
              {getExternalTransformations()}
            </Timeline.Item>
          )}
          {isFlagConsumers && (
            <ConsumerTable dataSet={dataSetWithIntegrations.dataSet} />
          )}
        </Timeline>
      </ContentView>
    );
  }

  return (
    <ContentView>
      <Spin />
    </ContentView>
  );
};

export default Lineage;
