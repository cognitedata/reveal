import { PolylinesNode } from "../Nodes/PolylinesNode";
import { BaseTargetNode } from "../Core/Nodes/BaseTargetNode";
import { BaseVisualNode } from "../Core/Nodes/BaseVisualNode";
import { StubRootCreator } from "./StubModule/StubRootCreator";
import { isInstanceOf } from "../Core/PrimitiveClasses/ClassT";
import { BaseRenderStyle } from "../Core/Styles/BaseRenderStyle";
import { StubTargetNode } from "./StubModule/StubTargetNode";

describe('Hierarcy', () =>
{
  // Create the root
  test('Identifyable', () => testIdentifyable());
  test('boundingBox', () => boundingBox());

  test('getDescendantsByType', () => getDescendantsByType());
  test('Hierarcy', () => testHierarcy());
  test('isVisible/SetVisible', () => isVisibleSetVisible());
  test('count views', () => countView());

  test('renderStyle', () => 
  {
    const root = StubRootCreator.createTestRoot();
    for (const isVisible of [true, false])
    {
      const styles: BaseRenderStyle[] = [];
      for (const target of root.targets.getChildrenByType(BaseTargetNode))
        for (const node of root.others.getChildrenByType(BaseVisualNode))
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
    expect(node.isA(BaseVisualNode.name)).toBe(true);

    expect(isInstanceOf(node, PolylinesNode).valueOf()); //Ask F2 about this syntax
  }

  function boundingBox(): void
  {
    const root = StubRootCreator.createTestRoot();
    for (const descendant of root.getDescendantsByType(PolylinesNode))
    {
      expect(descendant.boundingBox.isEmpty).toBe(false);
      expect(descendant.boundingBox.volume).toBeGreaterThan(0);
    }
  }

  function getDescendantsByType(): void
  {
    const root = StubRootCreator.createTestRoot();

    for (const descendant of root.getDescendantsByType(PolylinesNode))
      expect(PolylinesNode.name).toBe(descendant.className);
    for (const descendant of root.getDescendantsByType(StubTargetNode))
      expect(StubTargetNode.name).toBe(descendant.className);
  }

  function testHierarcy(): void
  {
    const root = StubRootCreator.createTestRoot();
    const child = root.getChild(0);
    expect(root.childCount).toBe(5);
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
      expect(n).toBe(12);
    }
    {
      let n = 0;
      for (const { } of root.getDescendants())
        n++;
      expect(n).toBe(11);
    }
    {
      let n = 0;
      for (const { } of root.getDescendantsByType(PolylinesNode))
        n++;
      expect(n).toBe(4);
    }
    {
      let n = 0;
      for (const { } of root.others.getChildrenByType(PolylinesNode))
        n++;
      expect(n).toBe(4);
    }
    expect(root.others.getChildByType(PolylinesNode)).not.toBeNull();

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
    const root = StubRootCreator.createTestRoot();

    for (const isVisible of [true, false])
    {
      for (const target of root.targets.getChildrenByType(BaseTargetNode))
        for (const node of root.others.getChildrenByType(BaseVisualNode))
        {
          node.setVisible(isVisible, target);
          expect(node.views.isOk()).toBe(true);
        }

      let visibleCount = 0;
      for (const target of root.targets.getChildrenByType(BaseTargetNode))
        for (const node of root.others.getChildrenByType(BaseVisualNode))
          if (node.isVisible(target))
            visibleCount++;

      expect(visibleCount).toBe(isVisible ? 8 : 0);
    }
    for (const isVisible of [true, false])
    {
      for (const node of root.others.getChildrenByType(BaseVisualNode))
        node.setVisible(isVisible);

      let visibleCount = 0;
      for (const node of root.others.getChildrenByType(BaseVisualNode))
        if (node.isVisible())
          visibleCount++;
      expect(visibleCount).toBe(isVisible ? 4 : 0);
    }
  }


  function countView(): void
  {
    for (const testType of [0, 1, 2, 3]) 
    {
      const root = StubRootCreator.createTestRoot();

      // Set all visible
      let expectedVisibleCount = 0;
      for (const target of root.targets.getChildrenByType(BaseTargetNode))
        for (const node of root.others.getChildrenByType(BaseVisualNode))
          if (node.setVisible(true, target))
            expectedVisibleCount++;

      expect(expectedVisibleCount).toBeGreaterThan(0);

      if (testType === 0)
      {
      }
      else if (testType === 1)
      {
        // Set all invisible
        for (const target of root.targets.getChildrenByType(BaseTargetNode))
          for (const node of root.others.getChildrenByType(BaseVisualNode))
            node.setVisible(false, target);

        expectedVisibleCount = 0;
      }
      else if (testType === 2)
      {
        // Set all invisible
        for (const target of root.getDescendantsByType(BaseTargetNode))
          target.removeAllViewsShownHere();
        expectedVisibleCount = 0;
      }
      else if (testType === 3)
      {
        // Set all invisible
        for (const node of root.getDescendantsByType(BaseVisualNode))
          node.removeAllViews();
        expectedVisibleCount = 0;
      }
      let viewsInNodeCount = 0;
      for (const node of root.getDescendantsByType(BaseVisualNode))
      {
        expect(node.views.isOk()).toBe(true);
        viewsInNodeCount += node.views.count;
      }

      let viewsInTargetCount = 0;
      for (const target of root.getDescendantsByType(BaseTargetNode))
      {
        expect(target.viewsShownHere.isOk()).toBe(true);
        viewsInTargetCount += target.viewsShownHere.count;
      }

      let isVisibleCount = 0;
      for (const target of root.getDescendantsByType(BaseTargetNode))
        for (const node of root.getDescendantsByType(BaseVisualNode))
          if (node.isVisible(target))
            isVisibleCount++;

      expect(expectedVisibleCount).toBe(viewsInNodeCount);
      expect(expectedVisibleCount).toBe(viewsInTargetCount);
      expect(expectedVisibleCount).toBe(isVisibleCount);
    }
  }
});

