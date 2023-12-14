import dat from 'dat.gui';
import { Cognite3DViewer } from '@cognite/reveal';

export class GaussianSplattingUI {
  private readonly _viewer: Cognite3DViewer;

  constructor(uiFolder: dat.GUI, viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this.createGui(uiFolder);
  }

  private createGui(ui: dat.GUI): void {
    const actions = {
      gaussianSplatting: () => this.gaussianSplatting()
    };
    ui.add(actions, 'gaussianSplatting').name('Load Gaussian Splatting');
  }

  private gaussianSplatting(): void {
    // TODO: add gaussian splatting 3DObject as below
    //this._viewer.addObject3D(gaussianSplattingObject);
  }
}
