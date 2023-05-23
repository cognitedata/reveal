import {
  useFileBySiteIdQuery,
  useFileIconQuery,
} from '@data-exploration-lib/domain-layer';

export const use360ImageThumbnail = (siteId: string | undefined) => {
  const { data: file } = useFileBySiteIdQuery(siteId);
  return useFileIconQuery(file);
};
