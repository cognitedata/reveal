
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { ThreeRenderTargetNode } from "../Nodes/ThreeRenderTargetNode";
import { BaseCommand } from "@/Core/Commands/BaseCommand";

export abstract class ThreeRenderTargetCommand extends BaseCommand {

  public target: null | ThreeRenderTargetNode = null; // Get the node to invoke the command on

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(target: ThreeRenderTargetNode | null = null) {
    super();
    this.target = target;
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public get isEnabled() : boolean { return this.target != null;  }
}


