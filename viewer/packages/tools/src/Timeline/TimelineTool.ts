/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { TimelineKeyframe } from './TimelineKeyframe';
import { NodeCollectionBase, NodeAppearance } from '@reveal/core/src';

/**
 * Tool to applying styles to nodes based on date to play them over in Timeline
 */
export class TimelineTool extends Cognite3DViewerToolBase {
  private readonly _model: Cognite3DModel;
  private _timelineKeyframes: TimelineKeyframe[];
  private _intervalId: any = 0;
  private _activeTimelineKeyframesCount: number;
  private _allDates: Date[];
  private _activeIndex: number;

  constructor(cadModel: Cognite3DModel) {
    super();

    this._model = cadModel;
    this._timelineKeyframes = new Array<TimelineKeyframe>();
    this._activeTimelineKeyframesCount = 0;
    this._allDates = new Array<Date>();
    this._activeIndex = 0;
  }

  /**
   * Create Key frame for the Timeline
   * @param date - date value by Date.now() since January 1, 1970
   * @param nodeCollection - Set of nodes to be rendered for the TimelineKeyframe
   * @param nodeAppearance - Styling of the nodes
   */
  public createKeyFrame(date: Date, nodeCollection: NodeCollectionBase, nodeAppearance: NodeAppearance) {
    this._timelineKeyframes.push(new TimelineKeyframe(this._model, date, nodeCollection, nodeAppearance));
    this._allDates.push(date);
    this.sortTimelineKeyframesByDates();
  }

  /**
   * Removes the TimelineKeyframe from the Timeline
   * @param date - Date of the TimelineKeyframe to be removed from the Timeline
   */
  public removeKeyFrame(date: Date) {
    if (this._timelineKeyframes.length > 0) {
      const index = this._timelineKeyframes.findIndex(obj => obj.getTimelineKeyframeDate() === date);

      if (index > -1) {
        this._timelineKeyframes = this._timelineKeyframes.splice(index, 1);
      }
    }
  }

  /**
   * Overrides styling of cadModel to match styling
   * @param date - Date of the TimelineKeyframe to apply the styling on the CAD Model
   */
  private styleByDate(date: Date) {
    if (this._timelineKeyframes.length > 0) {
      this._activeIndex = this._timelineKeyframes.findIndex(obj => obj.getTimelineKeyframeDate() === date);

      // Date provided not found than get the closest downward date
      // e.g if you have keyframes "1000, 2000, 3000" the result from styleByDate(2500) should be styles from 2000
      if (this._activeIndex === -1) {
        const timelineframe = this._timelineKeyframes.reduce((prev, curr) =>
          date >= curr.getTimelineKeyframeDate() ? curr : prev
        );
        this._activeIndex = this._timelineKeyframes.findIndex(obj => obj === timelineframe);
      }

      const currentTimeframe = this._timelineKeyframes[this._activeIndex];
      const previousTimeframe = this._timelineKeyframes[this._activeIndex - 1];

      if (previousTimeframe) {
        previousTimeframe.deactivate();
      }
      currentTimeframe.activate();
    }
  }

  /**
   * Starts playback of Timeline
   * @param startDate - TimelineKeyframe date to start the Playback of TimelineKeyframes
   * @param endDate - TimelineKeyframe date to stop the Playback of TimelineKeyframes
   * @param totalDurationInMilliSeconds - Number of milli-seconds for all TimelineKeyframe within startDate & endDate to be rendered
   */
  public play(startDate: Date, endDate: Date, totalDurationInMilliSeconds: number) {
    this.stopPlayback();
    this.calculateTimelineKeyframeCount(startDate, endDate);
    this.styleByDate(startDate);
    this._activeIndex++;

    this._intervalId = setInterval(() => {
      if (this._allDates[this._activeIndex] <= endDate) {
        this.styleByDate(this._allDates[this._activeIndex]);
        this._activeIndex++;
      } else {
        this.stopPlayback();
      }
    }, totalDurationInMilliSeconds / this._activeTimelineKeyframesCount);
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
  public applyDefaultStyle() {
    if (this._timelineKeyframes.length > 0) {
      this._timelineKeyframes[0].applyDefaultStyle();
    }
  }

  /**
   * Sort the Timeline Keyframe by their Date
   */
  private sortTimelineKeyframesByDates() {
    if (this._timelineKeyframes.length > 1) {
      this._timelineKeyframes.sort((a: TimelineKeyframe, b: TimelineKeyframe) => {
        return a.getTimelineKeyframeDate().getTime() - b.getTimelineKeyframeDate().getTime();
      });
    }
  }

  /**
   * Provides all the dates in the Timeline
   * @returns All dates in the Timeline
   */
  public getAllDateInTimelineKeyframes(): Date[] {
    if (this._allDates.length > 0) {
      return this._allDates;
    }
    return [];
  }

  /**
   * Provides all TimelineKeyframes in the Timeline
   * @returns All TimelineKeyframes in Timeline
   */
  public getAllTimelineKeyframes(): TimelineKeyframe[] {
    if (this._timelineKeyframes.length > 0) {
      return this._timelineKeyframes;
    }
    return [];
  }

  /**
   * Set Styles for Set of nodes for a TimelineKeyframe or set of TimelineKeyframe
   * @param timelineKeyframes List of TimelineKeyframe to apply Style
   * @param nodeCollection Node set to apply the Styles
   * @param nodeAppearance Style to assign to the node collection
   */
  public assignStyledNodeCollection(
    timelineKeyframes: TimelineKeyframe | TimelineKeyframe[],
    nodeCollection: NodeCollectionBase,
    nodeAppearance: NodeAppearance
  ) {
    let timelineKeyframeList = new Array<TimelineKeyframe>();
    timelineKeyframeList = timelineKeyframeList.concat(timelineKeyframes);

    for (const timelineKeyframe of timelineKeyframeList) {
      timelineKeyframe.assignStyledNodeCollection(nodeCollection, nodeAppearance);
    }
  }

  /**
   * Calculate the TimelineKeyframes Count from the given start date to end date
   * @param startDate TimelineKeyframe date to start the Playback of TimelineKeyframes
   * @param endDate TimelineKeyframe date to stop the Playback of TimelineKeyframes
   */
  private calculateTimelineKeyframeCount(startDate: Date, endDate: Date) {
    if (this._timelineKeyframes.length > 1) {
      this._activeTimelineKeyframesCount = this._timelineKeyframes.filter(
        obj => obj.getTimelineKeyframeDate() >= startDate && obj.getTimelineKeyframeDate() <= endDate
      ).length;
    }
  }

  public dispose(): void {
    super.dispose();
  }
}
