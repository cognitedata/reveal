export const forceDownloadDialog = (fileName: string, fileSrc: string) => {
  const link = document.createElement('a');
  link.href = fileSrc;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};
