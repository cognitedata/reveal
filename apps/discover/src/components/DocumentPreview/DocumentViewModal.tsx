import { getPreview } from 'domain/documents/service/network/getPreview';
import { downloadFileFromUrl } from 'domain/documents/service/utils/utils';

import React, { useState, useEffect } from 'react';

import styled from 'styled-components/macro';

import { IconType, Button } from '@cognite/cogs.js';

import { WhiteLoaderInline } from 'components/Loading';
import { ActionModal, OKModal } from 'components/Modal';
import { Typography } from 'components/Typography';
import { useTranslation } from 'hooks/useTranslation';
import { FlexRow, FlexAlignJustifyContent } from 'styles/layout';

import { ImagePreview } from './ImagePreview';

const PdfPreview = React.lazy(() => import('./PdfPreview'));

interface Props {
  documentId: string;
  fileName?: string;
  onModalClose: () => void;
  modalOpen: boolean;
}

type PageType = string | void | null;

const PreviewWrapper = styled.div`
  padding-top: 32px;
`;

const Loading = styled(FlexAlignJustifyContent)`
  height: 1024px;
  width: 1024px;
  max-width: 70%;
  background: white;
  margin: 0 auto 32px;
  border-radius: 8px;
`;

const InlineButton = styled.span`
  display: inline;
  text-decoration: underline;

  &:hover {
    color: black;
  }
`;

const InfoBox = styled(FlexRow)`
  width: 520px;
  user-select: none;
  background-color: var(--cogs-greyscale-grey3);
  border-radius: 8px;
  margin: 0 auto 32px;
  padding: 16px;
  justify-content: center;
  cursor: pointer;
`;

const StyledButton = styled(Button)`
  margin-left: 32px;
`;

const StyledTypography = styled(Typography)`
  margin-top: 8px;
  display: block !important;
`;

export const DocumentViewModal: React.FC<Props> = ({
  documentId,
  onModalClose,
  modalOpen,
  fileName,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previews, setPreviews] = useState<PageType[]>([]);
  const [pdfLoadingError, setPdfLoadingError] = useState<boolean>(false);

  const shouldDisplayPreviewLimitMessage =
    pdfLoadingError && previews.length === 3;

  // This is a temporary solution. If anything goes wrong, we just
  // show the error message in stead of showing what we can and
  // gracefully handling the error. - Ronald
  const handleError = () => {
    setPreviews([]);
    setError(true);
  };

  const getPreviews = async () => {
    // Fetch the first page so we can show it before the others load
    getPreview(documentId, 0)
      .then((firstPage) => {
        setPreviews([firstPage]);

        if (!firstPage) {
          handleError();
          return;
        }

        // Check for two more pages
        const remainingPages = [
          getPreview(documentId, 1).catch(handleError),
          getPreview(documentId, 2).catch(handleError),
        ];

        // Check if either of these pages exist
        Promise.all(remainingPages).then((pages: PageType[]) => {
          setLoading(false);
          setPreviews([firstPage, ...pages].filter((page: PageType) => page));
        });
      })
      .catch(handleError);
  };

  const getDownloadUrlFromDoc = async () => {
    downloadFileFromUrl(documentId);
  };

  const onPdfLoadError = () => {
    setPdfLoadingError(true);
    getPreviews();
  };

  const onPdfLoadSuccess = () => {
    if (loading) {
      setLoading(false);
    }
  };
  // Reset the state when the modal is hiding
  const resetState = () => {
    setLoading(true);
    setError(false);
    setPdfLoadingError(false);
    setPreviews([]);
  };

  useEffect(() => {
    if (modalOpen) {
      // Load the previews when the modal opens
      // INFO: right now we load the PDF preview first, and if that fails we load the images preview.
      // getPreviews();
    } else {
      resetState();
    }
  }, [modalOpen]);

  if (error) {
    return (
      <OKModal
        visible={modalOpen}
        title={fileName || t('Error processing Preview')}
        onCancel={onModalClose}
        okText={t('Download file')}
        onOk={() => {
          getDownloadUrlFromDoc();
          onModalClose();
        }}
      >
        {t(
          'Discover cannot process this file. Download the file to view it directly.'
        )}
      </OKModal>
    );
  }

  return (
    <ActionModal
      visible={modalOpen}
      title={fileName || t('Document Preview')}
      onCancel={onModalClose}
      actions={[
        {
          icon: 'Download' as IconType,
          title: t('Download document'),
          onClick: getDownloadUrlFromDoc,
        },
      ]}
      fullWidth
    >
      <PreviewWrapper>
        {loading && (
          <Loading>
            <WhiteLoaderInline />
          </Loading>
        )}
        {pdfLoadingError &&
          previews.map((preview) => (
            <ImagePreview
              key={preview as string}
              name={fileName || ''}
              imageSrc={preview as string}
            />
          ))}
        {shouldDisplayPreviewLimitMessage && (
          <InfoBox onClick={getDownloadUrlFromDoc}>
            <StyledTypography variant="microheader">
              {t('Preview is limited to three pages.')}{' '}
              <InlineButton>{t('Download the file')}</InlineButton>{' '}
              {t('to view the full document.')}
            </StyledTypography>
            <StyledButton type="tertiary">{t('Download file')}</StyledButton>
          </InfoBox>
        )}
        {!pdfLoadingError && (
          <React.Suspense fallback={<WhiteLoaderInline />}>
            <PdfPreview
              documentId={documentId}
              onError={onPdfLoadError}
              onSuccess={onPdfLoadSuccess}
            />
          </React.Suspense>
        )}
      </PreviewWrapper>
    </ActionModal>
  );
};

export default DocumentViewModal;
