import React from 'react';

import styled from 'styled-components';

import { Body, Button, Drawer, Chip } from '@cognite/cogs.js';

import { PageHeader } from '../../../../components/page';
import { Loading } from '../../../../components/states/Loading';
import { documentConfig } from '../../../../configs/global.config';
import {
  useDocumentPreviewQuery,
  useDocumentQuery,
} from '../../../../services/query/documents/query';
import { base64Image } from '../../../../utils/document';
import { humanReadableFileSize } from '../../../../utils/numbers';
import { getContainer } from '../../../../utils/utils';

const Image = styled.img`
  width: 100%;
`;

const Container = styled.div``;

const ImageContent = styled.div`
  border: 1px solid var(--cogs-greyscale-grey6);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 577px;
`;

export const DocumentPreview = React.memo(
  ({
    documentId,
    visible,
    toggleVisibility,
  }: {
    documentId?: number;

    visible?: boolean;
    toggleVisibility: () => void;
  }) => {
    const {
      data: preview,
      isLoading,
      isError,
    } = useDocumentPreviewQuery(documentId);
    const { data: document } = useDocumentQuery(documentId);

    const documentDescription = `${document?.type} - ${humanReadableFileSize(
      document?.sourceFile?.size
    )}`;

    return (
      <Drawer
        visible={visible}
        getContainer={getContainer()}
        onCancel={() => toggleVisibility()}
        width="30rem"
        footer={null}
        closeIcon={null}
      >
        <Container>
          <PageHeader
            title={documentConfig.FILE_PREVIEW_TITLE}
            onClose={() => toggleVisibility()}
            Action={
              <Button
                icon="ExternalLink"
                aria-label="Go to external document preview"
              />
            }
          />

          <ImageContent>
            {preview && !isError && (
              <Image src={base64Image(preview)} alt="document preview" />
            )}
            {isError && <Body strong>{documentConfig.IMAGE_ERROR}</Body>}
            {isLoading && <Loading title={documentConfig.IMAGE_LOADING} />}
          </ImageContent>

          <PageHeader
            subtitle={document?.title}
            title={document?.sourceFile?.name || 'Unknown: Filename'}
            titleLevel={5}
            description={documentDescription}
            Action={
              <Chip label={`${document?.labels?.length || '0'}` + ' labels'} />
            }
          />
        </Container>
      </Drawer>
    );
  }
);
