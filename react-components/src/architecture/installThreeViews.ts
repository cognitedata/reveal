import { AnnotationsDomainObject } from './concrete/annotations/AnnotationsDomainObject';
import { AnnotationsView } from './concrete/annotations/AnnotationsView';
import { AxisDomainObject } from './concrete/axis/AxisDomainObject';
import { AxisThreeView } from './concrete/axis/AxisThreeView';
import { BoxDomainObject } from './concrete/primitives/box/BoxDomainObject';
import { BoxView } from './concrete/primitives/box/BoxView';
import { CadDomainObject } from './concrete/reveal/cad/CadDomainObject';
import { CadThreeView } from './concrete/reveal/cad/CadThreeView';
import { CylinderDomainObject } from './concrete/primitives/cylinder/CylinderDomainObject';
import { CylinderView } from './concrete/primitives/cylinder/CylinderView';
import { ExampleDomainObject } from './concrete/example/ExampleDomainObject';
import { ExampleView } from './concrete/example/ExampleView';
import { Image360CollectionDomainObject } from './concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { Image360CollectionThreeView } from './concrete/reveal/Image360Collection/Image360CollectionThreeView';
import { installThreeView } from './base/views/ThreeViewFactory';
import { LineDomainObject } from './concrete/primitives/line/LineDomainObject';
import { LineView } from './concrete/primitives/line/LineView';
import { PlaneDomainObject } from './concrete/primitives/plane/PlaneDomainObject';
import { PlaneView } from './concrete/primitives/plane/PlaneView';
import { PointCloudDomainObject } from './concrete/reveal/pointCloud/PointCloudDomainObject';
import { PointCloudThreeView } from './concrete/reveal/pointCloud/PointCloudThreeView';
import { PointsOfInterestDomainObject, PointsOfInterestView } from './concrete/pointsOfInterest';
import { TerrainDomainObject } from './concrete/terrain/TerrainDomainObject';
import { TerrainThreeView } from './concrete/terrain/TerrainThreeView';

export function installThreeViews(): void {
  installThreeView(AnnotationsDomainObject, AnnotationsView);
  installThreeView(AxisDomainObject, AxisThreeView);
  installThreeView(BoxDomainObject, BoxView);
  installThreeView(CadDomainObject, CadThreeView);
  installThreeView(CylinderDomainObject, CylinderView);
  installThreeView(ExampleDomainObject, ExampleView);
  installThreeView(Image360CollectionDomainObject, Image360CollectionThreeView);
  installThreeView(LineDomainObject, LineView);
  installThreeView(PlaneDomainObject, PlaneView);
  installThreeView(PointCloudDomainObject, PointCloudThreeView);
  installThreeView(PointsOfInterestDomainObject, PointsOfInterestView);
  installThreeView(TerrainDomainObject, TerrainThreeView);
}
