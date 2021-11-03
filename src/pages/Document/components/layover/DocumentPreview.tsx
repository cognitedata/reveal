import { Body, Button, Drawer, Label } from '@cognite/cogs.js';
import { Header } from 'components/Header';
import { documentConfig } from 'configs/global.config';
import React from 'react';
import {
  useDocumentPreviewQuery,
  useDocumentQuery,
} from 'services/query/documents/query';
import styled from 'styled-components';
import { base64Image } from 'utils/document';
import { humanReadableFileSize } from 'utils/numbers';
import { getContainer } from 'utils/utils';

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
`;

interface Props {
  documentId?: number;
  visible?: boolean;
  toggleVisibility: () => void;
}
export const DocumentPreview: React.FC<Props> = React.memo(
  ({ documentId, visible, toggleVisibility }) => {
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
        getContainer={getContainer}
        onCancel={() => toggleVisibility()}
        width="30rem"
        footer={null}
        closeIcon={null}
      >
        <Container>
          <Header
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
            {isLoading && <Body strong>{documentConfig.IMAGE_LOADING}</Body>}
          </ImageContent>

          <Header
            subtitle={document?.title || 'Unknown: Title'}
            title={document?.sourceFile?.name || 'Unknown: Filename'}
            titleLevel={5}
            description={documentDescription}
            Action={
              <Label>
                {document?.sourceFile?.labels?.length || 0} label(s)
              </Label>
            }
          />
        </Container>
      </Drawer>
    );
  }
);
