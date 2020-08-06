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

import CameraControls from "camera-controls";
import { CameraControl } from "@/Three/Nodes/CameraControl";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";

export class ToolController
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public _activeTool: BaseTool | null = null;

  public _defaultTool: BaseTool | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get activeTool(): BaseTool | null { return this._activeTool; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public setDefaultTool(tool: BaseTool | null, cameraControl: CameraControl | null)
  {
    if (!tool)
    {
      if (this._defaultTool)
        this.setActiveTool(this._defaultTool, cameraControl);
    }
    else
    {
      this._defaultTool = tool;
      this.setActiveTool(tool, cameraControl);
    }
  }

  public setActiveTool(tool: BaseTool | null, cameraControl: CameraControl | null)
  {
    if (!tool)
      return;

    if (this._activeTool === tool)
      return;

    if (this._activeTool)
      this._activeTool.onDeactivate();

    this._activeTool = tool;
    this._activeTool.onActivate();
    if (!cameraControl)
      return;

    const { controls } = cameraControl;
    if (tool.overrideLeftButton())
      controls.mouseButtons.left = CameraControls.ACTION.NONE;
    else
      controls.mouseButtons.left = CameraControls.ACTION.ROTATE;

    // default values:
    // controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    // controls.mouseButtons.right = CameraControls.ACTION.TRUCK;
    // controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
  }

  //==================================================
  // INSTANCE METHODS: Events
  //==================================================

  public onMouseClick(target: ThreeRenderTargetNode, event: MouseEvent): void
  {
    const tool = this.activeTool;
    if (tool)
      tool.onMouseClick(event);
  }

  public onMouseDown(target: ThreeRenderTargetNode, event: MouseEvent): void
  {
    // https://www.w3schools.com/jsref/obj_mouseevent.asp
    const tool = this.activeTool;
    if (tool)
      tool.onMouseDown(event);
  }

  public onMouseUp(target: ThreeRenderTargetNode, event: MouseEvent): void
  {
    // https://www.w3schools.com/jsref/obj_mouseevent.asp
    const tool = this.activeTool;
    if (tool)
      tool.onMouseUp(event);
  }

  public onMouseMove(target: ThreeRenderTargetNode, event: MouseEvent): void
  {
    // https://www.w3schools.com/jsref/obj_mouseevent.asp
    if (event.buttons === 1)
    {
      if (event.movementX === 0 && event.movementX === 0)
        return;

      const tool = this.activeTool;
      if (tool)
        tool.onMouseDrag(event);
    }
    if (event.buttons === 0)
    {
      const tool = this.activeTool;
      if (tool)
        tool.onMouseHover(event);
    }
  }
}
