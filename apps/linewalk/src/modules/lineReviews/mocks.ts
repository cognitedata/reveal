/* eslint-disable @typescript-eslint/no-loss-of-precision */

import DocumentId from './DocumentId';
import ISO_L132_1 from './parsing/ISO_L132_1';
import ISO_L132_2 from './parsing/ISO_L132_2';
import ISO_L29 from './parsing/ISO_L29';
import PID004 from './parsing/PID004';
import PID004Linking from './parsing/PID004-Linking';
import PID025 from './parsing/PID025';
import PID026 from './parsing/PID026';
import PID027 from './parsing/PID027';
import PID028 from './parsing/PID028';
import PID043 from './parsing/PID043';
import PID043Linking from './parsing/PID043-Linking';
import PID044 from './parsing/PID044';
import PID044Linking from './parsing/PID044-Linking';
import PID025Linking from './parsing/PID025-Linking';
import { DocumentType, LineReview, LineReviewStatus } from './types';
import PID025Opacities from './parsing/PID025-Opacities';
import PID026Linking from './parsing/PID026-Linking';
import PID026Opacities from './parsing/PID026-Opacities';
import PID027Linking from './parsing/PID027-Linking';
import PID028Opacities from './parsing/PID028-Opacities';
import PID028Linking from './parsing/PID028-Linking';
import PID027Opacities from './parsing/PID027-Opacities';

export const MOCK_LINE_REVIEW_0040_0029: LineReview = {
  id: 'LINE_REVIEW_ID_0029_123',
  name: 'G0040_L029',
  system: '09-Fractionator Overhead',
  status: LineReviewStatus.OPEN,
  assignees: [{ name: 'Garima' }],
  documents: [
    {
      id: DocumentId.PID_DOCUMENT_004,
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
        // {
        //   id: 'LINE_CORRECTION_ANNOTATION_1',
        //   markup: [
        //     // {
        //     //   type: 'line',
        //     //   min: [820.7412073300046, 986.1067820019232],
        //     //   max: [820.7412073300046, 1140.2631877622773],
        //     // },
        //     // {
        //     //   type: 'line',
        //     //   min: [820.7412073300046, 1141.486651300058],
        //     //   max: [2093.1432866218165, 1141.486651300058],
        //     // },
        //     // {
        //     //   type: 'line',
        //     //   min: [2091.919823084036, 1143.9335783756192],
        //     //   max: [2091.919823084036, 1243.0341249358469],
        //     // },
        //   ],
        //   externalId: 'ASSET_ID',
        //   resource: 'asset',
        // },
      ],
      type: DocumentType.PID,
      _annotations: PID004,
      _linking: PID004Linking.linking,
      _opacities: [
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a38',
          groupId: DocumentId.PID_DOCUMENT_004,
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
            inGroup: DocumentId.PID_DOCUMENT_004,
            unselectable: true,
          },
        },
        {
          id: '7322031a-e61f-4c74-82c0-dec22bcf9476',
          groupId: DocumentId.PID_DOCUMENT_004,
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
            inGroup: DocumentId.PID_DOCUMENT_004,
            unselectable: true,
          },
        },
        {
          id: '793e891a-13b4-483c-bd5d-4dafc37d0293',
          groupId: DocumentId.PID_DOCUMENT_004,
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
            inGroup: DocumentId.PID_DOCUMENT_004,
            draggable: false,
            rotation: 0,
            scaleX: 0.9947954798765213,
            scaleY: 0.9598418230253337,
            unselectable: true,
          },
        },
        {
          id: '9e9ebe21-bfdb-4dce-b32a-c797d7a9a91d',
          groupId: DocumentId.PID_DOCUMENT_004,
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
            inGroup: DocumentId.PID_DOCUMENT_004,
            scaleX: 1,
            scaleY: 1,
            unselectable: true,
          },
        },
        {
          id: '9e9ebe21-bfdb-4dce-b32a-c797d7a9a91d',
          groupId: DocumentId.PID_DOCUMENT_004,
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
            inGroup: DocumentId.PID_DOCUMENT_004,
            scaleX: 1,
            scaleY: 1,
            unselectable: true,
          },
        },
      ],
    },
    {
      id: DocumentId.PID_DOCUMENT_043,
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
      _annotations: PID043,
      _linking: PID043Linking.linking,
      _opacities: [
        {
          id: 'a1eb6734-a002-455f-bb9b-e86ec39aac3e',
          type: 'rect',
          groupId: DocumentId.PID_DOCUMENT_043,
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
            inGroup: DocumentId.PID_DOCUMENT_043,
            unselectable: true,
          },
        },
        {
          id: '879c33b8-4678-4d93-a265-eea3454d7b00',
          type: 'rect',
          groupId: DocumentId.PID_DOCUMENT_043,
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
            inGroup: DocumentId.PID_DOCUMENT_043,
            unselectable: true,
          },
        },
        {
          id: '84213992-cfa7-4167-b99f-baf49ce6d8b4',
          type: 'rect',
          groupId: DocumentId.PID_DOCUMENT_043,
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
            inGroup: DocumentId.PID_DOCUMENT_043,
            unselectable: true,
          },
        },
        {
          id: '27fc39a3-856d-47fa-8932-757269c2835d',
          type: 'rect',
          groupId: DocumentId.PID_DOCUMENT_043,
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
            inGroup: DocumentId.PID_DOCUMENT_043,
            unselectable: true,
          },
        },
      ],
    },
    {
      id: DocumentId.PID_DOCUMENT_044,
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
      _annotations: PID044,
      type: DocumentType.PID,
      _linking: PID044Linking.linking,
      _opacities: [
        {
          id: 'fca00b33-0566-4295-8827-ae2900c3cb88',
          type: 'rect',
          groupId: DocumentId.PID_DOCUMENT_044,
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
            inGroup: DocumentId.PID_DOCUMENT_044,
            unselectable: true,
          },
        },
        {
          id: '4952fe77-eec2-4017-b918-5fea4f5d2765',
          type: 'rect',
          groupId: DocumentId.PID_DOCUMENT_044,
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
            inGroup: DocumentId.PID_DOCUMENT_044,
            unselectable: true,
          },
        },
        {
          id: 'd5df38d2-0f50-43cd-94da-f1bf12bcb462',
          type: 'rect',
          groupId: DocumentId.PID_DOCUMENT_044,
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
            inGroup: DocumentId.PID_DOCUMENT_044,
            unselectable: true,
          },
        },
      ],
    },
    {
      id: DocumentId.ISO_DOCUMENT_L29,
      fileExternalId: 'G0040_L029-1',
      annotations: [],
      type: DocumentType.ISO,
      _annotations: ISO_L29,
      _opacities: [],
      _linking: [],
    },
  ],
  discrepancies: [],
};

