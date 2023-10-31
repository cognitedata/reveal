import { ColumnShape } from 'react-base-table';

import { InfiniteData, useQuery } from '@tanstack/react-query';
import {
  CODE_EDITOR_THEME_LOCAL_STORAGE_KEY,
  DEFAULT_CODE_EDITOR_THEME,
  RELEASE_BANNER_SESSION_STORAGE_KEY,
} from '@transformations/common';
import { JobMetricsGroup, Warning } from '@transformations/hooks';
import { Items, Job, Schema, TransformationRead } from '@transformations/types';

import { CodeEditorTheme, createLink } from '@cognite/cdf-utilities';
import { IconType } from '@cognite/cogs.js';
import { IDPType } from '@cognite/login-utils';

import { ColorStatus } from './types';

export const isLegacyAuth = (flow: IDPType) => {
  return flow === 'COGNITE_AUTH';
};

export const shouldUseApiKeysAsDestinationCredentials = (
  transformation: TransformationRead
): boolean => {
  return transformation.hasSourceApiKey || transformation.hasDestinationApiKey;
};

export const getContainer = () => {
  return document.body;
};

export const capitalizeEveryWord = (
  text: string = '',
  ignoredWords: string[] = []
) => {
  return text
    .split(' ')
    .map((word) =>
      ignoredWords.includes(word)
        ? word
        : `${word.charAt(0).toUpperCase()}${word.substring(1)}`
    )
    .join(' ');
};

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
};

export const useSleep = (id: string, ms: number) =>
  useQuery(['sleep', id], () => sleep(ms).then(() => ({ ms })), {
    cacheTime: 0,
    staleTime: Infinity,
  });

export const trimFileExtension = (fullName: string): string => {
  return fullName.split('.').slice(0, -1).join('.');
};

export const createInternalLink = (path?: string | number) => {
  const mountPoint = window.location.pathname.split('/')[2];
  return createLink(`/${mountPoint}/${path || ''}`);
};

export const convertToNumber = (
  n: string | number,
  fallbackValue: number = -1
): number => {
  let result: number;
  try {
    if (typeof n === 'number') {
      result = n;
    } else {
      result = parseInt(n);
    }
  } catch {
    result = fallbackValue;
  }

  if (isNaN(result)) {
    result = fallbackValue;
  }

  return result;
};

export const shouldDisableUpdatesOnTransformation = (
  transformation?: TransformationRead
): boolean => {
  return !!transformation?.schedule && !transformation.schedule.isPaused;
};

export const isReleaseBannerOpen = () => {
  return sessionStorage.getItem(RELEASE_BANNER_SESSION_STORAGE_KEY) !== 'true';
};

export const closeReleaseBanner = () => {
  sessionStorage.setItem(RELEASE_BANNER_SESSION_STORAGE_KEY, 'true');
};

export const collectPages = <T>(data?: InfiniteData<Items<T>>) =>
  data
    ? data.pages.reduce((accl, page) => [...accl, ...page.items], [] as T[])
    : ([] as T[]);

export const truncateText = (text: string, limit = 360): string => {
  if (text.length > limit) {
    return `${text.substring(0, limit - 3)}...`;
  }

  return text;
};

export const removeSurroundingBackticks = (text: string = ''): string => {
  let result = text;
  if (result.startsWith('`')) {
    result = result.substring(1);
  }
  if (result.endsWith('`')) {
    result = result.substring(0, result.length - 1);
  }

  return result;
};

export const getSparkColumnType = (
  type?: Schema['type']
): string | undefined => {
  if (typeof type === 'string') {
    return type;
  }

  return type?.type;
};

export const reactBaseTableDataGetter = ({
  column,
  rowData,
}: {
  column: ColumnShape<Record<string, any>>;
  rowData: Record<string, any>;
}) => rowData[column.key];

export const reorder = <T>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] => {
  const copied = [...list];
  const [removed] = copied.splice(startIndex, 1);
  copied.splice(endIndex, 0, removed);

  return copied;
};

export const getQueryPreviewTabTitle = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(date);
};

export const getHumanReadableJobSummary = (
  groupedJobMetrics: JobMetricsGroup[]
): string[] => {
  const summary: { [action: string]: { [resource: string]: number } } = {};
  groupedJobMetrics.forEach(({ action, count, label }) => {
    const resource = label.split('.').pop() ?? label;
    if (!summary[action]) {
      summary[action] = {
        [resource]: count,
      };
    } else if (!summary[action][resource]) {
      summary[action][resource] = count;
    } else {
      summary[action][resource] += count;
    }
  });

  return Object.entries(summary).flatMap(([action, resources]) =>
    Object.entries(resources).map(
      ([resource, count]) =>
        `${new Intl.NumberFormat().format(count)} ${resource} ${action}`
    )
  );
};

export const getSelectedCodeEditorTheme = (): CodeEditorTheme => {
  const theme = localStorage.getItem(CODE_EDITOR_THEME_LOCAL_STORAGE_KEY);
  switch (theme) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    default:
      return DEFAULT_CODE_EDITOR_THEME;
  }
};

export const setSelectedCodeEditorTheme = (theme: CodeEditorTheme): void => {
  localStorage.setItem(CODE_EDITOR_THEME_LOCAL_STORAGE_KEY, theme);
};

export const getIconPropsFromWarningType = (
  type: Warning['type']
): {
  icon: IconType;
  status: ColorStatus;
} => {
  switch (type) {
    case 'column-missing':
      return {
        icon: 'WarningFilled',
        status: 'critical',
      };
    case 'incorrect-type':
      return {
        icon: 'WarningFilled',
        status: 'warning',
      };
    case 'unknown-column':
      return {
        icon: 'InfoFilled',
        status: 'undefined',
      };
  }
};

export const getIconPropsFromJobStatus = (
  status: Job['status']
): {
  icon: IconType;
  status: ColorStatus;
} => {
  switch (status) {
    case 'Failed':
      return {
        icon: 'WarningFilled',
        status: 'critical',
      };
    case 'Completed':
      return {
        icon: 'CheckmarkFilled',
        status: 'success',
      };
    case 'Running':
      return {
        icon: 'Loader',
        status: 'neutral',
      };
    default:
      return {
        icon: 'Remove',
        status: 'undefined',
      };
  }
};

export const getRawTabKey = (database: string, table: string) => {
  return `${database}:${table}`;
};

export enum PrimaryKeyMethod {
  ChooseColumn = 'chooseColumn',
  AutoGenerate = 'autoGenerate',
}
