/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { ToolbarTool } from './ToolbarTool';
import { createGlContext, mockClientAuthentication } from '../../../../test-utilities';
import * as THREE from 'three';

describe(ToolbarTool.name, () => {
  let viewer: Cognite3DViewer;
  let tool: ToolbarTool;

  let canvasContainer: HTMLDivElement;

  const styles = {
    container: 'reveal-viewer-toolbar-container',
    bottom: 'reveal-viewer-toolbar-container--bottom'
  };

  beforeEach(() => {
    const sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      getToken: async () => 'dummy'
    });
    mockClientAuthentication(sdk);

    const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
    const renderer = new THREE.WebGLRenderer({ context });
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

    tool.addToolbarButton('', iconClicked, 'Tooltip1');
    tool.addToolbarButton('', iconClicked, 'Tooltip2');
    tool.addToolbarButton('', iconClicked, 'Tooltip3');

    expect(createElementMock).toBeCalledTimes(6);

    expect(toolbarContainer[0].hasChildNodes()).toBeTrue;

    expect(toolbarContainer[0].childElementCount).toBe(3);
  });

  test('Set Position of toolbar', () => {
    const toolbarContainer = canvasContainer.getElementsByClassName(styles.container);

    expect(toolbarContainer[0].classList.contains(styles.bottom));

    tool.setPosition('bottom');

    expect(toolbarContainer[0].classList.contains(styles.container));
  });

  test('Add Axis Tool, screenshot tool, camera target click toggle, zoom past, camera fit to model to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');
    const toolbarContainer = canvasContainer.getElementsByClassName(styles.container);

    expect(toolbarContainer[0].hasChildNodes()).toBeFalse;

    tool.addAxisToolToggle();
    tool.addTakeScreenshotTool();
    tool.addCameraTargetOnClickToggle();
    tool.addZoomPastToCursorToggle();
    tool.addFitCameraToModel();

    expect(createElementMock).toBeCalledTimes(10);

    expect(toolbarContainer[0].hasChildNodes()).toBeTrue;

    expect(toolbarContainer[0].childElementCount).toBe(5);
  });
});
