import React, { Suspense, useState } from 'react';

import { Dropdown, Spinner } from '@fdx/components';
import { useInstancesQuery } from '@fdx/services/instances/generic/queries/useInstanceByIdQuery';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import { useOpenIn } from '@fdx/shared/hooks/useOpenIn';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { ContainerReferenceType } from '@fdx/shared/types/canvas';

import { Button } from '@cognite/cogs.js';

import {
  InstancePreviewContainer,
  InstancePreviewContent,
  InstancePreviewFooter,
  OpenButton,
} from './elements';
import { Overview } from './modules/Overview';
import { PropertiesView } from './modules/PropertiesView';
import { RelationshipEdgeView } from './modules/RelationshipEdgeView/RelationshipEdgeView';
import { ThreeDViewer } from './modules/Viewers/ThreeDViewer';
import { InstancePreviewProps } from './types';

export const GenericInstancePreview: React.FC<InstancePreviewProps> = ({
  dataModel,
  instance,
  disableViewer,
}) => {
  const { t } = useTranslation();
  const { toInstancePage } = useNavigation();
  const { openContainerReferenceInCanvas } = useOpenIn();

  const [view, setView] = useState<
    'properties' | { type: string; field: string } | undefined
  >();

  const { data, isLoading } = useInstancesQuery({
    instance,
    model: dataModel,
  });

  const handleOpenInCanvas = () => {
    openContainerReferenceInCanvas({
      type: ContainerReferenceType.FDM_INSTANCE,
      instanceExternalId: instance?.externalId,
      instanceSpace: instance?.instanceSpace,
      viewExternalId: instance?.dataType,
      viewSpace: dataModel?.space,
    });
  };

  const handleOpenClick = () => {
    // ensure "instance" object is not empty
    toInstancePage(
      instance?.dataType,
      instance?.instanceSpace,
      instance?.externalId,
      {
        ...dataModel,
        dataModel: dataModel?.externalId,
      }
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (view === undefined) {
      return (
        <Overview
          type={instance?.dataType}
          title={data?.name || data?.externalId}
          description={data?.description}
          onClick={(item) => setView(item)}
          dataModel={dataModel}
          instance={instance}
        />
      );
    }

    if (view === 'properties') {
      return (
        <PropertiesView
          data={data}
          onClick={(item) => setView(item)}
          instance={instance}
          dataModel={dataModel}
        />
      );
    }

    return (
      <RelationshipEdgeView
        type={view}
        instance={instance}
        dataModel={dataModel}
        onClick={(item) => setView(item)}
      />
    );
  };

  return (
    <>
      <InstancePreviewContainer>
        {!disableViewer && (
          <ThreeDViewer instance={instance} dataModel={dataModel} />
        )}

        <InstancePreviewContent>
          <Suspense fallback={<Spinner />}>{renderContent()}</Suspense>
        </InstancePreviewContent>

        <InstancePreviewFooter>
          <Dropdown.OpenIn
            placement="top"
            onCanvasClick={handleOpenInCanvas}
            disabled={isLoading}
          >
            <Button icon="EllipsisHorizontal" />
          </Dropdown.OpenIn>
          <OpenButton type="primary" onClick={handleOpenClick}>
            {t('GENERAL_OPEN')}
          </OpenButton>
        </InstancePreviewFooter>
      </InstancePreviewContainer>
    </>
  );
};
