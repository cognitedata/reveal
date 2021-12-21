import { Button, Modal, TextInput, Icon } from '@cognite/cogs.js';
import { Drawing } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState } from 'react';
import layers from 'utils/z';
import {
  LineReview,
  DocumentType,
  DocumentConnection,
} from 'modules/lineReviews/types';

import { getDocumentUrl } from '../../modules/lineReviews/api';
import { DocumentId } from '../../modules/lineReviews/mocks';

import IsoModal from './IsoModal';
import ReactOrnate, { ReactOrnateProps } from './ReactOrnate';

type LineReviewViewerProps = {
  lineReview: LineReview;
};

const getDocumentOpacities = (): Drawing[] => {
  const PID_1: Drawing[] = [
    {
      id: '77c58677-7dd5-47d7-9a36-4141b5386a38',
      groupId: DocumentId.PID_DOCUMENT_1,
      type: 'rect',
      attrs: {
        id: '77c58677-7dd5-47d7-9a36-4141b5386a38',
        x: 65.94872358203493,
        y: 256.876083112572,
        width: 2355.1116288604744,
        height: 575.4218866355695,
        fill: 'rgba(255,255,255,0.8)',
        strokeWidth: 0,
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_1,
      },
    },
    {
      id: '7322031a-e61f-4c74-82c0-dec22bcf9476',
      groupId: DocumentId.PID_DOCUMENT_1,
      type: 'rect',
      attrs: {
        id: '7322031a-e61f-4c74-82c0-dec22bcf9476',
        x: 58.157711577298016,
        y: 836.7499766079911,
        width: 486.38174943857615,
        height: 623.2809603789535,
        fill: 'rgba(255,255,255,0.8)',
        strokeWidth: 0,
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_1,
      },
    },
    {
      id: '793e891a-13b4-483c-bd5d-4dafc37d0293',
      groupId: DocumentId.PID_DOCUMENT_1,
      type: 'rect',
      attrs: {
        id: '793e891a-13b4-483c-bd5d-4dafc37d0293',
        x: 546.7394418451793,
        y: 1459.8301461020578,
        width: 1486.970291189789,
        height: -287.15444246030347,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_1,
        draggable: false,
        rotation: 0,
        scaleX: 0.9947954798765213,
        scaleY: 0.9598418230253337,
      },
    },
    {
      id: '9e9ebe21-bfdb-4dce-b32a-c797d7a9a91d',
      groupId: DocumentId.PID_DOCUMENT_1,
      type: 'rect',
      attrs: {
        id: '9e9ebe21-bfdb-4dce-b32a-c797d7a9a91d',
        x: 974.1581229913671,
        y: 835.6369748930288,
        width: 1460,
        height: 288.26744417526584,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_1,
        scaleX: 1,
        scaleY: 1,
      },
    },
    {
      id: '9e9ebe21-bfdb-4dce-b32a-c797d7a9a91d',
      groupId: DocumentId.PID_DOCUMENT_1,
      type: 'rect',
      attrs: {
        id: '9e9ebe21-bfdb-4dce-b32a-c797d7a9a91d',
        x: 774.1581229913671,
        y: 20,
        width: 960,
        height: 288.26744417526584,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_1,
        scaleX: 1,
        scaleY: 1,
      },
    },
  ];

  const PID_2: Drawing[] = [
    {
      id: 'a1eb6734-a002-455f-bb9b-e86ec39aac3e',
      type: 'rect',
      groupId: DocumentId.PID_DOCUMENT_2,
      attrs: {
        id: 'a1eb6734-a002-455f-bb9b-e86ec39aac3e',
        x: 81.6312165263962,
        y: 32.20543228768186,
        width: 905.467482785004,
        height: 449.86228003060444,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_2,
      },
    },
    {
      id: '879c33b8-4678-4d93-a265-eea3454d7b00',
      type: 'rect',
      groupId: DocumentId.PID_DOCUMENT_2,
      attrs: {
        id: '879c33b8-4678-4d93-a265-eea3454d7b00',
        x: 1013.8990053557764,
        y: 258.0937260902832,
        width: 1416.5876052027543,
        height: 1183.0420811017598,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_2,
      },
    },
    {
      id: '84213992-cfa7-4167-b99f-baf49ce6d8b4',
      type: 'rect',
      groupId: DocumentId.PID_DOCUMENT_2,
      attrs: {
        id: '84213992-cfa7-4167-b99f-baf49ce6d8b4',
        x: 1299.1308339709258,
        y: 30.29112471308354,
        width: 1135.1843917368014,
        height: 227.80260137719966,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_2,
      },
    },
    {
      id: '27fc39a3-856d-47fa-8932-757269c2835d',
      type: 'rect',
      groupId: DocumentId.PID_DOCUMENT_2,
      attrs: {
        id: '27fc39a3-856d-47fa-8932-757269c2835d',
        x: 64.72338192751567,
        y: 962.4768248894226,
        width: 406.0770139564311,
        height: 137.85640326196187,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_2,
      },
    },
  ];

  const PID_3: Drawing[] = [
    {
      id: 'fca00b33-0566-4295-8827-ae2900c3cb88',
      type: 'rect',
      groupId: DocumentId.PID_DOCUMENT_3,
      attrs: {
        id: 'fca00b33-0566-4295-8827-ae2900c3cb88',
        x: 735.2645735417245,
        y: 19.95858954405386,
        width: 594.8803488586827,
        height: 632.3413280059549,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_3,
      },
    },
    {
      id: '4952fe77-eec2-4017-b918-5fea4f5d2765',
      type: 'rect',
      groupId: DocumentId.PID_DOCUMENT_3,
      attrs: {
        id: '4952fe77-eec2-4017-b918-5fea4f5d2765',
        x: 1592.3717764313133,
        y: 799.1469558073159,
        width: -262.226854030906,
        height: -445.03643226959383,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_3,
      },
    },
    {
      id: 'd5df38d2-0f50-43cd-94da-f1bf12bcb462',
      type: 'rect',
      groupId: DocumentId.PID_DOCUMENT_3,
      attrs: {
        id: 'd5df38d2-0f50-43cd-94da-f1bf12bcb462',
        x: 2428.5008309984287,
        y: 1125.8066939715295,
        width: -923.0385261887868,
        height: -368.61603480915846,
        fill: 'rgba(255,255,255,0.8)',
        userGenerated: true,
        type: 'rect',
        name: 'drawing',
        inGroup: DocumentId.PID_DOCUMENT_3,
      },
    },
  ];

  return [...PID_1, ...PID_2, ...PID_3];
};

