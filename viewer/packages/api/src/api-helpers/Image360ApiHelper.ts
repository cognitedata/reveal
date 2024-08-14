/*!
 * Copyright 2022 Cognite AS
 */
import { Quaternion, Raycaster, Vector2, Vector3, type Matrix4 } from 'three';
import TWEEN from '@tweenjs/tween.js';

import { CogniteClient, Metadata } from '@cognite/sdk';
import {
  Image360Collection,
  Image360Entity,
  Image360CollectionFactory,
  Image360Facade,
  Image360,
  IconsOptions,
  Image360RevisionEntity,
  DefaultImage360Collection,
  Image360AnnotationIntersection,
  Image360AnnotationFilterOptions
} from '@reveal/360-images';
import {
  Cdf360CombinedDescriptorProvider,
  Cdf360DataModelsDescriptorProvider,
  Cdf360EventDescriptorProvider,
  Cdf360ImageProvider,
  Image360DataModelIdentifier
} from '@reveal/data-providers';
import {
  BeforeSceneRenderedDelegate,
  determineCurrentDevice,
  EventTrigger,
  InputHandler,
  getNormalizedPixelCoordinates,
  PointerEventData,
  SceneHandler
} from '@reveal/utilities';
import {
  CameraManager,
  FlexibleCameraManager,
  ProxyCameraManager,
  StationaryCameraManager
} from '@reveal/camera-manager';
import { MetricsLogger } from '@reveal/metrics';
import debounce from 'lodash/debounce';
import { Image360WithCollection } from '../public/types';

export class Image360ApiHelper {
  private readonly _image360Facade: Image360Facade<Metadata | Image360DataModelIdentifier>;
  private readonly _domElement: HTMLElement;
  private _transitionInProgress: boolean = false;
  private readonly _raycaster = new Raycaster();
  private _needsRedraw: boolean = false;

  private readonly _interactionState: {
    currentImage360Hovered?: Image360Entity;
    currentImage360Entered?: Image360Entity;
    revisionSelectedForEntry?: Image360RevisionEntity;
    enteredCollection?: DefaultImage360Collection;
    lastMousePosition?: { offsetX: number; offsetY: number };
  };

  private readonly _eventHandlers: {
    setHoverIconEventHandler: (event: MouseEvent) => void;
    enter360Image: (event: PointerEvent) => Promise<void>;
    exit360ImageOnEscapeKey: (event: KeyboardEvent) => void;
    updateHoverStateOnRender: () => void;
  };

  private readonly _debouncePreLoad = debounce(
    entity => {
      this._image360Facade.preload(entity, this.findRevisionIdToEnter(entity)).catch(() => {});
    },
    300,
    {
      leading: true
    }
  );

  private readonly _activeCameraManager: ProxyCameraManager;
  private readonly _stationaryCameraManager: StationaryCameraManager | undefined;
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;
  private _cachedCameraManager: CameraManager | undefined;

