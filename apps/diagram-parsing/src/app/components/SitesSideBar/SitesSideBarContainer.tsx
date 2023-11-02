import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Body, toast } from '@cognite/cogs.js';

import { useDataSets } from '../../hooks';
import { useTranslation } from '../../hooks/useTranslation';

import { SitesSidebar } from './SitesSideBar';

/** Display all the sites (data sets for now) in a project. */
export const SitesSideBarContainer = () => {
  const { t } = useTranslation();

  const { dataSetId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useDataSets();

  const handleDataSetClick = (dataSetID: number) => {
    navigate(`/${dataSetID}`);
  };

  // If there is no data set selected, then select the first possible one
  useEffect(() => {
    if (!dataSetId) {
      const firstDataSetId = data[0]?.id.toString();
      firstDataSetId && navigate(firstDataSetId);
    }
  }, [data, navigate, dataSetId]);

  if (isError) {
    toast.error(
      <>
        <Body size="medium">{t('datasets-error-load')}</Body>
        <Body size="small">{error?.toString()}</Body>
      </>
    );
  }

  return (
    <SitesSidebar
      isLoading={isLoading}
      dataSets={data}
      onDataSetClick={handleDataSetClick}
      selectedDataSetId={dataSetId}
    />
  );
};
