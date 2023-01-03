/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { CogniteClient, Metadata } from '@cognite/sdk';
import { Image360Entity, Image360EntityFactory, Image360Facade } from '@reveal/360-images';
import { Cdf360ImageEventProvider } from '@reveal/data-providers';
import { InputHandler, pixelToNormalizedDeviceCoordinates, PointerEventData, SceneHandler } from '@reveal/utilities';
import { CameraManager, ProxyCameraManager, StationaryCameraManager } from '@reveal/camera-manager';
import { Image360 } from '@reveal/360-images/src/Image360';

export class Image360ApiHelper {
  private readonly _image360Facade: Image360Facade<Metadata>;
  private readonly _domElement: HTMLElement;
  private _transitionInProgress: boolean = false;

  private readonly _interactionState: {
    lastHoveredState?: Image360Entity;
    lastImage360Entered?: Image360Entity;
  };

  private readonly _domEventHandlers: {
    setHoverIconEventHandler: (event: MouseEvent) => void;
    enter360Image: (event: PointerEvent) => Promise<void>;
    exit360ImageOnEscapeKey: (event: KeyboardEvent) => void;
  };

  private readonly _requestRedraw: () => void;
  private readonly _activeCameraManager: ProxyCameraManager;
  private readonly _image360Navigation: StationaryCameraManager;
  private _cachedCameraManager: CameraManager;

  constructor(
    cogniteClient: CogniteClient,
    sceneHandler: SceneHandler,
    domElement: HTMLElement,
    activeCameraManager: ProxyCameraManager,
    inputHandler: InputHandler,
    requestRedraw: () => void
  ) {
    const image360DataProvider = new Cdf360ImageEventProvider(cogniteClient);
    const image360EntityFactory = new Image360EntityFactory(image360DataProvider, sceneHandler);
    this._image360Facade = new Image360Facade(image360EntityFactory);
    this._image360Navigation = new StationaryCameraManager(domElement, activeCameraManager.getCamera().clone());

    this._domElement = domElement;
    this._interactionState = {};

    this._activeCameraManager = activeCameraManager;
    this._cachedCameraManager = activeCameraManager.innerCameraManager;
    this._requestRedraw = requestRedraw;

    const setHoverIconEventHandler = (event: MouseEvent) => this.setHoverIconOnIntersect(event);
    domElement.addEventListener('mousemove', setHoverIconEventHandler);

    const enter360Image = (event: PointerEventData) => this.enter360ImageOnIntersect(event);
    inputHandler.on('click', enter360Image);

    const exit360ImageOnEscapeKey = (event: KeyboardEvent) => this.exit360ImageOnEscape(event);

    this._domEventHandlers = {
      setHoverIconEventHandler,
      enter360Image,
      exit360ImageOnEscapeKey
    };
  }

  public async add360ImageSet(
    eventFilter: { [key: string]: string },
    collectionTransform: THREE.Matrix4,
    preMultipliedRotation: boolean
  ): Promise<Image360Entity[]> {
    const entities = await this._image360Facade.create(eventFilter, collectionTransform, preMultipliedRotation);
    this._requestRedraw();
    return entities;
  }

  public async remove360Images(entities: Image360[]): Promise<void> {
    await Promise.all(entities.map(entity => this._image360Facade.delete(entity as Image360Entity)));
  }

