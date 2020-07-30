import { BaseNode } from "@/Core/Nodes/BaseNode";
import { UniqueId } from "@/Core/Primitives/UniqueId";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { BaseProperty } from "@/Core/Property/Base/BaseProperty";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";

export default class NodeUtils
{

  private static _currentProperties: BasePropertyFolder | null = null;

  public static get properties(): BasePropertyFolder | null
  {
    return NodeUtils._currentProperties;
  }
  public static set properties(properties: BasePropertyFolder | null)
  {
    NodeUtils._currentProperties = properties;
  }

  public static getNodeById(id: string): BaseNode | null
  {
    let node: BaseNode | null = null;
    if (BaseRootNode.active)
    {
      node = BaseRootNode.active.getDescendantByUniqueId(UniqueId.create(id));
    }
    return node;
  }

  public static getPropertyById(name: string): BaseProperty | null
  {
    let property: BaseProperty | null = null;
    if (NodeUtils.properties)
    {
      property = NodeUtils.properties.getChildPropertyByName(name);
    }
    return property;
  }
}
