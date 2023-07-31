import { v1 } from 'uuid';

import { Trace } from '@cognite/seismic-sdk-js';

import {
  addSurveySelection,
  removeSurveySelection,
  removeFileSelection,
  removeAllFileSelection,
  addFileSelection,
} from './actions';
import { SeismicHeader } from './service';
import {
  SeismicFile,
  SeismicSurveyContainer,
  SeismicSelections,
} from './types';

type RawMetadata = [string, string][];
// Mapping out metadatalist as an object instead of a list.
export const mapMetadata = (metadata: RawMetadata) => {
  return metadata.reduce((result, meta) => {
    const key = getSafeMetadataName(meta[0]);

    return {
      ...result,
      [key]: meta[1] === 'nan' ? '' : meta[1],
    };
  }, {} as SeismicFile['metadata']);
};

export const getSafeMetadataName = (name: string) =>
  name
    .replace(/\s+/g, '_')
    .replace(/[\u200B-\u200D]/g, '') // Removing invisible unicodes that might ruin your day!
    .toLowerCase()
    .trim();

export const normalizeSurvey = (response: any) => {
  const surveyName = response.survey.name;
  const survey: SeismicSurveyContainer = {
    id: response.survey.id,
    survey: surveyName,
    geometry: response.survey.geometry,
    surveys: response.files.map((file: any) => {
      const fileInfo = {
        id: file.id,
        survey: surveyName,
        dataSetName: file.name,
        geometry: file.geometry,
        metadata: mapMetadata(file.metadata),
      };

      return fileInfo;
    }),
  };

  return survey;
};

// this second arg is there so we can call this from nested things
// by passing that data sourced from the parent component (where hooks are ok)
export const isSurveySelected = (
  surveyId: string,
  selectedSurveys: SeismicSelections['surveys']
) => {
  return selectedSurveys.includes(surveyId);
};

export const toggleSurveySelected = (
  surveyId: string,
  selectedSurveys: SeismicSelections['surveys']
) => {
  const isSelected = isSurveySelected(surveyId, selectedSurveys);

  if (isSelected) {
    return removeSurveySelection(surveyId);
  }

  return addSurveySelection(surveyId);
};

export const isFileSelected = (
  fileId: string,
  selectedFiles: SeismicSelections['files']
) => {
  return selectedFiles.some(
    (selectedSurveyFile) => fileId === selectedSurveyFile.fileId
  );
};

export const toggleFileSelected = (
  file: SeismicFile,
  selectedFiles: SeismicSelections['files']
) => {
  const isSelected = isFileSelected(file.id, selectedFiles);

  if (isSelected) {
    return removeFileSelection(file.id);
  }

  return addFileSelection(file);
};

export const deselectAllFiles = () => {
  return removeAllFileSelection();
};

export const processSegyHeader = (header: SeismicHeader): SeismicHeader => {
  const regexLineBreak = /\r?\n|\r/g; // Used to remove all linebreaks in the raw text
  const regexLineStart = /(C [0-9]|C[0-9]{2})/g; // Fetches all the headers (e.g C01, C 1, C10, C22 etc)
  const regexResult = '\r\n$1 ';

  // Used to remove all linebreaks in the raw text
  const stripLineBreaks = (string: string) =>
    string.replace(regexLineBreak, '');

  // Adds a line break before each header (e.g C01, C 1, C10, C22 etc)
  const addLineBreaksBeforeHeaders = (string: string) =>
    string.replace(regexLineStart, regexResult);

  if (!header || !header.meta) {
    return {
      meta: {
        fileId: '',
        rawHeader: '',
        header: '',
      },
    };
  }

  const processedHeader = addLineBreaksBeforeHeaders(
    stripLineBreaks(header.meta.header)
  );
  return {
    meta: {
      fileId: header.meta.fileId,
      rawHeader: header.meta.header,
      header: processedHeader,
    },
  };
};

export const average = (data: number[]) => {
  const sum = data.reduce((result, value) => {
    return result + value;
  }, 0);
  const avg = sum / data.length;
  return avg;
};

export const getStandardDeviation = (values: Trace[], avg: number) => {
  const squareDiffs: number[] = [];
  values.forEach((v) => {
    const inner = v.traceList.map((value: number) => {
      const diff = value - avg;
      const sqrDiff = diff * diff;
      return sqrDiff;
    });
    squareDiffs.push(...inner);
  });

  const avgSquareDiff = average(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

export const getSlice = (list: Trace[]) => {
  const slices = list;
  const count = list.length * list[0].traceList.length;

  const sum = list.reduce((a, b) => a + (b.sum || 0), 0);
  const mean = sum / count;
  const standardDeviation = getStandardDeviation(list, mean);

  return {
    content: slices,
    mean,
    standardDeviation,
    id: v1(),
  };
};
