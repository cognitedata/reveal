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

import Range3 from "@/Core/Geometry/Range3";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";

import Icon from "@images/Nodes/SeismicCubeNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";
import { SeismicCube } from "@/SubSurface/Seismic/Data/SeismicCube";
import { ITarget } from "@/Core/Interfaces/ITarget";
import { SurveyNode } from "@/SubSurface/Seismic/Nodes/SurveyNode";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { CogniteSeismicClient } from "@cognite/seismic-sdk-js";
import { SeismicPlaneNode } from "@/SubSurface/Seismic/Nodes/SeismicPlaneNode";
import { SeismicRenderStyle } from "@/SubSurface/Seismic/Nodes/SeismicRenderStyle";

export class SeismicCubeNode extends DataNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SeismicCubeNode";
  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get seismicCube(): SeismicCube | null { return this.anyData; }
  public set seismicCube(value: SeismicCube | null) { this.anyData = value; }
  public get renderStyle(): SeismicRenderStyle | null { return this.getRenderStyle() as SeismicRenderStyle; }
  public get surveyNode(): SurveyNode | null { return this.getAncestorByType(SurveyNode); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SeismicCubeNode.className; }
  public /*override*/ isA(className: string): boolean { return className === SeismicCubeNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Seismic Cube"; }
  public /*override*/ hasColorMap(): boolean { return true; }
  public /*override*/ getIcon(): string { return this.dataIsLost ? super.getIcon() : Icon; }
  public /*override*/ isRadio(target: ITarget | null): boolean { return true; }
  public /*override*/ canChangeColor(): boolean { return false; }

  public /*override*/ get boundingBox(): Range3 { return this.seismicCube ? this.seismicCube.boundingBox : new Range3(); }
  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SeismicRenderStyle(targetId);
  }

  protected /*override*/ populateStatisticsCore(folder: BasePropertyFolder): void
  {
    super.populateStatisticsCore(folder);

    const cube = this.seismicCube;
    if (!cube)
      return;

    folder.addReadOnlyString("FileId", cube.fileId);
    folder.addReadOnlyIndex3("# Cells", cube.cellSize);
    folder.addReadOnlyIndex2("Start cell", cube.startCell);
    folder.addReadOnlyVector3("Spacing", cube.inc);
    folder.addReadOnlyVector3("Origin", cube.origin);
    folder.addReadOnlyAngle("Rotation", cube.rotationAngle);
    folder.addReadOnlyRange3(cube.boundingBox);
    folder.addReadOnlyRange1("Values (approx)", cube.valueRange);
    folder.addReadOnlyStatistics("Values (approx)", cube.statistics);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public load(client: CogniteSeismicClient, fileId: string): void
  {
    SeismicCube.loadCube(client, fileId).then(cube =>
    {
      if (!cube)
        return;

      this.seismicCube = cube;
      if (this.surveyNode)
        this.surveyNode.surveyCube = cube.getRegularGrid();

      // Just to set ensure the index properly
      if (this.surveyNode)
      {
        this.surveyNode.surveyCube = cube.getRegularGrid();
        for (const plane of this.surveyNode.getDescendantsByType(SeismicPlaneNode))
        {
          const index = plane.perpendicularIndex;
          plane.notifyNameChanged();
        }
      }
    }).catch(error =>
    {
      this.seismicCube = null;
      alert(`Can not load seismic cube.\nError message: ${error}`);
    });
  }
}
