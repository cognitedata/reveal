/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { Keyframe } from './Keyframe';
import { NodeCollectionBase, NodeAppearance } from '@reveal/core/src';

/**
 * Tool to applying styles to nodes based on date to play them over in Timeline
 */
export class TimelineTool extends Cognite3DViewerToolBase {
  private readonly _model: Cognite3DModel;
  private _keyframes: Keyframe[];
  private _intervalId: any = 0;
  private _allDates: Date[];
  private _activeIndex: number;

  constructor(cadModel: Cognite3DModel) {
    super();

    this._model = cadModel;
    this._keyframes = new Array<Keyframe>();
    this._allDates = new Array<Date>();
    this._activeIndex = 0;
  }

  /**
   * Create Key frame for the Timeline
   * @param date - date value by Date.now() since January 1, 1970
   */
  public createKeyFrame(date: Date): Keyframe {
    const keyframe = new Keyframe(this._model, date);
    this._keyframes.push(keyframe);
    this._allDates.push(date);
    this.sortKeyframesByDates();

    return keyframe;
  }

  /**
   * Removes the Keyframe from the Timeline
   * @param keyframe - Keyframe to be removed from the Timeline
   */
  public removeKeyFrame(keyframe: Keyframe) {
    if (this._keyframes.length > 0) {
      const index = this._keyframes.findIndex(obj => obj === keyframe);

      if (index > -1) {
        this._keyframes = this._keyframes.splice(index, 1);
      }
    }
  }

  /**
   * Overrides styling of cadModel to match styling
   * @param date - Date of the Keyframe to apply the styling on the CAD Model
   */
  private styleByDate(date: Date) {
    if (this._keyframes.length > 0) {
      this._activeIndex = this._keyframes.findIndex(obj => obj.getKeyframeDate() === date);

      // Date provided not found than get the closest downward date
      // e.g if you have keyframes "1000, 2000, 3000" the result from styleByDate(2500) should be styles from 2000
      if (this._activeIndex === -1) {
        const timelineframe = this._keyframes.reduce((prev, curr) => (date >= curr.getKeyframeDate() ? curr : prev));
        this._activeIndex = this._keyframes.findIndex(obj => obj === timelineframe);
      }

      const currentTimeframe = this._keyframes[this._activeIndex];
      const previousTimeframe = this._keyframes[this._activeIndex - 1];

      if (previousTimeframe) {
        previousTimeframe.deactivate();
      }
      currentTimeframe.activate();
    }
  }

  /**
   * Starts playback of Timeline
   * @param startDate - Keyframe date to start the Playback of Keyframes
   * @param endDate - Keyframe date to stop the Playback of Keyframes
   * @param totalDurationInMilliSeconds - Number of milli-seconds for all Keyframe within startDate & endDate to be rendered
   */
  public play(startDate: Date, endDate: Date, totalDurationInMilliSeconds: number) {
    this.stopPlayback();
    this.styleByDate(startDate);
    this._activeIndex++;
    let keyframesCount = 0;

    if (this._keyframes.length > 1) {
      keyframesCount = this._keyframes.filter(
        obj => obj.getKeyframeDate() >= startDate && obj.getKeyframeDate() <= endDate
      ).length;
    }

    this._intervalId = setInterval(() => {
      if (this._allDates[this._activeIndex] <= endDate) {
        this.styleByDate(this._allDates[this._activeIndex]);
        this._activeIndex++;
      } else {
        this.stopPlayback();
      }
    }, totalDurationInMilliSeconds / keyframesCount);
  }

  /**
   * Stops any ongoing playback
   */
  public stopPlayback() {
    if (this._intervalId !== 0) {
      clearInterval(this._intervalId);
      this._intervalId = 0;
      this._activeIndex = 0;
    }
  }

  /**
   * Restores the Style of the model to default style
   */
  public resetStyles() {
    for (const keyframe of this._keyframes) {
      keyframe.deactivate();
    }
  }

  /**
   * Sort the Timeline Keyframe by their Date
   */
  private sortKeyframesByDates() {
    if (this._keyframes.length > 1) {
      this._keyframes.sort((a: Keyframe, b: Keyframe) => {
        return a.getKeyframeDate().getTime() - b.getKeyframeDate().getTime();
      });
    }
  }

  /**
   * Provides all Keyframes in the Timeline
   * @returns All Keyframes in Timeline
   */
  public getAllKeyframes(): Keyframe[] {
    if (this._keyframes.length > 0) {
      return this._keyframes;
    }
    return [];
  }

  /**
   * Set Styles for Set of nodes for a Keyframe or set of Keyframes
   * @param keyframes List of Keyframe to apply Style
   * @param nodeCollection Node set to apply the Styles
   * @param nodeAppearance Style to assign to the node collection
   */
  public assignStyledNodeCollection(
    keyframes: Keyframe | Keyframe[],
    nodeCollection: NodeCollectionBase,
    nodeAppearance: NodeAppearance
  ) {
    let keyframeList = new Array<Keyframe>();
    keyframeList = keyframeList.concat(keyframes);

    for (const keyframe of keyframeList) {
      keyframe.assignStyledNodeCollection(nodeCollection, nodeAppearance);
    }
  }

  /**
   * Removes node set & styles from a keyframe or set of keyframes
   * @param keyframes List of Keyframes where node set & styles to be removed
   * @param nodeCollection Node set to be removed from keyframes
   * @param nodeAppearance Styles to be removed from keyframes
   */
  public unassignStyledNodeCollection(
    keyframes: Keyframe | Keyframe[],
    nodeCollection: NodeCollectionBase,
    nodeAppearance: NodeAppearance
  ) {
    let keyframeList = new Array<Keyframe>();
    keyframeList = keyframeList.concat(keyframes);

    for (const keyframe of keyframeList) {
      keyframe.unassignStyledNodeCollection(nodeCollection, nodeAppearance);
    }
  }

  public dispose(): void {
    super.dispose();
    this.resetStyles();
  }
}
