import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { generalLanguageDetectTranslationPrompt } from '@cognite/llm-hub';

import { CopilotAction } from '../../types';
import {
  addToCopilotEventListener,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../utils';
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
  input: string,
  llm: BaseChatModel
) => {
  const detectLanguagePromptTemplate = new PromptTemplate({
    template: generalLanguageDetectTranslationPrompt.template,
    inputVariables: generalLanguageDetectTranslationPrompt.input_variables,
  });

  const detectLanguageChain = new LLMChain({
    llm: llm,
    prompt: detectLanguagePromptTemplate,
  });
  try {
    return JSON.parse(
      (await parallelGPTCalls([{ input: input }], detectLanguageChain))[0].text
    ) as translationResponse;
  } catch (error) {
    return { language: 'english', translation: input } as translationResponse;
  }
};

// Can be used for any chain, and even for single inputs to ensure retries and timeouts.
// Takes in a list of input (ChainValues objects) and a chain which should call on them.
// For each call, creates a race between the call and a timeout promise.
// Retries the call if it times out, up to maxRetries times.
// If after maxRetries the call still times out, the result is just an {text:''} object, therefore the chain implementing this should never fail.
// Returns a list of results, where the index of each result corresponds to the index of the input.
export async function parallelGPTCalls(
  inputList: ChainValues[],
  chain: LLMChain,
  maxRetries: number = 3,
  timeout: number = 3000
): Promise<ChainValues[]> {
  const results: ChainValues[] = [];
  const retries: number[] = Array(inputList.length).fill(maxRetries);

  const executeCall = async (index: number): Promise<void> => {
    const input = inputList[index];
    let timeoutId: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clearTimeout(timeoutId!);
        reject(new Error('Request timed out'));
      }, timeout);
    });

    try {
      const response = await Promise.race([chain.call(input), timeoutPromise]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clearTimeout(timeoutId!);
      results[index] = response;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clearTimeout(timeoutId!);
      if (retries[index] > 0) {
        retries[index]--;
        console.log(`Retrying call ${index}...`);
        await executeCall(index); // Retry the call
      } else {
        results[index] = { text: '' }; // Max retries reached or timed out, return empty result
      }
    }
  };

  await Promise.all(inputList.map((_, index) => executeCall(index)));

  return results;
}
