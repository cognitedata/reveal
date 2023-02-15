/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './../entity/Image360';
import { Image360EnteredDelegate, Image360ExitedDelegate } from '../types';

/**
 * A wrapper that represents a set of 360 images.
 */
export interface Image360Collection {
  /**
   * A list containing all the 360 images in this set.
   */
  readonly image360Entities: Image360[];

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
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  off(event: 'image360Exited', callback: Image360ExitedDelegate): void;
}
