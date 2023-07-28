import { useState } from 'react';

import { SerializedCanvasDocument } from '../types';

// Here we keep the state of the selected canvas to use as a toggle for visibility modal.
const useCanvasVisibility = () => {
  const [selectedCanvas, setSelectedCanvas] = useState<
    SerializedCanvasDocument | undefined
  >(undefined);

  return {
    selectedCanvas,
    setSelectedCanvas,
    selectedCanvasVisibility: selectedCanvas?.visibility,
  };
};

export default useCanvasVisibility;
