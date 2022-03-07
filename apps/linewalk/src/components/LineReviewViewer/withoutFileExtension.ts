const withoutFileExtension = (filename: string) => {
  const lastIndex = filename.lastIndexOf('.');
  return lastIndex === -1 ? filename : filename.substring(0, lastIndex);
};

export default withoutFileExtension;
