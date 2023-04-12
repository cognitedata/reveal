const APPLICATION = 'application';
const TEXT = 'text';
const IMAGE = 'image';

export const mapFileType = (mimeType: string) => {
  if (mimeType.startsWith(APPLICATION) || mimeType.startsWith(TEXT)) {
    const [, ...rest] = mimeType.split('/');
    const fileType = rest.join('');
    switch (fileType) {
      case 'pdf':
        return 'PDF';
      case 'msword':
        return 'Word Document';
      case 'vnd.ms-excel' ||
        'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'Excel Sheet';
      case 'xml':
        return 'XML';
      case 'zip' || '7z' || 'vnd.rar' || 'x-tar':
        return 'Archive';
      case 'plain':
        return 'Text';
      case 'json':
        return 'JSON';
      case 'octet-stream':
        return 'Binary';
      case 'txt':
        return 'Text';
      case 'csv':
        return 'CSV';
      case 'x-cit':
        return 'CIT';
      default:
        return fileType;
    }
  }

  if (mimeType.startsWith(IMAGE)) {
    const [, ...rest] = mimeType.split('/');
    const fileType = rest.join('');
    switch (fileType) {
      case 'dwg':
        return 'DWG';
      case 'x-dfx':
        return 'vnd.dgn';
      case 'svg' || 'svg+xml':
        return 'SVG';
      default:
        return 'Image';
    }
  }
  return mimeType;
};
