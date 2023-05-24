
import { useFileIconQuery } from "./useFileIconQuery";
import { use360ImageStationFilesQuery } from "./use360ImageStationFilesQuery";

export const use360ImageThumbnail = (stationId: string | undefined) => {
  const { data: files } = use360ImageStationFilesQuery(stationId);
  const arraybuffer: ArrayBuffer[] = [];
  files?.forEach((file) => {
    const result = useFileIconQuery(file);

    if (result.isSuccess) {
      arraybuffer.push(result.data as ArrayBuffer);
    }
  });

  return arraybuffer;
};
