import { RootNode } from "../Nodes/RootNode";
import { PolylinesNode } from "../Example/PolylinesNode";
import { ThreeTargetNode } from "../Three/ThreeTargetNode";
import { TargetNode } from "../Nodes/TargetNode";
import { VisualNode } from "../Nodes/VisualNode";
import { RootCreator } from "./RootCreator";
import { DataFolder } from "../Nodes/DataFolder";
import { isInstanceOf } from "../Core/ClassT";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { tsConstructSignatureDeclaration } from "@babel/types";

// tslint:disable: no-console

describe('Hierarcy', () =>
{
  // Create the root
  test('Identifyable', () => testIdentifyable());
  test('getDescendantsByType', () => getDescendantsByType());
  test('Hierarcy', () => testHierarcy());
  test('isVisible/SetVisible', () => isVisibleSetVisible());
  test('count views', () => countView());
  test('renderStyle', () => 
  {
    const root = RootCreator.createThreeRoot();

    expect(root.targetFolder).not.toBeNull();
    expect(root.dataFolder).not.toBeNull();
    if (root.targetFolder == null)
      return;
    if (root.dataFolder == null)
      return;

    for (const isVisible of [true, false])
    {
      const styles: BaseRenderStyle[] = [];
      for (const target of root.targetFolder.getChildrenByType(TargetNode))
        for (const node of root.dataFolder.getChildrenByType(VisualNode))
        {
          node.setVisible(isVisible, target);
          const style = node.getRenderStyle(target.targetId);
          expect(style).not.toBeNull();
          if (!style)
            continue;

          for (const other of styles)
            if (style === other)
             expect(style).not.toBe(other);

          styles.push(style);
        }
    }
  });

  //==================================================
  // FUNCTIONS: 
  //==================================================

  function testIdentifyable(): void
  {
    const node = new PolylinesNode();
    expect("PolylinesNode").toBe(node.className);
    expect("PolylinesNode").toBe(PolylinesNode.name);

    expect(node.isA(node.className)).toBe(true);
    expect(node.isA(VisualNode.name)).toBe(true);

    expect(isInstanceOf(node, PolylinesNode).valueOf()); //Ask F2 about this syntax
    expect(isInstanceOf(node, DataFolder).valueOf());
  }

  function getDescendantsByType(): void
  {
    const root = RootCreator.createThreeRoot();
    root.debugHierarcy();

    for (const descendant of root.getDescendantsByType(PolylinesNode))
      expect(PolylinesNode.name).toBe(descendant.className);
    for (const descendant of root.getDescendantsByType(ThreeTargetNode))
      expect(ThreeTargetNode.name).toBe(descendant.className);
  }

  function testHierarcy(): void
  {
    const root = RootCreator.createThreeRoot();;
    expect(root.targetFolder).not.toBeNull();
    expect(root.dataFolder).not.toBeNull();
    if (root.targetFolder == null)
      return;
    if (root.dataFolder == null)
      return;


    const child = root.getChild(0);
    expect(root.childCount).toBe(2);
    expect(child).not.toBeNull();
    expect(child.childIndex).toBe(0);
    expect(child.hasParent).toBe(true);
    expect(child.parent).toBe(child.root);
    expect(child.root).toBe(root);

    // Test Descendants
    {
      let n = 0;
      for (const { } of root.getThisAndDescendants())
        n++;
      expect(n).toBe(9);
    }
    {
      let n = 0;
      for (const { } of root.getDescendants())
        n++;
      expect(n).toBe(8);
    }
    {
      let n = 0;
      for (const { } of root.getDescendantsByType(PolylinesNode))
        n++;
      expect(n).toBe(4);
    }
    {
      let n = 0;
      for (const { } of root.dataFolder.getChildrenByType(PolylinesNode))
        n++;
      expect(n).toBe(4);
    }
    {
      expect(root.dataFolder.getChildByType(PolylinesNode)).not.toBeNull();
    }

    // Test Ancestors
    {
      let n = 0;
      const grandChild = root.getChild(0).getChild(0);
      for (const node of grandChild.getThisAndAncestors())
      {
        expect(node.root).toBe(root);
        n++;
      }
      expect(n).toBe(3);
    }
    {
      let n = 0;
      const grandChild = root.getChild(0).getChild(0);
      for (const node of grandChild.getAncestors())
      {
        expect(node.root).toBe(root);
        n++;
      }
      expect(n).toBe(2);
    }
    // Test add and remove
    {
      const grandChild = root.getChild(0).getChild(0);
      expect(grandChild.hasParent).toBe(true);
      expect(grandChild.parent).not.toBeNull();

      const parent = grandChild.parent;
      if (!parent)
        return;

      const count = parent.childCount;
      grandChild.remove();

      expect(parent.childCount).toBe(count - 1);
      expect(grandChild.hasParent).toBe(false);
      expect(grandChild.parent).toBeNull();

      parent.addChild(grandChild);
      expect(parent.childCount).toBe(count);
      expect(grandChild.hasParent).toBe(true);
      expect(grandChild.parent).not.toBeNull();
    }
  }

  function isVisibleSetVisible(): void
  {
    const root = RootCreator.createThreeRoot();

    expect(root.targetFolder).not.toBeNull();
    expect(root.dataFolder).not.toBeNull();
    if (root.targetFolder == null)
      return;
    if (root.dataFolder == null)
      return;

    for (const isVisible of [true, false])
    {
      for (const target of root.targetFolder.getChildrenByType(TargetNode))
        for (const node of root.dataFolder.getChildrenByType(VisualNode))
          node.setVisible(isVisible, target);

      let visibleCount = 0;
      for (const target of root.targetFolder.getChildrenByType(TargetNode))
        for (const node of root.dataFolder.getChildrenByType(VisualNode))
          if (node.isVisible(target))
            visibleCount++;

      expect(visibleCount).toBe(isVisible ? 8 : 0);
    }
    for (const isVisible of [true, false])
    {
      for (const node of root.dataFolder.getChildrenByType(VisualNode))
        node.setVisible(isVisible);

      let visibleCount = 0;
      for (const node of root.dataFolder.getChildrenByType(VisualNode))
        if (node.isVisible())
          visibleCount++;
      expect(visibleCount).toBe(isVisible ? 4 : 0);
    }
  }


  function countView(): void
  {
    for (const testType of [0, 1, 2, 3]) 
    {
      const root = RootCreator.createThreeRoot();
      if (!root.targetFolder)
        return;
      if (!root.dataFolder)
        return;

      // Set all visible
      let expectedVisibleCount = 0;
      for (const target of root.targetFolder.getChildrenByType(TargetNode))
        for (const node of root.dataFolder.getChildrenByType(VisualNode))
          if (node.setVisible(true, target))
            expectedVisibleCount++;

      expect(expectedVisibleCount).toBeGreaterThan(0);

      if (testType === 0)
      {
      }
      else if (testType === 1)
      {
        // Set all invisible
        for (const target of root.targetFolder.getChildrenByType(TargetNode))
          for (const node of root.dataFolder.getChildrenByType(VisualNode))
            node.setVisible(false, target);

        expectedVisibleCount = 0;
      }
      else if (testType === 2)
      {
        // Set all invisible
        for (const target of root.getDescendantsByType(TargetNode))
          target.removeAllViewsShownHere();
        expectedVisibleCount = 0;
      }
      else if (testType === 3)
      {
        // Set all invisible
        for (const node of root.getDescendantsByType(VisualNode))
          node.removeAllViews();
        expectedVisibleCount = 0;
      }
      let viewsInNodeCount = 0;
      for (const node of root.getDescendantsByType(VisualNode))
        viewsInNodeCount += node.views.list.length;

      let viewsInTargetCount = 0;
      for (const target of root.getDescendantsByType(TargetNode))
        viewsInTargetCount += target.viewsShownHere.list.length;

      let isVisibleCount = 0;
      for (const target of root.getDescendantsByType(TargetNode))
        for (const node of root.getDescendantsByType(VisualNode))
          if (node.isVisible(target))
            isVisibleCount++;

      expect(expectedVisibleCount).toBe(viewsInNodeCount);
      expect(expectedVisibleCount).toBe(viewsInTargetCount);
      expect(expectedVisibleCount).toBe(isVisibleCount);
    }
  }


});

