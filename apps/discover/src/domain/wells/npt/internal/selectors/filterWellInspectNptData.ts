import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';

import { InspectTabsState } from 'modules/inspectTabs/types';
import { NptView } from 'pages/authorized/search/well/inspect/modules/nptEvents/types';

import { NptInternal } from '../types';

const filterByName = (npt: NptView, searchPhrase: string) =>
  isEmpty(searchPhrase) ||
  includes(npt.wellName, searchPhrase) ||
  includes(npt.wellboreName, searchPhrase);

const filterByDuration = (npt: NptInternal, duration: number[]) => {
  if (!duration) return false;

  const eventNPTDuration = npt?.duration || 0;
  const [min, max] = duration;

  return eventNPTDuration >= min && eventNPTDuration <= max;
};

const filterByNptCode = (npt: NptInternal, nptCodes: string[]) =>
  isEmpty(nptCodes) || includes(nptCodes, npt.nptCode);

const filterByNptDetailCode = (npt: NptInternal, nptDetailCodes: string[]) =>
  isEmpty(nptDetailCodes) || includes(nptDetailCodes, npt.nptCodeDetail);

export const filterWellInspectNptData = (
  nptData: NptView[],
  nptFilters: InspectTabsState['npt']
) => {
  const { searchPhrase, duration, nptCode, nptDetailCode } = nptFilters;

  return nptData.filter((npt) => {
    return (
      filterByName(npt, searchPhrase) &&
      filterByDuration(npt, duration) &&
      filterByNptCode(npt, nptCode) &&
      filterByNptDetailCode(npt, nptDetailCode)
    );
  });
};
