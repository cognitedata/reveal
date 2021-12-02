import queryString from 'query-string';
import { useHistory } from 'react-router-dom';

import { useCellSelection } from 'hooks/table-selection';
import useLocalStorage from './useLocalStorage';
import { getEnv, getProject } from '@cognite/cdf-utilities';

const opts: { arrayFormat: 'comma' } = { arrayFormat: 'comma' };
const getSetItems =
  <T>(key: string, push: boolean, history: ReturnType<typeof useHistory>) =>
  (newItems: T) => {
    const search = queryString.parse(history?.location?.search, opts);
    history[push ? 'push' : 'replace']({
      pathname: history?.location?.pathname,
      search: queryString.stringify(
        {
          ...search,
          [key]: JSON.stringify(newItems),
        },
        opts
      ),
    });
  };

function useQueryParam<T>(
  key: string,
  defaultValue: T,
  push = false
): [T | undefined, (_: T | undefined) => void] {
  const history = useHistory();

  const search = queryString.parse(history?.location?.search, opts);
  const item = (() => {
    try {
      const itemStr = (search[key] || '') as string;
      return itemStr
        ? (JSON.parse(decodeURIComponent(itemStr)) as T)
        : defaultValue;
    } catch {
      return defaultValue;
    }
  })();

  return [item, getSetItems<T | undefined>(key, push, history)];
}

export type SpecificTable = [database: string, table: string, view?: string];
type SpecificTableState = SpecificTable | undefined;

function useUrlTable(): [SpecificTableState, (t: SpecificTableState) => void] {
  const project = getProject();
  const env = getEnv();
  const [lsTab, setLsTab] = useLocalStorage<SpecificTableState>(
    `${project}_${env}_raw_activeTab`,
    undefined
  );
  const [tab, setTab] = useQueryParam<SpecificTableState>('activeTable', lsTab);

  return [
    tab,
    (t: SpecificTableState) => {
      setTab(t);
      setLsTab(t);
    },
  ];
}
function useUrlTabList(): [SpecificTable[], (_: SpecificTable[]) => void] {
  const project = getProject();
  const env = getEnv();
  const [lsTabs, setLsTabs] = useLocalStorage<SpecificTable[]>(
    `${project}_${env}_raw_tabList`,
    []
  );
  const [tabs = [], setTabs] = useQueryParam<SpecificTable[]>('tabs', lsTabs);

  return [
    tabs,
    (tabs: SpecificTable[]) => {
      setTabs(tabs);
      setLsTabs(tabs);
    },
  ];
}

export function useTableTabList() {
  return useUrlTabList()[0];
}

export function useActiveTable(): [
  SpecificTableState,
  (_: SpecificTable) => void
] {
  const [active, setActive] = useUrlTable();
  const [tabs, setTabs] = useUrlTabList();
  const { deselectCell } = useCellSelection();
  return [
    active,
    ([newDb, newTable, newView]: SpecificTable) => {
      let view = newView;
      deselectCell();
      if (!tabs) {
        setTabs([[newDb, newTable, view]]);
      } else {
        const tabIndex = tabs.findIndex(
          ([tabDb, tabTable]) => tabDb === newDb && newTable === tabTable
        );

        if (tabIndex >= 0) {
          if (!view) {
            view = tabs[tabIndex][2];
          }
          tabs[tabIndex] = [newDb, newTable, view];
          setTabs(tabs);
        } else {
          setTabs([...tabs, [newDb, newTable, newView]]);
        }
      }
      setActive([newDb, newTable, view]);
    },
  ];
}

export function useCloseDatabase() {
  const [[activeDb] = [], setActive] = useUrlTable();
  const [tabs, setTabs] = useUrlTabList();
  return ([closeDb]: [database: string]) => {
    if (tabs) {
      const firstIndex = tabs.findIndex(([db]) => db === closeDb);
      if (firstIndex) {
        const filteredTabs = tabs.filter(([db]) => db !== closeDb);
        setTabs(filteredTabs);
        if (activeDb === closeDb) {
          if (filteredTabs.length > 0) {
            setActive(filteredTabs[Math.max(0, firstIndex - 1)]);
          } else {
            setActive(undefined);
          }
        }
      }
    }
  };
}

export function useCloseTable() {
  const [[activeDb, activeTable] = [], setActive] = useUrlTable();
  const [tabs, setTabs] = useUrlTabList();
  return ([closeDb, closeTable]: SpecificTable) => {
    let closeIndex = tabs
      ? tabs.findIndex(([db, table]) => db === closeDb && table === closeTable)
      : -1;
    if (tabs && closeIndex > -1) {
      const newTabs = [
        ...tabs.slice(0, closeIndex),
        ...tabs.slice(closeIndex + 1),
      ];
      setTabs(newTabs);

      if (activeDb === closeDb && activeTable === closeTable) {
        if (newTabs.length > 0) {
          setActive(newTabs[Math.max(0, closeIndex - 1)]);
        } else {
          setActive(undefined);
        }
      }
    }
  };
}
