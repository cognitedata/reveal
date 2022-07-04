import { Asset } from '@cognite/sdk';
import FileListSidebar from 'components/FileListSidebar/FileListSidebar';
import useAssetAnnotatedFiles from 'models/cdf/assets/queries/useAssetAnnotatedFiles';
import useFilesPreviewURL from 'models/cdf/files/queries/useFilesPreviewURL';
import { ComponentProps } from 'react';
import filePreviewSelector from '../selectors/filePreviewSelector';

export default function useFileListSidebar(
  asset: Asset,
  selectedFileId: number
): ComponentProps<typeof FileListSidebar>['files'] {
  const { data: files = [], isFetching: isLoadingFiles } =
    useAssetAnnotatedFiles(asset);
  const filePreviewURLQueries = useFilesPreviewURL(files);

  return isLoadingFiles
    ? {
        list: [],
        isLoading: true,
        isError: false,
      }
    : {
        list: files.map((file, index) => ({
          id: file.id,
          name: file.name,
          active: file.id === selectedFileId,
          preview: filePreviewSelector(filePreviewURLQueries[index], file),
        })),
        isLoading: false,
        isError: false,
      };
}
