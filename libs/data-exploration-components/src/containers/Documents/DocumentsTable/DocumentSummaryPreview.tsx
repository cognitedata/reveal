import React, { useEffect, useState } from 'react';
import { InternalDocument } from '@data-exploration-lib/domain-layer';
import { Body, Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

type GptCompletionResponse = {
  choices: {
    message: {
      role: string;
      content: string;
      finishReason: string;
    };
  }[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const DocumentSummaryPreview = ({
  document,
  query,
}: {
  document: InternalDocument;
  query: string | undefined;
}) => {
  const sdk = useSDK();
  const [content, setContent] = useState('Loading...');

  useEffect(() => {
    async function retrieveContent() {
      if (document.mimeType !== 'application/pdf') {
        setContent('Summary only works for PDF');
      } else {
        try {
          // 1. Fetch document content using CDF OCR
          const response = await sdk.get<string>(
            `/api/v1/projects/${sdk.project}/documents/${document.id}/content`,
            {
              headers: { accept: 'text/plain' },
            }
          );
          if (response.status !== 200) {
            setContent('OCR not available');
            return;
          }

          // 2. Create summary
          const ocrText = response.data;

          let gptContent =
            'Describe with maximum 150 characters the purpose of the following document: \n\n' +
            ocrText;
          if (query && query.endsWith('?')) {
            gptContent =
              'Given this information about this file: \n\n' +
              ocrText.substring(0, 10000) +
              '\n' +
              query +
              "\nIf you don't have the answer, just return N/A, and only that.";
          }

          await sleep(document.id % 2000);

          // 3. Have ChatGPT figure out what the document is about
          const gptUrl = `/api/v1/projects/${sdk.project}/context/gpt/chat/completions`;
          const gptQuery = {
            messages: [
              {
                role: 'user',
                content: gptContent,
              },
            ],
            maxTokens: 300,
            temperature: 0,
          };
          const gptResponse = await sdk.post<GptCompletionResponse>(gptUrl, {
            data: gptQuery,
            withCredentials: true,
          });
          let summary = gptResponse.data.choices[0].message.content.trim();
          summary =
            summary.charAt(0).toLocaleUpperCase() + summary.substring(1);
          if (summary.includes('N/A')) {
            summary = 'N/A';
          }
          setContent(summary);
        } catch (error) {
          setContent(`Could not generate summary`);
        }
      }
    }
    retrieveContent();
  }, [sdk, sdk.files, document, query]);

  return (
    <Body level={2}>
      <Flex alignItems="center">{content}</Flex>
    </Body>
  );
};
