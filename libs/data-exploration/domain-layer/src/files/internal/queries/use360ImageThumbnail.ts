import { useFileBySiteIdQuery, useFileIconQuery } from '../../service';

export const use360ImageThumbnail = (siteId?: string) => {
  const { data: file } = useFileBySiteIdQuery(siteId);
  return useFileIconQuery(file);
};
