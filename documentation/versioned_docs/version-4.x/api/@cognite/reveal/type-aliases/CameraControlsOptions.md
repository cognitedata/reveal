# Type Alias: CameraControlsOptions

> **CameraControlsOptions**: `object`

## Type declaration

### changeCameraPositionOnDoubleClick?

> `optional` **changeCameraPositionOnDoubleClick**: `boolean`

Enables or disables change of camera position on mouse doubke click. New target is then set to the point of the model under current cursor
position and the a camera position is set half way to this point

Default is false.

### changeCameraTargetOnClick?

> `optional` **changeCameraTargetOnClick**: `boolean`

Enables or disables change of camera target on mouse click. New target is then set to the point of the model under current cursor position.

Default is false.

### mouseWheelAction?

> `optional` **mouseWheelAction**: `"zoomToTarget"` \| `"zoomPastCursor"` \| `"zoomToCursor"`

Sets mouse wheel initiated action.

Modes:

'zoomToTarget' - zooms just to the current target (center of the screen) of the camera.

'zoomPastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.

'zoomToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.

Default is 'zoomPastCursor'.

## Defined in

[packages/camera-manager/src/CameraControlsOptions.ts:5](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/camera-manager/src/CameraControlsOptions.ts#L5)
