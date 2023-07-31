import React, { useState } from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from '../../components/dropdown/Dropdown';
import { Spinner } from '../../components/loader/Spinner';
import { useNavigation } from '../../hooks/useNavigation';
import { useOpenIn } from '../../hooks/useOpenIn';
import { useTranslation } from '../../hooks/useTranslation';
import { useFileByIdQuery } from '../../services/instances/file/queries/useFileByIdQuery';
import { FDXFilePreview } from '../widgets/File/FilePreview';

import { Overview } from './containers/Overview';
import { PropertiesView } from './containers/PropertiesView';
import {
  InstancePreviewContainer,
  InstancePreviewContent,
  InstancePreviewFooter,
  OpenButton,
} from './elements';
import { PreviewView } from './types';

interface Props {
  id: number;
}

export const FilePreview: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const { toFilePage } = useNavigation();

  const { openInCanvas } = useOpenIn();

  const { data, isLoading } = useFileByIdQuery(id);

  const [view, setView] = useState<PreviewView>();

  const handleOpenClick = () => {
    toFilePage(id);
  };

  const handleNavigateToCanvasClick = () => {
    openInCanvas({ type: 'file', id: data?.id });
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
      <FileContainer>
        <FDXFilePreview fileId={id} showControls={false} />
      </FileContainer>
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

const FileContainer = styled.div`
  height: 140px;
  width: 300px;
`;
