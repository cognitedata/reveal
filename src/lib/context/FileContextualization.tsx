import React, { useState } from 'react';
import omit from 'lodash/omit';
import { LocalStorageFileContextKey } from 'lib/types';

/**
 * This context contains mappings between file ids and context jobs
 * running (or completed, failed and so on) in the context team back
 * end. The state is persisted to local storage to the key in
 * `LocalStorageFileContextKey`. The context does not enforce any
 * rules regarding multiple parallel jobs, see
 * 'src/hooks/objectDetection.ts' for that.
 */

export type JobTypeIdMapping = {
  similarObjectsJobId?: number;
  allObjectsJobId?: number;
};
type FileContextJobs = {
  [fileId: number]: JobTypeIdMapping;
};

export const FileContextualizationContext = React.createContext<{
  getId: (fileId: number, type: keyof JobTypeIdMapping) => number | undefined;
  updateJobId: (
    fileId: number,
    type: keyof JobTypeIdMapping,
    jobId: number
  ) => void;
  deleteJobId: (fileId: number, type: keyof JobTypeIdMapping) => void;
} | null>(null);
FileContextualizationContext.displayName = 'FileContextualizationContext';

const getInitialState = (): FileContextJobs => {
  try {
    if (window.localStorage && window.localStorage.getItem) {
      const oldState =
        window.localStorage.getItem(LocalStorageFileContextKey) || '{}';
      return JSON.parse(oldState);
    }
    return {} as FileContextJobs;
  } catch {
    return {} as FileContextJobs;
  }
};

export const FileContextualizationContextProvider = ({
  children,
  initialValue,
}: {
  children: any;
  initialValue?: FileContextJobs;
}) => {
  const [mappings, updateMapping] = useState<FileContextJobs>(
    initialValue || getInitialState()
  );

  const updateJobId = (
    fileId: number,
    type: keyof JobTypeIdMapping,
    jobId: number
  ) => {
    updateMapping(m => ({
      ...m,
      [fileId]: {
        ...(mappings[fileId] || {}),
        [type]: jobId,
      },
    }));
  };

  try {
    if (window.localStorage && window.localStorage.setItem) {
      const oldPersistedState = window.localStorage.getItem(
        LocalStorageFileContextKey
      );
      const newState = JSON.stringify(mappings);
      if (oldPersistedState !== newState) {
        window.localStorage.setItem(LocalStorageFileContextKey, newState);
      }
    }
    /* eslint no-empty: 0 */
  } catch {}

  const deleteJobId = (fileId: number, type: keyof JobTypeIdMapping) => {
    updateMapping(m => ({
      ...m,
      [fileId]: omit(m[fileId] || {}, type),
    }));
  };

  const getId = (
    fileId: number,
    type: keyof JobTypeIdMapping
  ): number | undefined => {
    if (mappings[fileId]) {
      return mappings[fileId][type];
    }
    return undefined;
  };

  return (
    <FileContextualizationContext.Provider
      value={{ getId, updateJobId, deleteJobId }}
    >
      {children}
    </FileContextualizationContext.Provider>
  );
};