  constructor(
    cogniteClient: CogniteClient,
    sceneHandler: SceneHandler,
    domElement: HTMLElement,
    activeCameraManager: ProxyCameraManager,
    inputHandler: InputHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>,
    iconsOptions?: IconsOptions
  ) {
    const image360EventDescriptorProvider = new Cdf360EventDescriptorProvider(cogniteClient);
    const image360DataModelsDescriptorProvider = new Cdf360DataModelsDescriptorProvider(cogniteClient);
    const combinedDescriptorProvider = new Cdf360CombinedDescriptorProvider(
      image360DataModelsDescriptorProvider,
      image360EventDescriptorProvider
    );

    const setNeedsRedraw: () => void = () => (this._needsRedraw = true);

    const image360DataProvider = new Cdf360ImageProvider(cogniteClient, combinedDescriptorProvider);
    const device = determineCurrentDevice();
    const image360EntityFactory = new Image360CollectionFactory(
      image360DataProvider,
      sceneHandler,
      onBeforeSceneRendered,
      setNeedsRedraw,
      device,
      iconsOptions
    );
    this._image360Facade = new Image360Facade(image360EntityFactory);

    this._domElement = domElement;
    this._interactionState = {};

    this._activeCameraManager = activeCameraManager;
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;
    if (!FlexibleCameraManager.as(activeCameraManager.innerCameraManager)) {
      this._stationaryCameraManager = new StationaryCameraManager(domElement, activeCameraManager.getCamera().clone());
      this._cachedCameraManager = activeCameraManager.innerCameraManager;
    }
    const setHoverIconEventHandler = (event: MouseEvent) => this.setHoverIconOnIntersect(event.offsetX, event.offsetY);
    domElement.addEventListener('mousemove', setHoverIconEventHandler);

    const enter360Image = (event: PointerEventData) => this.enter360ImageOnIntersect(event);
    inputHandler.on('click', enter360Image);

    const exit360ImageOnEscapeKey = (event: KeyboardEvent) => this.exit360ImageOnEscape(event);

    const updateHoverStateOnRender = () => {
      const lastOffset = this._interactionState.lastMousePosition;
      if (lastOffset === undefined) {
        return;
      }
      this.setHoverIconOnIntersect(lastOffset.offsetX, lastOffset.offsetY);
    };

    onBeforeSceneRendered.subscribe(updateHoverStateOnRender);

    this._eventHandlers = {
      setHoverIconEventHandler,
      enter360Image,
      exit360ImageOnEscapeKey,
      updateHoverStateOnRender
    };
  }

  get needsRedraw(): boolean {
    return this._needsRedraw || this._image360Facade.collections.some(collection => collection.needsRedraw);
  }

  resetRedraw(): void {
    this._needsRedraw = false;
    this._image360Facade.collections.forEach(collection => collection.resetRedraw());
  }

  public async add360ImageSet(
    collectionIdentifier: Metadata | Image360DataModelIdentifier,
    collectionTransform: Matrix4,
    preMultipliedRotation: boolean,
    annotationOptions?: Image360AnnotationFilterOptions
  ): Promise<Image360Collection> {
    validateIds(this._image360Facade);

    const imageCollection = await this._image360Facade.create(
      collectionIdentifier,
      annotationOptions,
      collectionTransform,
      preMultipliedRotation
    );

    this._needsRedraw = true;
    return imageCollection;

    function validateIds(image360Facade: Image360Facade<Metadata | Image360DataModelIdentifier>) {
      if (!Cdf360CombinedDescriptorProvider.isFdmIdentifier(collectionIdentifier)) {
        const id: string | undefined = collectionIdentifier.site_id;
        if (id === undefined) {
          throw new Error('Image set filter must contain site_id');
        }
        if (image360Facade.collections.map(collection => collection.id).includes(id)) {
          throw new Error(`Image set with id=${id} has already been added`);
        }
      } else {
        if (
          image360Facade.collections
            .map(collection => collection.id)
            .includes(collectionIdentifier.image360CollectionExternalId)
        ) {
          throw new Error(
            `Image set with id=${collectionIdentifier.image360CollectionExternalId} has already been added`
          );
        }
      }
    }
  }

  public getImageCollections(): Image360Collection[] {
    return [...this._image360Facade.collections];
  }

  public async remove360Images(entities: Image360[]): Promise<void> {
    if (
      this._interactionState.currentImage360Entered !== undefined &&
      entities.includes(this._interactionState.currentImage360Entered)
    ) {
      this.exit360Image();
    }

    await Promise.all(entities.map(entity => this._image360Facade.delete(entity as Image360Entity)));
    this._needsRedraw = true;
  }

  public remove360ImageCollection(collection: Image360Collection): void {
    if (
      this._interactionState.currentImage360Entered !== undefined &&
      collection.image360Entities.includes(this._interactionState.currentImage360Entered)
    ) {
      this.exit360Image();
    }

    this._image360Facade.removeSet(collection as DefaultImage360Collection);

    this._needsRedraw = true;
  }

