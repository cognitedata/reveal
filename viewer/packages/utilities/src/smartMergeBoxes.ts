]

import { Box3 } from 'three';

export function mergeBoxesSmart(boxes: Box3[]): Box3[] {

  const resultBoxes: Box3[] = [];
  
  for (const box of boxes) {
    let merged = false;
    
    for (let i = 0; i < resultBoxes.length; i++) {
      if (box.intersectsBox(resultBoxes[i])) {

        resultBoxes[i] = resultBoxes[i].union(box);
        
        merged = true;
        break;
      }
    }
    
    if (!merged) {
      resultBoxes.push(box);
    }
  }

  return resultBoxes;
}
