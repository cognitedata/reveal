import sdk from 'sdk-singleton';

export const getCalls = async (_: any, { id, scheduleId }: any) => {
  const filter = scheduleId ? { scheduleId } : {};
  return await sdk
    .post(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/list`,
      {
        data: { filter },
      }
    )
    .then(response => response.data);
};