  public getCurrentlyEnteredImageInfo(): Image360WithCollection | undefined {
    const entity = this._interactionState.currentImage360Entered;

    if (entity === undefined) {
      return undefined;
    }

    const collection = this._image360Facade.getCollectionContainingEntity(entity);

    return {
      image360: entity,
      image360Collection: collection
    };
  }

  public async enter360Image(image360Entity: Image360Entity, revision?: Image360RevisionEntity): Promise<void> {
    const revisionToEnter = revision ?? this.findRevisionIdToEnter(image360Entity);
    if (revisionToEnter === this._interactionState.revisionSelectedForEntry) {
      return;
    }
    this._interactionState.revisionSelectedForEntry = revisionToEnter;
    try {
      await this._image360Facade.preload(image360Entity, revisionToEnter, true);
    } catch (error) {
      if (this._interactionState.revisionSelectedForEntry === revisionToEnter) {
        this._interactionState.revisionSelectedForEntry = undefined;
      }
      return;
    }
    if (this._interactionState.revisionSelectedForEntry !== revisionToEnter) {
      return;
    }
    const lastEntered360ImageEntity = this._interactionState.currentImage360Entered;
    this._interactionState.currentImage360Entered = image360Entity;
    lastEntered360ImageEntity?.deactivateAnnotations();
    image360Entity.setActiveRevision(revisionToEnter);

    this.setStationaryCameraManager();

    const imageCollection = this._image360Facade.getCollectionContainingEntity(image360Entity);
    this._interactionState.enteredCollection = imageCollection;

    if (lastEntered360ImageEntity) {
      lastEntered360ImageEntity.icon.setVisible(imageCollection.isCollectionVisible);
    }

    image360Entity.icon.setVisible(false);
    image360Entity.image360Visualization.visible = true;
    this._image360Facade.allIconCullingScheme = 'proximity';

    // Only do transition if we are switching between entities.
    // Revisions are updated instantly (for now).
    if (lastEntered360ImageEntity === image360Entity) {
      image360Entity.activateAnnotations();
      this._needsRedraw = true;
    } else {
      this._transitionInProgress = true;
      if (lastEntered360ImageEntity !== undefined) {
        await this.transition(lastEntered360ImageEntity, image360Entity);
        MetricsLogger.trackEvent('360ImageEntered', {});
      } else {
        const transitionDuration = 1000;
        const position = new Vector3().setFromMatrixPosition(image360Entity.transform);
        const flexibleCameraManager = FlexibleCameraManager.as(this._activeCameraManager.innerCameraManager);
        if (flexibleCameraManager) {
          await Promise.all([
            moveCameraPositionTo(flexibleCameraManager, position, transitionDuration),
            this.tweenVisualizationAlpha(image360Entity, 0, 1, transitionDuration)
          ]);
        } else if (this._stationaryCameraManager) {
          await Promise.all([
            this._stationaryCameraManager.moveTo(position, transitionDuration),
            this.tweenVisualizationAlpha(image360Entity, 0, 1, transitionDuration)
          ]);
        }
        image360Entity.activateAnnotations();
        MetricsLogger.trackEvent('360ImageTransitioned', {});
      }
      this._transitionInProgress = false;
    }
    this._domElement.addEventListener('keydown', this._eventHandlers.exit360ImageOnEscapeKey);
    this.applyFullResolutionTextures(revisionToEnter);

    imageCollection.events.image360Entered.fire(image360Entity, revisionToEnter);
  }

  private async applyFullResolutionTextures(revision: Image360RevisionEntity) {
    await revision.applyFullResolutionTextures();
    this._needsRedraw = true;
  }

