/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  type FdmAssetMappingsConfig,
  Reveal3DResources,
  RevealContainer,
  RevealToolbar,
  useClickedNode /* useClickedNode */
} from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';
// import { ClickedNode } from '../src/higher-order-components/ClickedNode';
import { type ReactElement, useEffect } from 'react';

import { DefaultFdmConfig } from './utilities/fdmConfig';

const meta = {
  title: 'Example/ClickedNode',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

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
    resources: [
      {
        modelId: 2551525377383868,
        revisionId: 2143672450453400
      }
    ],
    styling: {},
    fdmAssetMappingConfig: DefaultFdmConfig
  },
  render: ({ resources, fdmAssetMappingConfig }) => {
    return (
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <Reveal3DResources resources={resources} fdmAssetMappingConfig={fdmAssetMappingConfig} />
        <ClickedNodePrinter fdmConfig={fdmAssetMappingConfig} />
        <RevealToolbar />
      </RevealContainer>
    );
  }
};

const ClickedNodePrinter = ({
  fdmConfig
}: {
  fdmConfig: FdmAssetMappingsConfig | undefined;
}): ReactElement => {
  const clickedNode = useClickedNode(fdmConfig);
  useEffect(() => {
    console.log('Clicked node is ', clickedNode);
  }, [clickedNode?.nodeExternalId]);

  return <></>;
};
