import { Button, CollapsablePanel, Icon } from '@cognite/cogs.js';
import { ReactElement, useEffect, useState } from 'react';
import { SidePanelTitle } from './data-preview-side-panel-title';
import { SidePanel } from './SidePanel';

import * as S from './elements';
import { InstancePreview } from './InstancePreview/InstancePreview';
import { ListPreview } from './ListPreview/ListPreview';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
  KeyValueMap,
} from '@platypus/platypus-core';
import { CogDataList } from '@cognite/cog-data-grid';
import { TimeseriesChart } from '@cognite/plotting-components';
import { SDKProvider } from '@cognite/sdk-provider';
import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';

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
  const [resourceId, setResourceId] = useState<number | undefined>();
  useEffect(() => {
    if (!data || data.type !== 'timeseries') {
      setResourceId(undefined);
      return;
    }
    getCogniteSDKClient()
      .timeseries.retrieve([{ externalId: data.externalId }])
      .then(([{ id }]) => setResourceId(id));
  }, [data]);
  const getSidebarContent = () => {
    if (!data) {
      return null;
    }

    if (data.type === 'list') {
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
    } else if (data.type === 'timeseries') {
      return resourceId ? (
        <SDKProvider sdk={getCogniteSDKClient()}>
          <TimeseriesChart
            timeseriesId={resourceId}
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
            href={`//${window.location.hostname}/${
              getCogniteSDKClient().project
            }/explore/timeSeries/${resourceId}${window.location.search}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button style={{ marginTop: 12 }}>Open in data explorer</Button>
          </a>
        </SDKProvider>
      ) : (
        <Icon type="Loader" />
      );
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
