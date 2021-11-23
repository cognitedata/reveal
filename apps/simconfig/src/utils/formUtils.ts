import { FileExtensionToSimulator } from 'components/forms/ModelForm/constants';

export const getSelectEntriesFromMap = <T extends Record<string, string>>(
  obj: T
): { label: string; value: keyof T }[] =>
  Object.entries(obj).map(([value, label]) => ({
    label,
    value,
  }));

export function isValidExtension(
  ext: string
): ext is keyof typeof FileExtensionToSimulator {
  return ext in FileExtensionToSimulator;
}

export const getFileExtensionFromFileName = (name: string) => {
  const lastDot = name?.lastIndexOf('.');
  return name?.substring(lastDot).toLowerCase();
};
