import React, { useEffect, useState } from 'react';
import { InternalDocument } from '@data-exploration-lib/domain-layer';
import styled from 'styled-components';
import { HighlightCell } from '@data-exploration-components/components';
import { Body, Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { HttpResponseType } from '@cognite/sdk';

type OcrResponse = {
  items: {
    annotations: {
      text: string;
      type: string;
    }[];
  }[];
};

type GptCompletionResponse = {
  choices: {
    text: string;
  }[];
};

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
          const response = await sdk.post<OcrResponse>(
            'https://azure-dev.cognitedata.com/api/playground/projects/${sdk.project}/context/pnid/ocr',
            {
              data: { fileId: document.id },
              responseType: HttpResponseType.Json,
            }
          );
          if (response.status !== 200) {
            setContent('OCR not available');
            return;
          }

          // 2. Create summary of max ~200 kb
          const ocr = response.data.items[0];
          let ocrText = '';
          for (
            let i = 0;
            ocrText.length < 200 * 1024 && i < ocr.annotations.length;
            i++
          ) {
            ocrText = ocrText + ocr.annotations[i].text + ' ';
          }

          // 3. Have ChatGPT figure out what the document is about
          const gptModel = 'text-davinci-002';
          const gptUrl = `https://api.azure-dev.cogniteapp.com/openai-proxy/${sdk.project}/completion/${gptModel}`;
          const gptQuery = {
            prompt:
              'Describe with maximum 150 characters the purpose of the following document: \n\n' +
              ocrText,
            max_tokens: 300,
            temperature: 0,
            top_p: 0,
          };
          const gptResponse = await sdk.post<GptCompletionResponse>(gptUrl, {
            data: gptQuery,
            withCredentials: true,
          });
          const summary = gptResponse.data.choices[0].text
            .trim()
            .replace('The document is a ', '')
            .replace('This document is a ', '')
            .replace('The document is an ', '')
            .replace('This document is an ', '');
          setContent(
            summary.charAt(0).toLocaleUpperCase() + summary.substring(1)
          );
        } catch (error) {
          setContent(`Could not generate summary`);
        }
      }
    }
    retrieveContent();
  }, [sdk, sdk.files, document]);

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
