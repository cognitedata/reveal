import { CogniteCadModel, DefaultNodeAppearance, NodeAppearance, NodeCollection, NodeIdNodeCollection, TreeIndexNodeCollection, IndexSet } from "@cognite/reveal";
import { useEffect } from "react";
import { CadModelStyling, useReveal } from "../..";
import { NodeStylingGroup, TreeIndexStylingGroup, modelExists } from "./CadModelContainer";
import { useSDK } from "../RevealContainer/SDKProvider";
import { CogniteClient } from "@cognite/sdk";
import { isEqual } from "lodash";

export const useApplyCadModelStyling = (model?: CogniteCadModel, modelStyling?: CadModelStyling) => {
    const viewer = useReveal();
    const sdk = useSDK();
    
    const defaultStyle = modelStyling?.defaultStyle ?? DefaultNodeAppearance.Default;
    const styleGroups = modelStyling?.groups;

    useEffect(() => {
        if (!modelExists(model, viewer) || styleGroups === undefined) return;
        
        applyStyling(sdk, model, styleGroups);
      }, [styleGroups, model]);
    
      useEffect(() => {
        if (!modelExists(model, viewer)) return;
          
        model.setDefaultNodeAppearance(defaultStyle);
        
        return () => {
          if (!modelExists(model, viewer)) {
            return;
          }
            
          model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
        };
      }, [defaultStyle, model]);

};

async function applyStyling(
    sdk: CogniteClient,
    model: CogniteCadModel,
    stylingGroups: Array<NodeStylingGroup | TreeIndexStylingGroup>,
): Promise<void> {

  const firstChangeIndex = getFirstChangeIndex();

  for (let i = firstChangeIndex; i < model.styledNodeCollections.length; i++) {
    const viewerStyledNodeCollection = model.styledNodeCollections[i];
    model.unassignStyledNodeCollection(viewerStyledNodeCollection.nodeCollection);
  }

  for (let i = firstChangeIndex; i < stylingGroups.length; i++) {
    const stylingGroup = stylingGroups[i];

    if (stylingGroup.style === undefined)
      continue;

    if ('treeIndices' in stylingGroup) {
      const nodes = new TreeIndexNodeCollection(stylingGroup.treeIndices); 
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
    }
    
    if ('nodeIds' in stylingGroup) {
      const nodes = new NodeIdNodeCollection(sdk, model);
      await nodes.executeFilter(stylingGroup.nodeIds);
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
    }
  }

  function getFirstChangeIndex(): number {
    for (let i = 0; i < model.styledNodeCollections.length; i++) {
      const stylingGroup = stylingGroups[i];
      const viewerStyledNodeCollection = model.styledNodeCollections[i];

      const areEqual = isEqualStylingGroupAndCollection(stylingGroup, viewerStyledNodeCollection);
      
      if (!areEqual) {
        return i;
      }
    }

    return model.styledNodeCollections.length;
  };
  // let shouldForceApply = false;

  // for (let groupIndex = 0; groupIndex < stylingGroups.length; groupIndex++) {
  //   const group = stylingGroups[groupIndex];

  //   if (group.style === undefined)
  //     continue;

  //   console.log('Going to apply group style', group);
  //   //const cachedCollections = stylingCollectionsMap.get(group.style);
    

  //   if ('treeIndices' in group) {
  //     const nodes = new TreeIndexNodeCollection(group.treeIndices);

  //     const appliedCollectionIndex = model.styledNodeCollections.findIndex((collection) => {
  //       if (group.style === undefined)
  //         return false;
  //       const isTreeIndexCollection = collection instanceof TreeIndexNodeCollection;

  //       const isEqualContent = isTreeIndexCollection ? isEqualTreeIndex(collection, nodes) : false;
        
  //       return isEqualStyle(collection.appearance, group.style) && isEqualContent;
  //     });
        
  //     // if (cachedCollections?.treeIndex) {
  //     //   const newSet = cachedCollections.treeIndex.getIndexSet().unionWith(nodes.getIndexSet());
  //     //   //model.assignStyledNodeCollection(cachedCollections.treeIndex, group.style);
  //     //   //cachedCollections.treeIndex.updateSet(newSet);
  //     // } else {
  //     //   stylingCollectionsMap.set(group.style, { treeIndex: nodes, node: cachedCollections?.node });
  //     //   model.assignStyledNodeCollection(nodes, group.style);
  //     // }
  //   } else if ('nodeIds' in group) {
  //     const nodes = new NodeIdNodeCollection(sdk, model);
      
  //     const appliedCollectionIndex = model.styledNodeCollections.findIndex((collection) => {
  //       if (group.style === undefined)
  //         return false;
        
  //       const isNodeIdCollection = collection instanceof NodeIdNodeCollection;

  //       if (isNodeIdCollection) {
  //         const collectionNodeIds = collection.serialize().state.nodeIds as Array<number>;
  //         const isEqualContent = collectionNodeIds.every((id) => group.nodeIds.some((groupId) => groupId === id));
        
  //         return isEqualStyle(collection.appearance, group.style) && isEqualContent;
  //       } else {
  //         return false;
  //       }
  //     });

  //     const isCurrentGroupApplied = appliedCollectionIndex === groupIndex;

  //     if (isCurrentGroupApplied)
  //       continue;

  //     await nodes.executeFilter(group.nodeIds);
  //     model.assignStyledNodeCollection(nodes, group.style);
        
  //     // if (cachedCollections?.node) {
  //     //   cachedCollections.node.getIndexSet().unionWith(nodes.getIndexSet());
  //     //   //model.assignStyledNodeCollection(cachedCollections.node, group.style);
  //     //   //(cachedCollections.node as any).notifyChanged();
  //     // } else {
  //     //   stylingCollectionsMap.set(group.style, { treeIndex: cachedCollections?.treeIndex, node: nodes });
  //     //   model.assignStyledNodeCollection(nodes, group.style);
              
  //     // }
  //   }
  // }
  // console.log('Collections updated', stylingCollectionsMap);
  // stylingCollectionsMap.forEach((cachedCollections) => {
  //   (cachedCollections?.node as any)?.notifyChanged();
  //   (cachedCollections?.treeIndex as any)?.notifyChanged();
  // });
}

