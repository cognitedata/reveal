/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DModel } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { CadMaterialManager, CadNode } from '@reveal/rendering';
import { CadModelMetadata } from '@reveal/cad-parsers';
import { createCadModelMetadata, generateSectorTree } from '../../../../test-utilities';
import { NodesLocalClient } from '@reveal/nodes-api';
import { initMetrics } from '@reveal/metrics';

import { IndexSet } from '../../../../packages/utilities';
import { TreeIndexNodeCollection, NodeAppearance } from '../../../../packages/cad-styling';
import { TimelineTool } from './TimelineTool';
import TWEEN from '@tweenjs/tween.js';

describe('TimelineTool', () => {
  let client: CogniteClient;
  let model: Cognite3DModel;
  let timelineTool: TimelineTool;
  let kf1Collection: TreeIndexNodeCollection;
  let kf2Collection: TreeIndexNodeCollection;
  let kf3Collection: TreeIndexNodeCollection;
  let kf1Appearance: NodeAppearance;
  let kf2Appearance: NodeAppearance;
  let kf3Appearance: NodeAppearance;

  beforeAll(() => {
    initMetrics(false, '', '', {});
  });

  beforeEach(() => {
    client = new CogniteClient({ appId: 'test', baseUrl: 'http://localhost' });
    client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });

    const materialManager = new CadMaterialManager();
    const cadRoot = generateSectorTree(3, 3);
    const cadMetadata: CadModelMetadata = createCadModelMetadata(cadRoot);
    materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

    const cadNode = new CadNode(cadMetadata, materialManager);
    const apiClient = new NodesLocalClient();

    model = new Cognite3DModel(1, 2, cadNode, apiClient);

    timelineTool = new TimelineTool(model);

    kf1Collection = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    kf1Appearance = { renderGhosted: false };
    kf2Collection = new TreeIndexNodeCollection(new IndexSet([4, 5, 6]));
    kf2Appearance = { renderGhosted: true };
    kf3Collection = new TreeIndexNodeCollection(new IndexSet([7, 8, 9]));
    kf3Appearance = { renderGhosted: false };

    const kf1 = timelineTool.createKeyframe(new Date('2021-10-25'));
    const kf2 = timelineTool.createKeyframe(new Date('2021-10-26'));
    const kf3 = timelineTool.createKeyframe(new Date('2021-10-27'));

    kf1.assignStyledNodeCollection(kf1Collection, kf1Appearance);
    kf2.assignStyledNodeCollection(kf2Collection, kf2Appearance);
    kf3.assignStyledNodeCollection(kf3Collection, kf3Appearance);
  });

  test('play() playback the Timeline', () => {
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');
    const unassignStyledNodeCollectionSpy = jest.spyOn(model, 'unassignStyledNodeCollection');

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 30000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 20000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection, kf2Appearance);
    TWEEN.update(current + 30000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf3Collection, kf3Appearance);
    TWEEN.update();

    expect(unassignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection);
  });

  test('stop() stops the Timeline playback', () => {
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 40000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 20000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection, kf2Appearance);
    TWEEN.update(current + 30000);

    timelineTool.stop();

    expect(TWEEN.update()).toBeFalse();
  });

  test('pause() & resume() pauses & resumes the Timeline', () => {
    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 40000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(TWEEN.update()).toBeTrue();

    timelineTool.pause();
    expect(TWEEN.update()).toBeFalse();
    TWEEN.update(current + 20000);

    timelineTool.resume();
    expect(TWEEN.update()).toBeTrue();
    TWEEN.update(current + 30000);
  });

  test('play() while play is active', () => {
    const stopSpy = jest.spyOn(timelineTool, 'stop');
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');
    const unassignStyledNodeCollectionSpy = jest.spyOn(model, 'unassignStyledNodeCollection');

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 30000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 30000);

    expect(stopSpy).toBeCalledTimes(2);

    TWEEN.update(current + 20000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 30000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection, kf2Appearance);
    TWEEN.update(current + 40000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf3Collection, kf3Appearance);
    TWEEN.update();

    expect(unassignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection);
  });

  test('stop() while in stopped', () => {
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 40000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 20000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection, kf2Appearance);
    TWEEN.update(current + 30000);

    timelineTool.stop();

    expect(TWEEN.update()).toBeFalse();

    TWEEN.update(current + 20000);

    timelineTool.stop();

    expect(TWEEN.update()).toBeFalse();
  });
});
