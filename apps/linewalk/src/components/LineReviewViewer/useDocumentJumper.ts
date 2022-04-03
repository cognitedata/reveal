import { CogniteOrnate } from '@cognite/ornate';
import Konva from 'konva';
import { useEffect, useState } from 'react';

import { ParsedDocument } from '../../modules/lineReviews/types';

import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import withoutFileExtension from './withoutFileExtension';

const useDocumentJumper = (
  documents: ParsedDocument[],
  ornateRef: CogniteOrnate | undefined
) => {
  const [jumpToDocumentValue, setJumpToDocumentValue] = useState('');

  const documentJumperOptions = [
    {
      label: 'Jump to document...',
      value: '',
    },

    ...documents.map((document) => ({
      label: `${document.type.toUpperCase()}: ${withoutFileExtension(
        document.pdfExternalId
      )}`,
      value: document.externalId,
    })),
  ];

  useEffect(() => {
    if (ornateRef && jumpToDocumentValue !== '') {
      const node = ornateRef.stage.findOne(
        `#${getKonvaSelectorSlugByExternalId(jumpToDocumentValue)}`
      ) as Konva.Group;
      if (node) {
        ornateRef.zoomToGroup(node, {
          scaleFactor: 0.75,
        });
      }

      setJumpToDocumentValue('');
    }
  }, [jumpToDocumentValue, ornateRef]);

  return {
    documentJumperOptions,
    jumpToDocumentValue,
    setJumpToDocumentValue,
  };
};

export default useDocumentJumper;
