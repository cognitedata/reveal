How to use the TreeView:
========================

1. Using the TreeNode class:

* You can build up the tree view by using the TreeNode.
* You will need 3 functions that can be set on the TreeViewProps:

  onSelectNode: This is called when a node is selected
  onCheckNode: This is called when a nod is checked 
  loadNodes: This is called when the nodes need to load children or siblings.

  Examples below

  All functions are optional.

  In the file TreeNodeFunctions.ts there are some default implementations 
  that can be used or as examples.


2. Using the ITreeNode. 
   Then you have to implement the interfaces and make all necessary methods.
   You can look at the default implementation TreeView for how it should be done.


3. Examples of how the component can be used:

  function createTreeMock(): TreeNode {
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

  const root = createTreeMock();

  <TreeView
    root={root}
    onSelectNode={onSingleSelectNode}   // When select a node
    onCheckNode={onDependentCheckNode}  // When check a node
    loadNodes={loadNodes}               // When load children or siblings
    hasCheckboxes
    hasIcons
  />

  See the file TreeView.stories.txt for examples.

4. Lazy loading is optional. It will only be done if:

    * loadNodes is given
    * For siblings if the needLoadSiblings() returns true. 
      If it returns false, the treeView assumes that all siblings are loaded.


5. Note that checkboxes, selection, icons, colors, etc is optional.



Examples of the event functions to be used:


/**
 * Handles the single selection of a tree node.
 * If the node is selected, it will deselect all other nodes in the tree.
 * If the node is not selected, it will select the node.
 *
 * @param node - The tree node to be selected or deselected.
 */
export function onSingleSelectNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  // Deselect all others
  const root = node.getRoot();
  for (const descendant of root.getThisAndDescendants()) {
    if (descendant !== node) {
      descendant.isSelected = false;
    }
  }
  node.isSelected = !node.isSelected;

  if (node instanceof TreeNode) {
    console.log('Selected nodes');
    for (const child of node.getRoot().getSelectedNodes()) {
      console.log(child.label);
    }
  }
}

/**
 * Handles the multi-selection of a tree node.
 * Toggles the selection state of the node without affecting other nodes.
 *
 * @param node - The tree node to be selected or deselected.
 */
export function onMultiSelectNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  node.isSelected = !node.isSelected;
  
  if (node instanceof TreeNode) {
    console.log('Selected nodes');
    for (const child of node.getRoot().getSelectedNodes()) {
      console.log(child.label);
    }
  }
}

/**
 * Handles the independent checkbox state of a tree node.
 * Toggles the checkbox state between `All` and `None`without affecting other nodes.
 *
 * @param node - The tree node whose checkbox state is to be toggled.
 */
export function onIndependentCheckNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  if (node.checkBoxState === CheckBoxState.All) {
    node.checkBoxState = CheckBoxState.None;
  } else {
    node.checkBoxState = CheckBoxState.All;
  }
  console.log('Clicked node: ' + node.label);
  if (node instanceof TreeNode) {
    console.log('Check nodes');
    for (const child of node.getRoot().getCheckedNodes()) {
      console.log(child.label);
    }
  }
}

/**
 * Handles the event when a node's checkbox is clicked, toggling its state between `All` and `None`.
 * It also updates the checkbox states of all its descendants and ancestors.
 *
 * @param node - The tree node that was clicked.
 *
 * @remarks
 * - If the node's checkbox state is `All`, it will be set to `None`, and vice versa.
 * - All descendants of the node will have their checkbox states updated to match the node's new state, unless their state is `Hidden`.
 * - All ancestors of the node will have their checkbox states recalculated, unless their state is `Hidden`.
 * - Logs the label of the clicked node and the labels of all checked nodes in the root.
 */
export function onDependentCheckNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  if (node.checkBoxState === CheckBoxState.All) {
    node.checkBoxState = CheckBoxState.None;
  } else {
    node.checkBoxState = CheckBoxState.All;
  }
  // Recalculate all descendants and ancestors
  for (const descendant of node.getDescendants()) {
    if (descendant.checkBoxState !== CheckBoxState.Hidden) {
      descendant.checkBoxState = node.checkBoxState;
    }
  }
  for (const ancestor of node.getAncestors()) {
    if (ancestor.checkBoxState !== CheckBoxState.Hidden) {
      ancestor.checkBoxState = calculateCheckBoxState(ancestor);
    }
  }
  console.log('Clicked node: ' + node.label);
  if (node instanceof TreeNode) {
    console.log('Check nodes');
    for (const child of node.getRoot().getCheckedNodes()) {
      console.log(child.label);
    }
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function calculateCheckBoxState(node: ITreeNode): CheckBoxState {
  let numCandidates = 0;
  let numAll = 0;
  let numNone = 0;

  for (const child of node.getChildren()) {
    const checkBoxState = child.checkBoxState;
    if (!child.isEnabled || checkBoxState === CheckBoxState.Hidden) {
      continue;
    }
    numCandidates++;
    if (checkBoxState === CheckBoxState.All) {
      numAll++;
    } else if (checkBoxState === CheckBoxState.None) {
      numNone++;
    }
    if (numNone < numCandidates && numCandidates < numAll) {
      return CheckBoxState.Some; // Optimization by early return
    }
  }
  if (numCandidates === 0) {
    return node.checkBoxState;
  }
  if (numCandidates === numAll) {
    return CheckBoxState.All;
  }
  if (numCandidates === numNone) {
    return CheckBoxState.None;
  }
  return CheckBoxState.Some;
}
