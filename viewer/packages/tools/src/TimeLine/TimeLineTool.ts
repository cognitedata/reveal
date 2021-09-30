/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer, Cognite3DModel } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { TimelineKeyframe } from './TimelineKeyframe';
import { NodeCollectionBase, NodeAppearance } from '@reveal/core/src';

export class TimelineTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _model: Cognite3DModel;
  private _timeframe: TimelineKeyframe[];
  private _intervalId: any = 0;
  private _currentDate: number = 0;

  constructor(viewer: Cognite3DViewer, cadModel: Cognite3DModel) {
    super();

    this._viewer = viewer;
    this._model = cadModel;
    this._timeframe = new Array<TimelineKeyframe>();
  }

  public createKeyFrame(date: number, nodeCollection: NodeCollectionBase, nodeAppearance?: NodeAppearance) {
    this._timeframe.push(new TimelineKeyframe(this._model, date, nodeCollection, nodeAppearance));
  }

  public removeKeyFrame(keyFrame: TimelineKeyframe) {
    if(this._timeframe.length > 1) {
      const index = this._timeframe.indexOf(keyFrame, 0);
      if (index > -1) {
        this._timeframe = this._timeframe.splice(index, 1);
      }
    }
  }

  // Overrides styling of cadModel to match styling at "date"
  private styleByDate(date: number) {
    if(this._timeframe.length > 1) {
      const timeframe = this._timeframe.find(obj => obj.getTimeFrameDate() === date);
      if(timeframe) {
        timeframe.applyStyle();
      }
    }
  }

  // Start playback - will cancel any ongoing timeline
  public play(durationInMilliSeconds: number, startDate: number, endDate: number) {
    this.stopPlayback();
    this._currentDate = startDate;

    this._intervalId = setInterval(() => {
      if(this._currentDate !== endDate) {
        this.styleByDate(this._currentDate);
        this.getNextDate();
      }
      else {
        this.stopPlayback();
      }
    }, durationInMilliSeconds);
  }

  // Stops any ongoing playback
  public stopPlayback() {
    if(this._intervalId !== 0) {
      clearInterval(this._intervalId);
      this._intervalId = 0;
    }
  }

  private getNextDate() {
    if(this._timeframe.length > 1) {
      const currentIndex = this._timeframe.findIndex(obj => (obj.getTimeFrameDate() === this._currentDate));
      if(currentIndex !== this._timeframe.length - 1) {
        this._currentDate = this._timeframe[currentIndex + 1].getTimeFrameDate();
      }
      else {
        this.stopPlayback();
      }
    }
  }

  public dispose(): void {
    super.dispose();
  }
}

