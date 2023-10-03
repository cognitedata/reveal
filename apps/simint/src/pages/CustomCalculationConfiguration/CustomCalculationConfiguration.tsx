import { useEffect, useState } from 'react';
import { useMatch, useSearch } from 'react-location';
import { useSelector } from 'react-redux';

import { Skeleton } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelCalculationQuery,
  useGetModelCalculationTemplateQuery,
  useGetModelFileQuery,
  useGetSimulatorsListQuery,
} from '@cognite/simconfig-api-sdk/rtk';

import { useUserInfo } from '../../hooks/useUserInfo';
import type { AppLocationGenerics } from '../../routes';
import { selectProject } from '../../store/simconfigApiProperties/selectors';

import { CustomCalculationBuilder } from './CustomCalculationBuilder';

export function CustomCalculationConfiguration() {
  const [calculation, setCalculation] = useState<UserDefined | null>();
  const project = useSelector(selectProject);
  const { data: user } = useUserInfo();
  const userEmail = user ? user.mail : calculation?.userEmail ?? '';
  const {
    params: {
      simulator = 'UNKNOWN',
      modelName,
      calculationType: encodedCalculationType = 'UserDefined',
      userDefined,
    },
  } = useMatch<AppLocationGenerics>();
  const searchFilters: Partial<{
    calculationName: string;
    calculationDescription: string;
  }> = useSearch<AppLocationGenerics>();

  const isNewConfig = userDefined === 'new-calculation';

  const { data: modelFile } = useGetModelFileQuery({
    project,
    modelName,
    simulator,
  });

  const { data: simulatorsList } = useGetSimulatorsListQuery({ project });

  const simulatorConnector = simulatorsList?.simulators?.find(
    (connectorSimulator) => connectorSimulator.simulator === simulator
  );

  const {
    data: configurationTemplate,
    isFetching: isFetchingConfigurationTemplate,
  } = useGetModelCalculationTemplateQuery(
    {
      project,
      modelName,
      calculationType: encodedCalculationType,
      simulator,
      connector: simulatorConnector?.connectorName ?? 'unknown',
    },
    { skip: !simulatorConnector?.connectorName }
  );

  const { data: modelCalculation, isFetching: isFetchingModelCalculation } =
    useGetModelCalculationQuery(
      {
        project,
        modelName,
        calculationType: encodedCalculationType,
        userDefinedType: userDefined,
        simulator,
      },
      {
        refetchOnMountOrArgChange: true,
        skip: isNewConfig,
      }
    );

  useEffect(() => {
    if (modelCalculation?.configuration) {
      setCalculation(modelCalculation.configuration as UserDefined);
    }

    if (
      isNewConfig &&
      !isFetchingConfigurationTemplate &&
      searchFilters.calculationName
    ) {
      const calc = configurationTemplate as UserDefined;
      if (configurationTemplate) {
        setCalculation({
          ...calc,
          calculationName: searchFilters.calculationName,
          userEmail,
          calcTypeUserDefined: searchFilters.calculationName.replace(/ /g, ''),
        });
      }
    }
  }, [
    modelCalculation,
    configurationTemplate,
    isNewConfig,
    isFetchingConfigurationTemplate,
    searchFilters,
    userEmail,
  ]);

  if (
    !calculation ||
    isFetchingModelCalculation ||
    !modelFile ||
    isFetchingConfigurationTemplate
  ) {
    return (
      <>
        <Skeleton.Rectangle height="32px" width="100%" />
        <Skeleton.Rectangle height="80vh" width="100%" />
      </>
    );
  }

  return (
    <CustomCalculationBuilder
      calculation={calculation}
      dataSetId={modelFile.dataSetId}
      modelName={modelName}
      project={project}
      setCalculation={setCalculation}
      simulator={simulator}
    />
  );
}
