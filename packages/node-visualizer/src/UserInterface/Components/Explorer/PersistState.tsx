import React from 'react';
import { ExplorerPropType } from './ExplorerTypes';
import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';
import { ITreeNode } from '../VirtualTree/ITreeNode';

type ExplorerDataAutoSaverProps = {
  props: ExplorerPropType;
  children: any;
};

type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any;
};

type filterKeys = KeyOfType<ITreeNode, string>;

const localStorageKey = '3d-wellnames';
const saveDataToLS = (data: string[]) =>
  saveToLocalStorage(localStorageKey, data);
const getDataFromLS = () => getFromLocalStorage<string[]>(localStorageKey, []);

export const PersistState = ({
  props,
  children,
}: ExplorerDataAutoSaverProps) => {
  const { data, onToggleVisible } = props;
  const [processed, setProcessed] = React.useState(false);
  React.useEffect(() => {
    // we want this hook to run once initially but we could not use an empty dependency array here
    // because the first time this hook is called, the data is empty (even if there is data)
    // so we have to wait for it to be called again, but since we dont want this hook to run on every
    // data update, we use a processed variable which is set to true once we have applied the data
    // from the localStorage
    if (!processed) {
      const wellNames = getDataFromLS();
      if (wellNames) {
        wellNames.forEach((name) => {
          const id = nameToId(name, data);
          if (id) setTimeout(() => onToggleVisible(id), 0);
        });
        setProcessed(true);
      }
    }
  }, [data, processed]);

  const onToggleNode = (uniqueId: string) => {
    const toggledName = idToName(uniqueId, data);
    const selectedWellNames = getDataFromLS();
    let newSelectedWellNames = [];
    if (selectedWellNames && toggledName) {
      if (selectedWellNames.includes(toggledName)) {
        newSelectedWellNames = selectedWellNames.filter(
          (currentName) => currentName !== toggledName
        );
      } else {
        newSelectedWellNames = !selectedWellNames.includes(toggledName)
          ? [...selectedWellNames, toggledName]
          : selectedWellNames;
      }
      saveDataToLS(newSelectedWellNames);
    }

    onToggleVisible(uniqueId);
  };

  return <>{children(onToggleNode)}</>;
};
const translateObject = (findKey: filterKeys, returnKey: filterKeys) => {
  return (match: string, data: ITreeNode[]): string | undefined => {
    const output = data.find((item) => {
      return item[findKey] === match;
    });
    return output ? output[returnKey] : undefined;
  };
};
const nameToId = translateObject('name', 'uniqueId');
const idToName = translateObject('uniqueId', 'name');
