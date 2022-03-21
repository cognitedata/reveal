import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { Checkbox, SegmentedControl } from '@cognite/cogs.js';
import { useAppState, useDataPanelContext } from 'scarlet/hooks';
import { DataElementState, DataPanelActionType } from 'scarlet/types';

import { DataElementList } from '..';

import { sortedKeys } from './utils';
import * as Styled from './style';

const states = [
  {
    state: undefined,
    label: 'All',
  },
  {
    state: DataElementState.PENDING,
    label: 'Pending',
  },
  {
    state: DataElementState.APPROVED,
    label: 'Approved',
  },
  {
    state: DataElementState.OMITTED,
    label: 'Ignored',
  },
];

export const EquipmentPanel = () => {
  const { equipment } = useAppState();
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();
  const [state, setState] = useState<DataElementState>();
  const [checked, setChecked] = useState(false);
  const [someChecked, setSomeChecked] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const equipmentElements = useMemo(
    () =>
      !state
        ? equipment.data?.equipmentElements
        : equipment.data?.equipmentElements.filter(
            (dataElement) => dataElement.state === state
          ),
    [state, equipment.data?.equipmentElements]
  );

  const selectAll = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        setChecked(true);
        setSomeChecked(false);

        equipmentElements?.forEach((dataElement) => {
          dataPanelDispatch({
            type: DataPanelActionType.TOGGLE_DATA_ELEMENT,
            dataElement,
            checked: true,
          });
        });
      } else {
        setChecked(false);
        setSomeChecked(false);
        dataPanelDispatch({
          type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS,
        });
      }
    },
    [equipmentElements, dataPanelDispatch]
  );

  useEffect(() => {
    dataPanelDispatch({
      type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS,
    });

    if (scrollContainerRef.current?.scrollTop) {
      scrollContainerRef.current?.scrollTo({
        top: 0,
        left: 0,
      });
    }
  }, [state]);

  useEffect(() => {
    const checkedIds = dataPanelState.checkedDataElements.map(
      (item) => item.id
    );
    const someChecked =
      equipmentElements?.some((item) => checkedIds.includes(item.id)) || false;

    const allChecked = equipmentElements?.every((item) =>
      checkedIds.includes(item.id)
    );

    setChecked(someChecked);
    setSomeChecked(someChecked && !allChecked);
  }, [equipmentElements, dataPanelState.checkedDataElements]);

  return (
    <Styled.Container>
      <Styled.Header>
        <h4 className="cogs-title-4">Equipment Level</h4>
        <Styled.StateGroupContainer>
          <SegmentedControl
            fullWidth
            currentKey={state}
            onButtonClicked={(key) =>
              setState(key === 'all' ? undefined : (key as DataElementState))
            }
          >
            {states.map(({ state, label }) => (
              <SegmentedControl.Button key={state || 'all'}>
                {label}
              </SegmentedControl.Button>
            ))}
          </SegmentedControl>
        </Styled.StateGroupContainer>
      </Styled.Header>

      {state && Boolean(equipmentElements?.length) && (
        <Styled.SelectAllContainer>
          <Checkbox
            name="select-all-data-fields"
            indeterminate={someChecked}
            checked={checked}
            onChange={selectAll}
          >
            Select all
          </Checkbox>
        </Styled.SelectAllContainer>
      )}
      <Styled.ContentWrapper>
        <Styled.ScrollContainer ref={scrollContainerRef}>
          <Styled.ListContainer>
            {!equipmentElements?.length && !equipment.loading ? (
              getEmptyMessage(state)
            ) : (
              <DataElementList
                data={equipmentElements}
                loading={equipment.loading}
                skeletonAmount={20}
                sortedKeys={sortedKeys}
              />
            )}
          </Styled.ListContainer>
        </Styled.ScrollContainer>
      </Styled.ContentWrapper>
    </Styled.Container>
  );
};

const getEmptyMessage = (state?: DataElementState) => {
  switch (state) {
    case DataElementState.APPROVED:
      return 'No approved data-fields';
    case DataElementState.OMITTED:
      return 'No ignored data-fields';
    case DataElementState.PENDING:
      return 'No pending data-fields';
  }
  return undefined;
};
