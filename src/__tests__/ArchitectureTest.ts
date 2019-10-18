import { RevealModule } from "../Specific/RevealModule";
import { RootNode } from "../Nodes/RootNode";
import { PolylinesNode } from "../Specific/PolylinesNode";
import { FolderNode } from "../Nodes/FolderNode";
import { RevealTargetNode } from "../Specific/RevealTargetNode";
import { TargetNode } from "../Nodes/TargetNode";

describe('Hierarcy', () =>
{
  // Create the module
  let module = new RevealModule();
  module.Install();

  // Create the root
  let root = new RootNode();

  // Create some data
  {
    let node1 = new PolylinesNode();
    let node2 = new PolylinesNode();
    node1.name = "node1";
    node2.name = "node2";
    let dataFolder = new FolderNode();
    dataFolder.addChild(node1);
    dataFolder.addChild(node2);
    root.addChild(dataFolder);
  }
  // Create the viewers
  {
    let target1 = new RevealTargetNode();
    let target2 = new RevealTargetNode();
    target1.name = "target1";
    target2.name = "target2";
    let targets = new FolderNode();
    targets.addChild(target1);
    targets.addChild(target2);
    root.addChild(targets);
  }

  test('Hierarcy', () =>
  {
    {
      let n = 0;
      for (let descendant of root.getThisAndDescendants())
        n++;
      expect(n).toBe(7);
    }
    {
      let n = 0;
      for (let descendant of root.getDescendants())
        n++;
      expect(n).toBe(6);
    }
    expect(root.childCount).toBe(2);

    let folder = root.getChild(0);

    expect(folder!.childIndex).toBe(0);
    expect(folder!.parent).toBe(folder!.root);
    expect(folder!.root).toBe(root);
    expect(folder!.hasParent).toBe(true);
    expect(folder).not.toBeNull();
    expect(folder!.className).toBe(FolderNode.staticClassName);

    let grandChild = root.getChild(0).getChild(0);
    {
      let n = 0;
      for (let ancestor of grandChild.getThisAndAncestors())
        n++;
      expect(n).toBe(3);
    }
    {
      let n = 0;
      for (let ancestor of grandChild.getAncestors())
        n++;
      expect(n).toBe(2);
      expect(root.childCount).toBe(2);


      let parent = grandChild.parent;
      let count = parent!.childCount;
      expect(parent).not.toBeNull();
      grandChild.remove();

      expect(parent!.childCount).toBe(count - 1);
      expect(grandChild.hasParent).toBe(false);
      parent!.addChild(grandChild);
      expect(parent!.childCount).toBe(count);
      expect(grandChild.hasParent).toBe(true);
    }
  });

  test('isVisible/SetVisible', () =>
  {
    for (let target of root.getChild(1).children)
    {
      if (!(target instanceof TargetNode))
        continue;

      for (let node of root.getChild(0).children)
      {
        expect(node.isVisible(target)).toBe(false);
        node.setVisible(true, target);
        expect(node.isVisible(target)).toBe(true);
        node.setVisible(false, target);
        expect(node.isVisible(target)).toBe(false);
        expect(node.root.className).toBe(RootNode.staticClassName);
      }
    }
    for (let isVisible of [true, false])
    {
      let visibleCount = 0;
      for (let target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (let node of root.getChild(0).children)
          node.setVisible(isVisible, target);
      }
      visibleCount = 0;
      for (let target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (let node of root.getChild(0).children)
          if (node.isVisible(target))
            visibleCount++;
      }
      expect(visibleCount).toBe(isVisible ? 4 : 0);
    }
  });

  test('count views', () =>
  {
    for (let i of [0, 1, 2, 3]) 
    {
      // Set all visible
      let expectedVisibleCount = 0;
      for (let target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (let node of root.getChild(0).children)
          if (node.setVisible(true, target))
            expectedVisibleCount++;
      }
      if (i == 1)
      {
        for (let target of root.getChild(1).children)
        {
          if (!(target instanceof TargetNode))
            continue;

          for (let node of root.getChild(0).children)
            node.setVisible(false, target);
        }
        expectedVisibleCount = 0;
      }
      if (i == 2)
      {
        for (let target of root.getDescendants())
          if (target instanceof TargetNode)
            target.removeAllViewsShownHere();
        expectedVisibleCount = 0;
      }
      else if (i == 3)
      {
        for (let descendant of root.getDescendants())
          descendant.removeAllViews();
        expectedVisibleCount = 0;
      }
      let viewsInNodeCount = 0;
      for (let descendant of root.getDescendants())
        viewsInNodeCount += descendant.views.list.length;

      let viewsInTargetCount = 0;
      for (let target of root.getDescendants())
      {
        if (target instanceof TargetNode)
          viewsInTargetCount += target.viewsShownHere.list.length;
      }

      expect(expectedVisibleCount).toBe(viewsInNodeCount);
      expect(expectedVisibleCount).toBe(viewsInTargetCount);
    }
  });
});