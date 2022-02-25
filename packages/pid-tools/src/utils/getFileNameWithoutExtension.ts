const getFileNameWithoutExtension = (name: string): string =>
  name.substring(0, name.lastIndexOf('.')) || name;

export default getFileNameWithoutExtension;
