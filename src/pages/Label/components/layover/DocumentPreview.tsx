import { Body, Button, Drawer, Label } from '@cognite/cogs.js';
import { ModalProps } from 'src/components/modal/types';
import { PageHeader } from 'src/components/page';
import { Loading } from 'src/components/states/Loading';
import { documentConfig } from 'src/configs/global.config';
import React from 'react';
import {
  useDocumentPreviewQuery,
  useDocumentQuery,
} from 'src/services/query/documents/query';
import styled from 'styled-components';
import { base64Image } from 'src/utils/document';
import { humanReadableFileSize } from 'src/utils/numbers';
import { getContainer } from 'src/utils/utils';

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

interface Props extends ModalProps {
  documentId?: number;
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
              <Label size="medium">
                {document?.labels?.length || 0} labels
              </Label>
            }
          />
        </Container>
      </Drawer>
    );
  }
);
