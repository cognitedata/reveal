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
} from '@platypus/platypus-core';

export type DataPreviewSidebarData = {
  type: 'custom' | 'list';
  fieldName: string;
  externalId: string;
  fieldType?: DataModelTypeDefsType;
};

export type CollapsiblePanelContainerProps = {
  children: ReactElement;
  data: DataPreviewSidebarData | undefined;
  onClose: VoidFunction;
  dataModelTypeName: string;
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
  dataModelTypeName,
  dataModelTypeDefs,
  dataModelVersion,
  dataModelType,
}) => {
  const getSidebarContent = () => {
    if (!data) {
      return null;
    }
    if (data?.type === 'list') {
      return (
        <ListPreview
          externalId={data.externalId}
          field={data.fieldName}
          dataModelType={dataModelType}
          dataModelTypeDefs={dataModelTypeDefs}
          dataModelVersion={dataModelVersion}
        />
      );
    } else {
      return (
        <InstancePreview
          externalId={data.externalId}
          dataModelType={data.fieldType!}
          dataModelExternalId={dataModelVersion.externalId}
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
                dataModelTypeName={dataModelTypeName}
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
