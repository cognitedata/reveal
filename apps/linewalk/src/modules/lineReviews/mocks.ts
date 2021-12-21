import { DocumentType, LineReview, LineReviewStatus } from './types';

// const MOCK_LINE_REVIEW_ANNOTATION: DocumentAnnotation = {
//   min: [0.1, 0.1],
//   max: [0.15, 0.15],
//   status: 'UNCHECKED',
//   title: '',
//   description: '',
//   comments: [],
// };

export enum DocumentId {
  PID_DOCUMENT_1 = '2046569622287657',
  PID_DOCUMENT_2 = '5032835766307103',
  PID_DOCUMENT_3 = '8188746557002243',
  ISO_DOCUMENT_1 = '1267278914018112',
}

export const MOCK_LINE_REVIEW_0040_0029: LineReview = {
  id: 'LINE_REVIEW_ID_0029_123',
  name: 'G0040_L029',
  status: LineReviewStatus.OPEN,
  assignees: [{ name: 'Lindsey' }],
  documents: [
    {
      id: DocumentId.PID_DOCUMENT_1,
      fileExternalId: 'RBD_G0040_MF_4_27',
      annotations: [
        {
          id: 'CONNECT_ANNOTATION_1',
          markup: [
            {
              type: 'rect',
              min: [1004 / 1100, 508 / 710],
              max: [1071 / 1100, 521 / 710],
            },
          ],
          externalId: 'ASSET_ID',
          resource: 'asset',
        },
        {
          id: 'LINE_CORRECTION_ANNOTATION_1',
          markup: [
            // {
            //   type: 'line',
            //   min: [820.7412073300046, 986.1067820019232],
            //   max: [820.7412073300046, 1140.2631877622773],
            // },
            // {
            //   type: 'line',
            //   min: [820.7412073300046, 1141.486651300058],
            //   max: [2093.1432866218165, 1141.486651300058],
            // },
            // {
            //   type: 'line',
            //   min: [2091.919823084036, 1143.9335783756192],
            //   max: [2091.919823084036, 1243.0341249358469],
            // },
          ],
          externalId: 'ASSET_ID',
          resource: 'asset',
        },
      ],
      type: DocumentType.PID,
    },
    {
      id: DocumentId.PID_DOCUMENT_2,
      fileExternalId: 'RBD_G0040_MF_43_21',
      annotations: [
        {
          id: 'CONNECT_ANNOTATION_2',
          markup: [
            {
              type: 'rect',
              min: [29 / 1100, 263 / 710],
              max: [96 / 1100, 277 / 710],
            },
          ],
          externalId: 'ASSET_ID',
          resource: 'asset',
        },
        {
          id: 'CONNECT_ANNOTATION_3',
          markup: [
            {
              type: 'rect',
              min: [29 / 1100, 394 / 710],
              max: [96 / 1100, 408 / 710],
            },
          ],
          externalId: 'ASSET_ID',
          resource: 'asset',
        },
      ],
      type: DocumentType.PID,
    },
    {
      id: DocumentId.PID_DOCUMENT_3,
      fileExternalId: 'RBD_G0040_MF_44_14',
      annotations: [
        {
          id: 'CONNECT_ANNOTATION_4',
          markup: [
            {
              type: 'rect',
              min: [29 / 1100, 312 / 710],
              max: [96 / 1100, 326 / 710],
            },
          ],
          externalId: 'ASSET_ID',
          resource: 'asset',
        },
      ],
      type: DocumentType.PID,
    },
    {
      id: DocumentId.ISO_DOCUMENT_1,
      fileExternalId: '0040_ISO_74',
      annotations: [],
      type: DocumentType.ISO,
    },
  ],
  discrepancies: [],
};
