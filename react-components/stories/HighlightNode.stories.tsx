/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  type FdmAssetMappingsConfig,
  RevealContainer,
  RevealToolbar,
  useReveal
} from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4 } from 'three';
import { type ReactElement, useEffect, useState } from 'react';
import { type PointerEventData } from '@cognite/reveal';
import { queryMappedData } from '../src/components/Reveal3DResources/queryMappedData';
import { useFdmSdk, useSDK } from '../src/components/RevealContainer/SDKProvider';

const DefaultFdmConfig: FdmAssetMappingsConfig = {
  source: {
    space: 'hf_3d_schema',
    version: '1',
    type: 'view',
    externalId: 'cdf_3d_connection_data'
  },
  global3dSpace: 'hf_3d_global_data',
  assetFdmSpace: 'hf_customer_a'
};

const meta = {
  title: 'Example/HighlightNode',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 2551525377383868,
      revisionId: 2143672450453400
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({ addModelOptions }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <CadModelContainer addModelOptions={addModelOptions} />
      <RevealToolbar />
      <Querier fdmConfig={DefaultFdmConfig} />
    </RevealContainer>
  )
};

const Querier = ({ fdmConfig }: { fdmConfig: FdmAssetMappingsConfig }): ReactElement => {
  const viewer = useReveal();
  const sdk = useSDK();
  const fdmClient = useFdmSdk();

  const [nodeData, setNodeData] = useState<any>(undefined);

  useEffect(() => {
    const queryAndSetData = (e: PointerEventData): void => {
      void (async (e: PointerEventData): Promise<void> => {
        const nodeData = await queryMappedData(viewer, sdk, fdmClient, fdmConfig, e);
        setNodeData(nodeData);
      })(e);
    };

    viewer.on('click', (e: PointerEventData) => {
      queryAndSetData(e);
    });

    return (): void => {
      viewer.off('click', queryAndSetData);
    };
  });

  return <>Clicked node content: {JSON.stringify(nodeData)}</>;
};
