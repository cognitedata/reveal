/*!
 * Copyright 2023 Cognite AS
 */

import { assertNever, EventTrigger } from '@reveal/utilities';
import pull from 'lodash/pull';
import cloneDeep from 'lodash/cloneDeep';
import {
  AssetAnnotationImage360Info,
  Image360AnnotationAssetFilter,
  Image360AnnotationAssetQueryResult,
  Image360Collection
} from './Image360Collection';
import { Image360Entity } from '../entity/Image360Entity';
import { Image360EnteredDelegate, Image360ExitedDelegate } from '../types';
import { IconCollection, IconCullingScheme } from '../icons/IconCollection';
import { Image360AnnotationAppearance } from '../annotation/types';
import { Image360Annotation } from '../annotation/Image360Annotation';
import {
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  IdEither,
  CogniteInternalId,
  InternalId,
  ExternalId
} from '@cognite/sdk';

import { Image360DataProvider, Image360FileDescriptor } from '@reveal/data-providers';
import { Image360RevisionEntity } from '../entity/Image360RevisionEntity';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { Image360 } from '../entity/Image360';
import { Image360Revision } from '../entity/Image360Revision';
import { ImageAssetLinkAnnotationInfo } from '@reveal/data-providers';
import { Matrix4 } from 'three';
import { DEFAULT_IMAGE_360_OPACITY } from '../entity/Image360VisualizationBox';

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

  /**
   * If defined, any subsequently entered 360 images will load the revision that are closest to the target date.
   * If undefined, the most recent revision will be loaded.
   */
  private _targetRevisionDate: Date | undefined;

  private _needsRedraw: boolean = false;

  private _defaultStyle: Image360AnnotationAppearance = {};

  private readonly _image360DataProvider: Image360DataProvider;
  private readonly _annotationFilter: Image360AnnotationFilter;

  private readonly _events = {
    image360Entered: new EventTrigger<Image360EnteredDelegate>(),
    image360Exited: new EventTrigger<Image360ExitedDelegate>()
  };
  private readonly _icons: IconCollection;
  private _isCollectionVisible: boolean;
  private readonly _collectionId: string;
  private readonly _collectionLabel: string | undefined;
  private readonly _setNeedsRedraw: () => void;

  get id(): string {
    return this._collectionId;
  }

  get label(): string | undefined {
    return this._collectionLabel;
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
  } {
    return this._events;
  }

  get isCollectionVisible(): boolean {
    return this._isCollectionVisible;
  }

  constructor(
    collectionId: string,
    collectionLabel: string | undefined,
    entities: Image360Entity[],
    icons: IconCollection,
    annotationFilter: Image360AnnotationFilter,
    image360DataProvider: Image360DataProvider,
    setNeedsRedraw: () => void
  ) {
    this._collectionId = collectionId;
    this._collectionLabel = collectionLabel;
    this.image360Entities = entities;
    this._icons = icons;
    this._isCollectionVisible = true;
    this._annotationFilter = annotationFilter;
    this._image360DataProvider = image360DataProvider;
    this._setNeedsRedraw = setNeedsRedraw;
  }

  public getModelTransformation(out?: Matrix4): Matrix4 {
    return this._icons.getTransform(out);
  }

  public setModelTransformation(matrix: Matrix4): void {
    this._icons.setTransform(matrix);
    this.image360Entities.forEach(entity => entity.setWorldTransform(matrix));
    this._setNeedsRedraw();
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

  getIconsVisibility(): boolean {
    return this._isCollectionVisible;
  }

  public setIconsVisibility(value: boolean): void {
    this._isCollectionVisible = value;
    this.image360Entities.forEach(entity => entity.icon.setVisible(value));
    this._needsRedraw = true;
  }

  public isOccludedIconsVisible(): boolean {
    return this._icons.isOccludedVisible();
  }

  public setOccludedIconsVisible(value: boolean): void {
    this._icons.setOccludedVisible(value);
    this._needsRedraw = true;
  }

  public getIconsOpacity(): number {
    return this._icons.getOpacity();
  }

  public setIconsOpacity(value: number): void {
    this._icons.setOpacity(value);
    this._needsRedraw = true;
  }

  public getImagesOpacity(): number {
    for (const entity of this.image360Entities) {
      return entity.image360Visualization.opacity;
    }
    return DEFAULT_IMAGE_360_OPACITY;
  }

  public setImagesOpacity(value: number): void {
    for (const entity of this.image360Entities) {
      entity.image360Visualization.opacity = value;
    }
    this._needsRedraw = true;
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

  public setSelectedForAll(selected: boolean): void {
    this.image360Entities.forEach(entity => (entity.icon.selected = selected));
  }

  public setSelectedVisibility(visible: boolean): boolean {
    if (this._icons.hoverSpriteVisibility == visible) {
      return false;
    }
    this._icons.hoverSpriteVisibility = visible;
    return true;
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

  getDefaultAnnotationStyle(): Image360AnnotationAppearance {
    return cloneDeep(this._defaultStyle);
  }

  public setDefaultAnnotationStyle(defaultStyle: Image360AnnotationAppearance): void {
    this._defaultStyle = defaultStyle;
    this.image360Entities.forEach(entity =>
      entity.getRevisions().forEach(revision => revision.setDefaultAppearance(defaultStyle))
    );
  }

  public async findImageAnnotations(
    filter: Image360AnnotationAssetFilter
  ): Promise<Image360AnnotationAssetQueryResult[]> {
    const imageIds = await this._image360DataProvider.getFilesByAssetRef(filter.assetRef);
    const imageIdSet = new Set<CogniteInternalId>(imageIds);

    const entityAnnotationsPromises = this.image360Entities.map(getEntityAnnotationsForAsset);
    const entityAnnotations = await Promise.all(entityAnnotationsPromises);
    return entityAnnotations.flat();

    async function getEntityAnnotationsForAsset(entity: Image360Entity): Promise<Image360AnnotationAssetQueryResult[]> {
      const revisionPromises = entity.getRevisions().map(async revision => {
        const annotations = await getRevisionAnnotationsForAsset(revision);

        return annotations.map(annotation => ({ image: entity, revision, annotation }));
      });

      const revisionMatches = await Promise.all(revisionPromises);
      return revisionMatches.flat();
    }

    async function getRevisionAnnotationsForAsset(revision: Image360RevisionEntity): Promise<Image360Annotation[]> {
      const relevantDescriptors = revision.getDescriptors().faceDescriptors.filter(desc => imageIdSet.has(desc.fileId));

      if (relevantDescriptors.length === 0) {
        return [];
      }

      const annotations = await revision.getAnnotations();

      return annotations.filter(a => {
        const assetLink = a.annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink;
        return assetLink.assetRef !== undefined && matchesAssetRef(assetLink, filter.assetRef);
      });
    }
  }

  async getAssetIds(): Promise<IdEither[]> {
    const fileDescriptors = this.getAllFileDescriptors();
    const annotations = await this._image360DataProvider.get360ImageAssets(fileDescriptors, annotation =>
      this._annotationFilter.filter(annotation)
    );

    return annotations.map(annotation => annotation.data.assetRef).filter(isIdEither);

    function isIdEither(idEither: any | undefined): idEither is IdEither {
      return idEither?.id !== undefined || idEither?.externalId !== undefined;
    }
  }

  async getAnnotationsInfo(): Promise<AssetAnnotationImage360Info[]> {
    const fileDescriptors = this.getAllFileDescriptors();
    const fileIdToEntityRevision = this.createFileIdToEntityRevisionMap();

    const annotations = await this._image360DataProvider.get360ImageAssets(fileDescriptors, annotation =>
      this._annotationFilter.filter(annotation)
    );

    return pairAnnotationsWithEntityAndRevision(annotations);

    function pairAnnotationsWithEntityAndRevision(annotations: ImageAssetLinkAnnotationInfo[]) {
      return annotations
        .map(annotation => {
          const entityRevisionObject = fileIdToEntityRevision.get(annotation.annotatedResourceId);

          if (entityRevisionObject === undefined) {
            return undefined;
          }

          const { entity, revision } = entityRevisionObject;

          return { annotationInfo: annotation, imageEntity: entity, imageRevision: revision };
        })
        .filter((info): info is AssetAnnotationImage360Info => info !== undefined);
    }
  }

  private getAllFileDescriptors(): Image360FileDescriptor[] {
    return this.image360Entities
      .map(entity =>
        entity
          .getRevisions()
          .map(revision => revision.getDescriptors().faceDescriptors)
          .flat()
      )
      .flat();
  }

  private createFileIdToEntityRevisionMap(): Map<number, { entity: Image360; revision: Image360Revision }> {
    return this.image360Entities.reduce((map, entity) => {
      entity.getRevisions().forEach(revision => {
        const descriptors = revision.getDescriptors().faceDescriptors;
        descriptors.forEach(descriptor => map.set(descriptor.fileId, { entity, revision }));
      });
      return map;
    }, new Map<number, { entity: Image360; revision: Image360Revision }>());
  }
}

function matchesAssetRef(assetLink: AnnotationsCogniteAnnotationTypesImagesAssetLink, matchRef: IdEither): boolean {
  return (
    ((matchRef as InternalId).id !== undefined && assetLink.assetRef.id === (matchRef as InternalId).id) ||
    ((matchRef as ExternalId).externalId !== undefined &&
      assetLink.assetRef.externalId === (matchRef as ExternalId).externalId)
  );
}
