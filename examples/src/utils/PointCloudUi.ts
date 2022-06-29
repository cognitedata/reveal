import { Cognite3DViewer, CognitePointCloudModel, PotreePointColorType, PotreePointShape, PotreePointSizeType } from "@cognite/reveal";
import * as dat from 'dat.gui';

export class PointCloudUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _params =
    {
      pointSize: 1.0,
      pointSizeType: PotreePointSizeType.Adaptive,
      budget: 2_000_000,
      pointColorType: PotreePointColorType.Rgb,
      pointShape: PotreePointShape.Circle,
    };

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;

    ui.add(this._params, 'budget', 0, 20_000_000, 100_000).onChange(() => this.applyToAllModels());
    ui.add(this._params, 'pointSize', 0, 2, 0.025).onChange(() => this.applyToAllModels());
    ui.add(this._params, 'pointSizeType', { 
      Adaptive: PotreePointSizeType.Adaptive, 
      Attenuated: PotreePointSizeType.Attenuated, 
      Fixed: PotreePointSizeType.Fixed 
    }).onChange(() => this.applyToAllModels());
    ui.add(this._params, 'pointColorType', {
      Rgb: PotreePointColorType.Rgb,
      Depth: PotreePointColorType.Depth,
      Height: PotreePointColorType.Height,
      PointIndex: PotreePointColorType.PointIndex,
      LevelOfDetail: PotreePointColorType.LevelOfDetail,
      Classification: PotreePointColorType.Classification,
      Intensity: PotreePointColorType.Intensity,
    }).onChange(valueStr => {
      this._params.pointColorType = parseInt(valueStr, 10);
      this.applyToAllModels()
    });
    ui.add(this._params, 'pointShape', {
      Circle: PotreePointShape.Circle,
      Square: PotreePointShape.Square
    }).onChange(valueStr => {
      this._params.pointShape = parseInt(valueStr, 10);
      this.applyToAllModels()
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