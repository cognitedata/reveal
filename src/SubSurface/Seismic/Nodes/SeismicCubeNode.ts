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

import { Range3 } from "@/Core/Geometry/Range3";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { SurfaceRenderStyle } from "@/SubSurface/Basics/SurfaceRenderStyle";

import Icon from "@images/Nodes/SeismicCubeNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";
import { SeismicCube } from '@/SubSurface/Seismic/Data/SeismicCube';
import { ITarget } from "@/Core/Interfaces/ITarget";
import { SurveyNode } from '@/SubSurface/Seismic/Nodes/SurveyNode';
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import Index2 from '@/Core/Geometry/Index2';
import { CogniteSeismicClient } from '@cognite/seismic-sdk-js';
import { Vector3 } from '@/Core/Geometry/Vector3';
import Index3 from '@/Core/Geometry/Index3';
import { Statistics } from '@/Core/Geometry/Statistics';
import { SeismicPlaneNode } from '@/SubSurface/Seismic/Nodes/SeismicPlaneNode';
import { Ma } from '@/Core/Primitives/Ma';

export class SeismicCubeNode extends DataNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SeismicCubeNode";
  public ff: number = 89;
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get seismicCube(): SeismicCube | null { return this.anyData; }
  public set seismicCube(value: SeismicCube | null) { this.anyData = value; }
  public get renderStyle(): SurfaceRenderStyle | null { return this.getRenderStyle() as SurfaceRenderStyle; }
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
  public /*override*/ getIcon(): string { return Icon; }
  public /*override*/ isRadio(target: ITarget | null): boolean { return true; }
  public /*override*/ canChangeColor(): boolean { return false; }

  public /*override*/ get boundingBox(): Range3 { return this.seismicCube ? this.seismicCube.boundingBox : new Range3(); }
  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }

  protected /*override*/ populateStatisticsCore(folder: ExpanderProperty): void
  {
    super.populateStatisticsCore(folder);

    const { seismicCube } = this;
    if (!seismicCube)
      return;

    folder.addReadOnlyIndex3("# Cells", seismicCube.cellSize);
    folder.addReadOnlyVector3("Spacing", seismicCube.inc);
    folder.addReadOnlyVector3("Origin", seismicCube.origin);
    folder.addReadOnlyAngle("Rotation", seismicCube.rotationAngle);
    folder.addReadOnlyRange3(seismicCube.boundingBox);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public load(client: CogniteSeismicClient, fileId: string, isLog = false): void
  {
    client.file.getLineRange({ fileId }).then((lineRange) =>
    {
      if (!lineRange)
        return;

      if (!lineRange.inline)
        return;
      if (!lineRange.xline)
        return;

      const minIndex = Index2.newZero;
      const maxIndex = Index2.newZero;
      {
        const { min, max } = lineRange.inline;
        if (min === undefined || max === undefined)
          return;
        minIndex.i = min.value;
        maxIndex.i = max.value;
      }
      {
        const { min, max } = lineRange.xline;
        if (min === undefined || max === undefined)
          return;
        minIndex.j = min.value;
        maxIndex.j = max.value;
      }

      // console.log(`Min and max index: ${minIndex.toString()} ${maxIndex.toString()}`);

      const promises = [
        client.volume.getTrace({ fileId }, minIndex.i, minIndex.j),
        client.volume.getTrace({ fileId }, maxIndex.i, minIndex.j),
        client.volume.getTrace({ fileId }, maxIndex.i, maxIndex.j),
        client.volume.getTrace({ fileId }, minIndex.i, maxIndex.j)
      ];

      const numCellsI = maxIndex.i - minIndex.i + 1;
      const numCellsJ = maxIndex.j - minIndex.j + 1;

      Promise.all(promises).then(traces =>
      {
        let numCellsK = 0;
        for (const trace of traces)
        {
          numCellsK = Math.max(trace.traceList.length, numCellsK);
          // if (trace.coordinate !== undefined && trace.iline !== undefined && trace.xline !== undefined)
          //   console.log(`inline: ${trace.iline.value} xline: ${trace.xline.value} x: ${trace.coordinate.x} y: ${trace.coordinate.y}`);
        }
        const nodeSize = new Index3(numCellsI + 1, numCellsJ + 1, numCellsK + 1);
        const range = Range3.newTest;
        range.expandByFraction(0.3);

        const origin = range.min;
        const inc = new Vector3(5, 5, 4);
        const rotationAngle = Ma.toRad(5);
        const cube = new SeismicCube(nodeSize, origin, inc, rotationAngle);

        cube.minIndex = minIndex;
        cube.client = client;
        cube.fileId = fileId;
        cube.isLog = isLog;

        this.seismicCube = cube;
        if (this.surveyNode)
        {
          this.surveyNode.surveyCube = cube.getRegularGrid();
          for (const plane of this.surveyNode.getDescendantsByType(SeismicPlaneNode))
          {
            // Just to set the index properly
            const index = plane.perpendicularIndex;
            plane.notifyNameChanged();
          }
        }
        let minCell = new Index2(Math.round(cube.cellSize.i / 2), 0);
        let maxCell = new Index2(Math.round(cube.cellSize.i / 2), cube.cellSize.j - 1);
        const promise1 = cube.loadTraces(minCell, maxCell);

        minCell = new Index2(0, Math.round(cube.cellSize.j / 2));
        maxCell = new Index2(cube.cellSize.i - 1, Math.round(cube.cellSize.j / 2));
        const promise2 = cube.loadTraces(minCell, maxCell);

        Promise.all([promise1, promise2]).then(tracess =>
        {
          const statistics = new Statistics();
          for (const atraces of tracess)
          {
            if (!atraces)
              continue;

            for (const trace of traces)
            {
              for (let value of trace.traceList)
              {
                if (value === 0)
                  continue;

                value = cube.getRealValue(value);
                statistics.add(value);
              }
            }
          }
          cube.valueRange = statistics.getMostOfRange(4);
        });
      });
    });
  }
}
