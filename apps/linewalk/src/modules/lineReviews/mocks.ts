/* eslint-disable @typescript-eslint/no-loss-of-precision */

import DocumentId from './DocumentId';
import ISO_L132_1 from './parsing/ISO_L132_1';
import ISO_L132_2 from './parsing/ISO_L132_2';
import ISO_L29 from './parsing/ISO_L29';
import PID004 from './parsing/PID004';
import PID004Linking from './parsing/PID004-Connections';
import PID025 from './parsing/PID025';
import PID026 from './parsing/PID026';
import PID027 from './parsing/PID027';
import PID028 from './parsing/PID028';
import PID043 from './parsing/PID043';
import PID043Linking from './parsing/PID043-Connections';
import PID044 from './parsing/PID044';
import PID044Linking from './parsing/PID044-Connections';
import { DocumentType, LineReview, LineReviewStatus } from './types';

export const MOCK_LINE_REVIEW_0040_0029: LineReview = {
  id: 'LINE_REVIEW_ID_0029_123',
  name: 'G0040_L029',
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
  status: LineReviewStatus.OPEN,
  assignees: [{ name: 'Garima' }],
  documents: [
    {
      id: DocumentId.PID_DOCUMENT_025,
      fileExternalId: 'RBD_G0040_MF_4_25',
      annotations: [],
      type: DocumentType.PID,
      _annotations: PID025,
      _linking: [
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path594-path596',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path126-path26',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path582',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId:
              'path170-path174-path178-path182-path186-path190-path194-path198-path202-path206-path210-path214-path218-path222-path226-path230',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1360-path1362',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path318-path326-path330-path334',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path164-path166',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path398-path402-path406',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path4352-path4354',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path3904-path3908-path3912',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1270-path1274',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path978-path982-path994',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1876-path1878-path1880',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path1006-path1010-path986',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1286-path1288',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path912-path940',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1256',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId:
              'path2074-path2078-path2082-path2086-path2090-path2094-path2098-path2102-path2106-path2110-path2114-path2118-path2122-path2126-path2130-path2134',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1246',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path806-path814-path818-path822',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path102',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId:
              'path1056-path1060-path1064-path1068-path1072-path1076-path1080-path1084-path1088-path1092-path1096-path1100-path1104-path1108-path1112-path1116',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path116',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path1254-path1258-path1266-path1270-path1274-path1278',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path122',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path1734',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1908-path1910',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path1802-path1806-path1810',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1958-path1964-path1966-path1970',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path1934-path1946-path1950',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path6240-path6244',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path1958',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path6224-path6228',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path2184-path2192-path2196-path2200-path2204-path2208',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path2018-path2020',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path2932-path2936-path2940',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId:
              'path3612-path3614-path3616-path3618-path3622-path3626-path3630-path3634',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path2284-path2288-path2434',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path3600-path3602',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path2438-path2442',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path3580-path3586-path3588-path3592',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path2874-path2886-path2890',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path3566-path3568-path3572-path3574',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path2922-path2926-path2930-path2934-path2946-path2950',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path6364-path6368-path6374-path6376',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId: 'path2148-path2152-path554-path558-path562-path566',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path1986-path1990-path1992-path1994',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_1,
            instanceId:
              'path624-path628-path672-path674-path676-path678-path680-path682-path684-path688-path690-path692-path694-path696-path698-path704-path706-path708-path710-path712',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path3680-path3682-path3684-path3686',
          },
          to: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path14364-path14366-path14368',
          },
        },
      ],
      _opacities: [
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a381',
          groupId: DocumentId.PID_DOCUMENT_025,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a381',
            x: 360.94872358203493,
            y: 40.876083112572,
            width: 2000.1116288604744,
            height: 220.4218866355695,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_025,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a382',
          groupId: DocumentId.PID_DOCUMENT_025,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a382',
            x: 650.94872358203493,
            y: 260.876083112572,
            width: 1750.1116288604744,
            height: 660.4218866355695,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_025,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a383',
          groupId: DocumentId.PID_DOCUMENT_025,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a383',
            x: 70,
            y: 600,
            width: 700,
            height: 800,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_025,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a384',
          groupId: DocumentId.PID_DOCUMENT_025,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a384',
            x: 70,
            y: 350,
            width: 430,
            height: 250,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_025,
            unselectable: true,
          },
        },
      ],
    },
    {
      id: DocumentId.PID_DOCUMENT_026,
      fileExternalId: 'RBD_G0040_MF_4_26',
      annotations: [
        {
          id: 'CONNECT_ANNOTATION_L132_2',
          markup: [
            {
              type: 'rect',
              min: [0.9127272727272727, 0.7154929577464789],
              max: [0.9736363636363636, 0.7338028169014085],
            },
          ],
          externalId: 'ASSET_ID',
          resource: 'asset',
        },
      ],
      type: DocumentType.PID,
      _annotations: PID026,
      _linking: [
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path15820-path15822-path15826-path15828',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path3824-path3828-path3832-path3836-path3844-path3848',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11390-path11392',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path1202-path1226',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11672',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path3642',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11578-path11582-path11584-path11586',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path1152-path1160-path1188-path4902-path4906',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path16376-path16380-path16390-path16392',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path4950-path4958-path4962-path4966-path4978-path4982',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId:
              'path16256-path16258-path16260-path16264-path16268-path16272-path16276-path16280',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId:
              'path4986-path4988-path4990-path4992-path4994-path4996-path5000-path5092',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11548-path11552',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path4296-path4300-path4328-path4336-path4340-path4344',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11562-path11566-path11956-path11958',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path4810-path4814-path4818-path4822-path4834-path4838',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11526-path11530',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId:
              'path4670-path4674-path4684-path4686-path4688-path4690-path4692-path4694-path4696-path4698-path4700-path4702-path4704-path4706-path4710-path4714-path4716-path4718-path4720-path4736-path4738',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11612-path11616',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId:
              'path2062-path2066-path2162-path2164-path2166-path2168-path2170-path2172-path2174-path2176-path2178-path2182-path2184-path2186-path2188-path2208-path2212-path2214-path2216-path2218-path2220',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path11612-path11616',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId:
              'path2062-path2066-path2162-path2164-path2166-path2168-path2170-path2172-path2174-path2176-path2178-path2182-path2184-path2186-path2188-path2208-path2212-path2214-path2216-path2218-path2220',
          },
        },
      ],
      _opacities: [
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a385',
          groupId: DocumentId.PID_DOCUMENT_026,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a385',
            x: 750,
            y: 70,
            width: 1550,
            height: 1350,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_026,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a386',
          groupId: DocumentId.PID_DOCUMENT_026,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a386',
            x: 50,
            y: 250,
            width: 450,
            height: 300,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_026,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a387',
          groupId: DocumentId.PID_DOCUMENT_026,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a387',
            x: 50,
            y: 950,
            width: 700,
            height: 400,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_026,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a388',
          groupId: DocumentId.PID_DOCUMENT_026,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a388',
            x: 350,
            y: 70,
            width: 400,
            height: 300,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_026,
            unselectable: true,
          },
        },
      ],
    },
    {
      id: DocumentId.PID_DOCUMENT_027,
      fileExternalId: 'RBD_G0040_MF_4_27',
      annotations: [],
      type: DocumentType.PID,
      _annotations: PID027,
      _linking: [
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_027,
            instanceId: 'path22168-path22170-path22172-path22174',
          },
          to: {
            documentId: DocumentId.PID_DOCUMENT_025,
            instanceId: 'path6300-path6302-path6304',
          },
        },
      ],
      _opacities: [
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a389',
          groupId: DocumentId.PID_DOCUMENT_027,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a389',
            x: 700,
            y: 50,
            width: 1690,
            height: 1350,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_027,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a390',
          groupId: DocumentId.PID_DOCUMENT_027,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a390',
            x: 110,
            y: 650,
            width: 600,
            height: 750,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_027,
            unselectable: true,
          },
        },
      ],
    },
    {
      id: DocumentId.PID_DOCUMENT_028,
      fileExternalId: 'RBD_G0040_MF_4_28',
      annotations: [],
      type: DocumentType.PID,
      _annotations: PID028,
      _linking: [
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_028,
            instanceId: 'path6142',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path1562-path1570-path1574-path1578-path1582-path1586',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_028,
            instanceId: 'path6148',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path1936',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_028,
            instanceId: 'path5942-path7596-path7598',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId:
              'path1952-path1956-path1962-path1966-path1970-path1974-path1976-path1982',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_028,
            instanceId: 'path6852-path6856',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId:
              'path1840-path1844-path1884-path1886-path1888-path1890-path1892-path1894-path1896-path1898-path1900-path1904-path1906-path1908-path1910-path1912-path1916-path1920',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_028,
            instanceId: 'path4816',
          },
          to: {
            documentId: DocumentId.ISO_DOCUMENT_L132_2,
            instanceId: 'path1944',
          },
        },
        {
          from: {
            documentId: DocumentId.PID_DOCUMENT_028,
            instanceId: 'path2408-path2410-path2412-path2414',
          },
          to: {
            documentId: DocumentId.PID_DOCUMENT_026,
            instanceId: 'path12990-path12992-path12994',
          },
        },
      ],
      _opacities: [
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a319',
          groupId: DocumentId.PID_DOCUMENT_028,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a319',
            x: 100,
            y: 50,
            width: 2300,
            height: 950,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_028,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a311',
          groupId: DocumentId.PID_DOCUMENT_028,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a311',
            x: 100,
            y: 1000,
            width: 1250,
            height: 450,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_028,
            unselectable: true,
          },
        },
        {
          id: '77c58677-7dd5-47d7-9a36-4141b5386a312',
          groupId: DocumentId.PID_DOCUMENT_028,
          type: 'rect',
          attrs: {
            id: '77c58677-7dd5-47d7-9a36-4141b5386a312',
            x: 1300,
            y: 1300,
            width: 900,
            height: 150,
            fill: 'rgba(255,255,255,0.8)',
            strokeWidth: 0,
            userGenerated: true,
            type: 'rect',
            name: 'drawing',
            inGroup: DocumentId.PID_DOCUMENT_028,
            unselectable: true,
          },
        },
      ],
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
