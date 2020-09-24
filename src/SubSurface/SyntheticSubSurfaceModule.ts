/* eslint-disable max-classes-per-file */
import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";
import { Vector3 } from "@/Core/Geometry/Vector3";

import { SubSurfaceRootNode } from "@/SubSurface/Trees/SubSurfaceRootNode";

import { WellTrajectoryNode } from "@/SubSurface/Wells/Nodes/WellTrajectoryNode";
import { WellNode } from "@/SubSurface/Wells/Nodes/WellNode";
import { WellTrajectory } from "@/SubSurface/Wells/Logs/WellTrajectory";
import { FolderNode } from "@/Core/Nodes/FolderNode";

import { PointLogNode } from "@/SubSurface/Wells/Nodes/PointLogNode";
import { FloatLogNode } from "@/SubSurface/Wells/Nodes/FloatLogNode";
import { DiscreteLogNode } from "@/SubSurface/Wells/Nodes/DiscreteLogNode";

import { PointLog } from "@/SubSurface/Wells/Logs/PointLog";
import { FloatLog } from "@/SubSurface/Wells/Logs/FloatLog";
import { DiscreteLog } from "@/SubSurface/Wells/Logs/DiscreteLog";
import { CasingLogNode } from "@/SubSurface/Wells/Nodes/CasingLogNode";
import { Random } from "@/Core/Primitives/Random";
import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { RegularGrid2 } from "@/Core/Geometry/RegularGrid2";
import { SurfaceNode } from "@/SubSurface/Basics/SurfaceNode";
import { WellFolder } from "@/SubSurface/Wells/Nodes/WellFolder";
import { BaseModule } from "@/Core/Module/BaseModule";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { LogFolder } from "@/SubSurface/Wells/Nodes/LogFolder";
import { BaseFilterLogNode } from "@/SubSurface/Wells/Filters/BaseFilterLogNode";
import { IDataLoader } from "@/Core/Interfaces/IDataLoader";
import { DataNode } from "@/Core/Nodes/DataNode";
import { Ma } from "@/Core/Primitives/Ma";
import { CasingLog } from "@/SubSurface/Wells/Logs/CasingLog";
import { SurveyNode } from "@/SubSurface/Seismic/Nodes/SurveyNode";
import { SeismicCubeNode } from "@/SubSurface/Seismic/Nodes/SeismicCubeNode";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import { CogniteSeismicClient } from "@cognite/seismic-sdk-js";

export class SyntheticSubSurfaceModule extends BaseModule
{
  //==================================================
  // PRIVATE fields
  //==================================================

  private _cogniteClient?: CogniteSeismicClient;
  private _fileId?: string;

  //==================================================
  // Constructors
  //==================================================

  constructor(client?: CogniteSeismicClient, fileId?: string) 
  {
    super();

    this._cogniteClient = client;
    this._fileId = fileId;
  }

  //==================================================
  // PUBLIC Properties
  //==================================================

  public get cogniteClient(): CogniteSeismicClient | undefined { return this._cogniteClient; };
  public get fileId(): string | undefined { return this._fileId; }
  //==================================================
  // OVERRIDES of BaseModule
  //==================================================

  public /*override*/ createRoot(): BaseRootNode | null
  {
    return new SubSurfaceRootNode();
  }

  public /*override*/ loadData(root: BaseRootNode): void
  {
    this.addSeismic(root);
    SyntheticSubSurfaceModule.addWells(root);
    SyntheticSubSurfaceModule.addSurfaces(root);
  }

  public /*override*/ setDefaultVisible(root: BaseRootNode): void
  {
    //SyntheticSubSurfaceModule.setWellsAndLogsVisible(root);
    //SyntheticSubSurfaceModule.setSurfacesVisible(root);
  }

  public /*override*/ startAnimate(root: BaseRootNode): void
  {
    setInterval(() => SyntheticSubSurfaceModule.animate(root), 200);
  }

  //==================================================
  // STATIC METHODS: Surfaces
  //==================================================

  private static addSurfaces(root: BaseRootNode): void
  {
    if (!(root instanceof SubSurfaceRootNode))
      return;

    const smoothNumberOfPasses = 3;
    const powerOf2 = 8;
    for (let i = 0; i < 1; i++)
    {
      const parent0 = new FolderNode();
      root.others.addChild(parent0);

      for (let j = 0; j < 2; j++)
      {
        const parent1 = new FolderNode();
        parent0.addChild(parent1);

        const dampning = 0.5;
        for (let k = 0; k < 3; k++)
        {
          const node = new SurfaceNode();
          const range = Range3.newTest.clone();
          range.expandByFraction(0.2);
          range.z.set(-1000 + (k - 1) * 300, -1500 + (k - 1) * 300);
          node.surface = RegularGrid2.createFractal(range, powerOf2, dampning, smoothNumberOfPasses, Ma.toRad(5));
          //dampning += 0.1;
          parent1.addChild(node);
        }
      }
    }
  }

  private static setSurfacesVisible(root: BaseRootNode): void
  {
    for (const node of root.getDescendantsByType(SurfaceNode))
    {
      node.setVisibleInteractive(true);
      //break;
    }
  }

