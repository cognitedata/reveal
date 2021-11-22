/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewer, Cognite3DModel } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';
import { HtmlOverlayTool } from '@cognite/reveal/tools';
import { CogniteClient } from '@cognite/sdk';

function createOverlay() {
  const element = document.createElement('div');
  element.innerText = `Overlay!`;
  element.style.cssText = `
    position: absolute;

    /* Make it look nice */
    padding: 10px;
    minHeight: 50px;
    color: #fff;
    background: #232323da;
    borderRadius: 0.25em;
    border: '#ffffff22 solid 2px;
  `;
  return element;
}

/**
 * Test for ensuring pixel ratio does not interfere with placement of HTML overlays
 */
function HtmlOverlayPixelRatio() {

  let overlayTool: HtmlOverlayTool;

  function viewerInitializeCallback(viewer: Cognite3DViewer) {
    overlayTool = new HtmlOverlayTool(viewer);
  };

  function modelAddedCallback(model: Cognite3DModel, _: number) {

    const box = model.getModelBoundingBox();
    const position = box.getCenter(new THREE.Vector3());
    position.y = 0;

    const htmlElement = createOverlay();
    overlayTool.add(htmlElement, position);
  }

  const renderer = new THREE.WebGLRenderer();
  // Set some odd pixel ratio
  renderer.setPixelRatio(2);

  const viewerOptions = {
    sdk: new CogniteClient({appId: 'reveal-visual-tests'}),
    renderer
  };

  return (
    <Cognite3DTestViewer
      modelUrls={['primitives']}
      viewerOptions={viewerOptions}
      initializeCallback={viewerInitializeCallback}
      modelAddedCallback={modelAddedCallback}/>
  );
}

registerVisualTest('cad', 'html-overlay-pixel-ratio', 'Html Overlay pixel ratio', <HtmlOverlayPixelRatio />)
