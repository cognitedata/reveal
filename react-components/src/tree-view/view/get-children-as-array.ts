import { type ILazyLoader } from '../model/i-lazy-loader';
import { type TreeNodeType } from '../model/tree-node-type';

export function getChildrenAsArray(
  node: TreeNodeType,
  loader?: ILazyLoader,
  shouldUseExpanded = true
): TreeNodeType[] | undefined {
  if (shouldUseExpanded && !node.isExpanded) {
    return undefined;
  }
  if (node.getChildren(loader).next().value === undefined) {
    return undefined;
  }
  return Array.from(node.getChildren(loader));
}
