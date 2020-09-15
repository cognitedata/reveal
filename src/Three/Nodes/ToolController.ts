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
import { VirtualUserInterface } from "@/Core/States/VirtualUserInterface";

export class ToolController
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _activeTool: BaseTool | null = null;
  private _previousTool: BaseTool | null = null;
  private _alltools: BaseTool[] = [];

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get activeTool(): BaseTool | null { return this._activeTool; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public add(tool: BaseTool)
  {
    this._alltools.push(tool);
  }

  public setPreviousTool(cameraControl: CameraControl | null)
  {
    if (this._previousTool)
      this.setActiveTool(this._previousTool, cameraControl);
  }

  public setActiveTool(tool: BaseTool | null, cameraControl: CameraControl | null)
  {
    if (!tool)
      return;

    if (this._activeTool === tool)
      return;

    if (this._activeTool)
    {
      this._activeTool.onDeactivate();
      this._previousTool = this._activeTool;
    }
    this._activeTool = tool;
    this._activeTool.onActivate();
    if (!cameraControl)
      return;

    cameraControl.setLeftButton(this._activeTool);
  }

  //==================================================
  // INSTANCE METHODS: Events
  //==================================================

  public onMouseClick(target: ThreeRenderTargetNode, event: MouseEvent): void
  {
    target.domElement.focus();
    const tool = this.activeTool;
    if (tool)
      tool.onMouseClick(event);
  }

  public onMouseDown(target: ThreeRenderTargetNode, event: MouseEvent): void
  {
    target.domElement.focus();
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

  public onKeyDown(target: ThreeRenderTargetNode, event: KeyboardEvent): void
  {
    // Need this
    // if (document.activeElement !== target.domElement)
    // return;

    // ctrlKey, altKey,shiftKey
    // code – the “key code” ("KeyA", "ArrowLeft" and so on), specific to the physical location of the key on keyboard.
    // key – the character ("A", "a" and so on), for non-character keys, such as Esc, usually has the same value as code.
    const key = event.key.toUpperCase();
    for (const tool of this._alltools)
    {
      if (tool.getShortCutKeys() === key)
      {
        target.activeTool = tool;
        VirtualUserInterface.updateToolbars();
        return;
      }
    }
    const tool = this.activeTool;
    if (tool)
      tool.onKeyDown(event);
  }
}
