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
  private _activeTimelineKeyframes: TimelineKeyframe[];
  private _allDates: Date[];
  private _activeIndex: number;

  constructor(cadModel: Cognite3DModel) {
    super();

    this._model = cadModel;
    this._timelineKeyframes = new Array<TimelineKeyframe>();
    this._activeTimelineKeyframes = new Array<TimelineKeyframe>();
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
   * Overrides styling of cadModel to match styling at "date"
   * @param date - Date of the TimelineKeyframe to apply the styling on the CAD Model
   */
  private styleByDate(index: number) {
    if (this._activeTimelineKeyframes.length > 0) {
      const currentTimeframe = this._activeTimelineKeyframes[index];
      const previousTimeframe = this._activeTimelineKeyframes[index - 1];

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
   * @param durationInMilliSeconds - Number of milli-seconds for all TimelineKeyframe within startDate & endDate to be rendered
   */
  public play(startDate: Date, endDate: Date, totalDurationInMilliSeconds: number) {
    this.stopPlayback();
    this.sortTimelineKeyframesByDates();
    this.calculateAllAnimateDates(startDate, endDate);
    this.styleByDate(this._activeIndex);
    this._activeIndex++;

    this._intervalId = setInterval(() => {
      if (this._activeTimelineKeyframes.length >= this._activeIndex) {
        this.styleByDate(this._activeIndex);
        this._activeIndex++;
      } else {
        this.stopPlayback();
      }
    }, totalDurationInMilliSeconds / this._activeTimelineKeyframes.length);
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
    this._timelineKeyframes.sort((a: TimelineKeyframe, b: TimelineKeyframe) => {
      return a.getTimelineKeyframeDate().getTime() - b.getTimelineKeyframeDate().getTime();
    });
  }

  /**
   * Provides all the dates in the Timeline
   * @returns All dates in the Timeline
   */
  public getAllDateInTimelineKeyframes(): Date[] {
    if (this._allDates.length > 0) {
      return this._allDates;
    }
    return [] as Date[];
  }

  /**
   *
   * @param dates List of TimelineKeyframe Dates or a Date to apply Style
   * @param nodeCollection Node set to apply the Styles
   * @param nodeAppearance Style to assign to the node collection
   */
  public setNodeCollectionAndAppearance(
    dates: Date | Date[],
    nodeCollection: NodeCollectionBase,
    nodeAppearance: NodeAppearance
  ) {
    let dateList = new Array<Date>();
    dateList = dateList.concat(dates);

    for (const date of dateList) {
      const timelineKeyframe = this._timelineKeyframes.find(obj => obj.getTimelineKeyframeDate() === date);
      if (timelineKeyframe) {
        timelineKeyframe.assignStyledNodeCollection(nodeCollection, nodeAppearance);
      }
    }
  }

  /**
   * Calculate the TimelineKeyframes list from the given start date to end date
   * @param startDate TimelineKeyframe date to start the Playback of TimelineKeyframes
   * @param endDate TimelineKeyframe date to stop the Playback of TimelineKeyframes
   */
  private calculateAllAnimateDates(startDate: Date, endDate: Date) {
    if (this._timelineKeyframes.length > 1) {
      this._activeTimelineKeyframes = this._timelineKeyframes.filter(
        obj => obj.getTimelineKeyframeDate() >= startDate && obj.getTimelineKeyframeDate() <= endDate
      );
    }
  }

  public dispose(): void {
    super.dispose();
  }
}
