import { RevealModule } from "../Specific/RevealModule";
import { RootNode } from "../Nodes/RootNode";
import { PolylinesNode } from "../Specific/PolylinesNode";
import { FolderNode } from "../Nodes/FolderNode";
import { RevealTargetNode } from "../Specific/RevealTargetNode";
import { TargetNode } from "../Nodes/TargetNode";
import { BaseNode } from "../Nodes/BaseNode";

describe('Hierarcy', () =>
{
  // Create the module
  const module = new RevealModule();
  module.install();

  // Create the root
  const root = new RootNode();

  // Create some data
  {
    const node1 = new PolylinesNode();
    const node2 = new PolylinesNode();
    node1.name = "node1";
    node2.name = "node2";
    const dataFolder = new FolderNode();
    dataFolder.addChild(node1);
    dataFolder.addChild(node2);
    root.addChild(dataFolder);
  }
  // Create the viewers
  {
    const target1 = new RevealTargetNode();
    const target2 = new RevealTargetNode();
    target1.name = "target1";
    target2.name = "target2";
    const targets = new FolderNode();
    targets.addChild(target1);
    targets.addChild(target2);
    root.addChild(targets);
  }
  const vv = root.getChildOfType(FolderNode);
  const ff = root.getChildOfType(RevealTargetNode);
  console.log(vv);
  console.log(ff);

  for (const descendant of root.getDescendantsByType(PolylinesNode))
    console.log(descendant.className);
  for (const descendant of root.getDescendantsByType(RevealTargetNode))
    console.log(descendant.className);

  test('Identifyable', () => testIdentifyable());

  test('Hierarcy', () => 
  {
    {
      let n = 0;
      for (const descendant of root.getThisAndDescendants())
        n++;
      expect(n).toBe(7);
    }
    {
      let n = 0;
      for (const descendant of root.getDescendants())
        n++;
      expect(n).toBe(6);
    }
    expect(root.childCount).toBe(2);

    const folder = root.getChild(0);

    expect(folder!.childIndex).toBe(0);
    expect(folder!.parent).toBe(folder!.root);
    expect(folder!.root).toBe(root);
    expect(folder!.hasParent).toBe(true);
    expect(folder).not.toBeNull();
    expect(folder!.className).toBe(FolderNode.name);

    const grandChild = root.getChild(0).getChild(0);
    {
      let n = 0;
      for (const ancestor of grandChild.getThisAndAncestors())
        n++;
      expect(n).toBe(3);
    }
    {
      let n = 0;
      for (const ancestor of grandChild.getAncestors())
        n++;
      expect(n).toBe(2);
      expect(root.childCount).toBe(2);


      const parent = grandChild.parent;
      const count = parent!.childCount;
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
    for (const target of root.getChild(1).children)
    {
      if (!(target instanceof TargetNode))
        continue;

      for (const node of root.getChild(0).children)
      {
        expect(node.isVisible(target)).toBe(false);
        node.setVisible(true, target);
        expect(node.isVisible(target)).toBe(true);
        node.setVisible(false, target);
        expect(node.isVisible(target)).toBe(false);
        expect(node.root.className).toBe(RootNode.name);
      }
    }
    for (const isVisible of [true, false])
    {
      let visibleCount = 0;
      for (const target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (const node of root.getChild(0).children)
          node.setVisible(isVisible, target);
      }
      visibleCount = 0;
      for (const target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (const node of root.getChild(0).children)
          if (node.isVisible(target))
            visibleCount++;
      }
      expect(visibleCount).toBe(isVisible ? 4 : 0);
    }
  });

  test('count views', () =>
  {
    for (const i of [0, 1, 2, 3]) 
    {
      // Set all visible
      let expectedVisibleCount = 0;
      for (const target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (const node of root.getChild(0).children)
          if (node.setVisible(true, target))
            expectedVisibleCount++;
      }
      if (i == 1)
      {
        for (const target of root.getChild(1).children)
        {
          if (!(target instanceof TargetNode))
            continue;

          for (const node of root.getChild(0).children)
            node.setVisible(false, target);
        }
        expectedVisibleCount = 0;
      }
      if (i == 2)
      {
        for (const target of root.getDescendants())
          if (target instanceof TargetNode)
            target.removeAllViewsShownHere();
        expectedVisibleCount = 0;
      }
      else if (i == 3)
      {
        for (const descendant of root.getDescendants())
          descendant.removeAllViews();
        expectedVisibleCount = 0;
      }
      let viewsInNodeCount = 0;
      for (const descendant of root.getDescendants())
        viewsInNodeCount += descendant.views.list.length;

      let viewsInTargetCount = 0;
      for (const target of root.getDescendants())
      {
        if (target instanceof TargetNode)
          viewsInTargetCount += target.viewsShownHere.list.length;
      }

      expect(expectedVisibleCount).toBe(viewsInNodeCount);
      expect(expectedVisibleCount).toBe(viewsInTargetCount);
    }
  });
});

function testIdentifyable(): void
{
  const node = new PolylinesNode();
  expect("PolylinesNode").toBe(node.className);
  expect("PolylinesNode").toBe(PolylinesNode.name);


  expect(node.isA(node.className)).toBe(true);
  expect(node.isA(BaseNode.name)).toBe(true);
}