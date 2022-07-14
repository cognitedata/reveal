import { selector } from 'recoil';
import {
  selectedSubTypeAtom,
  newNodeIdAtom,
} from 'recoil/blankPopup/blankPopupAtoms';
import { nameAtom } from 'recoil/popupShared/nameAtom';

const generateExternalId = (name: string) => {
  return name.toLowerCase().split(' ').join('-');
};

export const blankFormState = selector({
  key: 'EditBlankSelector',
  get: ({ get }) => {
    const name = get(nameAtom);
    const subType = get(selectedSubTypeAtom);
    const nodeId = get(newNodeIdAtom);
    return {
      name,
      type: subType.value,
      nodeId,
      externalId: generateExternalId(name),
    };
  },
});
