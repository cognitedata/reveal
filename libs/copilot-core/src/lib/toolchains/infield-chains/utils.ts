import { generalLanguageDetectTranslationPrompt } from '@cognite/llm-hub';

import {
  CogniteBaseChain,
  callPromptChain,
  safeConvertToJson,
} from '../../CogniteBaseChain';
import { CopilotAction } from '../../types';
import { addToCopilotEventListener, sendFromCopilotEvent } from '../../utils';
import { sourceResponse, translationResponse } from '../../utils/types';

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

// Function for sending event and documentId to Infield, letting Infield handle logic for viewing document.
export const pushDocumentId = async (docId: string) => {
  return new Promise((resolve) => {
    const unmount = addToCopilotEventListener('PUSH_DOC_ID', (e) => {
      unmount();
      resolve(e);
    });
    sendFromCopilotEvent('PUSH_DOC_ID', { content: docId });
  });
};

// Function for printing the sources used to find multiple answers
// Also used to generate CopilotActions for opening the documents
export function prepareSources(sourceList: sourceResponse[]) {
  let sourceString = '';
  const openDocActionList: CopilotAction[] = [];
  for (let i = 0; i < sourceList.length; i++) {
    if (
      !(
        sourceString.includes(sourceList[i].source) &&
        sourceString.includes(sourceList[i].page)
      )
    ) {
      if (openDocActionList.length < 3) {
        openDocActionList.push({
          content: 'Open: ' + (openDocActionList.length + 1),
          onClick: () => {
            pushDocumentId('446078535171616'); //DOCUMENT ID HERE
          },
        } as CopilotAction);
      }

      sourceString += `${openDocActionList.length}. Source: ${sourceList[i].source} \n Page: ${sourceList[i].page} \n\n`;
    }
  }
  console.log(sourceString);
  return [sourceString, openDocActionList];
}

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

// calls GPT to translate input to english as well as recording original language
export const translateInputToEnglish = async (
  chain: CogniteBaseChain,
  input: string
) => {
  try {
    return (
      await callPromptChain(chain, generalLanguageDetectTranslationPrompt, [
        {
          input: input,
        },
      ]).then(safeConvertToJson<translationResponse>)
    )[0];
  } catch (error) {
    return { language: 'english', translation: input } as translationResponse;
  }
};
