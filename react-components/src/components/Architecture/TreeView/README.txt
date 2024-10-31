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

  function createTreeMock(lazyLoading: boolean): TreeNode {
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
