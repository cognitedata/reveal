/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { ToolbarTool } from './ToolbarTool';
// import { ToolbarPosition } from './Toolbar';
import { MetricsLogger } from '@reveal/metrics';
import { createGlContext } from '../../../../test-utilities';
import * as THREE from 'three';

describe('ToolbarTool', () => {
  let viewer: Cognite3DViewer;
  let canvasContainer: HTMLElement;
  let toolbar: ToolbarTool;
  let iconClicked: () => void;
  let createElement: any;
  
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  beforeAll(() => {
    MetricsLogger.init(false, '', '', {});
  });

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = '640px';
    canvasContainer.style.height = '480px';
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });

    toolbar = new ToolbarTool(viewer);
    iconClicked = jest.fn();
    createElement = document.createElement;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.createElement = createElement;
  });

  test('Add icon item to the Toolbar', () => {
    document.createElement = jest.fn().mockImplementation(() => {
      return 'BUTTON';
    });
    toolbar.addToolbarItem('Tooltip1', '', iconClicked);
    toolbar.addToolbarItem('Tooltip2', '', iconClicked);
    toolbar.addToolbarItem('Tooltip3', '', iconClicked);

    expect(document.createElement).toBeCalledTimes(3);
  });

  // test('Set Position of toolbar', () => {
  //   const position = ToolbarPosition.Bottom;
  //   toolbar.setPosition(position);

  //   // expect
  // });
});