/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { CogniteClient, Metadata } from '@cognite/sdk';
import {
  Image360Collection,
  Image360Entity,
  Image360CollectionFactory,
  Image360Facade,
  Image360,
  Image360RevisionEntity,
  DefaultImage360Collection
} from '@reveal/360-images';
import { Cdf360ImageEventProvider } from '@reveal/data-providers';
import {
  BeforeSceneRenderedDelegate,
  determineCurrentDevice,
  EventTrigger,
  InputHandler,
  pixelToNormalizedDeviceCoordinates,
  PointerEventData,
  SceneHandler
} from '@reveal/utilities';
import { CameraManager, ProxyCameraManager, StationaryCameraManager } from '@reveal/camera-manager';
import { MetricsLogger } from '@reveal/metrics';
import debounce from 'lodash/debounce';

export class Image360ApiHelper {
  private readonly _image360Facade: Image360Facade<Metadata>;
  private readonly _domElement: HTMLElement;
  private _transitionInProgress: boolean = false;
  private readonly _raycaster = new THREE.Raycaster();
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
  private readonly _image360Navigation: StationaryCameraManager;
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;
  private _cachedCameraManager: CameraManager;

  constructor(
    cogniteClient: CogniteClient,
    sceneHandler: SceneHandler,
    domElement: HTMLElement,
    activeCameraManager: ProxyCameraManager,
    inputHandler: InputHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>
  ) {
    const image360DataProvider = new Cdf360ImageEventProvider(cogniteClient);
    const device = determineCurrentDevice();
    const image360EntityFactory = new Image360CollectionFactory(
      image360DataProvider,
      sceneHandler,
      onBeforeSceneRendered,
      device
    );
    this._image360Facade = new Image360Facade(image360EntityFactory);
    this._image360Navigation = new StationaryCameraManager(domElement, activeCameraManager.getCamera().clone());

    this._domElement = domElement;
    this._interactionState = {};

    this._activeCameraManager = activeCameraManager;
    this._cachedCameraManager = activeCameraManager.innerCameraManager;
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;

    const setHoverIconEventHandler = (event: MouseEvent) => this.setHoverIconOnIntersect(event.offsetX, event.offsetY);
    domElement.addEventListener('mousemove', setHoverIconEventHandler);

    const enter360Image = (event: PointerEventData) => this.enter360ImageOnIntersect(event);
    inputHandler.on('click', enter360Image);

    const handleAnnotationHover = (event: PointerEventData) => this.handleAnnotationCursorEvent('hover', event);
    inputHandler.on('hover', handleAnnotationHover);

    const handleAnnotationClick = (event: PointerEventData) => this.handleAnnotationCursorEvent('click', event);
    inputHandler.on('click', handleAnnotationClick);

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

  private getNormalizedOffset(data: PointerEventData): THREE.Vector2 {
    return new THREE.Vector2(
      (data.offsetX / this._domElement.clientWidth) * 2 - 1,
      1 - (data.offsetY / this._domElement.clientHeight) * 2
    );
  }

  private handleAnnotationCursorEvent(eventType: 'hover' | 'click', event: PointerEventData): void {
    const currentEntity = this._interactionState.currentImage360Entered;

    if (currentEntity === undefined) {
      return;
    }

    const point = this.getNormalizedOffset(event);

    this._raycaster.setFromCamera(point, this._activeCameraManager.getCamera());

    const annotation = currentEntity.intersectAnnotations(this._raycaster);

    if (annotation === undefined) {
      return;
    }

    const collection = this._image360Facade.getCollectionContainingEntity(currentEntity);

    if (eventType === 'hover') {
      collection.fireHoverEvent(annotation);
    } else if (eventType === 'click') {
      collection.fireClickEvent(annotation);
    }
  }

  public async add360ImageSet(
    eventFilter: Metadata,
    collectionTransform: THREE.Matrix4,
    preMultipliedRotation: boolean
  ): Promise<Image360Collection> {
    const id: string | undefined = eventFilter.site_id;
    if (id === undefined) {
      throw new Error('Image set filter must contain site_id');
    }
    if (this._image360Facade.collections.map(collection => collection.id).includes(id)) {
      throw new Error(`Image set with id=${id} has already been added`);
    }
    const imageCollection = await this._image360Facade.create(eventFilter, collectionTransform, preMultipliedRotation);

    this._needsRedraw = true;
    return imageCollection;
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

  public async enter360Image(image360Entity: Image360Entity, revision?: Image360RevisionEntity): Promise<void> {
    const revisionToEnter = revision ?? this.findRevisionIdToEnter(image360Entity);
    this._interactionState.revisionSelectedForEntry = revisionToEnter;

    const fatalDownloadError = await this._image360Facade.preload(image360Entity, revisionToEnter, true).catch(e => {
      return e;
    });

    if (this._interactionState.revisionSelectedForEntry !== revisionToEnter) {
      return;
    }

    if (fatalDownloadError) {
      this._interactionState.revisionSelectedForEntry = undefined;
      return;
    }

    const lastEntered360ImageEntity = this._interactionState.currentImage360Entered;
    this._interactionState.currentImage360Entered = image360Entity;
    image360Entity.setActiveRevision(revisionToEnter);

    this.set360CameraManager();

    const imageCollection = this._image360Facade.getCollectionContainingEntity(image360Entity);
    this._interactionState.enteredCollection = imageCollection;

    lastEntered360ImageEntity?.icon.setVisibility(imageCollection.isCollectionVisible);
    image360Entity.icon.setVisibility(false);
    image360Entity.image360Visualization.visible = true;
    this._image360Facade.allIconCullingScheme = 'proximity';
    this._image360Facade.allHoverIconsVisibility = false;

    // Only do transition if we are swithing between entities.
    // Revisions are updated instantly (for now).
    if (lastEntered360ImageEntity === image360Entity) {
      this._needsRedraw = true;
    } else {
      this._transitionInProgress = true;
      if (lastEntered360ImageEntity !== undefined) {
        await this.transition(lastEntered360ImageEntity, image360Entity);
        MetricsLogger.trackEvent('360ImageEntered', {});
      } else {
        const transitionDuration = 1000;
        const position = new THREE.Vector3().setFromMatrixPosition(image360Entity.transform);
        await Promise.all([
          this._image360Navigation.moveTo(position, transitionDuration),
          this.tweenVisualizationAlpha(image360Entity, 0, 1, transitionDuration)
        ]);
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

    const fromPosition = new THREE.Vector3().setFromMatrixPosition(from360Entity.transform);
    const toPosition = new THREE.Vector3().setFromMatrixPosition(to360Entity.transform);
    const length = new THREE.Vector3().subVectors(toPosition, fromPosition).length();

    const toZoom = this._image360Navigation.defaultFOV;
    const fromZoom = this._image360Navigation.getCamera().fov;

    setPreTransitionState();

    const currentFromOpacity = fromVisualizationCube.opacity;
    await Promise.all([
      this._image360Navigation.moveTo(toPosition, cameraTransitionDuration),
      this.tweenVisualizationZoom(this._image360Navigation, fromZoom, toZoom, alphaTweenDuration),
      this.tweenVisualizationAlpha(from360Entity, currentFromOpacity, 0, alphaTweenDuration)
    ]);

    restorePostTransitionState(currentFromOpacity);

    function setPreTransitionState() {
      const fillingScaleMagnitude = length * 2;
      const uniformScaling = new THREE.Vector3(1, 1, 1).multiplyScalar(fillingScaleMagnitude);

      fromVisualizationCube.scale = uniformScaling;
      fromVisualizationCube.renderOrder = default360ImageRenderOrder + 1;

      toVisualizationCube.scale = uniformScaling;
      toVisualizationCube.renderOrder = default360ImageRenderOrder;
    }

    function restorePostTransitionState(opacity: number) {
      const defaultScaling = new THREE.Vector3(1, 1, 1);

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

  private set360CameraManager() {
    if (this._activeCameraManager.innerCameraManager !== this._image360Navigation) {
      this._cachedCameraManager = this._activeCameraManager.innerCameraManager;
      this._activeCameraManager.setActiveCameraManager(this._image360Navigation);
    }
  }

  public exit360Image(): void {
    this._image360Facade.allIconCullingScheme = 'clustered';
    if (this._interactionState.currentImage360Entered !== undefined) {
      const imageCollection = this._image360Facade.getCollectionContainingEntity(
        this._interactionState.currentImage360Entered
      );
      this._interactionState.currentImage360Entered.icon.setVisibility(imageCollection.isCollectionVisible);
      imageCollection.events.image360Exited.fire();

      this._interactionState.currentImage360Entered.image360Visualization.visible = false;
      this._interactionState.currentImage360Entered = undefined;
      this._interactionState.revisionSelectedForEntry = undefined;
      this._interactionState.enteredCollection = undefined;
      MetricsLogger.trackEvent('360ImageExited', {});
    }
    const { position, rotation } = this._image360Navigation.getCameraState();
    this._activeCameraManager.setActiveCameraManager(this._cachedCameraManager);
    this._activeCameraManager.setCameraState({
      position,
      target: new THREE.Vector3(0, 0, -1).applyQuaternion(rotation).add(position)
    });
    this._domElement.removeEventListener('keydown', this._eventHandlers.exit360ImageOnEscapeKey);
  }

  public dispose(): void {
    this._onBeforeSceneRenderedEvent.unsubscribe(this._eventHandlers.updateHoverStateOnRender);
    this._domElement.removeEventListener('mousemove', this._eventHandlers.setHoverIconEventHandler);
    this._domElement.addEventListener('pointerup', this._eventHandlers.enter360Image);
    this._domElement.addEventListener('keydown', this._eventHandlers.exit360ImageOnEscapeKey);

    if (this._activeCameraManager.innerCameraManager === this._image360Navigation) {
      this._activeCameraManager.setActiveCameraManager(this._cachedCameraManager);
    }

    this._image360Facade.dispose();
    this._image360Navigation.dispose();
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
    const size = new THREE.Vector2(this._domElement.clientWidth, this._domElement.clientHeight);

    const { x: width, y: height } = size;
    const ndcCoordinates = pixelToNormalizedDeviceCoordinates(offsetX, offsetY, width, height);
    const entity = this._image360Facade.intersect(
      new THREE.Vector2(ndcCoordinates.x, ndcCoordinates.y),
      this._activeCameraManager.getCamera()
    );
    return entity;
  }

  private setHoverIconOnIntersect(offsetX: number, offsetY: number) {
    this._interactionState.lastMousePosition = { offsetX, offsetY };
    this._image360Facade.allHoverIconsVisibility = false;
    const size = new THREE.Vector2(this._domElement.clientWidth, this._domElement.clientHeight);

    const { x: width, y: height } = size;
    const ndcCoordinates = pixelToNormalizedDeviceCoordinates(offsetX, offsetY, width, height);
    const entity = this._image360Facade.intersect(
      new THREE.Vector2(ndcCoordinates.x, ndcCoordinates.y),
      this._activeCameraManager.getCamera()
    );

    if (entity !== undefined) {
      entity.icon.hoverSpriteVisible = true;
    }

    if (entity === this._interactionState.currentImage360Hovered) {
      return;
    }

    if (entity !== undefined) {
      entity.icon.hoverSpriteVisible = true;
      this._debouncePreLoad(entity);
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
      await this.tweenVisualizationAlpha(lastEntered, currentOpacity, 0, transitionOutDuration);
      lastEntered.image360Visualization.opacity = currentOpacity;
    }
    this.exit360Image();
  }
}
