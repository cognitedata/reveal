import React, { useState } from 'react';

import { Dropdown, Spinner } from '@fdx/components';
import { useFileByIdQuery } from '@fdx/services/instances/file/queries/useFileByIdQuery';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import { useOpenIn } from '@fdx/shared/hooks/useOpenIn';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button } from '@cognite/cogs.js';

import {
  InstancePreviewContainer,
  InstancePreviewContent,
  InstancePreviewFooter,
  OpenButton,
} from './elements';
import { Overview } from './modules/Overview';
import { PropertiesView } from './modules/PropertiesView';
import { FileViewer } from './modules/Viewers/FileViewer';
import { PreviewView } from './types';

interface Props {
  id: number | string;
}

export const FilePreview: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const { toFilePage } = useNavigation();

  const { openAssetCentricResourceItemInCanvas } = useOpenIn();

  const { data, isLoading } = useFileByIdQuery(id);

  const [view, setView] = useState<PreviewView>();

  const handleOpenClick = () => {
    toFilePage(id);
  };

  const handleNavigateToCanvasClick = () => {
    if (!data?.id) {
      return;
    }
    openAssetCentricResourceItemInCanvas({ id: data?.id, type: 'file' });
  };

  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (view === 'properties') {
      return <PropertiesView data={data} onClick={(item) => setView(item)} />;
    }

    return (
      <Overview
        type="File"
        title={data?.name || data?.externalId}
        onClick={(item) => setView(item)}
      />
    );
  };

  return (
    <InstancePreviewContainer>
      <FileViewer id={id} />

      <InstancePreviewContent>{renderContent()}</InstancePreviewContent>

      <InstancePreviewFooter>
        <Dropdown.OpenIn
          placement="top"
          onCanvasClick={handleNavigateToCanvasClick}
          disabled={isLoading}
        >
          <Button icon="EllipsisHorizontal" />
        </Dropdown.OpenIn>

        <OpenButton type="primary" onClick={handleOpenClick}>
          {t('GENERAL_OPEN')}
        </OpenButton>
      </InstancePreviewFooter>
    </InstancePreviewContainer>
  );
};
