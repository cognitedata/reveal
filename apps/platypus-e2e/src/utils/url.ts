import { getFDMVersion } from './get-fdm-version';

export const getUrl = (url: string) => {
  return getFDMVersion() === 'V3'
    ? `/platypus/data-models${url}`
    : `/platypus/data-models-previous${url}`;
};
