import { useState } from 'react';
import { Tooltip, DocumentIcon } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useDocumentImage } from 'hooks/useQuery/useDocumentImage';

import { PreviewImage } from './elements';

export type DocumentPreviewProps = {
  document: FileInfo;
};

const DocumentPreview = ({ document }: DocumentPreviewProps) => {
  const [isBroken, setBroken] = useState(false);
  const { data: image } = useDocumentImage(document);

  if (image && !isBroken) {
    return (
      <Tooltip
        content={<img src={image} alt={document.name} style={{ width: 320 }} />}
      >
        <PreviewImage
          src={image}
          alt={document.name}
          onError={() => setBroken(true)}
        />
      </Tooltip>
    );
  }

  return <DocumentIcon file={document.name} />;
};

export default DocumentPreview;
