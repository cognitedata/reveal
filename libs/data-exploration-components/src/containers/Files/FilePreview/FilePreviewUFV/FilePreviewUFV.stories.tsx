import { ComponentStory } from '@storybook/react';
import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ocrResults, response } from '../resources';
import { FilePreviewUFV } from './FilePreviewUFV';
// @ts-ignore
import pdfFileUrl from '../mock/pnid.pdf';
// @ts-ignore
import longPdfFileUrl from '../mock/multipageExample.pdf';
import testImageUrl from '../mock/test-image.png';
import { mockTxt, mockJson, mockCsv } from '../mock/mockFiles';
import { annotations } from './stubs/annotations';

const VIEWER_ID = 'FilePreviewUFV-story';
const APPLICATION_ID = 'data-exploration-components-storybook';

const allMockFiles = {
  pdfFile: {
    id: 111,
    externalId: 'PH-ME-P-0153-001.pdf',
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'Random File',
    mimeType: 'application/pdf',
    url: pdfFileUrl,
    hasEventAnnotations: true,
  },

  longPDF: {
    id: 222,
    externalId: 'PH-ME-P-0153-002.pdf',
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'Random File',
    mimeType: 'application/pdf',
    url: longPdfFileUrl,
    hasEventAnnotations: true,
  },

  testImage: {
    id: 333,
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'example.png',
    mimeType: 'image/png',
    url: testImageUrl,
    hasEventAnnotations: true,
  },

  txtFile: {
    id: 4,
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'example.txt',
    mimeType: 'text/plain',
    url: mockTxt,
    hasEventAnnotations: false,
  },

  jsonFile: {
    id: 5,
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'example.json',
    mimeType: 'application/json',
    url: mockJson,
    hasEventAnnotations: false,
  },

  csvFile: {
    id: 6,
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'example.csv',
    mimeType: 'text/csv',
    url: mockCsv,
    hasEventAnnotations: false,
  },

  unsupportedFileTypeFile: {
    id: 444,
    externalId: 'PH-ME-P-0153-001.random',
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'Random File',
    mimeType: 'random/random',
    url: pdfFileUrl,
    hasEventAnnotations: false,
  },

  fileWithoutMimeType: {
    id: 555,
    externalId: 'PH-ME-P-0153-001.random',
    lastUpdatedTime: new Date(),
    uploaded: false,
    createdTime: new Date(),
    name: 'Random File',
    url: pdfFileUrl,
    hasEventAnnotations: false,
  },
};

const mockFilesList = Object.values(allMockFiles);

const getMockFiles = (ids: (number | string)[]) => {
  const mockFiles = ids.map((id) =>
    mockFilesList.find((f) => f.id === Number(id))
  );
  if (mockFiles.some((f) => f === undefined)) {
    throw new Error(
      `FilePreviewUFV.stories pdfSdkMock: Did not find all files width ids ${ids}`
    );
  }

  return mockFiles;
};

const pdfSdkMock = {
  post: async (query: string, { data }: any) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('files')) {
      if (!data?.items.length) {
        return [];
      }
      return {
        data: {
          items: getMockFiles(data.items.map((f: any) => f.id)),
        },
      };
    }
    if (query.includes('events')) {
      const file = getMockFiles([
        data.filter.metadata.CDF_ANNOTATION_file_id,
      ])[0];
      if (file?.hasEventAnnotations) {
        return { data: { items: response } };
      }
      return { data: { items: [] } };
    }
    if (query.includes('ocr')) {
      if (data.fileId === allMockFiles.longPDF.id) {
        return { data: { items: ocrResults } };
      }

      throw new Error('OCR data not available');
    }
    return { data: { items: [] } };
  },
  files: {
    retrieve: async (fileIds: { id: string }[]) => {
      return getMockFiles(fileIds.map(({ id }) => id));
    },
    getDownloadUrls: async (fileIds: { id: number }[]) => {
      return getMockFiles(fileIds.map(({ id }) => id)).map((mockFile) => ({
        downloadUrl: mockFile?.url,
      }));
    },
  },
  annotations: {
    list: async () => ({ items: annotations }),
  },
} as unknown as CogniteClient;

export default {
  title: 'Files/FilePreviewUFV',
  component: FilePreviewUFV,
  parameters: {
    options: {
      enableShortcuts: false,
    },
    explorerConfig: { sdkMockOverride: pdfSdkMock },
  },
};

export const SinglePagePdf: ComponentStory<typeof FilePreviewUFV> = (args) => (
  <FilePreviewUFV {...args} />
);
SinglePagePdf.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.pdfFile.id,
};

export const MultiPagePdfWithOcr: ComponentStory<typeof FilePreviewUFV> = (
  args
) => <FilePreviewUFV {...args} />;
MultiPagePdfWithOcr.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.longPDF.id,
};

export const Png: ComponentStory<typeof FilePreviewUFV> = (args) => (
  <FilePreviewUFV {...args} />
);
Png.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.testImage.id,
};

export const Txt: ComponentStory<typeof FilePreviewUFV> = (args) => (
  <FilePreviewUFV {...args} />
);
Txt.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.txtFile.id,
};

export const Csv: ComponentStory<typeof FilePreviewUFV> = (args) => (
  <FilePreviewUFV {...args} />
);
Csv.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.csvFile.id,
};

export const Json: ComponentStory<typeof FilePreviewUFV> = (args) => (
  <FilePreviewUFV {...args} />
);
Json.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.jsonFile.id,
};

export const UnsupportedFileType: ComponentStory<typeof FilePreviewUFV> = (
  args
) => <FilePreviewUFV {...args} />;
UnsupportedFileType.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.unsupportedFileTypeFile.id,
};

export const FileWithoutMimeType: ComponentStory<typeof FilePreviewUFV> = (
  args
) => <FilePreviewUFV {...args} />;
FileWithoutMimeType.args = {
  id: VIEWER_ID,
  applicationId: APPLICATION_ID,
  fileId: allMockFiles.fileWithoutMimeType.id,
};
