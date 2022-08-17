import { useEffect, useState } from 'react';
import { useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Button, Skeleton, toast } from '@cognite/cogs.js';
import type {
  CalculationTemplate,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelCalculationQuery,
  useGetModelFileQuery,
  useUpsertCalculationMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

import { CustomCalculationBuilder } from './CustomCalculationBuilder';

import type { AppLocationGenerics } from 'routes';

export function CustomCalculationConfiguration() {
  const [calculation, setCalculation] = useState<CalculationTemplate>(
    {} as CalculationTemplate
  );
  const project = useSelector(selectProject);
  const navigate = useNavigate();
  const {
    params: {
      simulator = 'UNKNOWN',
      modelName,
      calculationType: encodedCalculationType = 'IPR',
      userDefined,
    },
  } = useMatch<AppLocationGenerics>();

  const isNewConfig = userDefined === 'new-calculation';

  const { data: modelFile } = useGetModelFileQuery({
    project,
    modelName,
    simulator,
  });

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
      }
    );

  useEffect(() => {
    if (modelCalculation?.configuration) {
      setCalculation(modelCalculation.configuration);
    }
  }, [modelCalculation]);

  const [upsertCalculation] = useUpsertCalculationMutation();

  const handleCalculationUpdate = async () => {
    await upsertCalculation({
      project,
      dataSetId: modelFile?.dataSetId,
      calculationTemplateModel: calculation,
    })
      .unwrap()
      .then((_payload) => {
        toast.success('The calculation was successfully configured.', {
          autoClose: 5000,
        });

        navigate({
          to: `/model-library/models/${simulator}/${modelName}/calculations`,
        });
      })
      .catch((error) =>
        toast.error(
          `An error occured while storing the calculation configuration. Error: ${error}`
        )
      );
  };

  return (
    <CustomCalculationConfigurationContainer>
      {!isFetchingModelCalculation ? (
        <>
          <CustomCalculationConfigurationHeader>
            <h2>
              <span>
                {isNewConfig ? 'User defined' : calculation.calculationName}
              </span>{' '}
              Configuration for {modelFile?.metadata.modelName}
            </h2>
            <OptionsGroupContainer>
              <Button
                icon="Save"
                iconPlacement="right"
                type="primary"
                onClick={() => {
                  void handleCalculationUpdate();
                }}
              >
                {isNewConfig ? 'Save' : 'Update'}
              </Button>
            </OptionsGroupContainer>
          </CustomCalculationConfigurationHeader>

          <CustomCalculationBuilder
            calculation={calculation as UserDefined}
            setCalculation={setCalculation}
          />
        </>
      ) : (
        <>
          <Skeleton.Rectangle height="32px" width="100%" />
          <Skeleton.Rectangle height="80vh" width="100%" />
        </>
      )}
    </CustomCalculationConfigurationContainer>
  );
}

const CustomCalculationConfigurationContainer = styled.div`
  margin: 0 1em 1em 1em;
  section {
    margin-top: 1em;
    margin-bottom: 1em;
  }
`;

const CustomCalculationConfigurationHeader = styled.div`
  background: rgba(255, 255, 255, 0.9);
  position: fixed;
  width: calc(100% - 3rem);
  backdrop-filter: blur(5px);
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;

  h2 {
    font-size: 1.5em;
    font-weight: normal;
    span {
      font-weight: 700;
    }
  }
`;

const OptionsGroupContainer = styled.div`
  display: flex;
  flex-direction: row;
  grid-gap: 16px;
`;
