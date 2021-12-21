import { Button } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import React, { useEffect, useState } from 'react';
import layers from 'utils/z';

import { getDocumentUrl } from '../../modules/lineReviews/api';
import { DocumentId } from '../../modules/lineReviews/mocks';
import { WorkspaceTool } from '../WorkSpaceTools/WorkSpaceTools';
import { DocumentType } from '../../modules/lineReviews/types';

import ReactOrnate from './ReactOrnate';

type IsoModalProps = {
  visible?: boolean;
  onHidePress: () => void;
};

const IsoModal: React.FC<IsoModalProps> = ({ visible, onHidePress }) => {
  const { client } = useAuthContext();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await Promise.all(
        [
          {
            id: DocumentId.ISO_DOCUMENT_1,
            fileExternalId: '0040_ISO_74',
            annotations: [],
            type: DocumentType.ISO,
          },
        ].map(async (document) => ({
          id: document.id,
          url: await getDocumentUrl(client, document),
          pageNumber: 1,
          annotations: document.annotations,
          row: 1,
        }))
      );

      setDocuments(result);
      setIsInitialized(true);
    })();
  }, []);

  if (visible === false || !isInitialized) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '5%',
        top: '5%',
        width: 643,
        height: 526,
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        borderRadius: 8,
        zIndex: layers.OVERLAY,
        padding: '25px 20px',
      }}
    >
      <h2>Isometric Drawing G0040_L029-1</h2>
      <div
        style={{
          height: '380px',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
        }}
      >
        <ReactOrnate
          documents={documents}
          tools={[
            WorkspaceTool.SELECT,
            WorkspaceTool.MOVE,
            WorkspaceTool.COMMENT,
          ]}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 0',
        }}
      >
        <Button onClick={onHidePress}>Hide</Button>
      </div>
    </div>
  );
};

export default IsoModal;
