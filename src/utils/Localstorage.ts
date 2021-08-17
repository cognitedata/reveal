import { initialState } from 'src/modules/Review/imagePreviewSlice';

export const loadState = (): object | undefined => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState) {
      return {
        ...initialState,
        predefinedCollections: JSON.parse(serializedState),
      };
    }
    return { ...initialState };
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    console.error('Localstorage state error', err);
  }
};
