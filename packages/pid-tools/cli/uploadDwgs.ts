import uploadFilesWithExtensions from './uploadFilesWithExtensions';

const uploadPdfAndSvgFiles = (argv) =>
  uploadFilesWithExtensions(argv, ['.dwg']);

export default uploadPdfAndSvgFiles;
