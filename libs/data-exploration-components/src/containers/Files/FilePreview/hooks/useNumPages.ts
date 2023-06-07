import { useState, useEffect } from 'react';

import { ContainerType, getPdfCache } from '@cognite/unified-file-viewer';
import { FileContainerProps } from '@cognite/unified-file-viewer/dist/core/utils/getContainerConfigFromUrl';

export const useNumPages = (container: FileContainerProps | undefined) => {
  const [numPages, setNumPages] = useState(1);

  useEffect(() => {
    if (container === undefined || container.type !== ContainerType.DOCUMENT)
      return;

    getPdfCache().getPdfNumPages(container.url).then(setNumPages);
  }, [container]);

  return numPages;
};
