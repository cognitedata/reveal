/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealCanvas, RevealContext } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';
import { useState, type ReactElement } from 'react';
import { WindowWidget } from '../src/components/Widgets/WindowWidget';

const meta = {
  title: 'Example/SplitWindow',
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
        modelId: 3865289545346058,
        revisionId: 4160448151596909
      }
    ]
  },
  render: ({ resources }) => {
    const [isWindowWidgetVisible, setIsWindowWidgetVisible] = useState(true);
    const handleClose = (): void => {
      setIsWindowWidgetVisible(false);
    };

    return (
      <>
        <RevealContext sdk={sdk} color={new Color(0x4a4a4a)} appLanguage={'en'}>
          <RevealCanvas>
            <Reveal3DResources resources={resources} />
            {isWindowWidgetVisible && (
              <WindowWidget header="Widget Header" onClose={handleClose}>
                <SecondaryRevealContainer />
              </WindowWidget>
            )}
          </RevealCanvas>
        </RevealContext>
      </>
    );
  }
};

function SecondaryRevealContainer(): ReactElement {
  return (
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)} appLanguage={'en'}>
      <RevealCanvas>
        <Reveal3DResources
          resources={[{ modelId: 3544114490298106, revisionId: 6405404576933316 }]}
        />
      </RevealCanvas>
    </RevealContext>
  );
}
