import { BaseModule } from 'Core/Module/BaseModule';
import { BaseRootNode } from 'Core/Nodes/BaseRootNode';
import { SubSurfaceRootNode } from 'SubSurface/Trees/SubSurfaceRootNode';
import {
  BPData,
  BPDataOptions,
  MetadataTransformationMap,
} from 'Solutions/BP/BPData';
import { WellNodesCreator } from 'Solutions/BP/Creators/WellNodesCreator';
import { CogniteSeismicClient } from '@cognite/seismic-sdk-js';
import { SeismicCubeNode } from 'SubSurface/Seismic/Nodes/SeismicCubeNode';
import { ColorMaps } from 'Core/Primitives/ColorMaps';
import { SurveyNode } from 'SubSurface/Seismic/Nodes/SurveyNode';
import { PointsNode } from 'SubSurface/Basics/PointsNode';
import { Points } from 'Core/Geometry/Points';
import { Vector3 } from 'Core/Geometry/Vector3';
import { CogniteGeospatialClient } from '@cognite/geospatial-sdk-js';
import * as utm from 'utm';

type Tuple3<T> = [T, T, T];

export class SubSurfaceModule extends BaseModule {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private wellData: BPData | null = null;

  private seismicFiles: [CogniteSeismicClient, string][] | null = null;

  private horizonData: [
    ReturnType<typeof CogniteGeospatialClient>,
    string[]
  ][] = [];

  //= =================================================
  // OVERRIDES of BaseModule
  //= =================================================

  public /* override */ createRoot(): BaseRootNode | null {
    return new SubSurfaceRootNode();
  }

  public /* override */ loadData(root: BaseRootNode): void {
    if (!(root instanceof SubSurfaceRootNode)) return;

    // todo: clear rootNode if needed in the future using proper function
    if (this.wellData) {
      const wellNodes = WellNodesCreator.create(this.wellData);
      if (wellNodes && wellNodes.length > 0) {
        const tree = root.getWellsByForce();
        for (const wellNode of wellNodes) tree.addChild(wellNode);
        tree.synchronize();
      }
      this.wellData = null;
    }
    if (this.seismicFiles && this.seismicFiles.length > 0) {
      const tree = root.getSeismicByForce();
      for (const seismicFile of this.seismicFiles) {
        const survey = new SurveyNode();
        survey.name = 'Survey';

        const seismicCubeNode = new SeismicCubeNode();

        seismicCubeNode.colorMap = ColorMaps.seismicName;
        survey.addChild(seismicCubeNode);
        tree.addChild(survey);
        seismicCubeNode.load(...seismicFile);
      }
      this.seismicFiles.splice(0, this.seismicFiles.length);
    }

    this.renderHorizonData(root);
  }

  //= =================================================
  // INSTANCE METHODS: Add data
  //= =================================================

  public addWellData(
    data: BPDataOptions,
    transformations?: MetadataTransformationMap
  ) {
    this.wellData = new BPData(data, transformations);
  }

  public addSeismicCube(client: CogniteSeismicClient, fileId: string) {
    if (!this.seismicFiles) this.seismicFiles = [];
    this.seismicFiles.push([client, fileId]);
  }

  public addHorizonData(
    client: ReturnType<typeof CogniteGeospatialClient>,
    externalIds: string[]
  ): void {
    this.horizonData.push([client, externalIds]);
  }

  private scaleHorizonDataPoints(points: Tuple3<number>[]): Vector3[] {
    return points.map(([lat, lng, z]) => {
      const { easting: x, northing: y } = utm.fromLatLon(lat, lng);

      return new Vector3(x, y, z);
    });
  }

  private async renderHorizonData(root: SubSurfaceRootNode): Promise<void> {
    const tree = root.getOthersByForce();

    if (!this.horizonData.length) return;

    this.horizonData.forEach(([client, externalIds]) => {
      externalIds.forEach(async (externalId) => {
        const node = new PointsNode();
        const pointsObj = new Points();

        node.isLoading = true;
        tree.addChild(node);

        let points: Tuple3<number>[] = [];

        try {
          points = (await client.getPointCloud({
            externalId,
            outputCRS: 'epsg:4326',
          })) as Tuple3<number>[];
        } catch (e) {
          console.error(
            `Failed to get horizon points for externalID: ${externalId}`,
            e
          );
        }

        if (points && points.length) {
          pointsObj.list = this.scaleHorizonDataPoints(points);
          node.points = pointsObj;
          node.isLoading = false;
          node.notifyLoadedData();
        } else {
          node.remove();
        }
      });
    });

    this.horizonData = [];
  }
}