  //==================================================
  // STATIC METHODS: Wells and logs
  //==================================================

  private static addWells(root: BaseRootNode): void
  {
    if (!(root instanceof SubSurfaceRootNode))
      return;

    const numberOfFolder = 5;
    const numberOfTrajectories = 2;

    const wellTree = root.wells;
    const logDataLoader = new LogDataLoader();
    const trajectoryDataLoader = new TrajectoryDataLoader();

    // Add some random wells
    for (let folderIndex = 0; folderIndex < numberOfFolder; folderIndex++)
    {
      const wellFolder = new WellFolder();
      wellTree.addChild(wellFolder);
      wellFolder.name = `Area ${folderIndex + 1}`;

      const numberOfWells = Random.getInt2(2, 6);
      for (let wellIndex = 0; wellIndex < numberOfWells; wellIndex++)
      {
        const wellNode = new WellNode();
        wellFolder.addChild(wellNode);

        wellNode.wellHead = Vector3.getRandom(Range3.newTest);
        wellNode.wellHead.z = 0;
        wellNode.name = `${folderIndex + 1}-${Random.getInt2(10000, 20000)}`;

        // Add some random trajectories to the well
        for (let trajectoryIndex = 0; trajectoryIndex < numberOfTrajectories; trajectoryIndex++)
        {
          const trajectoryNode = new WellTrajectoryNode();
          trajectoryNode.name = `Traj ${trajectoryIndex + 1}`;
          trajectoryNode.dataLoader = trajectoryDataLoader;
          wellNode.addChild(trajectoryNode);

          // Add some random casing logs to the trajectory
          let numberOfLogs = 1;
          for (let logIndex = 0; logIndex < numberOfLogs; logIndex++)
          {
            const logNode = new CasingLogNode();
            logNode.dataLoader = logDataLoader;
            logNode.name = "Casing";
            trajectoryNode.addChild(logNode);
          }
          let folder = new LogFolder();
          trajectoryNode.addChild(folder);

          // Add some float logs to the trajectory
          numberOfLogs = Random.getInt2(2, 5);
          for (let logIndex = 0; logIndex < numberOfLogs; logIndex++)
          {
            const logNode = new FloatLogNode();
            logNode.dataLoader = logDataLoader;
            let name: string | null = null;
            if (logIndex === 0)
              name = "Gamma ray";
            else if (logIndex === 1)
              name = "Resisivity";
            else if (logIndex === 2)
              name = "Neutron density";
            else if (logIndex === 3)
              name = "Permeability";
            else if (logIndex === 4)
              name = "Permeability";
            if (name)
              logNode.name = name;
            folder.addChild(logNode);
          }
          folder = new LogFolder();
          trajectoryNode.addChild(folder);

          // Add some discrete logs to the trajectory
          numberOfLogs = 1;
          for (let logIndex = 0; logIndex < numberOfLogs; logIndex++)
          {
            const logNode = new DiscreteLogNode();
            logNode.dataLoader = logDataLoader;
            logNode.name = "Zone log";
            folder.addChild(logNode);
          }
          // Add some random point logs to the trajectory
          numberOfLogs = Random.getInt2(1, 2);
          for (let logIndex = 0; logIndex < numberOfLogs; logIndex++)
          {
            const logNode = new PointLogNode();
            logNode.dataLoader = logDataLoader;
            logNode.name = `Risk ${logIndex}`;
            folder.addChild(logNode);
          }
        }
      }
    }
    wellTree.synchronize();
  }

  private static setWellsAndLogsVisible(root: BaseRootNode): void
  {
    for (const well of root.getDescendantsByType(WellNode))
    {
      for (const wellTrajectory of well.getDescendantsByType(WellTrajectoryNode))
      {
        wellTrajectory.setVisibleInteractive(true);
        break;
      }
    }
    for (const node of root.getDescendantsByType(SurfaceNode))
    {
      node.setVisibleInteractive(true);
      //break;
    }
    for (const node of root.getDescendantsByType(BaseFilterLogNode))
    {
      node.setVisibleInteractive(true);
    }
  }

