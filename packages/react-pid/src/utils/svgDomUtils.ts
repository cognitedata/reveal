export const applyToLeafSVGElements = (
  svg: SVGSVGElement,
  callback: (node: SVGElement) => void
): void => {
  const traverse = (node: SVGElement) => {
    if (node.children.length === 0) {
      if (node instanceof SVGElement) {
        callback(node);
      }
      return;
    }
    if (node instanceof SVGClipPathElement) {
      return;
    }

    for (let i = 0; i < node.children.length; i++) {
      traverse(node.children[i] as SVGElement);
    }
  };

  traverse(svg);
};
