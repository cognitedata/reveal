/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  useClickedNodeData,
  useCameraNavigation,
  type AddResourceOptions,
  type FdmAssetStylingGroup,
  CadModelContainer
} from '../src';
import { Color, Matrix4 } from 'three';
import { type ReactElement, useState, useEffect } from 'react';
import { AddModelOptions, DefaultNodeAppearance } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { type AssetMappingStylingGroup } from '../src/components/Reveal3DResources/types';
import { ColorOverlayRules } from '../src/components/ColorOverlayRules/ColorOverlayRules';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';

const meta = {
  title: 'Example/ColorOverlay',
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
        modelId: 4319392643513894,
        revisionId: 91463736617758,
        styling: {
          default: {
            color: new Color('#efefef')
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
  const [resourceIsLoaded, setResourceIsLoaded] = useState<boolean>(false);

  const modelOptions = {
    modelId: 4319392643513894,
    revisionId: 91463736617758,
    
  };
  const transform = new Matrix4().makeTranslation(0, 10, 0);
  const onLoaded = (): void => {
    setResourceIsLoaded(true);
  };
  const rulesTest = [
    {
      colorRuleName: 'ABC indication Rule',
      rulerTriggerType: 'metadata',
      sourceField: ['ABC indication', 'ABC indic.'],
      isStringRule: true,
      subHierarchyAggregationMethod: 'none',
      threeDObjects: 'all',
      conditions: [
        {
          valueString: 'D',
          color: '#ACD123'
        },
        {
          valueString: 'L',
          color: '#00FF00'
        },
        {
          valueString: 'S',
          color: '#FF0000'
        },
        {
          valueString: 'M',
          color: '#FFFF00'
        },
        {
          valueString: 'H',
          color: '#FFDC00'
        },
        {
          valueString: 'F',
          color: '#CC00FF'
        }
      ]
    },
    {
      colorRuleName: 'Scalar Test',
      rulerTriggerType: 'metadata',
      sourceField: ['Room'],
      isStringRule: false,
      subHierarchyAggregationMethod: 'none',
      threeDObjects: 'all',
      conditions: [
        {
          description: 'Below retiring limit',
          valueMax: '1.0',
          valueMin: '0.0',
          color: '#ff0000'
        },
        {
          description: 'Close to retiring limit',
          valueMax: '1.5',
          valueMin: '1.0',
          color: '#ffdc00'
        },
        {
          description: 'Nominal',
          valueMax: '999.0',
          valueMin: '1.5',
          color: '#00ff00'
        }
      ]
    }
  ];
  return (
    <>
      <RevealResourcesFitCameraOnLoad onResourcesAdded={onLoaded} resources={resources} />
      {resourceIsLoaded && <ColorOverlayRules addModelOptions={modelOptions} rules={rulesTest} />}
    </>
  );
};
