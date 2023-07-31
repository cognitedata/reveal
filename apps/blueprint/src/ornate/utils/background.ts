import Konva from 'konva';

import bgImage from '../assets/bg.png';

export const renderBackgroundIntoLayer = (layer: Konva.Layer) => {
  const rectSize = 500000;
  const backgroundImage = new Image();
  backgroundImage.src = bgImage;
  backgroundImage.onload = () => {
    const backgroundRect = new Konva.Rect({
      x: -rectSize / 2,
      y: -rectSize / 2,
      width: rectSize,
      height: rectSize,
      fillPatternImage: backgroundImage,
      unselectable: true,
    });
    const group = new Konva.Group({
      preventSerialize: true,
      unselectable: true,
    });
    group.add(backgroundRect);
    layer.add(group);
  };
};
