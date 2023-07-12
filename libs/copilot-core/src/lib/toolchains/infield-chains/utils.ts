import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import {
  addToCopilotEventListener,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../utils';
import { sourceResponse, translationResponse } from '../../utils/types';

import { DETECT_LANGUAGE_PROMPT } from './prompts';
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
export function printSources(sourceList: sourceResponse[]) {
  let sourceString = '';
  for (let i = 0; i < sourceList.length; i++) {
    sourceString += `${i + 1}. Answer: ${sourceList[i].text} \n Source: ${
      sourceList[i].source
    } \n Page: ${sourceList[i].page} \n\n`;
  }
  sendToCopilotEvent('NEW_MESSAGES', [
    {
      source: 'bot',
      type: 'text',
      content: sourceString,
      chain: 'DocumentQueryChain',
    },
  ]);
  console.log(sourceString);
  return sourceString;
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
  const detectLanguagePrompt = new PromptTemplate({
    template: DETECT_LANGUAGE_PROMPT,
    inputVariables: ['input'],
  });

  const detectLanguageChain = new LLMChain({
    llm: llm,
    prompt: detectLanguagePrompt,
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
