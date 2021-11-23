import { createAsyncThunk } from '@reduxjs/toolkit';
import { JobState } from 'src/modules/Process/processSlice';
import { ThunkConfig } from 'src/store/rootReducer';
import { PollJobs } from 'src/store/thunks/Process/PollJobs';

export const ResumeAnnotationJobs = createAsyncThunk<
  void,
  { fileIds: Array<number>; unfinishedJobs: JobState[] },
  ThunkConfig
>('process/resumeAnnotationJobs', async ({ unfinishedJobs }, { dispatch }) => {
  unfinishedJobs.forEach(async (unfinishedJob) => {
    dispatch(PollJobs(unfinishedJob));
  });
});
