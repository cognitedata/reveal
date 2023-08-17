import { CogniteCadModel, DefaultNodeAppearance, NodeAppearance, NodeCollection, NodeIdNodeCollection, TreeIndexNodeCollection, IndexSet } from "@cognite/reveal";
import { useEffect, useRef } from "react";
import { CadModelStyling, useReveal } from "../..";
import { NodeStylingGroup, TreeIndexStylingGroup, modelExists } from "./CadModelContainer";
import { useSDK } from "../RevealContainer/SDKProvider";
import { CogniteClient } from "@cognite/sdk";

type CachedStylingCollections = { treeIndex?: TreeIndexNodeCollection, node?: NodeIdNodeCollection };

export const useApplyCadModelStyling = (model?: CogniteCadModel, modelStyling?: CadModelStyling) => {
    const viewer = useReveal();
    const sdk = useSDK();

    const stylingCollectionsMapRef = useRef<Map<NodeAppearance, CachedStylingCollections>>(new Map<NodeAppearance, CachedStylingCollections>);
    
    const defaultStyle = modelStyling?.defaultStyle ?? DefaultNodeAppearance.Default;
    const styleGroups = modelStyling?.groups;

    useEffect(() => {
        if (!modelExists(model, viewer) || styleGroups === undefined) return;
        
        const stylingCollections = applyStyling(sdk, model, styleGroups, stylingCollectionsMapRef.current);
        console.log('Finished applying styling');
    
        return () => {
          if (!modelExists(model, viewer)) return;
          
          void stylingCollections.then(() => {
            stylingCollectionsMapRef.current.forEach((cachedCollections) => {
              cachedCollections?.node?.getIndexSet().clear();
              cachedCollections?.treeIndex?.getIndexSet().clear();
            });
            console.log('collections cleared', model.styledNodeCollections);
          });
        };
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
    stylingCollectionsMap: Map<NodeAppearance, CachedStylingCollections>
): Promise<void> {
  
    // stylingGroupsMap.forEach((cachedCollections) => {
    //         cachedCollections?.node?.getIndexSet().clear();
    //         cachedCollections?.treeIndex?.getIndexSet().clear();
    // });

    for (const group of stylingGroups) {
        if (group.style === undefined) continue;
        console.log('Going to apply group style', group);
        const cachedCollections = stylingCollectionsMap.get(group.style);

      if ('treeIndices' in group) {
        const nodes = new TreeIndexNodeCollection(group.treeIndices);
        
        if (cachedCollections?.treeIndex) {
          const newSet = cachedCollections.treeIndex.getIndexSet().unionWith(nodes.getIndexSet());
          //model.assignStyledNodeCollection(cachedCollections.treeIndex, group.style);
          //cachedCollections.treeIndex.updateSet(newSet);
        } else {
            stylingCollectionsMap.set(group.style, { treeIndex: nodes, node: cachedCollections?.node });
            model.assignStyledNodeCollection(nodes, group.style);
        }
      } else if ('nodeIds' in group) {
        const nodes = new NodeIdNodeCollection(sdk, model);
        await nodes.executeFilter(group.nodeIds);
        
          if (cachedCollections?.node) {
            cachedCollections.node.getIndexSet().unionWith(nodes.getIndexSet());
            //model.assignStyledNodeCollection(cachedCollections.node, group.style);
            //(cachedCollections.node as any).notifyChanged();
          } else {             
              stylingCollectionsMap.set(group.style, { treeIndex: cachedCollections?.treeIndex, node: nodes });
              model.assignStyledNodeCollection(nodes, group.style);
              
          }
      }
    }
  console.log('Collections updated', stylingCollectionsMap);
  stylingCollectionsMap.forEach((cachedCollections) => {
    (cachedCollections?.node as any)?.notifyChanged();
    (cachedCollections?.treeIndex as any)?.notifyChanged();
  });
  }