export const MOCK_LINE_REVIEW_0040_0132: LineReview = {
  id: 'LINE_REVIEW_ID_0132_123',
  name: 'G0040_L132',
  system: '09-Fractionator Overhead',
  status: LineReviewStatus.OPEN,
  assignees: [{ name: 'Garima' }],
  documents: [
    {
      id: DocumentId.PID_DOCUMENT_025,
      fileExternalId: 'RBD_G0040_MF_4_25',
      annotations: [],
      type: DocumentType.PID,
      _annotations: PID025,
      _linking: PID025Linking,
      _opacities: PID025Opacities,
    },
    {
      id: DocumentId.PID_DOCUMENT_026,
      fileExternalId: 'RBD_G0040_MF_4_26',
      annotations: [],
      type: DocumentType.PID,
      _annotations: PID026,
      _linking: PID026Linking,
      _opacities: PID026Opacities,
    },
    {
      id: DocumentId.PID_DOCUMENT_027,
      fileExternalId: 'RBD_G0040_MF_4_27',
      annotations: [],
      type: DocumentType.PID,
      _annotations: PID027,
      _linking: PID027Linking,
      _opacities: PID027Opacities,
    },
    {
      id: DocumentId.PID_DOCUMENT_028,
      fileExternalId: 'RBD_G0040_MF_4_28',
      annotations: [],
      type: DocumentType.PID,
      _annotations: PID028,
      _linking: PID028Linking,
      _opacities: PID028Opacities,
    },
    {
      id: DocumentId.ISO_DOCUMENT_L132_1,
      fileExternalId: 'G0040_L132-1',
      annotations: [],
      type: DocumentType.ISO,
      _annotations: ISO_L132_1,
      _opacities: [],
      _linking: [],
    },
    {
      id: DocumentId.ISO_DOCUMENT_L132_2,
      fileExternalId: 'G0040_L132-2',
      annotations: [],
      type: DocumentType.ISO,
      _annotations: ISO_L132_2,
      _opacities: [],
      _linking: [],
    },
  ],
  discrepancies: [],
};
