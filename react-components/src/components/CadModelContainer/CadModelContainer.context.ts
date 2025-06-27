import { createContext } from 'react';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { useRenderTarget } from '../RevealCanvas';
import {
  useReveal3DResourceLoadFailCount,
  useReveal3DResourcesCount
} from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { useApplyCadModelStyling } from './useApplyCadModelStyling';
import { RevealModelsUtils } from '../../architecture/concrete/reveal/RevealModelsUtils';

export type CadModelContextDependencies = {
  useRevealKeepAlive: typeof useRevealKeepAlive;
  useRenderTarget: typeof useRenderTarget;
  useReveal3DResourcesCount: typeof useReveal3DResourcesCount;
  useReveal3DResourceLoadFailCount: typeof useReveal3DResourceLoadFailCount;
  useApplyCadModelStyling: typeof useApplyCadModelStyling;
  createCadDomainObject: typeof RevealModelsUtils.addModel;
  removeCadDomainObject: typeof RevealModelsUtils.remove;
};

export const defaultCadModelContextDependencies: CadModelContextDependencies = {
  useRevealKeepAlive,
  useRenderTarget,
  useReveal3DResourcesCount,
  useReveal3DResourceLoadFailCount,
  useApplyCadModelStyling,
  createCadDomainObject: RevealModelsUtils.addModel.bind(this),
  removeCadDomainObject: RevealModelsUtils.remove.bind(this)
};

export const CadModelContext = createContext<CadModelContextDependencies>(
  defaultCadModelContextDependencies
);
