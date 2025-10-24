import { createContext } from 'react';
import { useSceneConfig } from './scenes/useSceneConfig';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { useReveal } from '../components';

export type GroundPlaneFromSceneDependencies = {
  useSceneConfig: typeof useSceneConfig;
  useSDK: typeof useSDK;
  useReveal: typeof useReveal;
};

export const defaultGroundPlaneFromSceneDependencies: GroundPlaneFromSceneDependencies = {
  useSceneConfig,
  useSDK,
  useReveal
};

export const GroundPlaneFromSceneContext = createContext<GroundPlaneFromSceneDependencies>(
  defaultGroundPlaneFromSceneDependencies
);