  private async transition(from360Entity: Image360Entity, to360Entity: Image360Entity) {
    const cameraTransitionDuration = 1000;
    const alphaTweenDuration = 800;
    const default360ImageRenderOrder = 3;

    const toVisualizationCube = to360Entity.image360Visualization;
    const fromVisualizationCube = from360Entity.image360Visualization;

    const fromPosition = new Vector3().setFromMatrixPosition(from360Entity.transform);
    const toPosition = new Vector3().setFromMatrixPosition(to360Entity.transform);
    const length = new Vector3().subVectors(toPosition, fromPosition).length();

    setPreTransitionState();

    const currentFromOpacity = fromVisualizationCube.opacity;

    from360Entity.deactivateAnnotations();
    const flexibleCameraManager = FlexibleCameraManager.as(this._activeCameraManager.innerCameraManager);
    if (flexibleCameraManager) {
      flexibleCameraManager.controls.isStationary = true;
      await Promise.all([
        moveCameraPositionTo(flexibleCameraManager, toPosition, cameraTransitionDuration),
        tweenCameraToDefaultFov(flexibleCameraManager, alphaTweenDuration),
        this.tweenVisualizationAlpha(from360Entity, currentFromOpacity, 0, alphaTweenDuration)
      ]);
    } else if (this._stationaryCameraManager) {
      const fromZoom = this._stationaryCameraManager.getCamera().fov;
      const toZoom = this._stationaryCameraManager.defaultFOV;
      await Promise.all([
        this._stationaryCameraManager.moveTo(toPosition, cameraTransitionDuration),
        this.tweenVisualizationZoom(this._stationaryCameraManager, fromZoom, toZoom, alphaTweenDuration),
        this.tweenVisualizationAlpha(from360Entity, currentFromOpacity, 0, alphaTweenDuration)
      ]);
    }
    to360Entity.activateAnnotations();

    restorePostTransitionState(currentFromOpacity);

    function setPreTransitionState() {
      const fillingScaleMagnitude = length * 2;
      const uniformScaling = new Vector3(1, 1, 1).multiplyScalar(fillingScaleMagnitude);

      fromVisualizationCube.scale = uniformScaling;
      fromVisualizationCube.renderOrder = default360ImageRenderOrder + 1;

      toVisualizationCube.scale = uniformScaling;
      toVisualizationCube.renderOrder = default360ImageRenderOrder;
    }

    function restorePostTransitionState(opacity: number) {
      const defaultScaling = new Vector3(1, 1, 1);

      fromVisualizationCube.scale = defaultScaling;
      fromVisualizationCube.renderOrder = default360ImageRenderOrder;

      toVisualizationCube.scale = defaultScaling;
      toVisualizationCube.renderOrder = default360ImageRenderOrder;

      fromVisualizationCube.visible = false;
      fromVisualizationCube.opacity = opacity;
    }
  }

  private tweenVisualizationAlpha(
    entity: Image360Entity,
    alphaFrom: number,
    alphaTo: number,
    duration: number
  ): Promise<void> {
    const from = { alpha: alphaFrom };
    const to = { alpha: alphaTo };
    const tween = new TWEEN.Tween(from)
      .to(to, duration)
      .onUpdate(() => {
        entity.image360Visualization.opacity = from.alpha;
        this._needsRedraw = true;
      })
      .easing(num => TWEEN.Easing.Quintic.InOut(num))
      .start(TWEEN.now());

    return new Promise(resolve => {
      tween.onComplete(() => {
        tween.stop();
        resolve();
      });
    });
  }

  private tweenVisualizationZoom(
    camera: StationaryCameraManager,
    fovFrom: number,
    fovTo: number,
    duration: number
  ): Promise<void> {
    const from = { fov: fovFrom };
    const to = { fov: fovTo };
    const delay = duration * 0.25;
    const tween = new TWEEN.Tween(from)
      .to(to, duration * 0.5)
      .onUpdate(() => {
        camera.setFOV(from.fov);
      })
      .delay(delay)
      .easing(num => TWEEN.Easing.Quintic.InOut(num))
      .start(TWEEN.now());

    return new Promise(resolve => {
      tween.onComplete(() => {
        tween.stop();
        resolve();
      });
    });
  }

