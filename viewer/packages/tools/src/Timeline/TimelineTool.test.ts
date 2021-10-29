/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DModel } from '@reveal/core';
import { CogniteClient } from '@cognite/sdk';
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
    model = { modelId: 112, revisionId: 113 } as Cognite3DModel;
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
    const assignStyledNodeCollection = jest.spyOn(model, 'assignStyledNodeCollection');
    const unassignStyledNodeCollection = jest.spyOn(model, 'unassignStyledNodeCollection');

    const kf1 = timelineTool.createKeyframe(new Date('2021-10-25'));
    const kf2 = timelineTool.createKeyframe(new Date('2021-10-26'));
    const kf3 = timelineTool.createKeyframe(new Date('2021-10-27'));

    kf1.assignStyledNodeCollection(new TreeIndexNodeCollection(new IndexSet([1, 2, 3])), { renderGhosted: true });
    kf2.assignStyledNodeCollection(new TreeIndexNodeCollection(new IndexSet([4, 5, 6])), { renderGhosted: true });
    kf3.assignStyledNodeCollection(new TreeIndexNodeCollection(new IndexSet([7, 8, 9])), { renderGhosted: true });

    expect(kf1).not.toBeEmpty();
    expect(kf2).not.toBeEmpty();
    expect(kf3).not.toBeEmpty();

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 20000);
    const current = TWEEN.now();
    expect(assignStyledNodeCollection).toBeCalled();
    TWEEN.update(current + 500);
    expect(assignStyledNodeCollection).toBeCalled();
    TWEEN.update(current + 2000);
    expect(assignStyledNodeCollection).toBeCalled();
    TWEEN.update(current + 3000);
  });
});
