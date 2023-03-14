import { CollapsablePanel } from '@cognite/cogs.js';
import { ReactElement } from 'react';
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

export type DataPreviewSidebarData =
  | {
      type: 'custom';
      externalId: string;
      fieldName: string;
      fieldType: DataModelTypeDefsType;
    }
  | {
      type: 'list';
      externalId: string;
      fieldName: string;
    }
  | {
      type: 'json';
      fieldName: string;
      json: KeyValueMap;
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
        />
      );
    } else if (data.type === 'json') {
      const listData = Object.keys(data.json).map(
        (key) => `${key}: ${data.json[key]}`
      );

      return <CogDataList data-cy="instance-values" listData={listData} />;
    } else {
      return (
        <InstancePreview
          externalId={data.externalId}
          dataModelType={data.fieldType}
          dataModelExternalId={dataModelVersion.externalId}
          space={dataModelVersion.space}
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