  private setStationaryCameraManager() {
    const flexibleCameraManager = FlexibleCameraManager.as(this._activeCameraManager.innerCameraManager);
    if (flexibleCameraManager) {
      flexibleCameraManager.controls.isStationary = true;
    } else if (this._stationaryCameraManager) {
      if (this._activeCameraManager.innerCameraManager !== this._stationaryCameraManager) {
        this._cachedCameraManager = this._activeCameraManager.innerCameraManager;
        this._activeCameraManager.setActiveCameraManager(this._stationaryCameraManager);
      }
    }
  }

  public exit360Image(): void {
    this._image360Facade.allIconCullingScheme = 'clustered';
    if (this._interactionState.currentImage360Entered === undefined) {
      return;
    }
    const imageCollection = this._image360Facade.getCollectionContainingEntity(
      this._interactionState.currentImage360Entered
    );
    this._interactionState.currentImage360Entered.icon.setVisible(imageCollection.isCollectionVisible);
    imageCollection.events.image360Exited.fire();

    this._interactionState.currentImage360Entered.deactivateAnnotations();
    this._interactionState.currentImage360Entered.image360Visualization.visible = false;
    this._interactionState.currentImage360Entered = undefined;
    this._interactionState.revisionSelectedForEntry = undefined;
    this._interactionState.enteredCollection = undefined;
    MetricsLogger.trackEvent('360ImageExited', {});

    const flexibleCameraManager = FlexibleCameraManager.as(this._activeCameraManager.innerCameraManager);
    if (flexibleCameraManager) {
      flexibleCameraManager.controls.isStationary = false;
      const { position, rotation } = flexibleCameraManager.getCameraState();
      setCameraTarget1MeterInFrontOfCamera(flexibleCameraManager, position, rotation);
    } else if (this._stationaryCameraManager && this._cachedCameraManager) {
      const { position, rotation } = this._stationaryCameraManager.getCameraState();
      this._activeCameraManager.setActiveCameraManager(this._cachedCameraManager);
      setCameraTarget1MeterInFrontOfCamera(this._activeCameraManager, position, rotation);
    }
    this._domElement.removeEventListener('keydown', this._eventHandlers.exit360ImageOnEscapeKey);

    function setCameraTarget1MeterInFrontOfCamera(manager: CameraManager, position: Vector3, rotation: Quaternion) {
      manager.setCameraState({
        position,
        target: new Vector3(0, 0, -1).applyQuaternion(rotation).add(position)
      });
    }
  }

  public dispose(): void {
    this._onBeforeSceneRenderedEvent.unsubscribe(this._eventHandlers.updateHoverStateOnRender);
    this._domElement.removeEventListener('mousemove', this._eventHandlers.setHoverIconEventHandler);
    this._domElement.removeEventListener('keydown', this._eventHandlers.exit360ImageOnEscapeKey);

    if (this._stationaryCameraManager && this._cachedCameraManager) {
      if (this._activeCameraManager.innerCameraManager === this._stationaryCameraManager) {
        this._activeCameraManager.setActiveCameraManager(this._cachedCameraManager);
      }
      this._stationaryCameraManager.dispose();
    }
    this._image360Facade.dispose();
  }

  private findRevisionIdToEnter(image360Entity: Image360Entity): Image360RevisionEntity {
    const targetDate = this._image360Facade.getCollectionContainingEntity(image360Entity).targetRevisionDate;
    return targetDate ? image360Entity.getRevisionClosestToDate(targetDate) : image360Entity.getMostRecentRevision();
  }

  private enter360ImageOnIntersect(event: PointerEventData): Promise<void> {
    if (this._transitionInProgress) {
      return Promise.resolve();
    }
    const entity = this.intersect360ImageIcons(event.offsetX, event.offsetY);
    if (entity === undefined) {
      return Promise.resolve();
    }
    return this.enter360Image(entity);
  }

  public intersect360ImageIcons(offsetX: number, offsetY: number): Image360Entity | undefined {
    const ndcCoordinates = getNormalizedPixelCoordinates(this._domElement, offsetX, offsetY);
    const entity = this._image360Facade.intersect(
      new Vector2(ndcCoordinates.x, ndcCoordinates.y),
      this._activeCameraManager.getCamera()
    );
    return entity;
  }

