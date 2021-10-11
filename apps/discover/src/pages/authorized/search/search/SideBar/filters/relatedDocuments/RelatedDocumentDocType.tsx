import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { useQuerySavedSearchRelatedDocuments } from 'modules/api/savedSearches/useQuery';
import {
  DocumentsFacets,
  DocumentQueryFacet,
} from 'modules/documentSearch/types';
import { DocumentServiceWrapper } from 'pages/authorized/search/search/SideBar/filters/document/DocumentServiceWrapper';

import { ButtonBorderWrapper } from '../../components/elements';
import { RelatedDocumentCheckBoxes } from '../../components/RelatedDocumentCheckboxes';

export const RelatedDocumentDocType: React.FC<{
  doctype: DocumentQueryFacet[];
}> = (props) => {
  const { doctype } = props;
  const { t } = useTranslation();

  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const { data } = useQuerySavedSearchRelatedDocuments();
  const filters = get(data, 'filters.documents.facets') as DocumentsFacets;
  const labels = get(filters, 'labels', []);
  const filtersApplied = labels.length > 0;

  const handleClick = () => {
    setShowDropdown(true);
  };

  return (
    <Dropdown
      content={
        <div>
          {showDropdown && (
            <Menu>
              <DocumentServiceWrapper>
                {({ labels }) => (
                  <RelatedDocumentCheckBoxes
                    categoryData={labels}
                    resultFacets={doctype}
                    docQueryFacetType="labels"
                  />
                )}
              </DocumentServiceWrapper>
            </Menu>
          )}
        </div>
      }
    >
      <ButtonBorderWrapper highlightBorder={filtersApplied}>
        <Button onClick={handleClick} type="secondary">
          {t('Document type')}
        </Button>
      </ButtonBorderWrapper>
    </Dropdown>
  );
};
