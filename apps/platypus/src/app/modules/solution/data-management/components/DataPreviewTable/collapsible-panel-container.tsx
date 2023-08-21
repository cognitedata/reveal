import { ReactElement, useEffect, useState } from 'react';

import {
  FilePreview,
  SequencePreview,
} from '@data-exploration-components/containers';
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
import { FileInfo, Timeseries, Sequence } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';
import { usePreviewData } from '../../hooks/usePreviewData';

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

type SidebarCustomData =
  | { type: 'timeseries'; data: Timeseries[] }
  | { type: 'files'; data: FileInfo[] }
  | { type: 'sequences'; data: Sequence[] };

export const CustomDataTypes = ['TimeSeries', 'File', 'Sequence'];

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
  const [resources, setResources] = useState<SidebarCustomData | undefined>();

  const { data: previewData } = usePreviewData(
    {
      dataModelExternalId: dataModelVersion.externalId,
      dataModelSpace: dataModelVersion.space,
      dataModelType: dataModelType,
      externalId: data?.instanceExternalId || '',
      instanceSpace: data?.instanceSpace || '',
      nestedLimit: 0,
    },
    { enabled: !!data }
  );

  useEffect(() => {
    // if no data or not timeseries
    if (!data || !previewData || !CustomDataTypes.includes(data.type)) {
      setResources(undefined);
      return;
    }

    const externalIds = data.isList
      ? ((previewData[data.fieldName] as { externalId: string }[]) || []).map(
          ({ externalId }) => ({
            externalId,
          })
        )
      : [
          {
            externalId: (previewData[data.fieldName] as { externalId: string })
              .externalId,
          },
        ];

    const dataType: SidebarCustomData['type'] =
      data.type === 'TimeSeries'
        ? 'timeseries'
        : data.type === 'File'
        ? 'files'
        : 'sequences';

    switch (dataType) {
      case 'timeseries':
        getCogniteSDKClient()
          .timeseries.retrieve(externalIds)
          .then((response) => setResources({ type: dataType, data: response }));
        break;
      case 'files':
        getCogniteSDKClient()
          .files.retrieve(externalIds)
          .then((response) => setResources({ type: dataType, data: response }));
        break;
      case 'sequences':
        getCogniteSDKClient()
          .sequences.retrieve(externalIds)
          .then((response) => setResources({ type: dataType, data: response }));
        break;
    }
  }, [data, previewData]);

  const getSidebarContent = () => {
    if (!data) {
      return null;
    }

    if (CustomDataTypes.includes(data.type)) {
      if (!resources) {
        return <Icon type="Loader" />;
      }
      switch (resources.type) {
        case 'timeseries':
          return resources.data.map((ts) => (
            <SDKProvider sdk={getCogniteSDKClient()} key={ts.id}>
              <p>{ts.externalId}</p>
              <TimeseriesChart
                timeseries={{ id: ts.id }}
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
          ));
        case 'files':
          return resources.data.map((file) => (
            <SDKProvider sdk={getCogniteSDKClient()} key={file.id}>
              <p>{file.name}</p>
              <div style={{ height: 200 }}>
                <FilePreview
                  fileId={file.id}
                  id={file.externalId || 'N/A'}
                  applicationId="platypus"
                  creatable={false}
                  contextualization={false}
                />
              </div>
              <a
                href={createLink(
                  `/explore/file/${file.id}${window.location.search}`
                )}
                target="_blank"
                rel="noreferrer"
              >
                <Button style={{ marginTop: 12 }}>Open in data explorer</Button>
              </a>
            </SDKProvider>
          ));
        case 'sequences':
          return resources.data.map((sequence) => (
            <SDKProvider sdk={getCogniteSDKClient()} key={sequence.id}>
              <p>{sequence.externalId}</p>
              <div style={{ height: 200 }}>
                <SequencePreview sequence={sequence} />
              </div>
              <a
                href={createLink(
                  `/explore/sequence/${sequence.id}${window.location.search}`
                )}
                target="_blank"
                rel="noreferrer"
              >
                <Button style={{ marginTop: 12 }}>Open in data explorer</Button>
              </a>
            </SDKProvider>
          ));
        default:
          return <Icon type="Loader" />;
      }
    } else if (data.type === 'File' || data.type === 'Sequence') {
      // Temporary until we have suitable preview implementations
      const listData = data.isList
        ? data.listValues?.map((value) =>
            value ? value.externalId : '<External-id did not resolve>'
          )
        : [data.instanceExternalId];
      return <CogDataList data-cy="instance-values" listData={listData} />;
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
