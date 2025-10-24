import { type ILazyLoader } from '../../../../src/tree-view/model/i-lazy-loader';
import { type TreeNodeType } from '../../../../src/tree-view/model/tree-node-type';

export class EmptyLazyLoaderMock implements ILazyLoader {
  root: TreeNodeType | undefined;

  async loadChildren(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }

  async loadSiblings(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }
}
