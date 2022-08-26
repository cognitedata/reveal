import queryString from 'query-string';
import { useHistory } from 'react-router-dom';

import { useCellSelection } from 'hooks/table-selection';
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

function useUrlTable(): [
  SpecificTable | undefined,
  (t?: SpecificTable) => void
] {
  const project = getProject();
  const env = getEnv();
  const lsKey = `${project}_${env}_raw_activeTab`;

  const lsTab: SpecificTable | undefined = (() => {
    try {
      const s = localStorage.getItem(lsKey);
      return s ? JSON.parse(s) : undefined;
    } catch {
      return undefined;
    }
  })();
  const setLsTab = (tab: SpecificTable | undefined) => {
    try {
      localStorage.setItem(lsKey, JSON.stringify(tab));
    } catch {}
  };
  const [tab, setTab] = useQueryParam<SpecificTable | undefined>(
    'activeTable',
    lsTab
  );

  return [
    tab,
    (t?: SpecificTable) => {
      setTab(t);
      setLsTab(t);
    },
  ];
}
function useUrlTabList(): [SpecificTable[], (_: SpecificTable[]) => void] {
  const project = getProject();
  const env = getEnv();
  const lsKey = `${project}_${env}_raw_tabList`;

  const lsTabs: SpecificTable[] = (() => {
    try {
      const s = localStorage.getItem(lsKey);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  })();
  const setLsTabs = (tabs: SpecificTable[]) => {
    try {
      localStorage.setItem(lsKey, JSON.stringify(tabs));
    } catch {}
  };

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
  SpecificTable | undefined,
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

export function useCloseTables() {
  const [[activeDb, activeTable] = [], setActive] = useUrlTable();
  const [tabs, setTabs] = useUrlTabList();
  return (tabsToClose: SpecificTable[]) => {
    const filteredTabs = tabs.filter(
      ([testDb, testTable]) =>
        !tabsToClose.some(([db, table]) => db === testDb && table === testTable)
    );
    setTabs(filteredTabs);

    if (
      tabsToClose.some(
        ([db, table]) => activeDb === db && activeTable === table
      )
    ) {
      setActive(filteredTabs?.[0]);
    }
  };
}
