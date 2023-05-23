import { SELECTED_IDP_DETAILS_LS_KEY } from '../common';
import { IDPType, IDP_TYPES } from '../types';

type SelectedIdpDetails = {
  internalId: string;
  type: IDPType;
  idpId?: string;
};

export const getSelectedIdpDetails = (): SelectedIdpDetails | undefined => {
  try {
    const selectedIdpDetails =
      localStorage.getItem(SELECTED_IDP_DETAILS_LS_KEY) ?? '';
    console.log(selectedIdpDetails);
    const parsed = JSON.parse(selectedIdpDetails);
    if (typeof parsed?.internalId !== 'string') {
      throw new Error('Idp internalId is invalid');
    }
    if (!IDP_TYPES.includes(parsed?.type)) {
      throw new Error('Idp type is invalid');
    }

    return parsed as SelectedIdpDetails;
  } catch {
    return undefined;
  }
};

export const saveSelectedIdpDetails = (
  idpDetails: SelectedIdpDetails
): boolean => {
  try {
    const stringified = JSON.stringify(idpDetails);
    localStorage.setItem(SELECTED_IDP_DETAILS_LS_KEY, stringified);
    return true;
  } catch {
    return false;
  }
};

export const removeSelectedIdpDetails = (): void => {
  localStorage.removeItem(SELECTED_IDP_DETAILS_LS_KEY);
};
