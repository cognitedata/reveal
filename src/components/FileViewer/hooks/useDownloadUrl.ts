import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk';
import { useQuery } from 'react-query';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';
import { useEffect, useState } from 'react';
import {
  Annotation,
  getDecomposedContextualizedSvg,
} from '@cognite/unified-file-viewer';
import { getAnnotationsFromSVGAnnotations } from '../utils/getAnnotationsFromSVGAnnotations';
import { FILE_CONTAINER_ID } from '../constants';

const isSVG = (file: FileInfo | undefined) => {
  const { mimeType = '', name = '' } = file ?? {};
  const query = mimeType + name.slice(name.lastIndexOf('.') + 1);
  return query.includes('svg');
};

export const useDownloadUrl = (
  file?: FileInfo
): { fileUrl: string | undefined; extractedAnnotations: Annotation[] } => {
  const sdk = useSDK();
  const [fileUrl, setFileUrl] = useState<string>();
  const [extractedAnnotations, setExtractedAnnotations] = useState<
    Annotation[]
  >([]);

  const { id: fileId } = file || {};
  const { data } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', fileId],
    () =>
      fileId
        ? sdk.files.getDownloadUrls([{ id: fileId }]).then((r) => r[0])
        : undefined,
    // The retrieved URL becomes invalid after 30 seconds
    { refetchInterval: 25000 }
  );

  useEffect(() => {
    (async () => {
      setFileUrl(undefined);
      setExtractedAnnotations([]);

      if (file) {
        const downloadUrl = data?.downloadUrl;
        if (downloadUrl) {
          if (isSVG(file)) {
            const svgString = await fetch(downloadUrl)
              .then((resp) => resp.text())
              .then((svg) => svg);
            const { svg, annotations } =
              getDecomposedContextualizedSvg(svgString);

            const svgAnnotations = getAnnotationsFromSVGAnnotations(
              annotations,
              FILE_CONTAINER_ID
            );
            setFileUrl(svg);
            setExtractedAnnotations(svgAnnotations);
          } else {
            setFileUrl(downloadUrl);
          }
        }
      }
    })();
  }, [file, data, sdk]);

  return { fileUrl, extractedAnnotations };
};
