
import { RootNode } from "../Nodes/TreeNodes/RootNode";

export abstract class BaseRootLoader {
  public abstract load(root: RootNode): void;
  public  /*virtual*/  updatedVisible(root: RootNode): void { }
  public /*virtual*/ startAnimate(root: RootNode): void { }
}
