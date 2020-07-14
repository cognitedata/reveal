import { storiesOf } from '@storybook/react';
import 'antd/dist/antd.css';
import React from 'react';

import { DocumentTable } from './DocumentTable';

storiesOf('DocumentTable story', module)
  .add('DocumentTable', () => (
    <DocumentTable
      docs={[
        {
          id: 1,
          fileName: 'file name 1',
          metadata: {
            DOC_TITLE: 'document title 1',
            DOC_TYPE: 'XG',
          },
        },
        {
          id: 2,
          fileName: 'file name 2',
          metadata: {
            DOC_TITLE: 'document title 2',
            DOC_TYPE: 'XB',
          },
        },
        {
          id: 3,
          fileName: 'file name 3',
          metadata: {
            DOC_TITLE: 'document title 3',
            DOC_TYPE: 'XG',
          },
        },
      ]}
    />
  ))
  .add('Custom renderer', () => (
    <DocumentTable
      docs={[
        {
          id: 1,
          fileName: 'file name 1',
          metadata: {
            DOC_TITLE: 'document title 1',
            DOC_TYPE: 'VB',
          },
        },
        {
          id: 2,
          fileName: 'file name 2',
          metadata: {
            DOC_TITLE: 'document title 2',
            DOC_TYPE: 'MA',
          },
        },
        {
          id: 3,
          fileName: 'file name 3',
          metadata: {
            DOC_TITLE: 'document title 3',
            DOC_TYPE: 'XB',
          },
        },
        {
          id: 4,
          fileName: 'file name 4',
          metadata: {
            DOC_TITLE: 'document title 4',
            DOC_TYPE: 'XG',
          },
        },
        {
          id: 5,
          fileName: 'file name 5',
          metadata: {
            DOC_TITLE: 'document title 5',
            DOC_TYPE: 'AA',
          },
        },
      ]}
      documentRenderer={(document, i) => (
        <div>
          <h1>Document #{i + 1}</h1>
          <pre>{JSON.stringify(document, null, 2)}</pre>
        </div>
      )}
    />
  ))
  .add('With Category Sort', () => (
    <DocumentTable
      docs={[
        {
          id: 43,
          fileName: 'file name 43',
          metadata: {
            DOC_TITLE: 'document title 43',
            DOC_TYPE: 'VB',
          },
        },
        {
          id: 43,
          fileName: 'file name 43',
          metadata: {
            DOC_TITLE: 'document title 43',
            DOC_TYPE: 'MA',
          },
        },
        {
          id: 1,
          fileName: 'file name 1',
          metadata: {
            DOC_TITLE: 'document title 1',
            DOC_TYPE: 'XG',
          },
        },
        {
          id: 2,
          fileName: 'file name 2',
          metadata: {
            DOC_TITLE: 'document title 2',
            DOC_TYPE: 'XB',
          },
        },
        {
          id: 3,
          fileName: 'file name 3',
          metadata: {
            DOC_TITLE: 'document title 3',
            DOC_TYPE: 'XG',
          },
        },
        {
          id: 4,
          fileName: 'file name 4',
          metadata: {
            DOC_TITLE: 'document title 4',
            DOC_TYPE: 'VB',
          },
        },
        {
          id: 5,
          fileName: 'file name 5',
          metadata: {
            DOC_TITLE: 'document title 5',
            DOC_TYPE: 'AA',
          },
        },
      ]}
      categorySort={(a, b) => a.description.localeCompare(b.description)}
      documentRenderer={(document, i) => (
        <div>
          <h1>Document #{i + 1}</h1>
          <pre>{JSON.stringify(document, null, 2)}</pre>
        </div>
      )}
    />
  ))
  .add('Horizontally scrollable', () => (
    <DocumentTable
      docs={[
        {
          id: 1,
          fileName: 'Cat ipsum',
          metadata: {
            DOC_TITLE:
              'Cat ipsum dolor sit amet, fall over dead (not really but gets sympathy) litter kitter kitty litty little kitten big roar roar feed me but kitty ipsum dolor sit amet. Scratch the furniture attempt to leap between furniture but woefully miscalibrate and bellyflop onto the floor; whats your problem? i meant to do that',
            DOC_TYPE: 'XG',
          },
        },
        {
          id: 2,
          fileName: 'file name 2',
          metadata: {
            DOC_TITLE: 'document title 2',
            DOC_TYPE: 'XB',
          },
        },
        {
          id: 3,
          fileName: 'file name 3',
          metadata: {
            DOC_TITLE: 'document title 3',
            DOC_TYPE: 'XG',
          },
        },
      ]}
      scrollX={true}
    />
  ));
