import uploadFilesWithExtensions from './uploadFilesWithExtensions';

const uploadPdfAndSvgFiles = (argv) =>
  uploadFilesWithExtensions(argv, ['.svg', '.pdf']);

export default uploadPdfAndSvgFiles;
