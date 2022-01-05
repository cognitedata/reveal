/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { ToolbarTool } from './ToolbarTool';
import { createGlContext, mockClientAuthentication } from '../../../../test-utilities';
import * as THREE from 'three';

describe('ToolbarTool', () => {
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  mockClientAuthentication(sdk);

  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  const styles = {
    container: 'reveal-viewer-toolbar-container',
    bottom: 'reveal-viewer-toolbar-container--bottom'
  };
  const canvasContainer = document.createElement('div');
  canvasContainer.style.width = '640px';
  canvasContainer.style.height = '480px';

  const viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  const models = viewer.models.slice();
  const tool = new ToolbarTool(viewer, models[0]);

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
  });

  test('Set Position of toolbar', () => {
    const toolbarContainer = canvasContainer.getElementsByClassName(styles.container);

    expect(toolbarContainer[0].classList.contains(styles.bottom));

    tool.setPosition('bottom');

    expect(toolbarContainer[0].classList.contains(styles.container));
  });

  test('Add Axis Tool to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');

    tool.addAxisToolToggle();

    expect(createElementMock).toBeCalledTimes(2);
  });

  test('Add take screenshot tool to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');

    tool.addTakeScreenshotTool();

    expect(createElementMock).toBeCalledTimes(2);
  });

  test('Add Camera target on click toggle to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');

    tool.addCameraTargetOnClickToggle();

    expect(createElementMock).toBeCalledTimes(2);
  });

  test('Add Zoom past to cursor to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');

    tool.addZoomPastToCursorToggle();

    expect(createElementMock).toBeCalledTimes(2);
  });

  test('Add Fit camera to model to the Toolbar', () => {
    const createElementMock = jest.spyOn(document, 'createElement');

    tool.addFitCameraToModel();

    expect(createElementMock).toBeCalledTimes(2);
  });
});
