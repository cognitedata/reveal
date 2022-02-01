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
import useDimensions from './useDimensions';

const INITIAL_WIDTH = 643;
const INITIAL_HEIGHT = 526;

type IsoModalProps = {
  documents: Document[] | undefined;
  visible?: boolean;
  discrepancies: Discrepancy[];
  onHidePress: () => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
};

const RESIZABLE_CORNER_SIZE = 15;

const IsoModal: React.FC<IsoModalProps> = ({
  documents,
  visible,
  discrepancies,
  onOrnateRef,
  onHidePress,
}) => {
  const [modalRef, setModalRef] = useState<HTMLElement | null>(null);
  const { client } = useAuthContext();
  const [fetchedDocuments, setFetchedDocuments] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    dimensions,
    onMove,
    onResizeBottomRight,
    onResizeBottomLeft,
    onResizeTopLeft,
    onResizeTopRight,
  } = useDimensions(modalRef, {
    width: INITIAL_WIDTH,
    height: INITIAL_HEIGHT,
    x: window.innerWidth - INITIAL_WIDTH - Math.round(window.innerWidth * 0.02),
    y: Math.round(window.innerHeight * 0.02),
  });

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
      ref={(ref) => setModalRef(ref)}
      style={{
        visibility: visible ? undefined : 'hidden',
        position: 'fixed',
        top: dimensions.y,
        left: dimensions.x,
        width: dimensions.width,
        height: dimensions.height,
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        borderRadius: 8,
        zIndex: layers.OVERLAY,
        padding: '25px 20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <h2>
          Isometric Drawing{' '}
          {documents?.map(({ fileExternalId }) => fileExternalId).join(', ')}
        </h2>
        <div
          style={{
            marginLeft: '16px',
          }}
        >
          <Button onClick={onHidePress}>Hide</Button>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          flexBasis: 0,
          flexGrow: 1,
          flexShrink: 1,
          border: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
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
          cursor: 'move',
          position: 'absolute',
          top: 0,
          left: RESIZABLE_CORNER_SIZE,
          right: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        role="button"
        tabIndex={-1}
        aria-label="Move"
        onMouseDown={onMove}
      />
      <div
        style={{
          cursor: 'nwse-resize',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        role="button"
        aria-label="Resize"
        tabIndex={-1}
        onMouseDown={onResizeBottomRight}
      />
      <div
        style={{
          cursor: 'nesw-resize',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeBottomLeft}
      />
      <div
        style={{
          cursor: 'nwse-resize',
          position: 'absolute',
          top: 0,
          left: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeTopLeft}
      />
      <div
        style={{
          cursor: 'nesw-resize',
          position: 'absolute',
          top: 0,
          right: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeTopRight}
      />
    </div>
  );
};

export default IsoModal;
