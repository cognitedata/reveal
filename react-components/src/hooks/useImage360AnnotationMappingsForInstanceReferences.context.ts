import { createContext } from 'react';
import { useImage360AnnotationCache } from '../components/CacheProvider/CacheProvider';

export type Image360AnnotationMappingsDependencies = {
  useImage360AnnotationCache: typeof useImage360AnnotationCache;
};

export const defaultImage360AnnotationMappingsDependencies: Image360AnnotationMappingsDependencies =
  {
    useImage360AnnotationCache
  };

export const Image360AnnotationMappingsContext =
  createContext<Image360AnnotationMappingsDependencies>(
    defaultImage360AnnotationMappingsDependencies
  );
