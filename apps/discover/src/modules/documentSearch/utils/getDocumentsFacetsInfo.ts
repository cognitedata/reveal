import {
  DocumentFilterCategoryTitles,
  DocumentQueryFacet,
  DocumentResultFacets,
  Labels,
} from 'modules/documentSearch/types';
import { BreadCrumbContent } from 'pages/authorized/search/common/searchResult/types';

const transformFacets = (facet: DocumentQueryFacet[], labels?: Labels) => {
  const format = (name: string) => (labels ? labels[name] || name : name);

  return facet.map(({ name, count }) => ({
    name: format(name),
    count,
  }));
};

export const getDocumentsFacetsInfo = (
  facets: DocumentResultFacets,
  labels: Labels
): BreadCrumbContent[] => {
  const documentInformation: BreadCrumbContent[] = [
    {
      name: DocumentFilterCategoryTitles.filetype,
      content: transformFacets(facets.filetype),
    },
    {
      name: DocumentFilterCategoryTitles.labels,
      content: transformFacets(facets.labels, labels),
    },
    {
      name: DocumentFilterCategoryTitles.location,
      content: transformFacets(facets.location, labels),
    },
  ];
  return documentInformation;
};
