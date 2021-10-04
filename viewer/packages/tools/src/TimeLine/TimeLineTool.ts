/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { TimeLineKeyframe } from './TimeLineKeyframe';
import { NodeCollectionBase, NodeAppearance } from '@reveal/core/src';

/**
 * Tool to applying styles to nodes based on date to play them over in Timeline
 */
export class TimelineTool extends Cognite3DViewerToolBase {
  private readonly _model: Cognite3DModel;
  private _timelineframes: TimeLineKeyframe[];
  private _intervalId: any = 0;
  private _currentDate: number = 0;
  private _allDates: number[];

  constructor(cadModel: Cognite3DModel) {
    super();

    this._model = cadModel;
    this._timelineframes = new Array<TimeLineKeyframe>();
    this._allDates = new Array<number>();
  }

  /**
   * Create Key frame for the Timeline
   * @param date - date value by Date.now() or number of milliseconds elapsed since January 1, 1970
   * @param nodeCollection - Set of nodes to be rendered for the TimelineFrame
   * @param nodeAppearance - Styling of the nodes
   */
  public createKeyFrame(date: number, nodeCollection: NodeCollectionBase, nodeAppearance?: NodeAppearance) {
    this._timelineframes.push(new TimeLineKeyframe(this._model, date, nodeCollection, nodeAppearance));
    this._allDates.push(date);
  }

  /**
   * Removes the TimelineFrame from the Timeline
   * @param date - Date of the TimelineFrame to be removed from the Timeline
   */
  public removeKeyFrame(date: number) {
    if (this._timelineframes.length > 0) {
      const index = this._timelineframes.findIndex(obj => obj.getTimeLineFrameDate() === date);

      if (index > -1) {
        this._timelineframes = this._timelineframes.splice(index, 1);
      }
    }
  }

  /**
   * Overrides styling of cadModel to match styling at "date"
   * @param date - Date of the TimelineFrame to apply the styling on the CAD Model
   */
  private styleByDate(date: number) {
    if (this._timelineframes.length > 0) {
      const currentIndex = this._timelineframes.findIndex(obj => obj.getTimeLineFrameDate() === date);

      if (currentIndex <= this._timelineframes.length - 1) {
        const currentTimeframe = this._timelineframes[currentIndex];
        const previousTimeframe = this._timelineframes[currentIndex - 1];

        if (previousTimeframe) {
          previousTimeframe.removeStyle();
        }

        if (currentTimeframe) {
          currentTimeframe.applyStyle();
        }
      }
    }
  }

  /**
   * Starts playback of TImeline
   * @param durationInMilliSeconds -Number of milli-seconds after which next TimelineFrame is rendered
   * @param startDate - TimelineFrame date to start the Playback of TimelineFrames
   * @param endDate - TimelineFrame date to stop the Playback of TimelineFrames
   */
  public play(durationInMilliSeconds: number, startDate: number, endDate: number) {
    this.stopPlayback();
    this._currentDate = startDate;
    this.styleByDate(this._currentDate);

    this._intervalId = setInterval(() => {
      if (this._currentDate !== endDate) {
        this.getNextDate();
        this.styleByDate(this._currentDate);
      } else {
        this.stopPlayback();
      }
    }, durationInMilliSeconds);
  }

  /**
   * Stops any ongoing playback
   */
  public stopPlayback() {
    if (this._intervalId !== 0) {
      clearInterval(this._intervalId);
      this._intervalId = 0;
    }
  }

  /**
   * Restores the Style of the model to default style
   */
  public applyDefaultStyle() {
    if (this._timelineframes.length > 0) {
      this._timelineframes[0].applyDefaultStyle();
    }
  }

  /**
   * Provides the next Timelineframes date value
   */
  private getNextDate() {
    if (this._timelineframes.length > 0) {
      const currentIndex = this._timelineframes.findIndex(obj => obj.getTimeLineFrameDate() === this._currentDate);

      if (currentIndex !== this._timelineframes.length - 1) {
        this._currentDate = this._timelineframes[currentIndex + 1].getTimeLineFrameDate();
      } else {
        this.stopPlayback();
      }
    }
  }

  /**
   * Provides all the dates in the TImeline
   * @returns All dates in the Timeline
   */
  public getAllDateInTimeLineFrames() {
    if (this._allDates.length > 0) {
      return this._allDates;
    }
  }

  public dispose(): void {
    super.dispose();
  }
}
