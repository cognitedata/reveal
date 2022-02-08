import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { documentSearchService } from '../service';
import { getFilepath } from '../utils/getFilepath';

export const useDocumentFilename = (id: number) => {
  const [filename, setfileName] = React.useState('');

  React.useEffect(() => {
    documentSearchService.documentsByIds([id]).then((result) => {
      if (!isEmpty(result.items)) {
        const file = result.items[0].item;
        const path = getFilepath(file) + file.sourceFile.name;
        setfileName(path);
      }
    });
  }, [id]);

  return filename;
};
