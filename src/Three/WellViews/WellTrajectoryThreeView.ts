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

import * as THREE from "three";

import { Range3 } from "@/Core/Geometry/Range3";
import { Range1 } from "@/Core/Geometry/Range1";
import { Vector3 } from "@/Core/Geometry/Vector3";

import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { Changes } from "@/Core/Views/Changes";

import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { ThreeLabel } from "@/Three/Utilities/ThreeLabel";
import { LogRender } from "@/Three/WellViews/LogRender";
import { TrajectoryBufferGeometry } from "@/Three/WellViews/TrajectoryBufferGeometry";


export class WellTrajectoryThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  // Caching the bounding box of the scene
  private cameraDirection = new Vector3(0, 0, 1); // Direction to the center
  protected cameraPosition = new Vector3(0, 0, 1);
  private trajectoryName = "trajectory";
  private labelName = "label";
  private bandTextures: [THREE.CanvasTexture | null, THREE.CanvasTexture | null] = [null, null];

  public getBandName(rightBand: boolean): string { return rightBand ? "RightBand" : "LeftBand"; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  private get node(): WellTrajectoryNode { return super.getNode() as WellTrajectoryNode; }
  private get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  private get bandRange(): Range1 | undefined
  {
    const style = this.style;
    return !style ? undefined : new Range1(style.radius, style.bandWidth);
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);

    if (args.isChanged(Changes.filter) && this._object3D)
      this.clearTextures(this._object3D);
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
  }

  public calculateBoundingBoxCore(): Range3 | undefined
  {
    const trajectory = this.node.data;
    if (!trajectory)
      return undefined;

    const style = this.style;
    if (!style)
      return undefined;

    const boundingBox = trajectory.range.copy();
    if (!boundingBox)
      return undefined;

    const radius = this.style.radius;
    const margin = new Vector3(radius, radius, radius);

    margin.x = Math.max(margin.x, style.bandWidth);
    margin.y = Math.max(margin.y, style.bandWidth);
    margin.z = Math.max(margin.z, style.nameFontHeight);

    boundingBox.expandByMargin3(margin);
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const parent = new THREE.Group();

    this.addWellLabel(parent);
    this.addTrajectory(parent);
    return parent;
  }

  public /*override*/ mustTouch(): boolean
  {
    const node = this.node;
    const trajectory = node.data;
    if (!trajectory)
      return false;

    const target = this.renderTarget;
    const camera = target.activeCamera;
    const cameraPosition = ThreeConverter.fromVector(camera.position);
    const cameraDirection = trajectory.range.center;

    cameraDirection.substract(cameraPosition);
    cameraDirection.normalize();

    // Check if camera has move slightly
    const angle = Math.acos(cameraDirection.getDot(this.cameraDirection));
    if (angle < Math.PI / 100)
      return false;

    this.cameraDirection = cameraDirection;
    this.cameraPosition = cameraPosition;
    return true;
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
  // INSTANCE FUNCTIONS: Getters
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
      const log = logNode.data;
      if (!log)
        continue;

      if (!logNode.isVisible(this.renderTarget))
        continue;

      mdRange.addRange(log.mdRange);
    }
    if (mdRange.isEmpty)
      return undefined;

    return mdRange;
  }

  //==================================================
  // INSTANCE FUNCTIONS: Add 3D objects
  //==================================================

  private addWellLabel(parent: THREE.Object3D)
  {
    const node = this.node;
    const well = node.well;
    if (!well)
      return;

    const style = this.style;
    if (!style)
      return;

    const label = ThreeLabel.createByPositionAndAlignment(well.name, well.wellHead, 1, style.nameFontHeight, true);
    if (!label)
      return;

    label.name = this.labelName;
    parent.add(label);
  }

  private addTrajectory(parent: THREE.Object3D): void
  {
    const node = this.node;
    const style = this.style;
    const color = node.color;

    const trajectory = node.data;
    if (!trajectory)
      return;

    const geometry = new TrajectoryBufferGeometry(trajectory, style.radius, 16);
    const material = new THREE.MeshStandardMaterial({ color: ThreeConverter.toColor(color) });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = this.trajectoryName;
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
    const bands = logRender.createBands(parent, trajectory, this.cameraPosition, useRightBand, useLeftBand);

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
  // INSTANCE FUNCTIONS: Add 3D objects
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

      material.map = this.bandTextures[rightBand ? 0 : 1];
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
      const canvas = logRender.createCanvas();
      let filled = 0;

      for (const logNode of node.getDescendantsByType(DiscreteLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if (!rightBand)
        {
          logRender.addDiscreteLog(canvas, logNode.data);
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
          logRender.addFloatLog(canvas, logNode.data, logNode.color, true);
          filled++;
        }
        i++;
      }
      i = 0;
      for (const logNode of node.getDescendantsByType(FloatLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if ((i % 2 === 0) === rightBand)
          logRender.addFloatLog(canvas, logNode.data, logNode.color, false);
        i++;
      }
      for (const logNode of node.getDescendantsByType(PointLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if (!rightBand)
        {
          logRender.addPointLog(canvas, logNode.data, style.bandFontSize, rightBand);
          filled++;
        }
      }
      logRender.addAnnotation(canvas, style.bandFontSize, rightBand);
      textures[rightBand ? 0 : 1] = canvas.createTexture();
    }
    return textures;
  }
}
