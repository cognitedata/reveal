import { useCallback } from 'react';

import { useSearchParam } from '@data-exploration-lib/core';
import isEqual from 'lodash/isEqual';

export type PagedFileReference = {
  id: number;
  page: number | undefined;
};

type UseCanvasFilesFromUrlReturn = {
  removeFile: (file: PagedFileReference) => void;
  files: PagedFileReference[];
  addFile: (file: PagedFileReference) => void;
  serialize: (files: PagedFileReference[] | null) => string;
};

const deserialize = (value: string | null): PagedFileReference[] => {
  if (value === null) {
    return [];
  }

  if (value === '') {
    return [];
  }

  try {
    return JSON.parse(atob(value));
  } catch (error) {
    return [];
  }
};

const serialize = (files: PagedFileReference[] | null): string => {
  return btoa(JSON.stringify(files ?? []));
};

export const useCanvasFilesFromUrl = (): UseCanvasFilesFromUrlReturn => {
  const [files, setFiles] = useSearchParam('files', {
    deserialize,
    serialize,
  });

  const addFile = useCallback(
    (file: PagedFileReference) => {
      if (files?.some((comparisonFile) => isEqual(comparisonFile, file))) {
        return;
      }

      setFiles(files ? [...files, file] : [file]);
    },
    [files, setFiles]
  );

  // Note: We pass a full file descriptor (id + page) here rather than just the id since
  //       a file could exist multiple times in the same workspace
  const removeFile = useCallback(
    (file: PagedFileReference) => {
      setFiles(
        files
          ? files.filter((comparisonFile) => !isEqual(comparisonFile, file))
          : []
      );
    },
    [files, setFiles]
  );

  return {
    files: files ?? [],
    addFile,
    removeFile,
    serialize,
  };
};
