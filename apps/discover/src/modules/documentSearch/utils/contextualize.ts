import { DocumentPayload } from '@cognite/discover-api-types';

import { CONTEXTUALIZE_URL, SIDECAR } from 'constants/app';

export const canContextualize = (labels: string[]) => {
  const contextualizeableLabels: string[] = [
    'WELLBORE_SCHEMATIC',
    'Wellbore Schematic',
  ];

  return contextualizeableLabels.some((label) => labels.includes(label));
};

export const getContextualizePath = (rowId: string, project: string) => {
  const baseApi = getBaseApi();

  return `${CONTEXTUALIZE_URL}${project}/explore/file/${rowId}?env=${baseApi}&showSidebar=false`;
};

export const getBaseApi = () =>
  SIDECAR.cdfApiBaseUrl.replace('https://', '').split('.')[0];

export const extractDocumentLabelsFomAllLabels = (
  documentLabels: {
    externalId: string;
  }[],
  allLabels: DocumentPayload[]
): string[] => {
  const documentExternalIds = documentLabels.map(
    (documentLabel) => documentLabel.externalId
  );
  return allLabels
    .filter((label) =>
      label.id ? documentExternalIds.includes(label.id) : false
    )
    .map((label) => label.name);
};
