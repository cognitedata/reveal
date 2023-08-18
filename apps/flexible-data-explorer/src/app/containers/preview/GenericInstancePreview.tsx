import React, { Suspense, useState } from 'react';

import { ContainerReferenceType } from '@fusion/industry-canvas';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from '../../components/dropdown/Dropdown';
import { Spinner } from '../../components/loader/Spinner';
import { useNavigation } from '../../hooks/useNavigation';
import { useOpenIn } from '../../hooks/useOpenIn';
import { useTranslation } from '../../hooks/useTranslation';
import { useInstancesQuery } from '../../services/instances/generic/queries/useInstanceByIdQuery';

import { Overview } from './containers/Overview';
import { PropertiesView } from './containers/PropertiesView';
import { RelationshipEdgeView } from './containers/RelationshipEdgeView/RelationshipEdgeView';
import { ThreeDViewer } from './containers/Viewers/ThreeDViewer';
import {
  InstancePreviewContainer,
  InstancePreviewContent,
  InstancePreviewFooter,
  OpenButton,
} from './elements';
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
