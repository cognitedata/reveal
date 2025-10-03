import { createContext } from 'react';

import {
  useReveal3DResourceLoadFailCount,
  useReveal3DResourcesCount
} from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { useRenderTarget } from '../RevealCanvas';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { RevealModelsUtils } from '../../architecture/concrete/reveal/RevealModelsUtils';

export type Image360CollectionContainerContextDependencies = {
  useRenderTarget: typeof useRenderTarget;
  useRevealKeepAlive: typeof useRevealKeepAlive;
  useReveal3DResourcesCount: typeof useReveal3DResourcesCount;
  useReveal3DResourceLoadFailCount: typeof useReveal3DResourceLoadFailCount;
  createImage360CollectionDomainObject: typeof RevealModelsUtils.addImage360Collection;
  removeImage360CollectionDomainObject: typeof RevealModelsUtils.remove;
};

export const defaultImage360CollectionContainerContextDependencies: Image360CollectionContainerContextDependencies = {
  useRenderTarget,
  useRevealKeepAlive,
  useReveal3DResourcesCount,
  useReveal3DResourceLoadFailCount,
  createImage360CollectionDomainObject: RevealModelsUtils.addImage360Collection.bind(this),
  removeImage360CollectionDomainObject: RevealModelsUtils.remove.bind(this)
};

export const Image360CollectionContainerContext = createContext<Image360CollectionContainerContextDependencies>(
  defaultImage360CollectionContainerContextDependencies
);