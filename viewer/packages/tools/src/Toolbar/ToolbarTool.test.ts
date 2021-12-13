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
  let tool: ToolbarTool;
  let iconClicked: () => void;
  
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  const styles = {
    container: 'reveal-viewer-toolbar-container',
    bottom: 'reveal-viewer-toolbar-container--bottom',
    top: 'reveal-viewer-toolbar-container--top',
    left: 'reveal-viewer-toolbar-container--left',
    right: 'reveal-viewer-toolbar-container--right',
    icon: 'reveal-viewer-toolbar-icon'
  };

  beforeAll(() => {
    MetricsLogger.init(false, '', '', {});
  });

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = '640px';
    canvasContainer.style.height = '480px';
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });

    tool = new ToolbarTool(viewer);
    iconClicked = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Add icon item to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');
    tool.addToolbarItem('Tooltip1', '', iconClicked);
    tool.addToolbarItem('Tooltip2', '', iconClicked);
    tool.addToolbarItem('Tooltip3', '', iconClicked);
    tool.addToolbarItem('Tooltip4', '', iconClicked);
    tool.addToolbarItem('Tooltip5', '', iconClicked);

    expect(createElementMock).toBeCalledTimes(10);

    createElementMock.mockRestore();
  });

  // test('Set Position of toolbar', () => {
  //   const position = ToolbarPosition.Bottom;
  //   toolbar.setPosition(position);

  //   // expect
  // });
});