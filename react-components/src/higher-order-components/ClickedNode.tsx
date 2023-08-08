/*!
 * Copyright 2023 Cognite AS
 */

import { type PointerEventData } from '@cognite/reveal';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement
} from 'react';
import { type FdmAssetMappingsConfig, type NodeDataResult, useReveal } from '..';
import { useNodeMappedData } from '../components/Reveal3DResources/useNodeMappedData';

type ClickedNodeProps = {
  children?: ReactNode;
  fdmConfig?: FdmAssetMappingsConfig;
};

const ClickedNodeContext = createContext<NodeDataResult | undefined | null>(undefined);

export const ClickedNode = ({ fdmConfig, children }: ClickedNodeProps): ReactElement => {
  const viewer = useReveal();

  const [lastClickEvent, setLastClickEvent] = useState<PointerEventData | undefined>(undefined);
  const nodeData = useNodeMappedData(lastClickEvent, fdmConfig);

  useEffect(() => {
    const callback = async (pointerEvent: PointerEventData): Promise<void> => {
      setLastClickEvent(pointerEvent);
    };

    viewer.on('click', (event: PointerEventData) => {
      void callback(event);
    });
  }, [viewer]);

  return <ClickedNodeContext.Provider value={nodeData ?? null}>{children}</ClickedNodeContext.Provider>;
};

export const useClickedNode = (): NodeDataResult | null => {
  const nodeData = useContext(ClickedNodeContext);
  if (nodeData === undefined) {
    throw Error('useClickedNode must be used within a ClickedNode context');
  }
  return nodeData;
};
