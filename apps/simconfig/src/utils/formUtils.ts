import { FileExtensionToSimulator } from 'components/forms/ModelForm/constants';

export const getSelectEntriesFromMap = (obj: { [key: string]: string }) =>
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
  return name?.substring(lastDot);
};
