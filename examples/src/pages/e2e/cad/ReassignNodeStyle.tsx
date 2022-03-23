/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { Cognite3DModel, Cognite3DViewer, DefaultNodeAppearance, IndexSet, TreeIndexNodeCollection } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function createAlternatingIndexSet(nodeCount: number): IndexSet {
  const indexSet = new IndexSet();

  for (let i = 0; i < nodeCount; i += 2) {
    indexSet.add(i);
  }

  return indexSet;
}

function createFirstTreeIndicesSet(nodeCount: number): IndexSet {
  const indexSet = new IndexSet();

  for (let i = 0; i < nodeCount / 2; i++) {
    indexSet.add(i);
  }
  
  return indexSet;
}

/**
 * Regression issue where ghosting one model made the other invisible (ACEPC-110).
 */
function ReassignNodeStyle() {
  function handleModelAdded(model: Cognite3DModel, modelIndex: number) {
    const alternatingIndexSet = createAlternatingIndexSet(model.nodeCount);
    const invertedRanges = alternatingIndexSet.invertedRanges();
    const invertedSet = new IndexSet();

    const firstTreeIndicesSet = createFirstTreeIndicesSet(model.nodeCount);

    console.log("Inserting invertedRanges into new index set");
    for (const invertedRange of invertedRanges) {
      console.dir(invertedRange);
      invertedSet.addRange(invertedRange);
    }

    const alternatingNodeCollection = new TreeIndexNodeCollection(alternatingIndexSet);
    const invertedNodeCollection = new TreeIndexNodeCollection(invertedSet);
    const firstIndicesNodeCollection = new TreeIndexNodeCollection(firstTreeIndicesSet);

    model.assignStyledNodeCollection(alternatingNodeCollection, DefaultNodeAppearance.Highlighted);
    
    model.assignStyledNodeCollection(firstIndicesNodeCollection, DefaultNodeAppearance.Ghosted);
    model.assignStyledNodeCollection(invertedNodeCollection, DefaultNodeAppearance.Default);

    model.assignStyledNodeCollection(alternatingNodeCollection, DefaultNodeAppearance.Outlined);
  }

  return (
    <Cognite3DTestViewer 
      modelUrls={['primitives']}
      cadModelAddedCallback={handleModelAdded} 
      initializeCallback={(viewer: Cognite3DViewer) => {
        viewer.cameraManager.setCameraState({position: new THREE.Vector3(30,10,50), 
          target: new THREE.Vector3()});
      }}/>
  );
}

registerVisualTest('cad', 'reassign-node-style', 'Reassign node style on previously styled node collection', <ReassignNodeStyle />)
