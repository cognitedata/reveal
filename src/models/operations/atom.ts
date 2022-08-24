import { atom, AtomEffect, useRecoilValue } from 'recoil';
import { fetchOperations } from 'services/calculation-backend';
import { Operation } from '@cognite/calculation-backend';
import { getSDK } from 'utils/cdf-sdk';

const initializeOperationsEffect =
  (): AtomEffect<[boolean, Error?, Operation[]?]> =>
  ({ setSelf }) => {
    async function initialize() {
      try {
        const operations = await fetchOperations(getSDK());
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
