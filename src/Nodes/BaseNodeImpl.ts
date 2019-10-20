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

import { TargetId } from "../Core/TargetId";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { TargetNode } from "./TargetNode";
import { BaseNode } from "./BaseNode";
import { RenderStyleResolution } from "../Core/RenderStyleResolution";

export class BaseNodeImpl
{
  public static getRenderStyle(node: BaseNode, targetId: TargetId | null): BaseRenderStyle | null
  {
    const root = node.drawStyleRoot;
    if (root != null && root != node)
      return root.getRenderStyle(targetId);

    // Find the targetId if not present
    if (!targetId)
    {
      const target = TargetNode.getActive(node);
      if (target)
        targetId = target.targetId;
      else
        return null;
    }
    // Find the style in the node itself
    let style: BaseRenderStyle | null = null;
    for (const thisStyle of node.drawStyles)
    {
      if (thisStyle.isDefault)
        continue;

      if (!thisStyle.targetId.equals(targetId, node.drawStyleResolution))
        continue;

      style = thisStyle;
      break;
    }
    // If still not find and unique, copy one of the existing
    if (!style && node.drawStyleResolution == RenderStyleResolution.Unique)
    {
      for (const thisStyle of node.drawStyles)
      {
        if (thisStyle.isDefault)
          continue;

        if (!thisStyle.targetId.hasSameTypeName(targetId))
          continue;

        const style = thisStyle.copy();
        style.isDefault = false;
        style.targetId.set(targetId, node.drawStyleResolution);
        node.drawStyles.push(style);
        break;
      }
    }
    // If still not found: Create it
    if (!style)
    {
      style = node.createRenderStyle(targetId);
      if (style)
      {
        style.targetId.set(targetId, node.drawStyleResolution);
        node.drawStyles.push(style);
      }
    }
    if (style)
      node.verifyRenderStyle(style);
    return style;
  }
}


