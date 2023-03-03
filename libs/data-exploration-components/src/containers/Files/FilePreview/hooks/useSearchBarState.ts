import { useState } from 'react';
import { FileInfo } from '@cognite/sdk/dist/src';
import { getCanonicalMimeType } from '@cognite/unified-file-viewer';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';

import { useDisclosure } from '../../../../hooks';
import { useMetrics } from '../../../../hooks/useMetrics';
import { useFileDownloadUrl } from '../hooks';

type UseSearchBarProps = {
  file: FileInfo | undefined;
};

export type UseSearchBarState = {
  fileUrl: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  setSearchBarInputRef: (ref: HTMLInputElement | null) => void;
};

export const useSearchBarState = ({
  file,
}: UseSearchBarProps): UseSearchBarState => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchBarInputRef, setSearchBarInputRef] =
    useState<HTMLInputElement | null>();
  const trackUsage = useMetrics();

  const fileUrl = useFileDownloadUrl(file?.id);

  const {
    isOpen: isSearchOpen,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
  } = useDisclosure({
    isOpen: Boolean(searchQuery),
  });

  const handleSearchClose = () => {
    onSearchClose();
    setSearchQuery('');
  };

  const handleSearchOpen = () => {
    if (file === undefined) return;

    if (isSearchOpen) {
      searchBarInputRef?.select();
      return;
    }

    const fileMimeType = file.mimeType;
    trackUsage(
      DATA_EXPLORATION_COMPONENT.FILE_PREVIEW.SEARCH_IN_CONTAINER_OPEN,
      {
        fileId: file.id,
        mimeType:
          fileMimeType === undefined
            ? fileMimeType
            : getCanonicalMimeType(fileMimeType),
      }
    );
    onSearchOpen();
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    onSearchOpen: handleSearchOpen,
    onSearchClose: handleSearchClose,
    setSearchBarInputRef,
    fileUrl,
  };
};
