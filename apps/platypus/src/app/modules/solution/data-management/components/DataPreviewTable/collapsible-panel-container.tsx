import { ReactElement, useEffect, useState } from 'react';

import {
  BultinFieldTypeNames,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
  KeyValueMap,
} from '@platypus/platypus-core';

import { createLink } from '@cognite/cdf-utilities';
import { CogDataList } from '@cognite/cog-data-grid';
import { Button, CollapsablePanel, Icon } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';
import { Timeseries } from '@cognite/sdk/dist/src';
import { SDKProvider } from '@cognite/sdk-provider';

import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';

import { SidePanelTitle } from './data-preview-side-panel-title';
import * as S from './elements';
import { InstancePreview } from './InstancePreview/InstancePreview';
import { ListPreview } from './ListPreview/ListPreview';
import { SidePanel } from './SidePanel';

export type DataPreviewSidebarData = {
  fieldName: string;
  fieldType?: DataModelTypeDefsType;
  instanceExternalId: string;
  instanceSpace: string;
  isList: boolean;
  json?: KeyValueMap;
  listValues?: { externalId: string }[];
  type: BultinFieldTypeNames | 'custom';
};

export type CollapsiblePanelContainerProps = {
  children: ReactElement;
  data: DataPreviewSidebarData | undefined;
  onClose: VoidFunction;
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelVersion: DataModelVersion;
};

export const CollapsiblePanelContainer: React.FC<
  CollapsiblePanelContainerProps
> = ({
  children,
  data,
  onClose,
  dataModelTypeDefs,
  dataModelVersion,
  dataModelType,
}) => {
  const [timeSeriesIds, setTimeSeriesIds] = useState<
    Timeseries[] | undefined
  >();

  useEffect(() => {
    // if no data or not timeseries
    if (!data || data.type !== 'TimeSeries') {
      setTimeSeriesIds(undefined);
      return;
    }

    const externalIds = data.isList
      ? data.listValues!
      : [{ externalId: data.instanceExternalId }];

    getCogniteSDKClient()
      .timeseries.retrieve(externalIds)
      .then((timeseries) => setTimeSeriesIds(timeseries));
  }, [data]);

  const getSidebarContent = () => {
    if (!data) {
      return null;
    }

    if (data.type === 'TimeSeries') {
      return timeSeriesIds ? (
        timeSeriesIds.map((ts) => (
          <SDKProvider sdk={getCogniteSDKClient()}>
            <p>{ts.externalId}</p>
            <TimeseriesChart
              timeseriesId={ts.id}
              variant="small"
              height={200}
              dateRange={[
                new Date(
                  `${
                    new Date().getFullYear() - 1
                  }-${new Date().getMonth()}-${new Date().getDay()}`
                ),
                new Date(),
              ]}
            />
            <a
              href={createLink(
                `/explore/timeSeries/${ts.id}${window.location.search}`
              )}
              target="_blank"
              rel="noreferrer"
            >
              <Button style={{ marginTop: 12 }}>Open in data explorer</Button>
            </a>
          </SDKProvider>
        ))
      ) : (
        <Icon type="Loader" />
      );
    } else if (data.isList) {
      return (
        <ListPreview
          externalId={data.instanceExternalId}
          field={data.fieldName}
          dataModelType={dataModelType}
          dataModelTypeDefs={dataModelTypeDefs}
          dataModelVersion={dataModelVersion}
          instanceSpace={data.instanceSpace}
        />
      );
    } else if (data.type === 'JSONObject') {
      const listData = Object.keys(data.json!).map(
        (key) => `${key}: ${data.json![key]}`
      );

      return <CogDataList data-cy="instance-values" listData={listData} />;
    } else if (data.type === 'File') {
      return <p>File</p>;
    } else {
      return (
        <InstancePreview
          externalId={data.instanceExternalId}
          dataModelType={data.fieldType!}
          dataModelExternalId={dataModelVersion.externalId}
          dataModelSpace={dataModelVersion.space}
          instanceSpace={data.instanceSpace}
        />
      );
    }
  };

  return (
    <S.CollapsablePanelContainer>
      <CollapsablePanel
        sidePanelRight={
          <SidePanel
            title={
              <SidePanelTitle
                fieldName={data?.fieldName || ''}
                dataModelTypeName={dataModelType.name}
              />
            }
            onCloseClick={onClose}
          >
            {getSidebarContent()}
          </SidePanel>
        }
        sidePanelRightVisible={!!data}
        sidePanelRightWidth={376}
      >
        {children}
      </CollapsablePanel>
    </S.CollapsablePanelContainer>
  );
};
