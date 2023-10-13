/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Image360CollectionContainer, RevealContainer } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';
import { type ReactElement } from 'react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { use360Annotations } from '../src/hooks/use360Annotations';
import styled from 'styled-components';

const meta = {
  title: 'Example/AnnotationAsset',
  component: Image360CollectionContainer,
  tags: ['autodocs']
} satisfies Meta<typeof Image360CollectionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

const TableContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ccc;
  }

  th {
    background-color: #f2f2f2;
  }
`;

type AnnotationAssetElementsProps = {
  siteId: string;
};

function AnnotationAssetElements({ siteId }: AnnotationAssetElementsProps): ReactElement {
  const annotations = use360Annotations(sdk, [siteId] ?? ['celanese1']);

  return (
    <>
      {annotations.length > 0 && (
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                {Object.keys(annotations[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {annotations.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, i) => (
                    <td key={i}>
                      {typeof value === 'object' && value instanceof Date
                        ? value.toString()
                        : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      )}
    </>
  );
}

const queryClient = new QueryClient();

export const Main: Story = {
  args: {
    siteId: 'celanese1'
  },
  render: ({ siteId }) => (
    <>
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <Image360CollectionContainer siteId={siteId} />
      </RevealContainer>
      <QueryClientProvider client={queryClient}>
        <AnnotationAssetElements siteId={siteId} />
      </QueryClientProvider>
    </>
  )
};