function isEqualStylingGroupAndCollection(group: NodeStylingGroup | TreeIndexStylingGroup, collection: {
  nodeCollection: NodeCollection;
  appearance: NodeAppearance;
}): boolean {
  if (group?.style === undefined)
    return false;

  const isEqualGroupStyle = isEqualStyle(collection.appearance, group.style);

  if (collection.nodeCollection instanceof TreeIndexNodeCollection && 'treeIndices' in group) {
    const compareCollection = new TreeIndexNodeCollection(group.treeIndices)
    const isEqualContent = isEqualTreeIndex(collection.nodeCollection, compareCollection);

    return isEqualGroupStyle && isEqualContent;
  }

  if (collection.nodeCollection instanceof NodeIdNodeCollection && 'nodeIds' in group) {
    const collectionNodeIds = collection.nodeCollection.serialize().state.nodeIds as Array<number>;
    const isEqualContent = isEqual(collectionNodeIds, group.nodeIds);

    return isEqualGroupStyle && isEqualContent;
  }

  return false;
}

function isEqualTreeIndex(collectionA: TreeIndexNodeCollection, collectionB: TreeIndexNodeCollection): boolean {
  const isEqualContent = collectionA.getIndexSet().intersectWith(collectionB.getIndexSet()).count === collectionA.getIndexSet().count;
  return isEqualContent;
}

function isEqualStyle(styleA: NodeAppearance, styleB: NodeAppearance): boolean {
  const color = (styleA.color === undefined || styleB.color === undefined) ? Boolean(styleA.color ?? styleB.color) : styleA.color.equals(styleB.color);
  const visible = styleA.visible === styleB.visible;
  const renderInFront = styleA.renderInFront === styleB.renderInFront;
  const renderGhosted = styleA.renderGhosted === styleB.renderGhosted;
  const outlineColor = styleA.outlineColor === styleB.outlineColor;
  const prioritizedForLoadingHint = styleA.prioritizedForLoadingHint === styleB.prioritizedForLoadingHint;

  return (color && visible && renderInFront && renderGhosted && outlineColor && prioritizedForLoadingHint);
}