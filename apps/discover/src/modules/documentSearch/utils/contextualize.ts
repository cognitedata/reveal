import { CONTEXTUALIZE_URL, SIDECAR } from 'constants/app';
import { DocumentPayloadLabel } from 'modules/api/documents/types';

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
  allLabels: DocumentPayloadLabel[]
): string[] => {
  return allLabels
    .filter((label) =>
      documentLabels
        .map((documentLabel) => documentLabel.externalId)
        .includes(label.id)
    )
    .map((label) => label.name);
};
