/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { CogniteClient, Metadata } from '@cognite/sdk';
import { Image360Entity, Image360EntityFactory, Image360Facade } from '@reveal/360-images';
import { Cdf360ImageEventProvider } from '@reveal/data-providers';
import { pixelToNormalizedDeviceCoordinates, SceneHandler } from '@reveal/utilities';
import { CameraManager } from '@reveal/camera-manager';
import { InputHandler } from 'dist/packages/utilities';

export class Image360ApiHelper {
  private readonly _image360Facade: Image360Facade<Metadata>;
  private readonly _domElement: HTMLElement;

  private readonly _interactionState: {
    lastHoveredState?: Image360Entity;
    lastImage360Entered?: Image360Entity;
  };

  private readonly _cameraManagerProvider: () => CameraManager;
  private readonly _requestRedraw: () => void;

  constructor(
    cogniteClient: CogniteClient,
    sceneHandler: SceneHandler,
    inputHandler: InputHandler,
    domElement: HTMLElement,
    cameraManagerProvider: () => CameraManager,
    requestRedraw: () => void
  ) {
    const image360DataProvider = new Cdf360ImageEventProvider(cogniteClient);
    const image360EntityFactory = new Image360EntityFactory(image360DataProvider, sceneHandler);
    this._image360Facade = new Image360Facade(image360EntityFactory);

    this._domElement = domElement;
    this._interactionState = {};

    this._cameraManagerProvider = cameraManagerProvider;
    this._requestRedraw = requestRedraw;

    const setHoverIconEventHandler = (event: MouseEvent) => this.setHoverIconOnIntersect(event);
    domElement.addEventListener('mousemove', setHoverIconEventHandler);
  }

  // public async  enter360Image(image360: Image360Entity): Promise<void> {
  //   const image360Transform = image360.transform.elements;
  //   const pos = new THREE.Vector3(image360Transform[12], image360Transform[13], image360Transform[14]);
  //   const test = new StationaryCameraManager(this._domElement, this._cameraManager.getCamera().clone());
  //   await image360.activate360Image();
  //   this.setCameraManager(test, false);
  //   this.cameraManager.setCameraState({ position: pos, target: pos });
  //   this._image360Facade.allIconsVisibility = true;
  //   image360.icon.visible = false;
  //   if (this._interactionState.lastImage360Entered !== image360) {
  //     this._interactionState.lastImage360Entered?.deactivate360Image();
  //   }
  //   this._interactionState.lastImage360Entered = image360;
  //   this._requestRedraw();
  // }

  // private enter360ImageOnIntersect()

  private setHoverIconOnIntersect(event: MouseEvent) {
    this._image360Facade.allHoverIconsVisibility = false;
    const size = new THREE.Vector2(this._domElement.clientWidth, this._domElement.clientHeight);

    const { x, y } = event;
    const { x: width, y: height } = size;
    const ndcCoordinates = pixelToNormalizedDeviceCoordinates(x, y, width, height);
    const entity = this._image360Facade.intersect(
      { x: ndcCoordinates.x, y: ndcCoordinates.y },
      this._cameraManagerProvider().getCamera()
    );
    if (entity !== undefined) {
      entity.icon.hoverSpriteVisible = true;
    }
    if (entity !== this._interactionState.lastHoveredState) {
      this._requestRedraw();
      this._interactionState.lastHoveredState = entity;
    }
  }
}
