import { useState } from 'react';
import { Tooltip, DocumentIcon } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useDocumentImage } from 'hooks/useQuery/useDocumentImage';

import { PreviewImage } from './elements';

export type DocumentPreviewProps = {
  document: FileInfo;
  onClick?: () => void;
};

const DocumentPreview = ({ document, onClick }: DocumentPreviewProps) => {
  const { data: image, isError } = useDocumentImage(document);
  const [isBroken, setBroken] = useState(isError);

  if (document?.mimeType?.includes('svg')) return null;

  if (image && !isBroken) {
    return (
      <Tooltip
        content={
          <img
            key={`document-preview-img-${document.id}`}
            src={image}
            alt={document.name}
            style={{ width: 320 }}
          />
        }
      >
        <PreviewImage
          src={image}
          alt={document.name}
          onError={() => setBroken(true)}
          onClick={onClick}
        />
      </Tooltip>
    );
  }

  return <DocumentIcon file={document.name} />;
};

export default DocumentPreview;
