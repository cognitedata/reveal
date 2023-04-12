import React, { useEffect, useState } from 'react';
import { InternalDocument } from '@data-exploration-lib/domain-layer';
import styled from 'styled-components';
import { HighlightCell } from '@data-exploration/components';
import { Body, Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

// type OcrResponse = {
//   items: {
//     annotations: {
//       text: string;
//       type: string;
//     }[];
//   }[];
// };

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
        // const downloadUrl = await sdk.files.getDownloadUrls([
        //   { id: document.id },
        // ]);
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

          // 2. Create summary of max ~200 kb
          const ocrText = response.data;
          // let ocrText = '';
          // for (
          //   let i = 0;
          //   ocrText.length < 200 * 1024 && i < ocr.annotations.length;
          //   i++
          // ) {
          //   ocrText = ocrText + ocr.annotations[i].text + ' ';
          // }

          let gptContent =
            'Describe with maximum 150 characters the purpose of the following document: \n\n' +
            ocrText;
          if (query && query.endsWith('?')) {
            gptContent =
              'Given this information about this file: \n\n' +
              ocrText.substring(0, 10000) +
              '\n' +
              query +
              "\nIf you don't have the answer, just return N/A.";
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
          const summary = gptResponse.data.choices[0].message.content.trim();
          setContent(
            summary.charAt(0).toLocaleUpperCase() + summary.substring(1)
          );
        } catch (error) {
          setContent(`Could not generate summary`);
        }
      }
    }
    retrieveContent();
  }, [sdk, sdk.files, document, query]);

  return (
    <Body level={2}>
      <Flex alignItems="center">
        <StyledContentHighlight>
          <HighlightCell text={content} query={query} lines={3} />
        </StyledContentHighlight>
      </Flex>
    </Body>
  );
};

const StyledContentHighlight = styled.div`
  word-break: break-all;
  font-size: 10pt;
`;
