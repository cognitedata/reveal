/*!
 * Copyright 2023 Cognite AS
 */

import { type PointerEventData } from '@cognite/reveal';
import { type FdmAssetMappingsConfig, useReveal, type NodeDataResult } from '../';
import { useEffect, useState } from 'react';
import { useNodeMappedData } from './useNodeMappedData';

export const useClickedNode = (
  fdmConfig?: FdmAssetMappingsConfig | undefined
): NodeDataResult | undefined => {
  const viewer = useReveal();

  const [lastClickEvent, setLastClickEvent] = useState<PointerEventData | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      setLastClickEvent(event);
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  return useNodeMappedData(lastClickEvent, fdmConfig);
};
