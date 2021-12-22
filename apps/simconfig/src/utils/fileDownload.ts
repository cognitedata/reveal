export const forceDownloadDialog = async (
  fileName: string,
  fileSrc: string
) => {
  let hasError = false;
  await fetch(fileSrc)
    .then(async (response) => {
      if (!response.ok) {
        throw response;
      }
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    })
    .catch((error) => {
      if (error instanceof Response) {
        hasError = true;
      }
    });
  return hasError;
};
