import React from 'react';
import styled from 'styled-components';
import { IAnnotation, IRectShapeData } from '@cognite/react-picture-annotation';
import { Colors } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';
import { FileViewer } from './FileViewer';

export default { title: 'Molecules|FileViewer' };

const imageSdk = ({
  files: {
    getDownloadUrls: async () => [{ downloadUrl: '//unsplash.it/800/400' }],
  },
} as unknown) as CogniteClient;

const pdfSdk = ({
  files: {
    getDownloadUrls: async () => [
      {
        downloadUrl:
          'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
      },
    ],
  },
} as unknown) as CogniteClient;

export const Example = () => (
  <Wrapper>
    <FileViewer
      file={{
        id: 1,
        lastUpdatedTime: new Date(),
        uploaded: false,
        createdTime: new Date(),
        name: 'Random File',
        mimeType: 'png',
      }}
      sdk={imageSdk}
    />
  </Wrapper>
);
export const ExampleWithPDF = () => (
  <Wrapper>
    <FileViewer
      file={{
        id: 1,
        lastUpdatedTime: new Date(),
        uploaded: false,
        createdTime: new Date(),
        name: 'Random File',
        mimeType: 'application/pdf',
      }}
      sdk={pdfSdk}
    />
  </Wrapper>
);

export const ExampleWithEditing = () => (
  <Wrapper>
    <FileViewer
      file={{
        id: 1,
        lastUpdatedTime: new Date(),
        uploaded: false,
        createdTime: new Date(),
        name: 'Random File',
        mimeType: 'png',
      }}
      sdk={imageSdk}
      creatable
    />
  </Wrapper>
);

export const ExampleWithAnnotations = () => (
  <Wrapper>
    <FileViewer
      file={{
        id: 1,
        lastUpdatedTime: new Date(),
        uploaded: false,
        createdTime: new Date(),
        name: 'Random File',
        mimeType: 'png',
      }}
      sdk={imageSdk}
      annotations={
        [
          {
            id: '1',
            mark: {
              x: 120,
              y: 200,
              width: 100,
              height: 100,
            },
            comment: 'Sample',
          },
          {
            id: '2',
            mark: {
              x: 0.1,
              y: 0.1,
              width: 0.1,
              height: 0.4,
            },
            comment: 'Percentage',
          },
        ] as IAnnotation<IRectShapeData>[]
      }
    />
  </Wrapper>
);

export const ExampleWithCustomization = () => (
  <Wrapper>
    <FileViewer
      file={{
        id: 1,
        lastUpdatedTime: new Date(),
        uploaded: false,
        createdTime: new Date(),
        name: 'Random File',
        mimeType: 'png',
      }}
      sdk={imageSdk}
      annotations={
        [
          {
            id: '1',
            mark: {
              x: 120,
              y: 200,
              width: 100,
              height: 100,
              strokeColor: Colors.midblue.hex(),
              backgroundColor: Colors['midblue-2'].hex(),
            },
            comment: 'Sample',
          },
        ] as IAnnotation<IRectShapeData>[]
      }
      renderItemPreview={() => <h1>Override</h1>}
    />
  </Wrapper>
);

const Wrapper = styled.div`
  width: 100%;
  height: 600px;
  background: grey;
`;
