/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { ToolbarTool } from './ToolbarTool';
import { ToolbarPosition } from './Toolbar';
import { MetricsLogger } from '@reveal/metrics';
import { createGlContext } from '../../../../test-utilities';
import * as THREE from 'three';

describe('ToolbarTool', () => {
  let viewer: Cognite3DViewer;
  let canvasContainer: HTMLElement;
  let tool: ToolbarTool;

  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  const styles = {
    container: 'reveal-viewer-toolbar-container',
    bottom: 'reveal-viewer-toolbar-container--bottom'
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Add icon item to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');
    const toolbarContainer = canvasContainer.getElementsByClassName(styles.container);
    const iconClicked = jest.fn();

    expect(toolbarContainer[0]).not.toBeEmpty();

    tool.addToolbarItem('Tooltip1', '', true, iconClicked);
    tool.addToolbarItem('Tooltip2', '', false, iconClicked);
    tool.addToolbarItem('Tooltip3', '', false, iconClicked);

    expect(createElementMock).toBeCalledTimes(6);

    expect(toolbarContainer[0].hasChildNodes()).toBeTrue;

    expect(toolbarContainer[0].childElementCount).toBe(3);

    createElementMock.mockRestore();
  });

  test('Set Position of toolbar', () => {
    const toolbarContainer = canvasContainer.getElementsByClassName(styles.container);

    expect(toolbarContainer[0].classList.contains(styles.bottom));

    tool.setPosition(ToolbarPosition.Bottom);

    expect(toolbarContainer[0].classList.contains(styles.container));
  });
});
