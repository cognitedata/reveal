import React from 'react';
import { attrAccept, convertFileToCogsFile } from './utils';
import { CogsFile, CogsFileInfo } from './types';
import { FilePickerContext } from './FilePickerContext';

export type FileAndDirectoryInputProps = {
  files: Array<CogsFile | CogsFileInfo>;
  onChange: (files: Array<CogsFile | CogsFileInfo>) => unknown;
  onError?: (error: Error) => unknown;
  accept?: string;
  children: (args: {
    openSelectFileDialogue: () => void;
    openSelectDirectoryDialogue: () => void;
  }) => unknown;
};

/**
 * That component is designed to support 3 things related to file picking:
 * 1. Select File with system dialogue
 * 2. Select Directory with system dialogue
 * 3. Handle drop of both files&folders into component's dropzone
 * For all 3 events component calls props.onChange.
 * Notice that you can't select both files&folders with the same input, that's basically why this component was created.
 */
export function FilePickerHeadless({
  accept,
  files,
  onChange,
  onError = () => {},
  children,
}: FileAndDirectoryInputProps) {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const directoryInput = React.useRef<HTMLInputElement>(null);

  const directoryProps = {
    directory: 'directory',
    webkitdirectory: 'webkitdirectory',
  };

  // does conversion from File to CogsFile
  // filters out duplicates, unacceptable or hidden files
  const callOnChangeWithFilteredCogsFiles = React.useCallback(
    (newFiles: File[]) => {
      let acceptedFiles = newFiles;

      const isUniqueFile = (f: File) =>
        !files.find(
          (existingFile) =>
            existingFile.name === f.name &&
            existingFile.lastModified === f.lastModified &&
            existingFile.size === f.size
        );

      const isHidden = (f: File) => f.name.startsWith('.');

      acceptedFiles = acceptedFiles.filter(
        (file) => isUniqueFile(file) && !isHidden(file)
      );

      if (accept) {
        acceptedFiles = acceptedFiles.filter((file) => {
          if (attrAccept(file, accept)) {
            return true;
          }
          onError(
            new Error(
              `File ${file.name} has invalid extension. Accepted file types are "${accept}"`
            )
          );
          return false;
        });
      }

      onChange(files.concat(acceptedFiles.map(convertFileToCogsFile)));
    },
    [accept, files]
  );

  const selectFile = () => {
    if (!fileInput.current) {
      return;
    }
    fileInput.current!.click();
  };

  const selectDirectory = () => {
    if (!directoryInput.current) {
      return;
    }
    directoryInput.current!.click();
  };

  const fileInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    callOnChangeWithFilteredCogsFiles([...(e.target.files || [])]);
  };

  const commonProps: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > = {
    accept,
    multiple: true,
    type: 'file',
    // we don't track value here, onChange is purely additive
    // empty value helps to avoid the situation when you select a file or folder, then remove it from the list
    // then you try to select it again but you can't because input keeps the last value and don't call onChange
    value: '',
    onChange: fileInputOnChange,
    style: {
      position: 'absolute',
      visibility: 'hidden',
      height: 0,
      width: 0,
      lineHeight: 0,
      display: 'block',
    },
  };

  return (
    <FilePickerContext.Provider
      value={{ onChange: callOnChangeWithFilteredCogsFiles, onError }}
    >
      <input ref={fileInput} {...commonProps} />
      <input ref={directoryInput} {...commonProps} {...directoryProps} />
      <>
        {children({
          openSelectFileDialogue: selectFile,
          openSelectDirectoryDialogue: selectDirectory,
        })}
      </>
    </FilePickerContext.Provider>
  );
}
