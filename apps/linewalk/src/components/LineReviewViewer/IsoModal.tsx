/* eslint-disable no-underscore-dangle */
import { Button } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import React, { useEffect, useState } from 'react';
import layers from 'utils/z';

import { getDocumentUrl } from '../../modules/lineReviews/api';
import { WorkspaceTool } from '../WorkSpaceTools/WorkSpaceTools';
import { Document } from '../../modules/lineReviews/types';

import getDiscrepancyCircleMarkersForDocument from './getDiscrepancyCircleMarkersForDocument';
import { Discrepancy } from './LineReviewViewer';
import ReactOrnate from './ReactOrnate';

export const ISO_MODAL_ORNATE_WIDTH_PX = 600;
export const ISO_MODAL_ORNATE_HEIGHT_PX = 380;

type IsoModalProps = {
  documents: Document[] | undefined;
  visible?: boolean;
  discrepancies: Discrepancy[];
  onHidePress: () => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
};

const IsoModal: React.FC<IsoModalProps> = ({
  documents,
  visible,
  discrepancies,
  onOrnateRef,
  onHidePress,
}) => {
  const { client } = useAuthContext();
  const [fetchedDocuments, setFetchedDocuments] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (documents) {
      (async () => {
        const result = await Promise.all(
          documents.map(async (document, index) => ({
            id: document.id,
            url: await getDocumentUrl(client, document),
            pageNumber: 1,
            annotations: document.annotations,
            row: 1,
            column: index + 1,
          }))
        );

        setFetchedDocuments(result);
        setIsInitialized(true);
      })();
    }
  }, [document]);

  if (!isInitialized) {
    return null;
  }

  const drawings = documents?.flatMap((document) =>
    getDiscrepancyCircleMarkersForDocument(document, discrepancies)
  );

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
      <h2>
        Isometric Drawing{' '}
        {documents?.map(({ fileExternalId }) => fileExternalId).join(', ')}
      </h2>
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
          documents={fetchedDocuments}
          drawings={drawings}
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
