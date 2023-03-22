/*!
 * Copyright 2023 Cognite AS
 */

import { assertNever, EventTrigger } from '@reveal/utilities';
import pull from 'lodash/pull';
import { Image360Collection } from './Image360Collection';
import { Image360Entity } from '../entity/Image360Entity';
import { Image360EnteredDelegate, Image360ExitedDelegate } from '../types';
import { IconCollection, IconCullingScheme } from '../icons/IconCollection';

type Image360Events = 'image360Entered' | 'image360Exited';

/**
 * Default implementation of {@link Image360Collection}. Used for events when entering
 * and exiting 360 image mode
 */
export class DefaultImage360Collection implements Image360Collection {
  /**
   * A list containing all the 360 images in this set.
   */
  readonly image360Entities: Image360Entity[];

  private readonly _events = {
    image360Entered: new EventTrigger<Image360EnteredDelegate>(),
    image360Exited: new EventTrigger<Image360ExitedDelegate>()
  };
  private readonly _icons: IconCollection;

  /**
   * The events from the image collection.
   */
  get events(): {
    image360Entered: EventTrigger<Image360EnteredDelegate>;
    image360Exited: EventTrigger<Image360ExitedDelegate>;
  } {
    return this._events;
  }

  constructor(entities: Image360Entity[], icons: IconCollection) {
    this.image360Entities = entities;
    this._icons = icons;
  }
  /**
   * Subscribes to events on 360 Image datasets. There are several event types:
   * 'image360Entered' - Subscribes to a event for entering 360 image mode.
   * 'image360Exited' - Subscribes to events indicating 360 image mode has exited.
   * @param event The event type.
   * @param callback Callback to be called when the event is fired.
   */
  public on(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  public on(event: 'image360Exited', callback: Image360ExitedDelegate): void;
  /**
   * Subscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  public on(event: Image360Events, callback: Image360EnteredDelegate | Image360ExitedDelegate): void {
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
   * Specify parameters used to determine the number of icons that are visible when entering 360 Images.
   * @param radius Only icons within the given radius will be made visible.
   * @param pointLimit Limit the number of points within the given radius. Points closer to the camera will be prioritized.
   */
  public set360IconCullingRestrictions(radius: number, pointLimit: number): void {
    this._icons.set360IconCullingRestrictions(radius, pointLimit);
  }

  /**
   * Set visibility of all 360 image icons.
   * @param visible If true all icons are made visible according to the active culling scheme. If false all icons are hidden.
   */
  public setIconsVisibility(visible: boolean): void {
    this.image360Entities.forEach(entity => entity.icon.setVisibility(visible));
  }

  /**
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  public off(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  public off(event: 'image360Exited', callback: Image360ExitedDelegate): void;

  /**
   * Unsubscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  public off(event: Image360Events, callback: Image360EnteredDelegate | Image360ExitedDelegate): void {
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

  public setSelectedVisibility(visible: boolean): void {
    this.image360Entities.forEach(entity => (entity.icon.hoverSpriteVisible = visible));
  }

  public setCullingScheme(scheme: IconCullingScheme): void {
    this._icons.setCullingScheme(scheme);
  }

  public remove(entity: Image360Entity): void {
    pull(this.image360Entities, entity);
    entity.dispose();
  }

  public dispose(): void {
    this.image360Entities.forEach(image360Entity => image360Entity.dispose());
    this.image360Entities.splice(0);
    this._icons.dispose();
    this._events.image360Entered.unsubscribeAll();
    this._events.image360Exited.unsubscribeAll();
  }
}
