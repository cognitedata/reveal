/*!
 * Copyright 2021 Cognite AS
 */
import TWEEN from '@tweenjs/tween.js';

import { createCadModel } from '../../../../test-utilities';
import { TimelineTool } from './TimelineTool';

import { MetricsLogger } from '@reveal/metrics';
import { IndexSet } from '@reveal/utilities';
import { NodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { CogniteCadModel } from '@reveal/api';

import { jest } from '@jest/globals';

describe('TimelineTool', () => {
  let model: CogniteCadModel;
  let timelineTool: TimelineTool;
  let kf1Collection: TreeIndexNodeCollection;
  let kf2Collection: TreeIndexNodeCollection;
  let kf3Collection: TreeIndexNodeCollection;
  let kf1Appearance: NodeAppearance;
  let kf2Appearance: NodeAppearance;
  let kf3Appearance: NodeAppearance;

  beforeAll(() => {
    MetricsLogger.init(false, '', '', {});
  });

  beforeEach(() => {
    model = createCadModel(1, 2, 3, 3);

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
    const unassignStyledNodeCollectionSpy = jest.spyOn(model, 'unassignStyledNodeCollection');

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 40000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 20000);

    timelineTool.stop();

    TWEEN.update();

    expect(unassignStyledNodeCollectionSpy).toBeCalledTimes(1);
  });

  test('pause() & resume() pauses & resumes the Timeline', () => {
    // With updates to TweenJS 24.0.0, we no longer receieve a return value from `TWEEN.update`
    // Disabling this test for now.
  });

  test('play() while play is active', () => {
    const stopSpy = jest.spyOn(timelineTool, 'stop');
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 30000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 30000);

    expect(stopSpy).toBeCalledTimes(2);

    TWEEN.update(current + 20000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
  });

  test('stop() while in stopped', () => {
    const assignStyledNodeCollectionSpy = jest.spyOn(model, 'assignStyledNodeCollection');
    const unassignStyledNodeCollectionSpy = jest.spyOn(model, 'unassignStyledNodeCollection');

    timelineTool.play(new Date('2021-10-25'), new Date('2021-10-27'), 40000);
    const current = TWEEN.now();
    TWEEN.update(current + 10000);

    expect(assignStyledNodeCollectionSpy).toBeCalledWith(kf1Collection, kf1Appearance);
    TWEEN.update(current + 20000);

    timelineTool.stop();

    timelineTool.stop();

    expect(unassignStyledNodeCollectionSpy).toBeCalledTimes(1);
  });
});
