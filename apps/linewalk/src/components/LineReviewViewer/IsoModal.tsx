import { Button } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import React, { useEffect, useState } from 'react';
import layers from 'utils/z';

import { getDocumentUrl } from '../../modules/lineReviews/api';
import { WorkspaceTool } from '../WorkSpaceTools/WorkSpaceTools';
import { Document } from '../../modules/lineReviews/types';

import ReactOrnate from './ReactOrnate';

export const ISO_MODAL_ORNATE_WIDTH_PX = 600;
export const ISO_MODAL_ORNATE_HEIGHT_PX = 380;

type IsoModalProps = {
  document: Document | undefined;
  visible?: boolean;
  onHidePress: () => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
};

const IsoModal: React.FC<IsoModalProps> = ({
  document,
  visible,
  onOrnateRef,
  onHidePress,
}) => {
  const { client } = useAuthContext();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (document) {
      (async () => {
        const result = await Promise.all(
          [document].map(async (document) => ({
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
    }
  }, [document]);

  if (!isInitialized) {
    return null;
  }

  return (
    <div
      style={{
        visibility: visible ? undefined : 'hidden',
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
          height: `${ISO_MODAL_ORNATE_HEIGHT_PX}px`,
          width: `${ISO_MODAL_ORNATE_WIDTH_PX}px`,
          border: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
        }}
      >
        <ReactOrnate
          onOrnateRef={onOrnateRef}
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
