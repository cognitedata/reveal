/*!
 * Copyright 2023 Cognite AS
 */

import { assertNever, EventTrigger, PointerEventData } from '@reveal/utilities';
import pull from 'lodash/pull';
import { Image360Collection } from './Image360Collection';
import { Image360Entity } from '../entity/Image360Entity';
import {
  Image360AnnotationClickedDelegate,
  Image360AnnotationHoveredDelegate,
  Image360EnteredDelegate,
  Image360ExitedDelegate
} from '../types';
import { IconCollection, IconCullingScheme } from '../icons/IconCollection';
import { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';
import { Image360AnnotationAppearance } from '../annotation/types';
import { Vector3 } from 'three';

type Image360Events = 'image360Entered' | 'image360Exited' | 'image360AnnotationHovered' | 'image360AnnotationClicked';

/**
 * Default implementation of {@link Image360Collection}. Used for events when entering
 * and exiting 360 image mode
 */
export class DefaultImage360Collection implements Image360Collection {
  /**
   * A list containing all the 360 images in this set.
   */
  readonly image360Entities: Image360Entity[];

  /**
   * If defined, any subsequently entered 360 images will load the revision that are closest to the target date.
   * If undefined, the most recent revision will be loaded.
   */
  private _targetRevisionDate: Date | undefined;

  private _needsRedraw: boolean = false;

  private _defaultStyle: Image360AnnotationAppearance = {};

  private readonly _events = {
    image360Entered: new EventTrigger<Image360EnteredDelegate>(),
    image360Exited: new EventTrigger<Image360ExitedDelegate>(),
    annotationHovered: new EventTrigger<Image360AnnotationHoveredDelegate>(),
    annotationClicked: new EventTrigger<Image360AnnotationClickedDelegate>()
  };
  private readonly _icons: IconCollection;
  private _isCollectionVisible: boolean;
  private readonly _collectionId: string;

  get id(): string {
    return this._collectionId;
  }

  get targetRevisionDate(): Date | undefined {
    return this._targetRevisionDate;
  }

  set targetRevisionDate(date: Date | undefined) {
    this._targetRevisionDate = date;
  }

  /**
   * The events from the image collection.
   */
  get events(): {
    image360Entered: EventTrigger<Image360EnteredDelegate>;
    image360Exited: EventTrigger<Image360ExitedDelegate>;
    annotationHovered: EventTrigger<Image360AnnotationHoveredDelegate>;
    annotationClicked: EventTrigger<Image360AnnotationClickedDelegate>;
  } {
    return this._events;
  }

  get isCollectionVisible(): boolean {
    return this._isCollectionVisible;
  }

  constructor(collectionId: string, entities: Image360Entity[], icons: IconCollection) {
    this._collectionId = collectionId;
    this.image360Entities = entities;
    this._icons = icons;
    this._isCollectionVisible = true;
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
  public on(event: 'image360AnnotationHovered', callback: Image360AnnotationHoveredDelegate): void;
  public on(event: 'image360AnnotationClicked', callback: Image360AnnotationClickedDelegate): void;
  /**
   * Subscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  public on(
    event: Image360Events,
    callback: Image360EnteredDelegate | Image360ExitedDelegate | Image360AnnotationHoveredDelegate
  ): void {
    switch (event) {
      case 'image360Entered':
        this._events.image360Entered.subscribe(callback as Image360EnteredDelegate);
        break;
      case 'image360Exited':
        this._events.image360Exited.subscribe(callback as Image360ExitedDelegate);
        break;
      case 'image360AnnotationHovered':
        this._events.annotationHovered.subscribe(callback as Image360AnnotationHoveredDelegate);
        break;
      case 'image360AnnotationClicked':
        this._events.annotationClicked.subscribe(callback as Image360AnnotationClickedDelegate);
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
    this._isCollectionVisible = visible;
    this.image360Entities.forEach(entity => (entity.icon.visible = visible));
  }

  /**
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  public off(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  public off(event: 'image360Exited', callback: Image360ExitedDelegate): void;
  public off(event: 'image360AnnotationHovered', callback: Image360AnnotationHoveredDelegate): void;
  public off(event: 'image360AnnotationClicked', callback: Image360AnnotationClickedDelegate): void;

  /**
   * Unsubscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  public off(
    event: Image360Events,
    callback:
      | Image360EnteredDelegate
      | Image360ExitedDelegate
      | Image360AnnotationHoveredDelegate
      | Image360AnnotationClickedDelegate
  ): void {
    switch (event) {
      case 'image360Entered':
        this._events.image360Entered.unsubscribe(callback as Image360EnteredDelegate);
        break;
      case 'image360Exited':
        this._events.image360Exited.unsubscribe(callback as Image360ExitedDelegate);
        break;
      case 'image360AnnotationHovered':
        this._events.annotationHovered.unsubscribe(callback as Image360AnnotationHoveredDelegate);
        break;
      case 'image360AnnotationClicked':
        this._events.annotationClicked.unsubscribe(callback as Image360AnnotationClickedDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  public setSelectedForAll(selected: boolean): void {
    this.image360Entities.forEach(entity => (entity.icon.selected = selected));
  }

  public fireHoverEvent(
    annotationObject: ImageAnnotationObject,
    pointerEvent: PointerEventData,
    direction: Vector3
  ): void {
    this._events.annotationHovered.fire(annotationObject, pointerEvent, direction);
  }

  public fireClickEvent(
    annotationObject: ImageAnnotationObject,
    pointerEvent: PointerEventData,
    direction: Vector3
  ): void {
    this._events.annotationClicked.fire(annotationObject, pointerEvent, direction);
  }

  public setSelectedVisibility(visible: boolean): void {
    this._icons.hoverSpriteVisibility = visible;
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

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  get defaultStyle(): Image360AnnotationAppearance {
    return this._defaultStyle;
  }

  public setDefaultAnnotationStyle(defaultStyle: Image360AnnotationAppearance): void {
    this._defaultStyle = defaultStyle;
    this.image360Entities.forEach(entity =>
      entity.getRevisions().forEach(revision => revision.setDefaultAppearance(defaultStyle))
    );
  }
}
