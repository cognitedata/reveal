/*!
 * Copyright 2021 Cognite AS
 */

import TWEEN, { type Tween } from '@tweenjs/tween.js';

import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { Keyframe } from './Keyframe';
import { TimelineDateUpdateDelegate } from './types';
import { EventTrigger, assertNever } from '@reveal/utilities';
import { CogniteCadModel } from '@reveal/api';

/**
 * Tool to applying styles to nodes based on date to play them over in Timeline
 */
export class TimelineTool extends Cognite3DViewerToolBase {
  private readonly _model: CogniteCadModel;
  private readonly _keyframes: Keyframe[];
  private _playback: Tween<{ dateInMs: number }> | undefined = undefined;
  private readonly _events = { dateChanged: new EventTrigger<TimelineDateUpdateDelegate>() };

  constructor(cadModel: CogniteCadModel) {
    super();

    this._model = cadModel;
    this._keyframes = new Array<Keyframe>();
  }

  /**
   * Subscribe to the Date changed event
   * @param event `dateChanged` event
   * @param listener Listen to Timeline date Update during Playback
   */
  public subscribe(event: 'dateChanged', listener: TimelineDateUpdateDelegate): void {
    switch (event) {
      case 'dateChanged':
        this._events.dateChanged.subscribe(listener);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  /**
   * Unsubscribe to the Date changed event
   * @param event `dateChanged` event
   * @param listener Remove Listen to Timeline date Update
   */
  public unsubscribe(event: 'dateChanged', listener: TimelineDateUpdateDelegate): void {
    switch (event) {
      case 'dateChanged':
        this._events.dateChanged.unsubscribe(listener);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  /**
   * Create Key frame for the Timeline
   * @param date - date value by Date.now() since January 1, 1970
   */
  public createKeyframe(date: Date): Keyframe {
    const keyframe = new Keyframe(this._model, date);
    this._keyframes.push(keyframe);
    this.sortKeyframesByDates();

    return keyframe;
  }

  /**
   * Returns the keyframe at the date given, or undefined if not found.
   * @param date
   * @returns
   */
  public getKeyframeByDate(date: Date): Keyframe | undefined {
    return this._keyframes.find(candidate => candidate.getKeyframeDate() === date);
  }

  /**
   * Removes the Keyframe from the timeline. Does nothing if the keyframe isn't part of the timeline.
   * @param keyframe - Keyframe to be removed from the timeline
   */
  public removeKeyframe(keyframe: Keyframe): void {
    const index = this._keyframes.findIndex(obj => obj === keyframe);

    if (index > -1) {
      this._keyframes.splice(index, 1);
    }
  }

  /**
   * Removes the Keyframe from the Timeline
   * @param date - Date of the Keyframe to be removed from the Timeline
   */
  public removeKeyframeByDate(date: Date): void {
    const index = this._keyframes.findIndex(obj => obj.getKeyframeDate() === date);

    if (index > -1) {
      this._keyframes.splice(index, 1);
    }
  }

  /**
   * Starts playback of Timeline
   * @param startDate - Keyframe date to start the Playback of Keyframes
   * @param endDate - Keyframe date to stop the Playback of Keyframes
   * @param totalDurationInMilliSeconds - Number of milliseconds for all Keyframe within startDate & endDate to be rendered
   */
  public play(startDate: Date, endDate: Date, totalDurationInMilliSeconds: number): void {
    this.stop();

    const playState = { dateInMs: startDate.getTime() };
    const to = { dateInMs: endDate.getTime() };
    const tween = new TWEEN.Tween(playState).to(to, totalDurationInMilliSeconds);
    let currentKeyframeIndex = -1;
    tween.onUpdate(() => {
      const date = new Date(playState.dateInMs);

      // Forward active keyframe to last keyframe that is before current date
      const prevIndex = currentKeyframeIndex;
      while (
        currentKeyframeIndex < this._keyframes.length - 1 &&
        this._keyframes[currentKeyframeIndex + 1].getKeyframeDate().getTime() <= date.getTime()
      ) {
        currentKeyframeIndex++;
      }

      if (currentKeyframeIndex !== prevIndex) {
        if (prevIndex !== -1) {
          this._keyframes[prevIndex].deactivate();
        }
        this._keyframes[currentKeyframeIndex].activate();
      }

      this._events.dateChanged.fire({
        date: date,
        activeKeyframe: this._keyframes[currentKeyframeIndex],
        startDate: startDate,
        endDate: endDate
      });
    });

    this._playback = tween;
    tween.start();
    TWEEN.add(tween);
  }

  /**
   * Stops any ongoing playback
   */
  public stop(): void {
    if (this._playback !== undefined) {
      this._playback.stop();
      this._playback = undefined;
    }
  }

  /**
   * Pause any ongoing playback
   */
  public pause(): void {
    if (this._playback !== undefined && this._playback.isPlaying()) {
      this._playback.pause();
    }
  }

  /**
   * Resume any paused playback
   */
  public resume(): void {
    if (this._playback !== undefined && this._playback.isPaused()) {
      this._playback.resume();
    }
  }

  /**
   * Provides all Keyframes in the Timeline
   * @returns All Keyframes in Timeline
   */
  public getAllKeyframes(): Keyframe[] {
    return this._keyframes.slice();
  }

  public dispose(): void {
    super.dispose();
    this._events.dateChanged.unsubscribeAll();
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
}
