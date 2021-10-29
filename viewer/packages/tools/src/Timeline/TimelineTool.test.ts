/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DModel } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
import { CadMaterialManager, CadNode } from '@reveal/rendering';
import { CadModelMetadata } from '@reveal/cad-parsers';
import { createCadModelMetadata, generateSectorTree } from '../../../../test-utilities';
import { NodesLocalClient } from '@reveal/nodes-api';

import { IndexSet } from '../../../../packages/utilities';
import { TreeIndexNodeCollection } from '../../../../packages/cad-styling';
import nock from 'nock';
import { TimelineTool } from './TimelineTool';
import TWEEN from '@tweenjs/tween.js';

describe('TimelineTool', () => {
  let client: CogniteClient;
  let model: Cognite3DModel;

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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    nock.cleanAll();
  });

  test('Test keyframe creation', () => {
    const timelineTool = new TimelineTool(model);
    expect(timelineTool).toBeTruthy();

    const kf1 = timelineTool.createKeyframe(new Date('2021-10-25'));
    const kf2 = timelineTool.createKeyframe(new Date('2021-10-26'));
    const kf3 = timelineTool.createKeyframe(new Date('2021-10-27'));
    const kf4 = timelineTool.createKeyframe(new Date('2021-10-28'));

    expect(kf1).not.toBeEmpty();
    expect(kf2).not.toBeEmpty();
    expect(kf3).not.toBeEmpty();
    expect(kf4).not.toBeEmpty();
  });

  test('Test assign Node & style to the keyframe & Play the Timeline', () => {
    const timelineTool = new TimelineTool(model);
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');
    const unassignStyledNodeCollectionSpy = jest.spyOn(model, 'unassignStyledNodeCollection');

    const kf1 = timelineTool.createKeyframe(new Date('2021-10-25'));
    const kf2 = timelineTool.createKeyframe(new Date('2021-10-26'));
    const kf3 = timelineTool.createKeyframe(new Date('2021-10-27'));

    const kf1Collection = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    const kf1Appearance = { renderGhosted: false };
    const kf2Collection = new TreeIndexNodeCollection(new IndexSet([4, 5, 6]));
    const kf2Appearance = { renderGhosted: true };
    const kf3Collection = new TreeIndexNodeCollection(new IndexSet([7, 8, 9]));
    const kf3Appearance = { renderGhosted: false };

    kf1.assignStyledNodeCollection(kf1Collection, kf1Appearance);
    kf2.assignStyledNodeCollection(kf2Collection, kf2Appearance);
    kf3.assignStyledNodeCollection(kf3Collection, kf3Appearance);

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 30000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 20000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection, kf2Appearance);
    TWEEN.update(current + 30000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf3Collection, kf3Appearance);
    TWEEN.update();

    expect(unassignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection);
  });

  test('Test Stop the Timeline', () => {
    const timelineTool = new TimelineTool(model);
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');

    const kf1 = timelineTool.createKeyframe(new Date('2021-10-25'));
    const kf2 = timelineTool.createKeyframe(new Date('2021-10-26'));
    const kf3 = timelineTool.createKeyframe(new Date('2021-10-27'));
    const kf4 = timelineTool.createKeyframe(new Date('2021-10-28'));

    const kf1Collection = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    const kf1Appearance = { renderGhosted: false };
    const kf2Collection = new TreeIndexNodeCollection(new IndexSet([4, 5, 6]));
    const kf2Appearance = { renderGhosted: true };
    const kf3Collection = new TreeIndexNodeCollection(new IndexSet([7, 8, 9]));
    const kf3Appearance = { renderGhosted: false };
    const kf4Collection = new TreeIndexNodeCollection(new IndexSet([10, 11, 12]));
    const kf4Appearance = { renderGhosted: true };

    kf1.assignStyledNodeCollection(kf1Collection, kf1Appearance);
    kf2.assignStyledNodeCollection(kf2Collection, kf2Appearance);
    kf3.assignStyledNodeCollection(kf3Collection, kf3Appearance);
    kf4.assignStyledNodeCollection(kf4Collection, kf4Appearance);

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-28'), 40000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 20000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf2Collection, kf2Appearance);
    TWEEN.update(current + 30000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf3Collection, kf3Appearance);
    TWEEN.update(current + 40000);

    timelineTool.stopPlayback();

    expect(TWEEN.update()).toBeFalse();
  });
});