  public intersect360ImageAnnotations(offsetX: number, offsetY: number): Image360AnnotationIntersection | undefined {
    const currentEntity = this._interactionState.currentImage360Entered;

    if (currentEntity === undefined) {
      return undefined;
    }

    const point = getNormalizedPixelCoordinates(this._domElement, offsetX, offsetY);
    this._raycaster.setFromCamera(point, this._activeCameraManager.getCamera());

    const annotation = currentEntity.intersectAnnotations(this._raycaster);

    if (annotation === undefined) {
      return undefined;
    }

    return {
      type: 'image360Annotation',
      annotation,
      direction: this._raycaster.ray.direction
    };
  }

  private setHoverIconOnIntersect(offsetX: number, offsetY: number) {
    this._interactionState.lastMousePosition = { offsetX, offsetY };
    this._image360Facade.allIconsSelected = false;
    const ndcCoordinates = getNormalizedPixelCoordinates(this._domElement, offsetX, offsetY);
    const entity = this._image360Facade.intersect(
      new Vector2(ndcCoordinates.x, ndcCoordinates.y),
      this._activeCameraManager.getCamera()
    );

    if (entity === this._interactionState.currentImage360Hovered) {
      entity?.icon.updateHoverSpriteScale();

      return;
    }

    if (entity !== undefined) {
      this._image360Facade.setHoverIconVisibilityForEntity(entity, true);
      entity.icon.selected = true;
      this._debouncePreLoad(entity);
    } else {
      this._image360Facade.hideAllHoverIcons();
    }

    this._needsRedraw = true;
    this._interactionState.currentImage360Hovered = entity;
  }

  private async exit360ImageOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }

    const lastEntered = this._interactionState.currentImage360Entered;
    if (lastEntered !== undefined) {
      const transitionOutDuration = 600;
      const currentOpacity = lastEntered.image360Visualization.opacity;
      lastEntered.deactivateAnnotations();
      await this.tweenVisualizationAlpha(lastEntered, currentOpacity, 0, transitionOutDuration);
      lastEntered.image360Visualization.opacity = currentOpacity;
    }
    this.exit360Image();
  }
}

//================================================
// STATIC METHODS: Tweens for FlexibleCameraManager
//================================================

function moveCameraPositionTo(manager: FlexibleCameraManager, position: Vector3, duration: number): void {
  if (manager.isDisposed) {
    return;
  }
  const cameraPosition = manager.camera.position;
  const from = {
    x: cameraPosition.x,
    y: cameraPosition.y,
    z: cameraPosition.z
  };
  const to = {
    x: position.x,
    y: position.y,
    z: position.z
  };

  const tempPosition = new Vector3();
  manager.controls.temporarilyDisableKeyboard = true;

  new TWEEN.Tween(from)
    .to(to, duration)
    .onUpdate(() => {
      tempPosition.set(from.x, from.y, from.z);
      manager.setPosition(tempPosition);
    })
    .easing(num => TWEEN.Easing.Quintic.InOut(num))
    .onStop(() => {
      manager.setPosition(tempPosition);
      manager.controls.temporarilyDisableKeyboard = false;
    })
    .onComplete(() => {
      manager.setPosition(position);
      manager.controls.temporarilyDisableKeyboard = false;
    })
    .start(TWEEN.now());
}

function tweenCameraToDefaultFov(manager: FlexibleCameraManager, duration: number): void {
  const from = { fov: manager.controls.fov };
  const to = { fov: manager.controls.options.defaultFov };
  const delay = duration * 0.25;
  new TWEEN.Tween(from)
    .to(to, duration * 0.5)
    .onUpdate(() => {
      manager.controls.setFov(from.fov);
    })
    .onComplete(() => {
      manager.controls.setFov(to.fov);
    })
    .delay(delay)
    .easing(num => TWEEN.Easing.Quintic.InOut(num))
    .start(TWEEN.now());
}
