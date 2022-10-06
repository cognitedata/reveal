struct TreeIndexPacked
{
  highp float thousands;
  highp float subThousands;
};

/**
 * Packs a treeIndex integer (passed in as a float) into two floats.
 * This avoids a precision issue causing wrong TreeIndexes to arrive to the fragment shader.
 *
 * Note: Instead of this we SHOULD use the "flat" modifier, but the "flat" modifier is
 * super slow on iOS Metal. Packing of TreeIndexes should be removed when the WebGL extension
 * EXT_provoking_vertex is implemented in WebKit.
 * https://registry.khronos.org/webgl/extensions/EXT_provoking_vertex/
 */
TreeIndexPacked packTreeIndex(float treeIndex) {
    highp float roundedTreeIndex = round(treeIndex);
    // We pack the potentially big input into two lower numbers representing the amount of 1000s and the "remaining up to 999 ones"
    // This avoids high numbers, and keeps precision while being "ok" enough for our usecase.
    highp float treeIndexThousands = floor(roundedTreeIndex / 1000.0);
    highp float treeIndexSubThousands = mod(roundedTreeIndex, 1000.0);

    return TreeIndexPacked(treeIndexThousands, treeIndexSubThousands);
}

/**
 * Unpacks the packed treeIndex to an int representing the original input TreeIndex
 */
int unpackTreeIndex(TreeIndexPacked treeIndexPacked) {
    highp int treeIndex = int(treeIndexPacked.thousands) * 1000 + int(treeIndexPacked.subThousands);
    return treeIndex;
}
