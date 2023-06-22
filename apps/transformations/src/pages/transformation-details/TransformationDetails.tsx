import { useParams } from 'react-router-dom';

import DMSv2WarningModal from '@transformations/components/dms-v2-warning-modal';
import DMSV3WarningModal from '@transformations/components/dms-v3-warning-modal';
import NoAccessPage from '@transformations/components/error-pages/NoAccess';
import UnknownErrorPage from '@transformations/components/error-pages/UnknownError';
import { useTransformation } from '@transformations/hooks';
import TransformationContextProvider from '@transformations/pages/transformation-details/TransformationContext';
import {
  convertToNumber,
  isDestinationTypeDMSV2,
  isDestinationTypeUnsupportedDMSV3Type,
} from '@transformations/utils';

import { Loader } from '@cognite/cogs.js';

import TransformationDetailsContent from './TransformationDetailsContent';

const TransformationDetailsWrapper = () => {
  const { transformationId = '-1' } = useParams<{
    transformationId: string;
  }>();

  const id = convertToNumber(transformationId);
  const {
    data: transformation,
    isFetched,
    isInitialLoading,
    error,
  } = useTransformation(id);

  if (!isFetched || isInitialLoading) {
    return <Loader />;
  }

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }

    if (error) {
      return <UnknownErrorPage error={error} />;
    }
  }

  if (!transformationId || !transformation) {
    return <>not found</>;
  }

  if (isDestinationTypeDMSV2(transformation?.destination?.type)) {
    return <DMSv2WarningModal transformation={transformation} />;
  }

  if (isDestinationTypeUnsupportedDMSV3Type(transformation?.destination)) {
    return <DMSV3WarningModal />;
  }

  return (
    <TransformationContextProvider
      key={transformation.id}
      transformation={transformation}
    >
      <TransformationDetailsContent transformation={transformation} />
    </TransformationContextProvider>
  );
};

export default TransformationDetailsWrapper;