  private addSeismic(root: BaseRootNode)
  {
    if (!(root instanceof SubSurfaceRootNode))
      return;

    try
    {
      const seismicTree = root.seismic;
      const survey = new SurveyNode();
      survey.name = "Survey";
      {
        const seismicCubeNode = new SeismicCubeNode();
        seismicCubeNode.colorMap = ColorMaps.seismicName;
        survey.addChild(seismicCubeNode);
        seismicTree.addChild(survey);
        seismicCubeNode.load(this.cogniteClient, this.fileId);
      }
      {
        const seismicCubeNode = new SeismicCubeNode();
        seismicCubeNode.colorMap = ColorMaps.greyScaleName;
        survey.addChild(seismicCubeNode);
        seismicTree.addChild(survey);
        seismicCubeNode.load(this.cogniteClient, this.fileId);
      }
    }
    catch (error)
    {
      alert(error);
    }

    // Get trace 1
    // const range = Range3.newTest;

    // const seismicTree = root.seismic;

    // const survey = new SurveyNode();

    // const nodeSize = new Index3(90, 100, 80);
    // const origin = range.min;
    // const inc = new Vector3(20, 20, 20);
    // const rotationAngle = Math.PI / 10;

    // let cube = new SeismicCube(nodeSize, origin, inc, rotationAngle);
    // let seismicCubeNode = new SeismicCubeNode();
    // seismicCubeNode.seismicCube = cube;
    // seismicCubeNode.colorMap = ColorMaps.rainbowName;
    // survey.addChild(seismicCubeNode);

    // cube = new SeismicCube(nodeSize, origin, inc, rotationAngle);
    // seismicCubeNode = new SeismicCubeNode();
    // seismicCubeNode.seismicCube = cube;
    // seismicCubeNode.colorMap = ColorMaps.commonSeismicName;
    // survey.addChild(seismicCubeNode);

    // survey.surveyCube = cube.getRegularGrid();

    // seismicTree.addChild(survey);
  }

  //==================================================
  // STATIC METHODS: Others
  //==================================================

  private static animate(root: BaseRootNode)
  {
    if (!(root instanceof SubSurfaceRootNode))
      return;

    const { wells } = root;
    return;

    // eslint-disable-next-line no-unreachable
    for (const node of wells.getDescendantsByType(WellTrajectoryNode))
    {

      if (Random.isTrue(0.025))
        node.toggleVisibleInteractive();
    }
    for (const node of wells.getDescendantsByType(BaseLogNode))
    {
      if (Random.isTrue(0.05))
        node.toggleVisibleInteractive();
    }
    if (Random.isTrue(0.05))
    {
      const n = Random.getInt2(0, 4);
      let i = 0;
      for (const node of root.getDescendantsByType(SurfaceNode))
      {
        node.setVisibleInteractive(i === n);
        i++;
      }
    }
  }
}

class TrajectoryDataLoader implements IDataLoader
{
  load(origin: DataNode): any
  {
    if (!(origin instanceof WellTrajectoryNode))
      return null;

    return WellTrajectory.createByRandom(Vector3.newZero);
  }
}

class LogDataLoader implements IDataLoader
{
  load(origin: DataNode): any
  {
    if (!(origin instanceof BaseLogNode))
      return null;

    const { trajectory } = origin;
    if (!trajectory)
      return null;

    const mdRange = trajectory.mdRange.clone();
    if (origin instanceof CasingLogNode)
    {
      mdRange.expandByFraction(-0.05);
      return CasingLog.createByRandom(mdRange, 7);
    }

    mdRange.min = (mdRange.center + mdRange.min) / 2;
    mdRange.expandByFraction(Random.getFloat2(-0.25, 0));

    if (origin instanceof FloatLogNode)
    {
      const valueRange = new Range1(0, 3.14);
      return FloatLog.createByRandom(mdRange, valueRange);
    }
    if (origin instanceof DiscreteLogNode)
    {
      const valueRange = new Range1(0, 4);
      return DiscreteLog.createByRandom(mdRange, valueRange);
    }
    if (origin instanceof PointLogNode)
    {
      return PointLog.createByRandom(mdRange, 10);
    }
    Error("Can not load these data");
    return null;
  }
}

// Old test code:
//===============
//
// Add data
//for (let i = 0; i < 1; i++)
//{
//  const range = Range3.newTest;
//  range.expandByFraction(-0.3);
//  const node = new PointsNode();
//  node.points = Points.createByRandom(2_000_000, range);
//  root.dataFolder.addChild(node);
//}
//for (let i = 0; i < 1; i++)
//{
//  const range = Range3.newTest;
//  range.expandByFraction(-0.2);
//  const node = new PolylinesNode();
//  node.polylines = Polylines.createByRandom(20, 10, range);
//  root.dataFolder.addChild(node);
//}
//for (let i = 0; i < 1; i++)
//{
//  const node = new SurfaceNode();
//  node.surface = RegularGrid2.createFractal(Range3.newTest, 8, 0.8, 2);
//  root.dataFolder.addChild(node);
//}
//{
//  const node = new PotreeNode();
//  //node.url = 'https://betaserver.icgc.cat/potree12/resources/pointclouds/barcelonasagradafamilia/cloud.js';
//  //node.name = 'Barcelona';
//  node.url = '/Real/ept.json';
//  node.name = 'Aerfugl';
//  root.dataFolder.addChild(node);
//}
//for (const node of root.getDescendantsByType(PotreeNode))
//  node.setVisible(true);
//for (const node of root.getDescendantsByType(PointsNode))
//{
//  const style = node.renderStyle;
//  if (style)
//  {
//    style.colorType = ColorType.DepthColor;
//    style.size = 1;
//  }
//  node.setVisible(true);
//}
//for (const node of root.getDescendantsByType(SurfaceNode))
//{
//  const style = node.renderStyle;
//  if (style)
//  {
//    style.colorType = ColorType.DepthColor;
//  }
//  node.setVisible(true);
//}
