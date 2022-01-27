import { Cognite3DViewer, CognitePointCloudModel, PotreePointColorType, PotreePointShape } from "@cognite/reveal";
import * as dat from 'dat.gui';

export class PointCloudUi {
  constructor(viewer: Cognite3DViewer, uiFolder: dat.GUI) {
      const pointCloudParams = {
        pointSize: 1.0,
        budget: 2_000_000,
        pointColorType: PotreePointColorType.Rgb,
        pointShape: PotreePointShape.Circle,
        apply: () => {
          viewer.pointCloudBudget = { numberOfPoints: pointCloudParams.budget };
          const pointCloudModels = viewer.models.filter(model => model.type === 'pointcloud').map(x => x as CognitePointCloudModel);
          pointCloudModels.forEach(model => {
            model.pointSize = pointCloudParams.pointSize;
            model.pointColorType = pointCloudParams.pointColorType;
            model.pointShape = pointCloudParams.pointShape;
          });
        }
      };
      
    const pcSettings = uiFolder.addFolder('Point clouds');
      pcSettings.add(pointCloudParams, 'budget', 0, 20_000_000, 100_000).onFinishChange(() => pointCloudParams.apply());
      pcSettings.add(pointCloudParams, 'pointSize', 0, 20, 0.25).onFinishChange(() => pointCloudParams.apply());
      pcSettings.add(pointCloudParams, 'pointColorType', {
        Rgb: PotreePointColorType.Rgb,
        Depth: PotreePointColorType.Depth,
        Height: PotreePointColorType.Height,
        PointIndex: PotreePointColorType.PointIndex,
        LevelOfDetail: PotreePointColorType.LevelOfDetail,
        Classification: PotreePointColorType.Classification,
        Intensity: PotreePointColorType.Intensity,
      }).onFinishChange(valueStr => {
        pointCloudParams.pointColorType = parseInt(valueStr, 10);
        pointCloudParams.apply()
      });
      pcSettings.add(pointCloudParams, 'pointShape', {
        Circle: PotreePointShape.Circle,
        Square: PotreePointShape.Square
      }).onFinishChange(valueStr => {
        pointCloudParams.pointShape = parseInt(valueStr, 10);
        pointCloudParams.apply()
      });
  }
}