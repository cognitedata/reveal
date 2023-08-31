import React, { useState } from 'react';

import { Meta } from '@storybook/react';

import { Avatar, Button, Menu, TopBar, A, Flex } from '@cognite/cogs.js';

import { Orientation as WalkthroughInternal } from './Orientation';
import { useOrientation, OrientationProvider } from './OrientationContext';
import { InternalStep } from './types';

export default {
  title: 'Components / Orientation',
} as Meta;

const steps: InternalStep[] = [
  {
    title: 'Step 1',
    icon: 'HeartFilled',
    description: 'This is the first step',
    target: '.step1',

    placement: 'bottom-start',
  },
  {
    title: 'Step 2',
    icon: 'HeartFilled',
    description: 'This is the second step',
    target: '.step2',
    placement: 'bottom-end',
  },
  {
    title: 'Step 3',
    icon: 'HeartFilled',
    placement: 'top-end',
    disableBeacon: true,
    description: (
      <div>
        This is the second step <A href="#">Read More</A>
      </div>
    ),
    target: '.step3',
  },
  {
    title: 'Step 4',
    placement: 'top-start',
    icon: 'HeartFilled',
    description: (
      <div>
        This is the second step <A href="#">Read More</A>
      </div>
    ),
    target: '.step4',
  },
];
const WalkthroughInner = ({
  isHotspotEnabled = false,
}: {
  isHotspotEnabled?: boolean;
}) => {
  const [_, setHelpCenterVisibility] = useState(false);

  const { handleState } = useOrientation();

  return (
    <div style={{ background: 'white' }}>
      <TopBar>
        <TopBar.Left>
          <TopBar.Logo title="Walkthrough Example" />
          <TopBar.Navigation
            links={[{ name: 'Table', isActive: true }, { name: 'Form' }]}
          />
        </TopBar.Left>
        <TopBar.Right>
          <TopBar.Actions
            actions={[
              {
                key: 'action1',
                icon: 'BarChart',
                menu: (
                  <Menu>
                    <Menu.Item>Menu item</Menu.Item>
                  </Menu>
                ),
                name: 'External Links',
              },
              {
                key: 'action2',
                icon: 'Help',
                onClick: () => setHelpCenterVisibility(true),
              },
              { key: 'action3', component: <Avatar text="Example User" /> },
            ]}
          />
        </TopBar.Right>
      </TopBar>

      <Flex style={{ padding: 40 }} justifyContent="space-around">
        <Button
          type="primary"
          onClick={() =>
            handleState((prev) => ({
              ...prev,
              open: true,
              enableHotspot: isHotspotEnabled,
              steps,
            }))
          }
        >
          Click here to start the demo
        </Button>
      </Flex>
      <main
        className="content"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',

          height: 300,
          alignItems: 'center',
        }}
      >
        <Button className="step1">Step 1</Button>
        <Button className="step2">Step 2</Button>
      </main>
      <Flex style={{ padding: 40 }} justifyContent="space-around">
        <Button className="step3">Step 3</Button>
        <Button className="step4">Step 4</Button>
      </Flex>
    </div>
  );
};

const BaseOrientation: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <OrientationProvider>
      <WalkthroughInternal />
      {children}
    </OrientationProvider>
  );
};

export const Orientation = () => (
  <BaseOrientation>
    <WalkthroughInner />
  </BaseOrientation>
);

export const OrientationWithHotspots = () => (
  <BaseOrientation>
    <WalkthroughInner isHotspotEnabled />
  </BaseOrientation>
);