  public async enter360Image(image360Entity: Image360Entity): Promise<void> {
    const lastEntered360ImageEntity = this._interactionState.lastImage360Entered;

    if (lastEntered360ImageEntity === image360Entity) {
      this._requestRedraw();
      return;
    }

    await this._image360Facade.preload(image360Entity);

    this.set360CameraManager();

    const image360Visualization = image360Entity.image360Visualization;
    image360Visualization.visible = true;
    this._image360Facade.allIconsVisibility = true;
    image360Entity.icon.visible = false;

    this._transitionInProgress = true;
    if (lastEntered360ImageEntity !== undefined) {
      await this.transition(lastEntered360ImageEntity, image360Entity);
    } else {
      const transitionDuration = 1000;
      const position = new THREE.Vector3().setFromMatrixPosition(image360Entity.transform);
      await Promise.all([
        this._image360Navigation.moveTo(position, transitionDuration),
        this.tweenVisualizationAlpha(image360Entity, 0, 1, transitionDuration)
      ]);
    }
    this._transitionInProgress = false;
    this._interactionState.lastImage360Entered = image360Entity;
    this._domElement.addEventListener('keydown', this._domEventHandlers.exit360ImageOnEscapeKey);

    this._requestRedraw();
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

    setPreTransitionState();

    const currentFromOpacity = fromVisualizationCube.opacity;
    await Promise.all([
      this._image360Navigation.moveTo(toPosition, cameraTransitionDuration),
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
        this._requestRedraw();
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

  private set360CameraManager() {
    if (this._activeCameraManager.innerCameraManager !== this._image360Navigation) {
      this._cachedCameraManager = this._activeCameraManager.innerCameraManager;
      this._activeCameraManager.setActiveCameraManager(this._image360Navigation);
    }
  }

  public exit360Image(): void {
    this._image360Facade.allIconsVisibility = true;
    if (this._interactionState.lastImage360Entered !== undefined) {
      this._interactionState.lastImage360Entered.image360Visualization.visible = false;
      this._interactionState.lastImage360Entered = undefined;
    }
    const { position, rotation } = this._image360Navigation.getCameraState();
    this._activeCameraManager.setActiveCameraManager(this._cachedCameraManager);
    this._activeCameraManager.setCameraState({
      position,
      target: new THREE.Vector3(0, 0, -1).applyQuaternion(rotation).add(position)
    });
    this._domElement.removeEventListener('keydown', this._domEventHandlers.exit360ImageOnEscapeKey);
  }

  public dispose(): void {
    this._domElement.removeEventListener('mousemove', this._domEventHandlers.setHoverIconEventHandler);
    this._domElement.addEventListener('pointerup', this._domEventHandlers.enter360Image);
    this._domElement.addEventListener('keydown', this._domEventHandlers.exit360ImageOnEscapeKey);

    if (this._activeCameraManager.innerCameraManager === this._image360Navigation) {
      this._activeCameraManager.setActiveCameraManager(this._cachedCameraManager);
    }

    this._image360Navigation.dispose();
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
      { x: ndcCoordinates.x, y: ndcCoordinates.y },
      this._activeCameraManager.getCamera()
    );
    return entity;
  }

  private setHoverIconOnIntersect(event: MouseEvent) {
    this._image360Facade.allHoverIconsVisibility = false;
    const size = new THREE.Vector2(this._domElement.clientWidth, this._domElement.clientHeight);

    const { offsetX, offsetY } = event;
    const { x: width, y: height } = size;
    const ndcCoordinates = pixelToNormalizedDeviceCoordinates(offsetX, offsetY, width, height);
    const entity = this._image360Facade.intersect(
      { x: ndcCoordinates.x, y: ndcCoordinates.y },
      this._activeCameraManager.getCamera()
    );

    if (entity !== undefined) {
      entity.icon.hoverSpriteVisible = true;
    }

    if (entity === this._interactionState.lastHoveredState) {
      return;
    }

    if (entity !== undefined) {
      entity.icon.hoverSpriteVisible = true;
      this._image360Facade.preload(entity);
    }

    this._requestRedraw();
    this._interactionState.lastHoveredState = entity;
  }

  private async exit360ImageOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }

    const lastEntered = this._interactionState.lastImage360Entered;
    if (lastEntered !== undefined) {
      const transitionOutDuration = 600;
      const currentOpacity = lastEntered.image360Visualization.opacity;
      await this.tweenVisualizationAlpha(lastEntered, currentOpacity, 0, transitionOutDuration);
      lastEntered.image360Visualization.opacity = currentOpacity;
    }

    this.exit360Image();
  }
}
