/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewer } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';
import { HtmlOverlayTool } from '@cognite/reveal/tools';

/**
 * Test for ensuring pixel ratio does not interfere with placement of HTML overlays
 */
function HtmlOverlayPixelRatio() {

  let overlayTool: HtmlOverlayTool;

  function viewerInitializeCallback(viewer: Cognite3DViewer) {
    overlayTool = new HtmlOverlayTool(viewer);

    const position = new THREE.Vector3(0, 0, 0.5);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    overlayTool.add(htmlElement, position);
  }

  return (
    <Cognite3DTestViewer
      modelUrls={['primitives']}
      initializeCallback={viewerInitializeCallback} />
  );
}
registerVisualTest('cad', 'html-overlay-pixel-ratio', 'Html Overlay pixel ratio', <HtmlOverlayPixelRatio />)
