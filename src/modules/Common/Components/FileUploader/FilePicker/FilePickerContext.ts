import React from 'react';

export interface FilePickerContextValue {
  onChange: (files: File[]) => unknown;
  onError: (error: Error) => unknown;
}

export const FilePickerContext =
  React.createContext<FilePickerContextValue | undefined>(undefined);

export function useFilePickerContext() {
  const context = React.useContext(FilePickerContext);
  if (!context) {
    throw new Error(
      'useFilePickerContext should be used with FilePickerHeadless that provides FilePickerContext'
    );
  }
  return context;
}
