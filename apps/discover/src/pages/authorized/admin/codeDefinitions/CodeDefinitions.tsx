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

import { CodeDefinitionsMenuItem } from './components/CodeDefinitionsMenuItem';
import { CodeDefinitionsView } from './components/CodeDefinitionsView';
import { Wrapper, LeftPanel, RightPanel } from './elements';

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
  const { data: nptCodes } = useNptLegendCodeQuery();
  const { data: nptDetailCodes } = useNptLegendDetailCodeQuery();
  const [activeItem, setActiveItem] = useState<WellLegendNptType>(
    WellLegendNptType.Code
  );

  const { mutateAsync: updateNptLegend } = useNptLegendCodeMutate();
  const { mutateAsync: updateNptDetailsLegend } =
    useNptLegendDetailCodeMutate();

  const codes = nptCodes
    ? nptCodes?.items.map((item) => ({
        code: item.id,
        definition: item.legend,
      }))
    : undefined;

  const detailCodes = nptDetailCodes
    ? nptDetailCodes.items.map((item) => ({
        code: item.id,
        definition: item.legend,
      }))
    : undefined;

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
      <LeftPanel>
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

      <RightPanel>
        {activeItem === WellLegendNptType.Code && (
          <CodeDefinitionsView
            title={NptMenuItems[0].label}
            codeDefinitions={codes}
            onLegendUpdated={({ code, definition }) => {
              updateNptLegend({ id: code, body: { legend: definition } });
            }}
          />
        )}

        {activeItem === WellLegendNptType.DetailCode && (
          <CodeDefinitionsView
            title={NptMenuItems[1].label}
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
