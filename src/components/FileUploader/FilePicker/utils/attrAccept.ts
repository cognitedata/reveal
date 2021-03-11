export function attrAccept(
  file: Pick<File, 'name' | 'type'>,
  acceptAttr: string | string[]
) {
  if (file && acceptAttr) {
    const acceptAttrArray = Array.isArray(acceptAttr)
      ? acceptAttr
      : acceptAttr.split(',');
    const fileName = file.name || '';
    const mimeType = (file.type || '').toLowerCase();
    const baseMimeType = mimeType.replace(/\/.*$/, '');

    return acceptAttrArray.some((type) => {
      const validType = type.trim().toLowerCase();
      if (validType.charAt(0) === '.') {
        return fileName.toLowerCase().endsWith(validType);
      }
      if (validType.endsWith('/*')) {
        // This is something like a image/* mime type
        return baseMimeType === validType.replace(/\/.*$/, '');
      }
      return mimeType === validType;
    });
  }
  return true;
}
