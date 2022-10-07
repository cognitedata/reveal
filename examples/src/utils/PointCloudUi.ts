import { Cognite3DViewer, CognitePointCloudModel, PointColorType, PointShape, PointSizeType } from "@cognite/reveal";
import * as dat from 'dat.gui';

export class PointCloudUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _params =
    {
      pointSize: 1.0,
      pointSizeType: PointSizeType.Adaptive,
      budget: 3_000_000,
      pointColorType: PointColorType.Rgb,
      pointShape: PointShape.Circle,
      pointBlending: true
    };

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    
    this._viewer = viewer;
    this._params.pointBlending = urlParams.get('pointBlending') === 'true';

    ui.add(this._params, 'budget', 0, 20_000_000, 100_000).onChange(() => this.applyToAllModels());
    ui.add(this._params, 'pointSize', 0, 2, 0.025).onChange(() => this.applyToAllModels());
    ui.add(this._params, 'pointSizeType', { 
      Adaptive: PointSizeType.Adaptive, 
      Attenuated: PointSizeType.Attenuated, 
      Fixed: PointSizeType.Fixed 
    }).onChange(() => this.applyToAllModels());
    ui.add(this._params, 'pointColorType', {
      Rgb: PointColorType.Rgb,
      Depth: PointColorType.Depth,
      Height: PointColorType.Height,
      PointIndex: PointColorType.PointIndex,
      LevelOfDetail: PointColorType.LevelOfDetail,
      Classification: PointColorType.Classification,
      Intensity: PointColorType.Intensity,
    }).onChange(valueStr => {
      this._params.pointColorType = parseInt(valueStr, 10);
      this.applyToAllModels()
    });
    ui.add(this._params, 'pointShape', {
      Circle: PointShape.Circle,
      Square: PointShape.Square
    }).onChange(valueStr => {
      this._params.pointShape = parseInt(valueStr, 10);
      this.applyToAllModels()
    });
    ui.add(this._params, 'pointBlending').onChange(value => {
      urlParams.set('pointBlending', value);
      window.location.href = url.toString()
    });

  }

  applyToAllModels() {
    this._viewer.pointCloudBudget = { numberOfPoints: this._params.budget };
    const pointCloudModels = this._viewer.models.filter(model => model.type === 'pointcloud').map(x => x as CognitePointCloudModel);
    pointCloudModels.forEach(model => {
      model.pointSize = this._params.pointSize;
      model.pointSizeType = this._params.pointSizeType;
      model.pointColorType = this._params.pointColorType;
      model.pointShape = this._params.pointShape;
    });
  }
}