## How to use the `AdvancedTreeView`:

### Overview

This tree contains the following features to be used:

- Label (Required)
- Bold label
- Icon
- Color on icon
- Checkbox with 3 different states
- Disable/enable the checkbox
- Selection
- Lazy loading av nodes
- isVisibleInTree

### Using the `TreeNodeType`.

The type of the tree node is called [`TreeNodeType`](./model/tree-node-type.ts).
This is the minimum of what you will need as a tree node.

You can either implement your own version of `TreeNodeType` and make all necessary methods or
use the default implementation `TreeNode` directly.

### Using the `TreeNode` class:

An implementation of `TreeNodeType` is [`TreeNode`](./model/tree-node.ts) and contains more,
like navigation in the tree, colors, icons etc.
You can build up the tree view by using the `TreeNode`,
by recursive adding children node to parent nodes.

### Using the `AdvancedTreeView` component:

There is 3 optional functions that can be set on the [`AdvancedTreeViewProps`](./view/advanced-tree-view-props.ts).

- `onSelectNode` is called when a node is selected
- `onToggleNode` is called when a checkbox is toggled
- `onClickInfo` is called when the info is clicked, if undefined, no info icon will appear.

There are some default implementations that can be used in the
file [`tree-node-functions.ts`](./model/tree-node-functions.ts).
Here different strategies for selection and checkboxes are implemented.

There are also some other property for appearance of the tree in the properties.

### Examples of how the `AdvancedTreeView` component can be used:

(There are several other examples in Storybook)

```typescript
function createTree(): TreeNode {
  const root = new TreeNode();
  root.label = 'Root';
  root.isExpanded = true;

  for (let i = 1; i <= 100; i++) {
    const parent = new TreeNode();
    parent.label = 'Parent ' + i;
    parent.isExpanded = true;
    root.addChild(parent);

    for (let j = 1; j <= 10; j++) {
      const child = new TreeNode();
      child.label = 'Child ' + i + '.' + j;
      parent.addChild(child);
    }
  }
  return root;
}

const root = createTree();

<AdvancedTreeView
  root={root}
  onSelectNode={onSingleSelectNode} // When select a node
  onCheckNode={onSimpleToggleNode} // When toggle the checkbox
  hasCheckboxes
  hasIcons
/>;
```

### Lazy loading

Lazy loading is optional. It will be applied when the `loader` property in the `AdvancedTreeViewProps` is set.
This property is a refer to the interface [`ILazyLoader`](./model/i-lazy-loader.ts). Look in the file for
description of the methods.

There is two methods that need to be implemented:

- `root` get the root of the tree
- `loadChildren` load the children of a parent
- `loadSiblings` load the siblings, typically when having a large number of children,
  so loadChildren doesn't load all.

When using the `loader` property in the `AdvancedTreeViewProps` is set, the `root` property is not used.
Instead the root is taken from `loader` itself. This is done in order to not double buffer the root in 2
different places, since the root is needed in the loader. If the `root` is not set in the loader it will
call the method `loadInitialRoot` if it is implemented.

When nodes are lazy loaded into the tree, the function `onNodeLoaded` will optionally be called. This method is
made in order to synchronize the checkboxes if needed. If for instance the parent checkbox is toggled on, it is
natural that the children checkbox should be toggled. The implementation below shows this:

```typescript
onNodeLoaded(child: TreeNodeType, parent?: TreeNodeType): void {
  if (parent === undefined) {
    return; // No parent when root
  }
  if (parent.checkboxState === undefined) {
    return; // No parent checkboxState exist
  }
  child.checkboxState = parent.checkboxState;
  if (child.checkboxState == CheckboxState.All) {
    // Set the node visible in the viewer
  }
 }
```
