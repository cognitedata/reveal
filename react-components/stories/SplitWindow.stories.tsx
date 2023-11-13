/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  RevealContainer,
  withSuppressRevealEvents,
  PointCloudContainer
} from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';
import styled from 'styled-components';
import { type ReactElement } from 'react';
import { SplitWidget } from '../src/components/Widgets/SplitWidget';

const meta = {
  title: 'Example/SplitWindow',
  component: PointCloudContainer,
  tags: ['autodocs']
} satisfies Meta<typeof PointCloudContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

const SuppressedDiv = withSuppressRevealEvents(styled.div``);

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 3865289545346058,
      revisionId: 4160448151596909
    }
  },
  render: ({ addModelOptions }) => {
    return (
      <>
        <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)} appLanguage={'en'}>
          <PointCloudContainer addModelOptions={addModelOptions} />
          <SuppressedDiv classname="suppresed-div">
            <SplitWidget>{<SecondaryRevealContainer />} </SplitWidget>
          </SuppressedDiv>
        </RevealContainer>
      </>
    );
  }
};

function SecondaryRevealContainer(): ReactElement {
  return (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)} appLanguage={'en'}>
      <CadModelContainer
        addModelOptions={{ modelId: 1791160622840317, revisionId: 498427137020189 }}
      />
    </RevealContainer>
  );
}
