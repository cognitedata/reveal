/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { MetricsLogger } from '@reveal/metrics';
import { createGlContext, mockClientAuthentication } from '../../../../test-utilities';

import * as THREE from 'three';
import { ToolbarTool } from './ToolbarTool';
import nock from 'nock';

describe('ToolbarTool', () => {
  let viewer: Cognite3DViewer;
  let tool: ToolbarTool;
  let canvasContainer: HTMLElement;

  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  mockClientAuthentication(sdk);

  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  const styles = {
    container: 'reveal-viewer-toolbar-container',
    bottom: 'reveal-viewer-toolbar-container--bottom'
  };

  beforeAll(() => {
    MetricsLogger.init(false, '', '', {});

    jest.useFakeTimers();
    nock.disableNetConnect();

    nock('https://api-js.mixpanel.com')
      .persist(true)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .get(/.*/)
      .reply(200);

    nock('https://api-js.mixpanel.com')
      .persist(true)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .post(/.*/)
      .reply(200);

    sdk.loginWithApiKey({ project: 'none', apiKey: 'dummy' });

    // Mock function for retriving model metadata, such as transformation
    jest.spyOn(sdk.revisions3D, 'retrieve').mockImplementation(async (_modelId, revisionId) => ({
      id: revisionId,
      fileId: 42,
      published: false,
      status: 'Done',
      createdTime: new Date(),
      assetMappingCount: 0
    }));
  });

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = '640px';
    canvasContainer.style.height = '480px';

    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    nock.enableNetConnect();
    jest.useRealTimers();
  });

  test('Add icon item to the Toolbar', async () => {
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    tool = new ToolbarTool(viewer, model);

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

  test('Set Position of toolbar', async () => {
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    tool = new ToolbarTool(viewer, model);

    const toolbarContainer = canvasContainer.getElementsByClassName(styles.container);

    expect(toolbarContainer[0].classList.contains(styles.bottom));

    tool.setPosition('bottom');

    expect(toolbarContainer[0].classList.contains(styles.container));
  });

  test('Add Axis Tool to the Toolbar', async () => {
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    tool = new ToolbarTool(viewer, model);
    const createElementMock = jest.spyOn(document, 'createElement');
    // const toolbarContainer = canvasContainer.getElementsByClassName(styles.container);

    tool.addAxisToolToggle();

    expect(createElementMock).toBeCalledTimes(2);
  });
});
