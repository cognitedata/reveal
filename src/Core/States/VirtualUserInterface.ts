import { IUserInterface } from "@/Core/Interfaces/IUserInterface";
import { BaseNode } from "@/Core/Nodes/BaseNode";

export class VirtualUserInterface
{
  //==================================================
  // STATIV PROPERTIES AND FIELDS
  //==================================================

  private static userInterface: IUserInterface | null = null;

  //==================================================
  // STATIC METHODS
  //==================================================

  static install(userInterface: IUserInterface): void
  {
    this.userInterface = userInterface;
  }

  static registerNode(node: BaseNode): void
  {
    VirtualUserInterface.userInterface?.registerNode(node);
  }

}