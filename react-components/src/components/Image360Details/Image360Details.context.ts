import { createContext } from 'react';
import { useReveal } from '../RevealCanvas';
import { useImage360Collections } from '../../hooks';
import { Image360HistoricalDetails } from '../Image360HistoricalDetails/Image360HistoricalDetails';

export type Image360DetailsContextDependencies = {
  useReveal: typeof useReveal;
  useImage360Collections: typeof useImage360Collections;
  Image360HistoricalDetails: typeof Image360HistoricalDetails;
};

export const defaultImage360DetailsContextDependencies: Image360DetailsContextDependencies =
  {
    useReveal,
    useImage360Collections,
    Image360HistoricalDetails
  };

export const Image360DetailsContext = 
  createContext<Image360DetailsContextDependencies>(
    defaultImage360DetailsContextDependencies
  );