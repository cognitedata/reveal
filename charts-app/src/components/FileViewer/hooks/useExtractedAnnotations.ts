import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useEffect, useState } from 'react';
import {
  Annotation,
  getDecomposedContextualizedSvg,
} from '@cognite/unified-file-viewer';

const isSVG = (file: FileInfo | undefined) => {
  const { mimeType = '', name = '' } = file ?? {};
  const query = mimeType + name.slice(name.lastIndexOf('.') + 1);
  return query.includes('svg');
};

export const useExtractedAnnotations = (
  file?: FileInfo
): {
  extractedAnnotations: Annotation[] | undefined;
} => {
  const sdk = useSDK();
  const [extractedAnnotations, setExtractedAnnotations] =
    useState<Annotation[]>();

  useEffect(() => {
    setExtractedAnnotations([]);
    (async () => {
      if (file !== undefined && isSVG(file)) {
        sdk.files
          .getDownloadUrls([{ id: file.id }])
          .then((results) => results[0].downloadUrl)
          .then((url) => fetch(url))
          .then((response) => response.text())
          .then((svgString) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
            const { svg, annotations } =
              getDecomposedContextualizedSvg(svgString);
            setExtractedAnnotations(annotations);
          });
      }
    })();
  }, [file]);

  if (!isSVG(file)) {
    return { extractedAnnotations: undefined };
  }

  return { extractedAnnotations };
};
