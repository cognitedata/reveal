import { EntityFeedbackModalState } from '../types';
import { getDerivedState } from '../utils';

describe('getDerivedState', () => {
  const defaultState: EntityFeedbackModalState = {
    isIncorrectDocType: false,
    correctDocType: '',
    isSensitiveData: false,
    isIncorrectGeo: false,
    isOther: false,
    freeText: '',
  };

  it('should return initial state as expected', () => {
    const { isCorrectDocTypeSelected, isAnyFeedbackTypeExist } =
      getDerivedState(defaultState);

    expect(isCorrectDocTypeSelected).toEqual(false);
    expect(isAnyFeedbackTypeExist).toEqual(false);
  });

  it('should return `isCorrectDocTypeSelected` as `false` when only the incorrect type checkbox is checked', () => {
    const { isCorrectDocTypeSelected } = getDerivedState({
      ...defaultState,
      isIncorrectDocType: true,
    });
    expect(isCorrectDocTypeSelected).toEqual(false);
  });

  it('should return `isCorrectDocTypeSelected` as `true` when correct doc type is selected', () => {
    const { isCorrectDocTypeSelected } = getDerivedState({
      ...defaultState,
      isIncorrectDocType: true,
      correctDocType: 'correct-doc-type',
    });
    expect(isCorrectDocTypeSelected).toEqual(true);
  });

  it('should return `isAnyFeedbackTypeExist` as `true` when checkbox when marked as sensitive data', () => {
    const { isAnyFeedbackTypeExist } = getDerivedState({
      ...defaultState,
      isSensitiveData: true,
    });
    expect(isAnyFeedbackTypeExist).toEqual(true);
  });

  it('should return `isAnyFeedbackTypeExist` as `true` when checkbox when marked as incorrect geo', () => {
    const { isAnyFeedbackTypeExist } = getDerivedState({
      ...defaultState,
      isIncorrectGeo: true,
    });
    expect(isAnyFeedbackTypeExist).toEqual(true);
  });

  it('should return `isAnyFeedbackTypeExist` as `true` when checkbox when marked some other feedback', () => {
    const { isAnyFeedbackTypeExist } = getDerivedState({
      ...defaultState,
      isOther: true,
    });
    expect(isAnyFeedbackTypeExist).toEqual(true);
  });

  it('should return `isAnyFeedbackTypeExist` as `true` when checkbox when additional feedback exists', () => {
    const { isAnyFeedbackTypeExist } = getDerivedState({
      ...defaultState,
      freeText: 'additional-feedback',
    });
    expect(isAnyFeedbackTypeExist).toEqual(true);
  });
});
