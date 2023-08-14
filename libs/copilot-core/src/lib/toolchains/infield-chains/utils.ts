import { generalLanguageDetectTranslationPrompt } from '@cognite/llm-hub';
import { Asset, CogniteClient } from '@cognite/sdk/dist/src';

import {
  CogniteBaseChain,
  callPromptChain,
  safeConvertToJson,
} from '../../CogniteBaseChain';
import { CopilotAction } from '../../types';
import {
  addToCopilotEventListener,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../utils';
import {
  queryResponse,
  sourceResponse,
  translationResponse,
} from '../../utils/types';
import { retrieveAsset } from '../../utils/utils';

export let externalAssetIdGlobal: string = '';
export let assetDescriptionGlobal: string = '';

// Function for sending event to Infield, and retrieving the external asset id.
export const getExternalId = async () => {
  return new Promise((resolve) => {
    const unmount = addToCopilotEventListener('GET_EXTERNAL_ASSETID', (e) => {
      unmount();
      resolve(e.content || '');
    });
    sendFromCopilotEvent('GET_EXTERNAL_ASSETID', undefined);
  });
};

// Function for printing the sources used to find multiple answers
// Also used to generate CopilotActions for opening the documents
export function prepareSources(sourceList: sourceResponse[]) {
  if (sourceList.length === 0) {
    return { sourceString: '', openDocActionList: [] };
  }

  let sourceString = '';
  const openDocActionList: CopilotAction[] = [];
  for (let i = 0; i < sourceList.length; i++) {
    let page;
    try {
      page = parseInt(sourceList[i].page);
    } catch (e) {
      page = sourceList[i].page;
    }
    if (
      sourceString.includes(
        `$Source: ${sourceList[i].source} \n [Page: ${page}]`
      )
    ) {
      continue;
    }
    if (openDocActionList.length < 5) {
      openDocActionList.push({
        content: 'Open: ' + (openDocActionList.length + 1),
        fromCopilotEvent: [
          'PUSH_DOC_ID_AND_PAGE',
          {
            docId: sourceList[i].fileId,
            page: String(page) || '1',
          },
        ],
      } as CopilotAction);
    }

    sourceString += `${i + 1}. ${sourceList[i].source} [Page: ${page}] \n`;
  }

  return { sourceString: sourceString, openDocActionList: openDocActionList };
}

export const prepareRelevantSoruces = (queryContext: queryResponse) => {
  const slicedSources = queryContext.items.slice(0, 3);
  const sourceString = slicedSources
    .map(
      (s, i) =>
        `${i + 1}. ${s.metadata.source} [Page: ${
          parseInt(s.metadata.page) || 1
        }]`
    )
    .join('\n');
  const openDocActionList = slicedSources.map(
    (s, i) =>
      ({
        content: 'Open: ' + (i + 1),
        fromCopilotEvent: [
          'PUSH_DOC_ID_AND_PAGE',
          {
            docId: s.metadata.fileId,
            page: String(parseInt(s.metadata.page) || 1) || '1',
          },
        ],
      } as CopilotAction)
  );
  return { sourceString: sourceString, openDocActionList: openDocActionList };
};

// Function for sending getLanguage event to Infield, and retrieving the language of the page.
export const getPageLanguage = async () => {
  return new Promise((resolve) => {
    const unmount = addToCopilotEventListener('GET_LANGUAGE', (e) => {
      unmount();
      resolve(e.content || '');
    });
    sendFromCopilotEvent('GET_LANGUAGE', undefined);
  });
};

// Function for getting the activities from Infield
export const getActivities = async () => {
  return new Promise((resolve) => {
    const unmount = addToCopilotEventListener('GET_ACTIVITIES', (e) => {
      unmount();
      resolve(e.content || '');
    });
    sendFromCopilotEvent('GET_ACTIVITIES', undefined);
  });
};

// calls GPT to translate input to english as well as recording original language
export const translateInputToEnglish = async (
  chain: CogniteBaseChain,
  input: string
) => {
  try {
    return (
      await callPromptChain(
        chain,
        'translating text',
        generalLanguageDetectTranslationPrompt,
        [
          {
            input: input,
          },
        ]
      ).then(safeConvertToJson<translationResponse>)
    )[0];
  } catch (error) {
    return { language: 'english', translation: input } as translationResponse;
  }
};

export const summarizeAssetProps = (chain: CogniteBaseChain, asset: Asset) => {
  const { name, description, metadata } = asset;
  let metadataString;
  try {
    metadataString = Object.keys(metadata || {})
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((key) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        !['', 'NA', 'null'].includes(metadata![key])
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            '' + key + ': ' + metadata![key]
          : ''
      )
      .join(' \n');
  } catch (error) {
    metadataString = '';
  }

  return (
    'Name: ' +
    name +
    '\n' +
    'Description: ' +
    description +
    '\n' +
    'Metadata: ' +
    metadataString
  );
};

export const runInfieldStartUp = async (
  externalAssetId: string,
  sdk: CogniteClient,
  chain: CogniteBaseChain
) => {
  sendToCopilotEvent('LOADING_STATUS', {
    status: 'Setting up...',
  });
  externalAssetIdGlobal = externalAssetId;
  const asset = (await retrieveAsset(externalAssetId, sdk))[0];
  assetDescriptionGlobal = summarizeAssetProps(chain, asset);
};
