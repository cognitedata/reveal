import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  useNptLegendCodeMutate,
  useNptLegendDetailCodeMutate,
} from 'services/well/legend/npt/useNptLegendMutate';
import {
  useNptLegendCodeQuery,
  useNptLegendDetailCodeQuery,
} from 'services/well/legend/npt/useNptLegendQuery';
import { WellLegendNptType } from 'services/well/legend/types';
import { useNptCodesQuery } from 'services/wellSearch/sdk/useNptCodesQuery';
import { useNptDetailCodesQuery } from 'services/wellSearch/sdk/useNptDetailCodesQuery';

import { CodeDefinitionsMenuItem } from './components/CodeDefinitionsMenuItem';
import { CodeDefinitionsView } from './components/CodeDefinitionsView';
import { Wrapper, LeftPanel, RightPanel } from './elements';
import { mapLegendValuesToCodes } from './utils/mapLegendValuesToCodes';

const NptMenuItems = [
  {
    label: 'NPT Codes',
    key: WellLegendNptType.Code,
  },
  {
    label: 'NPT Subcode',
    key: WellLegendNptType.DetailCode,
  },
];

const URL_QUERY_KEY = 'selected';

export const CodeDefinitions = () => {
  // NPT codes from WDL
  const { data: nptCodes, isLoading: isNptCodesLoading } = useNptCodesQuery();
  const { data: nptDetailCodes, isLoading: isNptDetailCodesLoading } =
    useNptDetailCodesQuery();

  // NPT legend from discover-api
  const { data: nptCodesLegend, isLoading: isNptCodeLegendLoading } =
    useNptLegendCodeQuery();
  const {
    data: nptDetailCodesLegend,
    isLoading: isNptDetailCodesLegendLoading,
  } = useNptLegendDetailCodeQuery();

  // NPT legend mutations
  const { mutateAsync: updateNptLegend } = useNptLegendCodeMutate();
  const { mutateAsync: updateNptDetailsLegend } =
    useNptLegendDetailCodeMutate();

  const [activeItem, setActiveItem] = useState<WellLegendNptType>(
    WellLegendNptType.Code
  );

  const codes = nptCodes
    ? mapLegendValuesToCodes(nptCodes, nptCodesLegend?.items || [])
    : [];

  const detailCodes = nptDetailCodes
    ? mapLegendValuesToCodes(nptDetailCodes, nptDetailCodesLegend?.items || [])
    : [];

  const history = useHistory();
  const { search } = useLocation();

  const setActiveItemUrlQuery = (item: WellLegendNptType) => {
    history.push({
      search: `?${URL_QUERY_KEY}=${encodeURIComponent(item)}`,
    });
  };

  useEffect(() => {
    if (!search) {
      setActiveItemUrlQuery(WellLegendNptType.Code);
    }
  }, []);

  useEffect(() => {
    if (search) {
      const urlParams = new URLSearchParams(search);
      const selected = decodeURIComponent(urlParams.get(URL_QUERY_KEY) || '');
      if (selected) {
        // the typecast is safe here because we get the values from the enum
        setActiveItem(selected as WellLegendNptType);
      }
    }
  }, [search]);

  return (
    <Wrapper>
      <LeftPanel data-testid="left-panel">
        {NptMenuItems.map(({ label, key }) => {
          return (
            <CodeDefinitionsMenuItem
              key={key}
              label={label}
              isActive={key === activeItem}
              onItemClicked={() => setActiveItemUrlQuery(key)}
            />
          );
        })}
      </LeftPanel>

      <RightPanel data-testid="right-panel">
        {activeItem === WellLegendNptType.Code && (
          <CodeDefinitionsView
            title={NptMenuItems[0].label}
            isLoading={isNptCodeLegendLoading || isNptCodesLoading}
            codeDefinitions={codes}
            onLegendUpdated={({ code, definition }) => {
              updateNptLegend({ id: code, body: { legend: definition } });
            }}
          />
        )}

        {activeItem === WellLegendNptType.DetailCode && (
          <CodeDefinitionsView
            title={NptMenuItems[1].label}
            isLoading={isNptDetailCodesLoading || isNptDetailCodesLegendLoading}
            codeDefinitions={detailCodes}
            onLegendUpdated={({ code, definition }) => {
              updateNptDetailsLegend({
                id: code,
                body: { legend: definition },
              });
            }}
          />
        )}
      </RightPanel>
    </Wrapper>
  );
};