const connections: DocumentConnection[] = [
  ['CONNECT_ANNOTATION_1', 'CONNECT_ANNOTATION_2'],
  ['CONNECT_ANNOTATION_3', 'CONNECT_ANNOTATION_4'],
];

const LineReviewViewer: React.FC<LineReviewViewerProps> = ({ lineReview }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [documents, setDocuments] = useState<
    ReactOrnateProps['documents'] | undefined
  >(undefined);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [isIsoModalOpen, setIsIsoModalOpen] = useState(false);
  const { client } = useAuthContext();

  const updateDrawings = () => {
    setDrawings([
      {
        id: 'DISCREPANCY',
        type: 'line',
        groupId: DocumentId.PID_DOCUMENT_1,
        attrs: {
          points: [
            820.7412073300046, 986.1067820019232, 820.7412073300046,
            1140.2631877622773, 2093.1432866218165, 1141.486651300058,
            2091.919823084036, 1243.0341249358469,
          ],
          stroke: '#CF1A17',
          dash: [6, 6],
          strokeWidth: 6,
          userGenerated: true,
          name: 'drawing',
          type: 'line',
          unselectable: true,
        },
        onClick: () => {
          setIsDiscrepancyModalOpen(true);
        },
      },
      ...getDocumentOpacities(),
    ]);
  };

  const [drawings, setDrawings] = useState<Drawing[]>([
    {
      id: 'DISCREPANCY',
      type: 'line',
      groupId: DocumentId.PID_DOCUMENT_1,
      attrs: {
        points: [
          820.7412073300046, 986.1067820019232, 820.7412073300046,
          1140.2631877622773, 2093.1432866218165, 1141.486651300058,
          2091.919823084036, 1243.0341249358469,
        ],
        stroke: 'rgba(0,0,0,0.01)',
        strokeWidth: 30,
        userGenerated: true,
        name: 'drawing',
        type: 'line',
        unselectable: true,
      },
      onClick: () => {
        setIsDiscrepancyModalOpen(true);
      },
    },
    ...getDocumentOpacities(),
  ]);

  useEffect(() => {
    (async () => {
      setDocuments(
        await Promise.all([
          ...lineReview.documents
            .filter(({ type }) => type === DocumentType.PID)
            .map(async (document, index) => ({
              id: document.id,
              url: await getDocumentUrl(client, document),
              pageNumber: 1,
              annotations: document.annotations,
              row: 1,
              column: index + 1,
            })),
          ...lineReview.documents
            .filter(({ type }) => type === DocumentType.ISO)
            .map(async (document, index) => ({
              id: document.id,
              url: await getDocumentUrl(client, document),
              pageNumber: 1,
              annotations: document.annotations,
              row: 2,
              column: index + 2,
            })),
        ])
      );
      setIsInitialized(true);
    })();
  }, []);

  if (!isInitialized || !documents) {
    return null;
  }

  // --TODO: Be able to modify drawings from here and they will be adopted by ReactOrnate
  return (
    <>
      <Modal
        visible={isDiscrepancyModalOpen}
        onCancel={() => {
          setIsDiscrepancyModalOpen(false);
        }}
        footer={null}
      >
        <h2>
          <Icon type="ExclamationMark" />
          Potential discrepancy
        </h2>
        <p>Branch line connection to 41_N757 not found in ISO.</p>
        <TextInput placeholder="Add comment..." style={{ width: '100%' }} />
        <div
          style={{
            marginTop: 16,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button style={{ marginRight: 8 }}>...</Button>
          <Button style={{ marginRight: 8 }}>Locate manually</Button>
          <Button
            type="primary"
            style={{ marginRight: 8 }}
            onClick={() => {
              setIsDiscrepancyModalOpen(false);
              updateDrawings();
            }}
          >
            Validate
          </Button>
        </div>
      </Modal>
      <IsoModal
        visible={isIsoModalOpen}
        onHidePress={() => setIsIsoModalOpen(false)}
      />
      <div
        style={{ height: 'calc(100vh - 180px - 60px)', position: 'relative' }}
      >
        {!isIsoModalOpen && (
          <div
            style={{
              position: 'absolute',
              right: 20,
              top: 20,
              zIndex: layers.OVERLAY,
            }}
          >
            <Button
              onClick={() => {
                setIsIsoModalOpen(true);
              }}
            >
              Open ISO
            </Button>
          </div>
        )}
        <ReactOrnate
          documents={documents}
          drawings={drawings}
          connections={connections}
        />
      </div>
    </>
  );
};

export default LineReviewViewer;
