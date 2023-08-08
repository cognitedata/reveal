/*!
 * Copyright 2023 Cognite AS
 */

import { PointerEventData } from '@cognite/reveal';
import { FdmAssetMappingsConfig, useReveal } from '../';
import { useEffect, useState } from 'react';
import { useNodeMappedData } from '../components/Reveal3DResources/useNodeMappedData';

export const useClickedNode = (fdmConfig?: FdmAssetMappingsConfig) => {
  const viewer = useReveal();

  const [lastClickEvent, setLastClickEvent] = useState<PointerEventData | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData) => {
      setLastClickEvent(event);
    };

    viewer.on('click', callback);

    return () => viewer.off('click', callback);
  }, [viewer]);

  return useNodeMappedData(lastClickEvent, fdmConfig);
}
