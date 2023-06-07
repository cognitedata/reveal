import { useFileBySiteIdQuery, useFileIconQuery } from '../../service';

export const use360ImageThumbnail = (siteId: string | undefined) => {
  const { data: file } = useFileBySiteIdQuery(siteId);
  return useFileIconQuery(file);
};
