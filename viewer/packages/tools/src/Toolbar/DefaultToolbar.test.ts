/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DModel, Cognite3DViewer } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { DefaultToolbar } from './DefaultToolbar';
import { MetricsLogger } from '@reveal/metrics';
import { createGlContext } from '../../../../test-utilities';
import { CadMaterialManager, CadNode } from '@reveal/rendering';
import { CadModelMetadata } from '@reveal/cad-parsers';
import { createCadModelMetadata, generateSectorTree } from '../../../../test-utilities';
import { NodesLocalClient } from '@reveal/nodes-api';

import * as THREE from 'three';

describe('ToolbarTool', () => {
  let viewer: Cognite3DViewer;
  let client: CogniteClient;
  let model: Cognite3DModel;
  let canvasContainer: HTMLElement;
  let defaultToolbar: DefaultToolbar;
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

    client = new CogniteClient({ appId: 'test', baseUrl: 'http://localhost' });
    client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });

    const materialManager = new CadMaterialManager();
    const cadRoot = generateSectorTree(3, 3);
    const cadMetadata: CadModelMetadata = createCadModelMetadata(cadRoot);
    materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

    const cadNode = new CadNode(cadMetadata, materialManager);
    const apiClient = new NodesLocalClient();

    model = new Cognite3DModel(1, 2, cadNode, apiClient);

    iconClicked = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Test Default Toolbar element creation', () => {
    const toolbarSpyOn = jest.spyOn(document, 'createElement');

    defaultToolbar = new DefaultToolbar(viewer, model);

    expect(toolbarSpyOn).toBeCalledWith('div');
    expect(toolbarSpyOn).toBeCalledWith('button');
    expect(toolbarSpyOn).toBeCalledWith('style');
    expect(toolbarSpyOn).toBeCalledWith('img');

    expect(toolbarSpyOn).toBeCalledTimes(12);

    toolbarSpyOn.mockRestore();
  });

  test('Test default toolbar elements', () => {
    defaultToolbar = new DefaultToolbar(viewer, model);

    const toolbarContainer = canvasContainer.getElementsByClassName('reveal-viewer-toolbar-container');

    expect(toolbarContainer[0].hasChildNodes).toBeTrue;

    expect(toolbarContainer[0].childElementCount).toBe(5);
  });

  test('Add new elements to existing default toolbar', () => {
    const iconClicked = jest.fn();
    defaultToolbar = new DefaultToolbar(viewer, model);

    const toolbar = defaultToolbar.getToolbar();
    expect(toolbar).not.toBeNull();

    toolbar.addToolbarItem('Tooltip1', '', true, iconClicked);
    toolbar.addToolbarItem('Tooltip2', '', false, iconClicked);

    const toolbarContainer = canvasContainer.getElementsByClassName('reveal-viewer-toolbar-container');

    expect(toolbarContainer[0].hasChildNodes).toBeTrue;

    expect(toolbarContainer[0].childElementCount).toBe(7);
  });
});
