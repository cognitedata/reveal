/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { CogniteClient, Metadata } from '@cognite/sdk';
import { Image360Entity, Image360EntityFactory, Image360Facade } from '@reveal/360-images';
import { Cdf360ImageEventProvider } from '@reveal/data-providers';
import { pixelToNormalizedDeviceCoordinates, SceneHandler } from '@reveal/utilities';
import { CameraManager, ProxyCameraManager, StationaryCameraManager } from '@reveal/camera-manager';

export class Image360ApiHelper {
  private readonly _image360Facade: Image360Facade<Metadata>;
  private readonly _domElement: HTMLElement;

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

    const enter360Image = (event: PointerEvent) => this.enter360ImageOnIntersect(event);
    domElement.addEventListener('pointerup', enter360Image);

    const exit360ImageOnEscapeKey = (event: KeyboardEvent) => this.exit360ImageOnEscape(event);
    domElement.addEventListener('keydown', exit360ImageOnEscapeKey);

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
    return this._image360Facade.create(eventFilter, collectionTransform, preMultipliedRotation);
  }

  public async enter360Image(image360Entity: Image360Entity): Promise<void> {
    await image360Entity.activate360Image();
    const position = new THREE.Vector3().setFromMatrixPosition(image360Entity.transform);
    const { rotation } = this._activeCameraManager.getCameraState();
    if (this._activeCameraManager.innerCameraManager !== this._image360Navigation) {
      this._cachedCameraManager = this._activeCameraManager.innerCameraManager;
      this._activeCameraManager.setActiveCameraManager(this._image360Navigation);
    }
    this._image360Navigation.setCameraState({ position, rotation });
    this._image360Facade.allIconsVisibility = true;
    image360Entity.icon.visible = false;
    if (this._interactionState.lastImage360Entered !== image360Entity) {
      this._interactionState.lastImage360Entered?.deactivate360Image();
    }
    this._interactionState.lastImage360Entered = image360Entity;
    this._requestRedraw();
  }

  public exit360Image(): void {
    this._image360Facade.allIconsVisibility = true;
    this._interactionState.lastImage360Entered?.deactivate360Image();
    this._interactionState.lastImage360Entered = undefined;
    this._activeCameraManager.setActiveCameraManager(this._cachedCameraManager);
  }

  public dispose(): void {
    this._domElement.removeEventListener('mousemove', this._domEventHandlers.setHoverIconEventHandler);
    this._domElement.addEventListener('pointerup', this._domEventHandlers.enter360Image);
    this._domElement.addEventListener('keydown', this._domEventHandlers.exit360ImageOnEscapeKey);
    this._image360Navigation.dispose();
  }

  private enter360ImageOnIntersect(event: PointerEvent): Promise<void> {
    const size = new THREE.Vector2(this._domElement.clientWidth, this._domElement.clientHeight);

    const { offsetX, offsetY } = event;
    const { x: width, y: height } = size;
    const ndcCoordinates = pixelToNormalizedDeviceCoordinates(offsetX, offsetY, width, height);
    const entity = this._image360Facade.intersect(
      { x: ndcCoordinates.x, y: ndcCoordinates.y },
      this._activeCameraManager.getCamera()
    );
    if (entity === undefined) {
      return Promise.resolve();
    }
    return this.enter360Image(entity);
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

  private exit360ImageOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }
    this.exit360Image();
  }
}
