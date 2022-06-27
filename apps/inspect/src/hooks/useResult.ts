import { useEffect, useState } from 'react';
import { ResultType } from 'pages/Search/types';

import { getIntentEntities } from '../utils/getIntentEntities';
import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';
import { DB_NAME, RESULTS_SCHEMA_TABLE } from '../constants';

type IntentResult = { documentId?: number; resultString?: string };

const getDocuments = async (assetId: string) => {
  const documents = await getCogniteSDKClient().documents.list({
    filter: {
      containsAll: {
        property: ['assetExternalIds'],
        values: [assetId || 'pump1'],
      },
    },
  });
  return documents?.items?.[0]?.id;
};

const getValueFromResultAPI = async (
  intentName: string,
  entityName: string
) => {
  const documentId = await getDocuments(entityName);

  const item = await getCogniteSDKClient().raw.retrieveRow(
    DB_NAME,
    RESULTS_SCHEMA_TABLE,
    String('')
  );

  return [
    intentName,
    // @ts-expect-error THIS TYPE IS WRONG
    item.items?.[0]?.columns?.finalSchema?.[intentName],
    documentId,
  ];
};

const getResultFromIntent = async (
  intentName: string,
  entityName: string,
  entityLabel: string
): Promise<IntentResult> => {
  if (!intentName && !entityName) {
    return Promise.resolve({
      resultString: 'Could not find any relevant result for the given query',
    });
  }
  switch (intentName) {
    case 'Performance_Curve': {
      // @ts-expect-error THIS TYPE IS WRONG
      return async () => {
        const value = await getValueFromResultAPI(intentName, entityName);
        return { documentId: value[2] };
      };
    }
    default: {
      const [intentKey, intentValue] = await getValueFromResultAPI(
        intentName,
        entityName
      );
      return {
        resultString: `The ${intentKey} for ${
          entityName || 'pump1'
        } ${entityLabel} is: ${intentValue}`,
      };
    }
  }
};

export const useResult = (
  result: ResultType
): IntentResult & {
  entityName: string;
  intentName: string;
} => {
  // @ts-expect-error THIS TYPE IS WRONG
  const { intentName, entityName, entityLabel } = getIntentEntities(result);
  const [{ resultString, documentId }, setResult] = useState<IntentResult>({
    resultString: undefined,
    documentId: undefined,
  });

  useEffect(() => {
    getResultFromIntent(intentName, entityName, entityLabel).then((result) =>
      setResult(result)
    );
  }, [intentName, entityName, entityLabel]);

  return { documentId, resultString, intentName, entityName };
};
