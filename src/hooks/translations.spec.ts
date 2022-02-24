import { renderHook } from '@testing-library/react-hooks';
import NonTranslatableComponent from './NonTranslatableComponent.mock';
import ComponentWithTranslationsProp from './ComponentWithTranslationsProp.mock';
import { useTranslations, useComponentTranslations } from './translations';
import FunctionComponentWithoutTranslationsProp from './FunctionComponentWithoutTranslationsProp.mock';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: false }),
}));

describe('useComponentTranslations', () => {
  it('should import component translations correctly when using translation prop', () => {
    const { result } = renderHook(() =>
      useComponentTranslations(ComponentWithTranslationsProp)
    );
    expect(result.current).toStrictEqual({
      t: { Test: 'Test' },
      translationReady: false,
    });
  });
  it('should import component translations correctly when using any other prop', () => {
    const { result } = renderHook(() =>
      useComponentTranslations(FunctionComponentWithoutTranslationsProp)
    );
    expect(result.current).toStrictEqual({
      t: { Test: 'Test' },
      translationReady: false,
    });
  });
  it('should throw an error on non translatable component', () => {
    const { result } = renderHook(() =>
      // @ts-expect-error
      useComponentTranslations(NonTranslatableComponent)
    );
    expect(result.error?.message).toBe(
      'Component has no translationKeys defined in it.'
    );
  });
});

describe('useTranslations', () => {
  it('should load translations correctly', () => {
    const { result } = renderHook(() =>
      useTranslations(ComponentWithTranslationsProp.translationKeys)
    );
    expect(result.current).toStrictEqual({
      t: { Test: 'Test' },
      translationReady: false,
    });
  });
});
