import { Water } from 'three/examples/jsm/objects/Water';
import { resetViewerEventHandlers } from "../viewerUtilities";
import * as THREE from 'three';
import useBaseUrl from "@docusaurus/useBaseUrl";

export const customScope = {
  resetViewerEventHandlers,
  THREE,
  Water,
  skyUrl: useBaseUrl('/img/sky007.jpg')
}
