import { ReactElement, useEffect, useState } from 'react';

import {
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

export type DataPreviewSidebarData =
  | {
      type: 'custom';
      externalId: string;
      fieldName: string;
      fieldType: DataModelTypeDefsType;
      instanceSpace: string;
    }
  | {
      type: 'list';
      externalId: string;
      fieldName: string;
      instanceSpace: string;
      listType: string;
      listValues: { externalId: string }[];
    }
  | {
      type: 'json';
      fieldName: string;
      json: KeyValueMap;
    }
  | {
      type: 'timeseries';
      fieldName: string;
      externalId: string;
    }
  | {
      type: 'file';
      fieldName: string;
      externalId: string;
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
  const [resourceIds, setResourceId] = useState<Timeseries[] | undefined>();
  useEffect(() => {
    if (!data || (data.type !== 'timeseries' && data.type !== 'list')) {
      setResourceId(undefined);
      return;
    }

    if (data.type === 'list' && data.listType !== 'TimeSeries') {
      setResourceId(undefined);
      return;
    }

    let externalIds: { externalId: string }[];
    if (data.type === 'list') {
      externalIds = data.listValues;
    } else {
      externalIds = [{ externalId: data.externalId }];
    }

    getCogniteSDKClient()
      .timeseries.retrieve(externalIds)
      .then((timeseries) => setResourceId(timeseries));
  }, [data]);
  const getSidebarContent = () => {
    if (!data) {
      return null;
    }

    if (
      data.type === 'timeseries' ||
      (data.type === 'list' && data.listType === 'TimeSeries')
    ) {
      return resourceIds ? (
        resourceIds.map((ts) => (
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
    } else if (data.type === 'list') {
      return (
        <ListPreview
          externalId={data.externalId}
          field={data.fieldName}
          dataModelType={dataModelType}
          dataModelTypeDefs={dataModelTypeDefs}
          dataModelVersion={dataModelVersion}
          instanceSpace={data.instanceSpace}
        />
      );
    } else if (data.type === 'json') {
      const listData = Object.keys(data.json).map(
        (key) => `${key}: ${data.json[key]}`
      );

      return <CogDataList data-cy="instance-values" listData={listData} />;
    } else if (data.type === 'file') {
      return null;
    } else {
      return (
        <InstancePreview
          externalId={data.externalId}
          dataModelType={data.fieldType}
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
