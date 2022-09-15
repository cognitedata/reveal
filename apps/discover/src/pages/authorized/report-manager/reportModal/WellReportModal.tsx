import {
  DATA_SETS_MAP,
  DATA_SET_FEEDBACK_TYPES,
} from 'domain/reportManager/internal/constants';
import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';
import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import { useDispatch } from 'react-redux';

import map from 'lodash/map';

import { wellInspectActions } from 'modules/wellInspect/actions';
import { useWellFeedback } from 'modules/wellInspect/selectors';

import { CreateReportModal, ReportFormValues } from './CreateReportModal';

const dataSetFeedabckTypes = map(DATA_SET_FEEDBACK_TYPES, (label, value) => ({
  value,
  label,
}));

const dataSets = map(DATA_SETS_MAP, (label, value) => ({
  value,
  label,
}));

export const WellReportModal = () => {
  const wellFeedback = useWellFeedback();
  const dispatch = useDispatch();
  const { data: user } = useUserInfoQuery();

  const onCancel = () => {
    dispatch(
      wellInspectActions.setWellFeedback({
        visible: false,
      })
    );
  };

  const onCreateReport = async ({
    description,
    dataSet,
    feedbackType,
  }: ReportFormValues) => {
    reportManagerAPI
      .create([
        {
          description,
          reason: feedbackType.value!,
          externalId: wellFeedback.wellboreMatchingId!,
          status: 'ACTIVE',
          reportType: dataSet.value!,
          startTime: Date.now(),
          ownerUserId: user!.id,
        },
      ])
      .then(() => {
        dispatch(
          wellInspectActions.setWellFeedback({
            visible: false,
          })
        );
      });
  };

  return (
    <CreateReportModal
      sourceTitle="Wellbore"
      sourceValue={wellFeedback.wellboreMatchingId!}
      feedbackTypeOptions={dataSetFeedabckTypes}
      dataSetOptions={dataSets}
      visible={wellFeedback.visible}
      onCancel={onCancel}
      onCreateReport={onCreateReport}
    />
  );
};
