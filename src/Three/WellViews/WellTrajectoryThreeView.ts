//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import * as Color from "color"
import * as THREE from "three";

import { Range3 } from "@/Core/Geometry/Range3";
import { Range1 } from "@/Core/Geometry/Range1";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Colors } from "@/Core/Primitives/Colors";

import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { WellTrajectoryStyle } from "@/Nodes/Wells/Styles/WellTrajectoryStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { Changes } from "@/Core/Views/Changes";

import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";
import { LogRender } from "@/Three/WellViews/Helpers/LogRender";
import { TrajectoryBufferGeometry } from "@/Three/WellViews/Helpers/TrajectoryBufferGeometry";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { Appearance } from "@/Core/States/Appearance";

const TrajectoryName = "trajectory";
const TrajectoryLabelName = "trajectoryLabel";
const WellLabelName = "wellLabel";

export class WellTrajectoryThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private cameraDirection = new Vector3(0, 0, 1); // Direction to the center
  private cameraPosition = new Vector3(0, 0, 1);
  private fgColor: Color = Colors.white;
  private bandTextures: [THREE.CanvasTexture | null, THREE.CanvasTexture | null] = [null, null];

  private getBandName(rightBand: boolean): string { return rightBand ? "RightBand" : "LeftBand"; }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  private get node(): WellTrajectoryNode { return super.getNode() as WellTrajectoryNode; }
  private get style(): WellTrajectoryStyle { return super.getStyle() as WellTrajectoryStyle; }

  private get bandRange(): Range1 | undefined
  {
    const style = this.style;
    return !style ? undefined : new Range1(style.radius, style.bandWidth);
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);

    if (args.isChanged(Changes.filter) && this._object3D)
      this.clearTextures(this._object3D);
  }

  protected /*override*/ onShowCore(): void
  {
    // Pattern: SYNC_LOGS_AND_FILTERLOGS
    super.onShowCore();

    const trajectoryNode = this.node;
    const filterLogFolder = trajectoryNode.getFilterLogFolder();
    if (!filterLogFolder)
      return;

    for (const logNode of trajectoryNode.getDescendantsByType(BaseLogNode))
    {
      const filterLogNode = filterLogFolder.getFilterLogNode(logNode);
      if (!filterLogNode)
        continue;

      if (filterLogNode.isVisible(this.renderTarget))
        logNode.setVisibleInteractive(true, this.renderTarget);
    }
  }

  protected /*override*/ onHideCore(): void
  {
    super.onHideCore();
  }

  public /*override*/ beforeRender(): void
  {
    super.beforeRender();
    const parent = this.object3D;
    if (!parent)
      return;

    // Check if we need to create the bands
    let hasBands = false;
    let hasTexture = false;

    for (const rightBand of [true, false])
    {
      const band = parent.getObjectByName(this.getBandName(rightBand));
      if (band)
        hasBands = true;

      const texture = this.bandTextures[rightBand ? 0 : 1];
      if (texture)
        hasTexture = true;
    }
    if (!hasBands || !hasTexture)
    {
      if (!hasBands)
        this.addBands(parent);

      if (!hasTexture)
        this.bandTextures = this.createBandTextures();

      this.setBandTextures(parent);
    }
    if (!parent.getObjectByName(TrajectoryLabelName))
      this.addTrajectoryLabel(parent);
    if (!parent.getObjectByName(WellLabelName))
      this.addWellLabel(parent);
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    const trajectory = this.node.data;
    if (!trajectory)
      return undefined;

    const style = this.style;
    if (!style)
      return undefined;

    const boundingBox = trajectory.range.clone();
    if (!boundingBox)
      return undefined;

    const radius = this.style.radius;
    const margin = new Vector3(radius, radius, radius);

    margin.x = Math.max(margin.x, style.bandWidth);
    margin.y = Math.max(margin.y, style.bandWidth);
    margin.z = Math.max(margin.z, style.nameFontHeight / this.transformer.zScale);

    boundingBox.expandByMargin3(margin);
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const parent = new THREE.Group();
    this.addTrajectory(parent);
    this.addTrajectoryLabel(parent);
    this.addWellLabel(parent);
    return parent;
  }

  public /*override*/ mustTouch(): boolean
  {
    const node = this.node;
    const trajectory = node.data;
    if (!trajectory)
      return false;

    const target = this.renderTarget;
    let colorChanged = false;
    {
      if (this.fgColor !== target.fgColor)
      {
        this.fgColor = target.fgColor;
        colorChanged = true;
      }
    }
    let cameraChanged = false;
    {
      const camera = this.camera;
      const cameraPosition = ThreeConverter.fromVector(camera.position);
      const cameraDirection = trajectory.range.center;
      this.transformer.transformTo3D(cameraDirection);

      cameraDirection.substract(cameraPosition);
      cameraDirection.normalize();

      // Check if camera has move slightly
      const angle = Math.acos(cameraDirection.getDot(this.cameraDirection));
      if (angle > Appearance.maxCameraDifferenceAngle)
      {
        this.cameraDirection = cameraDirection;
        this.cameraPosition = cameraPosition;
        cameraChanged = true;
      }
    }
    return cameraChanged || colorChanged;
  }

  public /*override*/ touchPart(): void
  {
    // This will be called when the camera has rotated
    const parent = this._object3D;
    if (parent)
      this.clearBands(parent);
    else
      super.touchPart();
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  private getMdRange(): Range1 | undefined
  {
    const node = this.node;
    const bandRange = this.bandRange;
    if (!bandRange)
      return undefined;

    const trajectory = node.data;
    if (!trajectory)
      return undefined;

    const mdRange = new Range1();
    for (const logNode of node.getDescendantsByType(BaseLogNode))
    {

      if (!this.isInBand(logNode))
        continue;

      const log = logNode.data;
      if (!log)
        continue;

      mdRange.addRange(log.mdRange);
    }
    if (mdRange.isEmpty)
      return undefined;

    return mdRange;
  }

  private isInBand(node: BaseNode): boolean
  {
    if (node instanceof FloatLogNode)
      return true;
    if (node instanceof DiscreteLogNode)
      return true;
    return false;
  }

  //==================================================
  // INSTANCE METHODS: Add 3D objects
  //==================================================

  private addTrajectoryLabel(parent: THREE.Object3D)
  {
    const node = this.node;
    const trajectory = node.data;
    if (!trajectory)
      return;

    const style = this.style;
    if (!style)
      return;

    const position = trajectory.getBasePosition().clone();
    this.transformer.transformTo3D(position);
    const label = SpriteCreator.createByPositionAndAlignment(node.getName(), position, 7, style.nameFontHeight, this.fgColor);
    if (!label)
      return;

    label.name = TrajectoryLabelName;
    parent.add(label);
  }

  private addWellLabel(parent: THREE.Object3D)
  {
    const node = this.node;
    const well = node.well;
    if (!well)
      return;

    const style = this.style;
    if (!style)
      return;

    const position = well.wellHead.clone();
    this.transformer.transformTo3D(position);
    const label = SpriteCreator.createByPositionAndAlignment(well.getName(), position, 1, style.nameFontHeight, this.fgColor);
    if (!label)
      return;

    label.name = WellLabelName;
    parent.add(label);
  }

  private addTrajectory(parent: THREE.Object3D): void
  {
    const node = this.node;
    const style = this.style;
    const trajectory = node.data;
    if (!trajectory)
      return;

    const color = node.getColorByColorType(style.colorType);

    const samples = trajectory.createRenderSamples(color, style.radius);
    const transformer = this.transformer;
    for (const sample of samples)
      transformer.transformTo3D(sample.point);

    const geometry = new TrajectoryBufferGeometry(samples);
    const material = new THREE.MeshStandardMaterial({
      color: ThreeConverter.toColor(Colors.white),
      vertexColors: THREE.VertexColors,
      transparent: true,
      opacity: 1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = TrajectoryName;
    parent.add(mesh);
  }

  private addBands(parent: THREE.Object3D): void
  {
    const node = this.node;
    const bandRange = this.bandRange;
    if (!bandRange)
      return;

    const trajectory = node.data;
    if (!trajectory)
      return;

    const mdRange = this.getMdRange();
    if (!mdRange)
      return;

    const useRightBand = true;
    const useLeftBand = true;

    const logRender = new LogRender(bandRange, mdRange);
    const bands = logRender.createBands(trajectory, this.transformer, this.cameraPosition, useRightBand, useLeftBand);

    for (const rightBand of [true, false])
    {
      const band = bands[rightBand ? 0 : 1];
      if (!band)
        continue;

      band.name = this.getBandName(rightBand);
      parent.add(band);
    }
  }

  //==================================================
  // INSTANCE METHODS: Add 3D objects
  //==================================================

  private clearTextures(parent: THREE.Object3D): void
  {
    // Clear the textures
    this.bandTextures = [null, null];
    this.setBandTextures(parent);
  }

  private clearBands(parent: THREE.Object3D): void
  {
    for (const rightBand of [true, false])
    {
      const band = parent.getObjectByName(this.getBandName(rightBand));
      if (band)
        parent.remove(band);

      const trajectoryLabel = parent.getObjectByName(TrajectoryLabelName);
      if (trajectoryLabel)
        parent.remove(trajectoryLabel);

      const wellLabel = parent.getObjectByName(WellLabelName);
      if (wellLabel)
        parent.remove(wellLabel);
    }
  }

  private setBandTextures(parent: THREE.Object3D): void
  {
    for (const rightBand of [true, false])
    {
      const object = parent.getObjectByName(this.getBandName(rightBand));
      if (!object)
        continue;

      if (!(object instanceof THREE.Mesh))
        continue;

      const mesh = object as THREE.Mesh;
      const material = mesh.material as THREE.MeshLambertMaterial;
      if (!material)
        continue;

      const texture = this.bandTextures[rightBand ? 0 : 1];
      material.map = texture;
      mesh.visible = texture != null;
    }
  }

  private createBandTextures(): [THREE.CanvasTexture | null, THREE.CanvasTexture | null]
  {
    const textures: [THREE.CanvasTexture | null, THREE.CanvasTexture | null] = [null, null];
    if (!parent)
      return textures;

    const node = this.node;
    const style = this.style;
    const bandRange = this.bandRange;
    if (!bandRange)
      return textures;

    const mdRange = this.getMdRange();
    if (!mdRange)
      return textures;

    const logRender = new LogRender(bandRange, mdRange);
    for (const rightBand of [true, false])
    {
      const canvas = logRender.createCanvas(this.transformer.zScale);
      let filled = 0;
      let visibleCount = 0;

      for (const logNode of node.getDescendantsByType(DiscreteLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if (!rightBand)
        {
          logRender.addDiscreteLog(canvas, logNode.data);
          visibleCount++;
          filled++;
        }
      }
      let i = 0;
      for (const logNode of node.getDescendantsByType(FloatLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if ((i % 2 === 0) === rightBand && filled < 2)
        {
          logRender.addFloatLog(canvas, logNode.data, logNode.getColor(), true);
          filled++;
          visibleCount++;
        }
        i++;
      }
      i = 0;
      for (const logNode of node.getDescendantsByType(FloatLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if ((i % 2 === 0) === rightBand)
        {
          logRender.addFloatLog(canvas, logNode.data, logNode.getColor(), false);
          visibleCount++;
        }
        i++;
      }
      if (visibleCount == 0)
        continue;

      logRender.addAnnotation(canvas, style.bandFontSize, rightBand);
      textures[rightBand ? 0 : 1] = canvas.createTexture();
    }
    return textures;
  }
}
