/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  type AddResourceOptions,
  useClickedNodeData,
  type FdmAssetStylingGroup,
  useCameraNavigation
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useEffect, useRef } from 'react';
import { DefaultNodeAppearance } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

const meta = {
  title: 'Example/HighlightNode',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 2231774635735416,
        revisionId: 912809199849811,
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        }
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <StoryContent resources={resources} />
        <ReactQueryDevtools />
      </RevealContainer>
    );
  }
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined);
  const stylingGroupsRef = useRef<FdmAssetStylingGroup[]>([]);

  const nodeData = useClickedNodeData();
  const cameraNavigation = useCameraNavigation();

  useEffect(() => {
    setHighlightedId(nodeData?.fdmNode.externalId);

    if (nodeData === undefined) return;

    void cameraNavigation.fitCameraToInstance(nodeData.fdmNode.externalId, 'pdms-mapping');
  }, [nodeData?.fdmNode.externalId]);

  if (stylingGroupsRef.current.length === 1) {
    stylingGroupsRef.current.pop();
  }

  if (highlightedId !== undefined) {
    stylingGroupsRef.current.push({
      fdmAssetExternalIds: [{ externalId: highlightedId, space: 'pdms-mapping' }],
      style: { cad: DefaultNodeAppearance.Highlighted }
    });
  }

  return (
    <>
      <RevealResourcesFitCameraOnLoad
    resources={resources}
    defaultResourceStyling={{cad: {
      default: { color: new Color('#efefef') },
      mapped: { color: new Color('#c5cbff') },
    }}}
        instanceStyling={stylingGroupsRef.current}
      />
      <RevealToolbar />
    </>
  );
};
