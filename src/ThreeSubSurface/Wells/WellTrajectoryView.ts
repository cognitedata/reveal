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

import * as Color from "color";
import * as THREE from "three";

import { Range3 } from "@/Core/Geometry/Range3";
import { Range1 } from "@/Core/Geometry/Range1";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Colors } from "@/Core/Primitives/Colors";

import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { FloatLogNode } from "@/SubSurface/Wells/Nodes/FloatLogNode";
import { DiscreteLogNode } from "@/SubSurface/Wells/Nodes/DiscreteLogNode";
import { WellTrajectoryStyle } from "@/SubSurface/Wells/Styles/WellTrajectoryStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { Changes } from "@/Core/Views/Changes";

import { WellTrajectoryNode } from "@/SubSurface/Wells/Nodes/WellTrajectoryNode";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";
import { LogRender } from "@/ThreeSubSurface/Wells/Helpers/LogRender";
import { TrajectoryBufferGeometry } from "@/ThreeSubSurface/Wells/Helpers/TrajectoryBufferGeometry";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { Appearance } from "@/Core/States/Appearance";
import { PointLogNode } from "@/SubSurface/Wells/Nodes/PointLogNode";
import { Units } from "@/Core/Primitives/Units";
import { WellNode } from "@/SubSurface/Wells/Nodes/WellNode";
import { BaseThreeView } from "@/Three/BaseViews/BaseThreeView";
import { ViewInfo } from "@/Core/Views/ViewInfo";
import { FloatLogStyle } from "@/SubSurface/Wells/Styles/FloatLogStyle";

const TrajectoryName = "trajectory";
const TrajectoryLabelName = "trajectoryLabel";
const WellLabelName = "wellLabel";

