/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { CameraController, Reveal3DResources, RevealContainer, RevealKeepAlive } from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { useState, type ReactElement } from 'react';

const meta = {
  title: 'Example/RevealKeepAlive',
  component: RevealKeepAlive,
  tags: ['autodocs']
} satisfies Meta<typeof RevealKeepAlive>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  render: () => <KeepAliveMockScenario />
};

const KeepAliveMockScenario = (): ReactElement => {
  const [isKeepAliveMounted, setIsKeepAliveMounted] = useState(true);
  const [isRevealContainerMounted, setIsRevealContainerMounted] = useState(true);
  const [isResourcesMounted, setIsResourcesMounted] = useState(true);
  return (
    <>
      <button
        onClick={() => {
          setIsKeepAliveMounted((prev) => !prev);
        }}>
        Toggle Mounting of RevealKeepAlive
      </button>
      <button
        onClick={() => {
          setIsRevealContainerMounted((prev) => !prev);
        }}>
        Toggle Mounting of RevealContainer
      </button>
      <button
        onClick={() => {
          setIsResourcesMounted((prev) => !prev);
        }}>
        Toggle Mounting of 3DResources
      </button>
      {isKeepAliveMounted && (
        <RevealKeepAlive>
          {isRevealContainerMounted && (
            <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
              {isResourcesMounted && (
                <Reveal3DResources
                  resources={[
                    {
                      modelId: 1791160622840317,
                      revisionId: 498427137020189,
                      transform: new Matrix4().makeTranslation(40, 0, 0)
                    },
                    {
                      modelId: 1791160622840317,
                      revisionId: 498427137020189,
                      transform: new Matrix4().makeTranslation(40, 10, 0)
                    },
                    {
                      siteId: 'c_RC_2'
                    },
                    {
                      modelId: 3865289545346058,
                      revisionId: 4160448151596909
                    }
                  ]}
                />
              )}
              <CameraController
                initialFitCamera={{
                  to: 'cameraState',
                  state: { position: new Vector3(10, 20, 15), target: new Vector3(10, 0, -10) }
                }}
              />
            </RevealContainer>
          )}
        </RevealKeepAlive>
      )}
    </>
  );
};
