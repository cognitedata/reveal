import React from 'react';
import { WebkitFile } from 'src/modules/Common/Components/FileUploader/FilePicker/types';
import { useFilePickerContext } from './FilePickerContext';

export const fileDropzoneTitle = 'Drop files or folders here';

type FilesDropzoneProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

type DragEvent<T = HTMLDivElement> = React.DragEvent<T> & { target: T };

export function FileDropzone(props: FilesDropzoneProps) {
  const rootElRef = React.useRef<HTMLDivElement>(null);
  const { onChange, onError } = useFilePickerContext();

  const onDrop = async (event: DragEvent) => {
    event.preventDefault();

    setDropActiveAttr(false);
    try {
      const files = await getAllFiles(event.dataTransfer.items);
      onChange(files);
    } catch (error) {
      onError(error);
    }
  };

  const setDropActiveAttr = (value: boolean) => {
    if (!rootElRef.current) {
      return;
    }
    rootElRef.current.setAttribute('drop-active', String(value));
  };

  const enterDropZone = (event: DragEvent) => {
    event.preventDefault();
    setDropActiveAttr(true);
  };

  const leaveDropZone = (event: DragEvent) => {
    event.preventDefault();
    setDropActiveAttr(false);
  };

  return (
    <div
      ref={rootElRef}
      {...props}
      // title={fileDropzoneTitle}
      onDragOver={enterDropZone}
      onDragLeave={leaveDropZone}
      onDrop={onDrop}
    />
  );
}

// ==================================================================

export interface InternalDataTransferItem extends DataTransferItem {
  isFile: boolean;
  file: (cd: (file: WebkitFile) => void) => void;
  createReader: () => any;
  fullPath: string;
  isDirectory: boolean;
  name: string;
}

// Drop handler function to get all files
async function getAllFiles(
  dataTransferItemList: DataTransferItemList
): Promise<File[]> {
  // in case if a user drops not just a list of folders,
  // but a file-tree (e.g. tree-view in file-explorer is used) there might be duplicates,
  // the same file can be processed as a child/grandchild of a parent/grandparent
  // e.g. folder -> subfolder -> file selected and dropped --- that would result as 3 files with a different fullPath
  // to avoid that we use fileEntries as a Map with a key equal to combination of a file props
  const fileEntries = new Map<string, WebkitFile>();

  // Use BFS to traverse entire directory/file structure
  const queue: Array<InternalDataTransferItem> = [];
  for (let i = 0; i < dataTransferItemList.length; i++) {
    queue.push(dataTransferItemList[i].webkitGetAsEntry());
  }

  /* eslint-disable no-await-in-loop */
  while (queue.length > 0) {
    const entry = queue.shift()!;
    if (entry.isFile) {
      const file = await getFileFromEntry(entry);
      const fileKey = `${file.name}_${file.lastModified}_${file.size}_${file.type}`;
      const existingFile = fileEntries.get(fileKey);

      const fileIsNewOrHasLongerRelativePath =
        !existingFile ||
        (existingFile &&
          existingFile.webkitRelativePath &&
          file.webkitRelativePath &&
          file.webkitRelativePath.length >
            existingFile.webkitRelativePath.length);

      if (fileIsNewOrHasLongerRelativePath) {
        fileEntries.set(fileKey, file);
      }
    } else if (entry.isDirectory) {
      queue.push(...(await recursivelyGetAllEntries(entry)));
    }
  }
  /* eslint-enable no-await-in-loop */
  return Array.from(fileEntries.values());
}

function getFileFromEntry(
  entry: InternalDataTransferItem
): Promise<WebkitFile> {
  return new Promise((resolve) => {
    entry.file((file: WebkitFile) => {
      if (entry.fullPath && !file.webkitRelativePath) {
        Object.defineProperties(file, {
          webkitRelativePath: {
            writable: true,
          },
        });
        // eslint-disable-next-line no-param-reassign
        file.webkitRelativePath = entry.fullPath.replace(/^\//, '');
        Object.defineProperties(file, {
          webkitRelativePath: {
            writable: false,
          },
        });
      }
      resolve(file);
    });
  });
}

async function recursivelyGetAllEntries(
  directoryEntry: InternalDataTransferItem
) {
  const directoryReader = directoryEntry.createReader();
  const entries = [];
  let readEntries = await readEntriesPromise(directoryReader);
  /* eslint-disable no-await-in-loop */
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  /* eslint-enable no-await-in-loop */
  return entries;
}

function readEntriesPromise(
  directoryReader: any
): Promise<InternalDataTransferItem[]> {
  return new Promise((resolve, reject) => {
    directoryReader.readEntries(resolve, reject);
  });
}
