import React, { useEffect, useState } from 'react';
import { InternalDocument } from '@data-exploration-lib/domain-layer';
import { Body, Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import gpt from '../../../utils/gpt';
import { useFlagDocumentGPT } from '@data-exploration-app/hooks';


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
  const isDocumentsGPTEnabled = useFlagDocumentGPT();

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
          const ocrText = response.data.substring(0, 10000);

          let gptQuery =
            'Describe with maximum 150 characters the purpose of the following document: \n\n' +
            ocrText;
          if (query && query.endsWith('?')) {
            gptQuery =
              'Given this information about this file: \n\n' +
              ocrText +
              '\n' +
              query +
              "\nIf you don't have the answer, just return N/A, and only that.";
          }

          await sleep(document.id % 2000); // Avoid 429s in the worst possible way!

          // 3. Have ChatGPT figure out what the document is about
          const choices = await gpt(
            {
              messages: [
                {
                  role: 'user',
                  content: gptQuery,
                },
              ],
              temperature: 0,
              maxTokens: 500,
            },
            sdk
          );
          let summary = choices[0].message.content.trim();
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
    if (isDocumentsGPTEnabled) {
      retrieveContent();
    }
  }, [sdk, sdk.files, document, query]);

  return (
    <Body level={2}>
      <Flex alignItems="center">{content}</Flex>
    </Body>
  );
};