export class WellTrajectoryView extends BaseGroupThreeView
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
    const { style } = this;
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
    if (args.isChanged(Changes.nodeColor))
      this.touch();
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
    const range = super.calculateBoundingBoxCore();
    if (!range)
      return range;

    // Add extra for the lables, these will for some reasom not be part of the bounding box
    const { style } = this;
    if (style)
      range.z.expandByMargin(style.nameFontSize * 1.25);
    return range;

    // const trajectory = this.node.data;
    // if (!trajectory)
    //   return undefined;

    // const wellNode = this.node.wellNode;
    // if (!wellNode)
    //   return undefined;

    // const style = this.style;
    // if (!style)
    //   return undefined;

    // const boundingBox = trajectory.range.clone();
    // if (!boundingBox)
    //   return undefined;

    // const radius = this.style.radius;
    // const margin = new Vector3(radius, radius, radius);

    // margin.x = Math.max(margin.x, style.bandWidth);
    // margin.y = Math.max(margin.y, style.bandWidth);
    // margin.z = Math.max(margin.z, style.nameFontHeight / this.transformer.zScale);

    // boundingBox.expandByMargin3(margin);
    // boundingBox.translate(wellNode.origin);
    // return boundingBox;
  }

  public /*override*/ onShowInfo(viewInfo: ViewInfo, intersection: THREE.Intersection): void
  {
    const md = WellTrajectoryView.startPickingAndReturnMd(this, viewInfo, intersection);
    if (md === undefined)
      return;

    const { node } = this;
    let counter = 0;
    for (const logNode of node.getDescendantsByType(BaseLogNode))
    {
      if (!logNode.isVisible(this.renderTarget))
        continue;

      if (logNode instanceof PointLogNode)
        continue;

      const { log } = logNode;
      if (!log)
        continue;

      if (counter === 0)
        viewInfo.addHeader("Visible Logs");

      const sample = log.getSampleByMd(md);
      viewInfo.addText(`  ${logNode.displayName}`, sample ? sample.getSampleText() : "Outside MD range");
      counter++;
    }
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const { node } = this;
    const { wellNode } = node;
    if (!wellNode)
      return null;

    const parent = new THREE.Group();
    this.addTrajectory(parent);
    this.addTrajectoryLabel(parent);
    this.addWellLabel(parent);

    parent.position.copy(this.transformer.to3D(wellNode.origin));
    return parent;
  }

  public /*override*/ mustTouch(): boolean
  {
    const { node } = this;
    const { trajectory } = node;
    if (!trajectory)
      return false;

    const { wellNode } = node;
    if (!wellNode)
      return false;

    const target = this.renderTarget;
    let colorChanged = false;

    if (this.fgColor !== target.fgColor)
    {
      this.fgColor = target.fgColor;
      colorChanged = true;
    }

    let cameraChanged = false;
    {
      const { transformer } = this;
      const { camera } = this;
      const cameraPosition = transformer.toWorld(camera.position);
      cameraPosition.substract(wellNode.origin);

      const cameraDirection = trajectory.boundingBox.center;

      transformer.transformRelativeTo3D(cameraPosition);
      transformer.transformRelativeTo3D(cameraDirection);

      cameraDirection.substract(cameraPosition);
      cameraDirection.normalize();

      // Check if camera has move slightly
      const angle = Math.acos(cameraDirection.getDot(this.cameraDirection));
      if (angle > Appearance.viewerSmallestCameraDeltaAngle)
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
    const { node } = this;
    const { bandRange } = this;
    if (!bandRange)
      return undefined;

    const { trajectory } = node;
    if (!trajectory)
      return undefined;

    const mdRange = new Range1();
    for (const logNode of node.getDescendantsByType(BaseLogNode))
    {
      if (!this.isInBand(logNode))
        continue;

      const { log } = logNode;
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
    const { node } = this;
    const { trajectory } = node;
    if (!trajectory)
      return;

    const { style } = this;
    if (!style)
      return;

    const position = trajectory.getBasePosition().clone();
    this.transformer.transformRelativeTo3D(position);
    const label = SpriteCreator.createByPositionAndAlignment(node.name, position, 7, style.nameFontSize, this.fgColor);
    if (!label)
      return;

    label.name = TrajectoryLabelName;
    parent.add(label);
  }

  private addWellLabel(parent: THREE.Object3D)
  {
    const { node } = this;
    const { wellNode } = node;
    if (!wellNode)
      return;

    const { trajectory } = node;
    if (!trajectory)
      return;

    const { style } = this;
    if (!style)
      return;

    const position = trajectory.getTopPosition().clone();
    this.transformer.transformRelativeTo3D(position);
    const label = SpriteCreator.createByPositionAndAlignment(wellNode.name, position, 1, style.nameFontSize, this.fgColor);
    if (!label)
      return;

    label.name = WellLabelName;
    parent.add(label);
  }

  private addTrajectory(parent: THREE.Object3D): void
  {
    const { node } = this;
    const { wellNode } = node;
    if (!wellNode)
      return;

    const { style } = this;
    const { trajectory } = node;
    if (!trajectory)
      return;

    const color = node.getColorByColorType(style.colorType);

    const samples = trajectory.createRenderSamples(color, style.radius);
    const { transformer } = this;
    for (const sample of samples)
      transformer.transformRelativeTo3D(sample.point);
    {
      const geometry = new TrajectoryBufferGeometry(samples);
      const material = new THREE.MeshPhongMaterial({
        color: ThreeConverter.toThreeColor(Colors.white),
        shininess: 75,
        vertexColors: true,
        emissive: ThreeConverter.toThreeColor(Colors.cyan),
        emissiveIntensity: 0.25,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = TrajectoryName;
      parent.add(mesh);
    }
    {
      const geometry = new THREE.Geometry();
      for (const sample of samples)
        geometry.vertices.push(ThreeConverter.toThreeVector3(sample.point));
      const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toThreeColor(color), linewidth: 2 });
      const line = new THREE.Line(geometry, material);
      parent.add(line);
    }
  }

  private addBands(parent: THREE.Object3D): void
  {
    const { node } = this;
    const { bandRange } = this;
    if (!bandRange)
      return;

    const { trajectory } = node;
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

    const { node } = this;
    const { style } = this;
    const { bandRange } = this;
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
          logRender.addDiscreteLog(canvas, logNode.log);
          visibleCount++;
          filled++;
        }
      }
      let i = 0;
      for (const logNode of node.getDescendantsByType(FloatLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        const logStyle = logNode.getRenderStyle(this.targetId) as FloatLogStyle;
        if (!logStyle)
          continue;

        if ((i % 2 === 0) === rightBand)
        {
          let color = logNode.getColorByColorType(logStyle.colorType);
          logRender.addFloatLog(canvas, logNode.log, logStyle, color, true, false);
          color = color.darken(0.5);
          logRender.addFloatLog(canvas, logNode.log, logStyle, color, false, true);
          visibleCount++;
        }
        i++;
      }
      if (visibleCount === 0)
        continue;

      logRender.addAnnotation(canvas, style.bandFontSize, rightBand);
      textures[rightBand ? 0 : 1] = canvas.createTexture();
    }
    return textures;
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static startPickingAndReturnMd(view: BaseThreeView, viewInfo: ViewInfo, intersection: THREE.Intersection, md?: number): number | undefined
  {
    const node = view.getNode();
    const wellNode = node.getThisOrAncestorByType(WellNode);
    if (!wellNode)
      return undefined;

    const trajectoryNode = node.getThisOrAncestorByType(WellTrajectoryNode);
    if (!trajectoryNode)
      return undefined;

    const { trajectory } = trajectoryNode;
    if (!trajectory)
      return undefined;

    if (md === undefined)
    {
      const { transformer } = view;
      const position = transformer.toWorld(intersection.point);
      position.substract(wellNode.origin);
      md = trajectory.getClosestMd(position);
    }
    const positionAtMd = Vector3.newEmpty;
    trajectory.getPositionAtMd(md, positionAtMd);
    const tvd = -positionAtMd.z;

    viewInfo.addText("Well", wellNode.displayName);
    viewInfo.addText("Trajectory", trajectoryNode.displayName);
    viewInfo.addText("Md", `${md.toFixed(2)} m / ${(md * Units.Feet).toFixed(2)} ft`);
    viewInfo.addText("Tvd", `${tvd.toFixed(2)} m / ${(tvd * Units.Feet).toFixed(2)} ft`);
    return md;
  }
}
