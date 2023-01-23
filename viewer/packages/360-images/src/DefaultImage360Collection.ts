/*!
 * Copyright 2023 Cognite AS
 */

import { assertNever, DisposedDelegate, EventTrigger } from '@reveal/utilities';
import { Image360 } from './Image360';
import { Image360Collection } from './Image360Collection';
import { Image360EnteredDelegate, Image360ExitedDelegate } from './types';

type Image360Events = 'image360Entered' | 'image360Exited';

/**
 * Default implementation of {@link Image360Collection}. Used for events when entering
 * and exiting 360 image mode
 */
export class DefaultImage360Collection implements Image360Collection {
  /**
   * A list containing all the 360 images in this set.
   */
  readonly image360Entities: Image360[];

  private readonly _events = {
    image360Entered: new EventTrigger<Image360EnteredDelegate>(),
    image360Exited: new EventTrigger<Image360ExitedDelegate>(),
    disposed: new EventTrigger<DisposedDelegate>()
  };

  /**
   * The events from the image collection.
   */
  get events(): {
    image360Entered: EventTrigger<Image360EnteredDelegate>;
    image360Exited: EventTrigger<Image360ExitedDelegate>;
    disposed: EventTrigger<DisposedDelegate>;
  } {
    return this._events;
  }

  constructor(entities: Image360[]) {
    this.image360Entities = entities;
  }
  /**
   * Subscribes to events on 360 Image datasets. There are several event types:
   * 'image360Entered' - Subscribes to a event for entering 360 image mode.
   * 'image360Exited' - Subscribes to events indicating 360 image mode has exited.
   * @param event The event type.
   * @param callback Callback to be called when the event is fired.
   */
  on(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  on(event: 'image360Exited', callback: Image360ExitedDelegate): void;
  /**
   * Subscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  on(event: Image360Events, callback: Image360EnteredDelegate | Image360ExitedDelegate | DisposedDelegate): void {
    switch (event) {
      case 'image360Entered':
        this._events.image360Entered.subscribe(callback as Image360EnteredDelegate);
        break;
      case 'image360Exited':
        this._events.image360Exited.subscribe(callback as Image360ExitedDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  /**
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  off(event: 'image360Exited', callback: Image360ExitedDelegate): void;
  /**
   * Unsubscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  off(event: Image360Events, callback: Image360EnteredDelegate | Image360ExitedDelegate | DisposedDelegate): void {
    switch (event) {
      case 'image360Entered':
        this._events.image360Entered.unsubscribe(callback as Image360EnteredDelegate);
        break;
      case 'image360Exited':
        this._events.image360Exited.unsubscribe(callback as Image360ExitedDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }
}
