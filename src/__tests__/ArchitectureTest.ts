import { RootNode } from "../Nodes/RootNode";
import { PolylinesNode } from "../Specific/PolylinesNode";
import { FolderNode } from "../Nodes/FolderNode";
import { RevealTargetNode } from "../Specific/RevealTargetNode";
import { TargetNode } from "../Nodes/TargetNode";
import { VisualNode } from "../Nodes/VisualNode";
import { RootCreator } from "./RootCreator";
import { DataFolder } from "../Nodes/DataFolder";

// tslint:disable: no-console

describe('Hierarcy', () =>
{
  // Create the root
  const root = RootCreator.createRevealRoot();;

  test('getDescendantsByType', () => getDescendantsByType(root));
  test('Identifyable', () => testIdentifyable());
  test('Hierarcy', () => testChilderen(root));
  test('isVisible/SetVisible', () => isVisibleSetVisible(root));
  test('count views', () => countView(root));

  function countView(root: VisualNode): void
  {
    for (const testType of [0, 1, 2, 3]) 
    {
      // Set all visible
      let expectedVisibleCount = 0;
      for (const target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (const node of root.getChild(0).children)
          if (node instanceof VisualNode && node.setVisible(true, target))
            expectedVisibleCount++;
      }
      if (testType === 1)
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
      if (testType === 2)
      {
        for (const target of root.getDescendants())
          if (target instanceof TargetNode)
            target.removeAllViewsShownHere();
        expectedVisibleCount = 0;
      }
      else if (testType === 3)
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
  }



  function testChilderen(root: VisualNode): void
  {
    {
      let n = 0;
      for (const descendant of root.getThisAndDescendants())
        n++;
      expect(n).toBe(9);
    }
    {
      let n = 0;
      for (const descendant of root.getDescendants())
        n++;
      expect(n).toBe(8);
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
  }

  function getDescendantsByType(root: VisualNode): void
  {
    for (const descendant of root.getDescendantsByType(PolylinesNode))
      console.log(descendant.className);
    for (const descendant of root.getDescendantsByType(RevealTargetNode))
      console.log(descendant.className);
  }


  function testIdentifyable(): void
  {
    const node = new PolylinesNode();
    expect("PolylinesNode").toBe(node.className);
    expect("PolylinesNode").toBe(PolylinesNode.name);

    expect(node.isA(node.className)).toBe(true);
    expect(node.isA(VisualNode.name)).toBe(true);

    expect(node.isSubclass(new PolylinesNode())).toBe(true);
    expect(node.isSubclass(new DataFolder())).toBe(false);
  }

  function isVisibleSetVisible(root: VisualNode): void
  {
    for (const target of root.getChild(1).children)
    {
      if (!(target instanceof TargetNode))
        continue;

      for (const node of root.getChild(0).children)
      {
        if (!(node instanceof VisualNode))
          continue;

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
        if (node instanceof VisualNode)
          node.setVisible(isVisible, target);
      }
      visibleCount = 0;
      for (const target of root.getChild(1).children)
      {
        if (!(target instanceof TargetNode))
          continue;

        for (const node of root.getChild(0).children)
          if (node instanceof VisualNode && node.isVisible(target))
            visibleCount++;
      }
      expect(visibleCount).toBe(isVisible ? 8 : 0);
    }
  }
});

