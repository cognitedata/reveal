import { FileExtensionToSimulator } from 'components/forms/ModelForm/constants';

export const getSelectEntriesFromMap = <T extends Record<string, string>>(
  obj?: T
): { label: string; value: keyof T }[] =>
  Object.entries(obj ?? {}).map(([value, label]) => ({
    label,
    value,
  }));

export function isValidExtension(
  ext: string
): ext is keyof typeof FileExtensionToSimulator {
  return ext in FileExtensionToSimulator;
}

export const getFileExtensionFromFileName = (name: string) => {
  const lastDot = name.lastIndexOf('.');
  return name.substring(lastDot).toLowerCase();
};

// https://stackoverflow.com/a/68404823
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<
          DotNestedKeys<T[K]>
        >}`;
      }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : string;

export const getNodeFromPath = <InputType extends Record<string, unknown>>(
  inputObject: InputType,
  path: DotNestedKeys<InputType>
) =>
  path
    .split('.')
    .reduce<unknown>(
      (obj, key) =>
        obj && typeof obj === 'object' && key in obj
          ? (obj as InputType)[key]
          : '',
      inputObject
    );
