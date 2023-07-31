import { getDocumentSDKClient } from 'domain/documents/service/utils/getDocumentSDKClient';

import { useEffect, useState } from 'react';

import { DocumentType } from 'modules/documentSearch/types';
import { toDocument } from 'modules/documentSearch/utils';

export const useDocument = (
  documentId: string
): [DocumentType | undefined, boolean, string | undefined] => {
  const [doc, setDoc] = useState<DocumentType>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setIsLoading(true);
    try {
      getDocumentSDKClient()
        .search({
          filter: {
            or: [
              {
                in: {
                  property: ['id'],
                  values: [Number(documentId)],
                },
              },
              {
                in: {
                  property: ['externalId'],
                  values: [documentId],
                },
              },
            ],
          },
        })
        .then(({ items }) => {
          setDoc(
            toDocument({
              item: {
                ...items?.[0]?.item,
                sourceFile: {},
              } as any,
            })
          );
          setError(undefined);
          setIsLoading(false);
        });
    } catch (fetchingError) {
      setError(String(fetchingError));
      setIsLoading(false);
    }
  }, [documentId]);

  return [doc, isLoading, error];
};
