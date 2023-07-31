import { useEffect } from 'react';
import { CogniteOrnate } from '@cognite/ornate';
import { FileInfo } from '@cognite/sdk';
import { useDocumentDownloadUrl } from 'hooks/useQuery/useDocumentDownloadUrl';
import useAnnotationEventsByIdQuery from 'hooks/useQuery/useAnnotationEventsByIdQuery';
import useOrnate from 'hooks/useOrnate';

import SelectedAnnotationCard from '../SelectedAnnotationCard/SelectedAnnotationCard';

type Props = {
  document: FileInfo;
};

const OrnatePreview = ({ document }: Props) => {
  const fileUrlQuery = useDocumentDownloadUrl(document);

  const annotationEventsByIdQuery = useAnnotationEventsByIdQuery({
    id: document.id,
    externalId: document.externalId,
  });

  const {
    ornateViewer,
    selectedAnnotation,
    setSelectedAnnotation,
    addPDF,
    addImage,
  } = useOrnate();

  useEffect(() => {
    if (
      ornateViewer.current &&
      fileUrlQuery.isSuccess &&
      !annotationEventsByIdQuery.isLoading
    ) {
      ornateViewer.current?.restart();
      const fileUrl = fileUrlQuery.data;
      const annotationEvents = annotationEventsByIdQuery.data || [];
      if (document.mimeType?.includes('pdf')) {
        addPDF({
          file: { fileUrl, type: 'CDF', ...document },
          annotationEvents,
        });
      } else if (document.mimeType?.includes('image')) {
        addImage(fileUrl);
      }
    }
  }, [
    document.id,
    fileUrlQuery.status,
    annotationEventsByIdQuery.status,
    ornateViewer.current,
  ]);

  useEffect(() => {
    ornateViewer.current = new CogniteOrnate({
      container: '#ornate-container',
    });
  }, []);

  return (
    <div
      style={{ position: 'relative', maxHeight: '100%', overflow: 'hidden' }}
    >
      <div id="ornate-container" />
      {selectedAnnotation && (
        <SelectedAnnotationCard
          style={{ position: 'absolute', bottom: '16px', left: '16px' }}
          annotation={selectedAnnotation.annotation}
          onClose={() => setSelectedAnnotation(undefined)}
        />
      )}
    </div>
  );
};

export default OrnatePreview;
