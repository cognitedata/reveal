import mime from 'mime-types';

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);
