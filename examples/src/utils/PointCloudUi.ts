import { Cognite3DViewer, CognitePointCloudModel, PotreePointColorType, PotreePointShape, PotreePointSizeType } from "@cognite/reveal";
import * as dat from 'dat.gui';

export class PointCloudUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _params =
    {
      pointSize: 1.0,
      pointSizeType: PotreePointSizeType.Adaptive,
      budget: 3_000_000,
      pointColorType: PotreePointColorType.Rgb,
      pointShape: PotreePointShape.Circle,
      pointBlending: true,
      edlOptions: {
        enabled: true,
        radius: 2.2,
        strength: 0.5,
      }
    };

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    
    this._viewer = viewer;
    this._params.pointBlending = urlParams.get('pointBlending') === 'true';
    this._params.edlOptions.enabled = urlParams.get('edl') === 'true';
    this._params.edlOptions.radius = parseFloat(urlParams.get('edlRadius') ?? '2.2');
    this._params.edlOptions.strength = parseFloat(urlParams.get('edlStrength') ?? '0.5');

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
      Square: PotreePointShape.Square,
      Paraboloid: PotreePointShape.Paraboloid,
    }).onChange(valueStr => {
      this._params.pointShape = parseInt(valueStr, 10);
      this.applyToAllModels()
    });
    ui.add(this._params, 'pointBlending').onChange(value => {
      urlParams.set('pointBlending', value);
      window.location.href = url.toString()
    });
    const edl = ui.addFolder('EDLOptions');
    edl.open();
    edl.add(this._params.edlOptions, 'enabled').onChange(value => {
      urlParams.set('edl', value);
      window.location.href = url.toString()
    });
    edl.add(this._params.edlOptions, 'radius', 0, 10, 0.1).onFinishChange(value => {
      urlParams.set('edlRadius', value);
      window.location.href = url.toString()
    });
    edl.add(this._params.edlOptions, 'strength', 0, 10, 0.1).onFinishChange(value => {
      urlParams.set('edlStrength', value);
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