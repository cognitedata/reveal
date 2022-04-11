import { useState } from 'react';
import { Tooltip, DocumentIcon } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useDocumentImage } from 'hooks/useQuery/useDocumentImage';

import { PreviewImage } from './elements';

export type DocumentPreviewProps = {
  document: FileInfo;
  handleClick?: () => void;
};

const DocumentPreview = ({ document, handleClick }: DocumentPreviewProps) => {
  const [isBroken, setBroken] = useState(false);
  const { data: image } = useDocumentImage(document);

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
          onClick={handleClick}
        />
      </Tooltip>
    );
  }

  return <DocumentIcon file={document.name} />;
};

export default DocumentPreview;
