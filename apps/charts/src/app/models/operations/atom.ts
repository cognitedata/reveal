import { fetchOperations } from '@charts-app/services/calculation-backend';
import { atom, AtomEffect, useRecoilValue } from 'recoil';

import { Operation } from '@cognite/calculation-backend';
import sdk from '@cognite/cdf-sdk-singleton';

const initializeOperationsEffect =
  (): AtomEffect<[boolean, Error?, Operation[]?]> =>
  ({ setSelf }) => {
    async function initialize() {
      try {
        const operations = await fetchOperations(sdk);
        setSelf([false, undefined, operations]);
      } catch (err) {
        setSelf([
          false,
          new Error('Could not get available operations'),
          undefined,
        ]);
      }
    }

    initialize();
  };

export const operationsAtom = atom<[boolean, Error?, Operation[]?]>({
  key: 'operationsAtom',
  default: [true, undefined, undefined],
  effects: [initializeOperationsEffect()],
});

export const useOperations = () => {
  return useRecoilValue(operationsAtom);
};
