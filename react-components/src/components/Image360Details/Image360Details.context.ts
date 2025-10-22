import { type Context, createContext } from 'react';
import { useReveal } from '../RevealCanvas';
import { Image360HistoricalDetails } from '../Image360HistoricalDetails/Image360HistoricalDetails';
import { useImage360Entity } from './useImage360Entity';

export type Image360DetailsContextDependencies = {
  useReveal: typeof useReveal;
  useImage360Entity: typeof useImage360Entity;
  Image360HistoricalDetails: typeof Image360HistoricalDetails;
};

export const defaultImage360DetailsContextDependencies: Image360DetailsContextDependencies = {
  useReveal,
  useImage360Entity,
  Image360HistoricalDetails
};

export const Image360DetailsContext: Context<Image360DetailsContextDependencies> =
  createContext<Image360DetailsContextDependencies>(defaultImage360DetailsContextDependencies);
