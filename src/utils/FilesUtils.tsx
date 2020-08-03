export const canDeploySelectedFiles = (
  allFiles: any,
  selectedKeys: number[]
) => {
  const selectedPassedJobs = allFiles.filter(
    (job: any) =>
      selectedKeys.includes(job.id) &&
      job.parsingJob &&
      job.parsingJob.jobDone &&
      !job.parsingJob.jobError
  );
  if (
    selectedKeys.length === 0 ||
    selectedPassedJobs.length < selectedKeys.length
  ) {
    return false;
  }
  return true;
};
