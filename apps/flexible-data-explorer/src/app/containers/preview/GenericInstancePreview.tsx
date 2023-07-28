import React, { Suspense, useState } from 'react';

import { Spinner } from '../../components/loader/Spinner';
import { useNavigation } from '../../hooks/useNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import { useInstancesQuery } from '../../services/instances/generic/queries/useInstanceByIdQuery';

import { Overview } from './containers/Overview';
import { PropertiesView } from './containers/PropertiesView';
import { RelationshipEdgeView } from './containers/RelationshipEdge';
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
}) => {
  const { t } = useTranslation();
  const { toInstancePage } = useNavigation();

  const [view, setView] = useState<
    'properties' | { type: string; field: string } | undefined
  >();

  const { data, isLoading } = useInstancesQuery({
    instance,
    model: dataModel,
  });

  const handleOpenClick = () => {
    // ensure "instance" object is not empty
    if (
      instance?.dataType === undefined ||
      instance?.externalId === undefined ||
      instance?.instanceSpace === undefined
    ) {
      return;
    }

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
        <InstancePreviewContent>
          <Suspense fallback={<Spinner />}>{renderContent()}</Suspense>
        </InstancePreviewContent>

        <InstancePreviewFooter>
          <OpenButton type="primary" onClick={handleOpenClick}>
            {t('GENERAL_OPEN')}
          </OpenButton>
        </InstancePreviewFooter>
      </InstancePreviewContainer>
    </>
  );
};
