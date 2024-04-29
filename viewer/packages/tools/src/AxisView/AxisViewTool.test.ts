/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@reveal/api';
import * as THREE from 'three';

import { mockClientAuthentication, populateWebGLRendererMock } from '../../../../test-utilities';

import { AxisViewTool } from './AxisViewTool';
import { defaultAxisBoxConfig } from './types';

import { jest } from '@jest/globals';
import { Mock } from 'moq.ts';

describe('AxisViewTool', () => {
  let canvasContainer: HTMLElement;
  let domSize: { height: number; width: number };
  let viewer: Cognite3DViewer;

  beforeEach(() => {
    const sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      getToken: async () => 'dummy'
    });
    mockClientAuthentication(sdk);
    const renderer = populateWebGLRendererMock(new Mock<THREE.WebGLRenderer>()).object();
    renderer.render = jest.fn();

    domSize = { height: 480, width: 640 };
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = `${domSize.width}px`;
    canvasContainer.style.height = `${domSize.height}px`;
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  });

  test('Creation of tool', () => {
    const xPosition = 123;
    const yPosition = 234;
    const tool = new AxisViewTool(viewer, { position: { xAbsolute: xPosition, yAbsolute: yPosition } });
    expect((tool as any)._screenPosition.x).toBe(xPosition);
    expect((tool as any)._screenPosition.y).toBe(yPosition);
  });

  test('Click of tool', () => {
    const xPosition = 123;
    const yPosition = 234;

    const size = 100;

    const tool = new AxisViewTool(viewer, { size: size, position: { xAbsolute: xPosition, yAbsolute: yPosition } });

    expect((tool as any).handleClick(xPosition + size / 2, yPosition - size / 2, domSize)).toBeTrue();

    expect((tool as any).handleClick(xPosition + size / 2, yPosition + size / 2, domSize)).toBeFalse();
    expect((tool as any).handleClick(xPosition - size / 2, yPosition - size / 2, domSize)).toBeFalse();

    expect((tool as any).handleClick(0, 0, domSize)).toBeFalse();
    expect((tool as any).handleClick(domSize.width, 0, domSize)).toBeFalse();
    expect((tool as any).handleClick(0, domSize.height, domSize)).toBeFalse();
    expect((tool as any).handleClick(domSize.width, domSize.height, domSize)).toBeFalse();
  });

  test('Test custom configuration', () => {
    const config = { size: 123, position: { xAbsolute: 234, yAbsolute: 345 } };

    const tool = new AxisViewTool(viewer, config);

    expect((tool as any)._layoutConfig.size).toBe(config.size);

    expect((tool as any)._layoutConfig.position.xAbsolute).toBe(config.position.xAbsolute);
    expect((tool as any)._layoutConfig.position.yAbsolute).toBe(config.position.yAbsolute);

    Object.entries((tool as any)._layoutConfig).forEach((entry: any) => {
      if (!(config as any)[entry[0]]) {
        expect(entry[1]).toStrictEqual((defaultAxisBoxConfig as any)[entry[0]]);
      }
    });
  });
});
