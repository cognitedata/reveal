/*!
 * Copyright 2021 Cognite AS
 */

import { EventTrigger } from '@reveal/utilities';

class InputManager {
  private readonly _events = {
    cameraChange: new EventTrigger<CameraChangeDelegate>(),
    click: new EventTrigger<PointerEventDelegate>(),
    hover: new EventTrigger<PointerEventDelegate>(),
    sceneRendered: new EventTrigger<SceneRenderedDelegate>(),
    disposed: new EventTrigger<DisposedDelegate>()
  };
}
