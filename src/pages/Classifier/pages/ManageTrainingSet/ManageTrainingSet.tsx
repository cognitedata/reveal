import { Body, Button, Flex } from '@cognite/cogs.js';
import { Header } from 'components/Header';
import { useClassifierConfig } from 'machines/classifier/selectors/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useClassifierManageTrainingSetsQuery } from 'services/query';
import { ClassifierParams } from 'types/params';
import { LabelTable } from './components/Table/LabelTable';

export const ManageTrainingSets: FC = () => {
  const { classifierName, modelName } = useParams<ClassifierParams>();

  const { description } = useClassifierConfig(ClassifierState.MANAGE);
  const { data } = useClassifierManageTrainingSetsQuery();

  return (
    <>
      <Header
        title={modelName || 'No title'}
        subtitle={classifierName}
        description={description}
        Action={
          <Flex alignItems="center" gap={8}>
            <Body level={2}>{data.length} labels</Body>
            <Button icon="PlusCompact">Add label</Button>
          </Flex>
        }
      />

      <LabelTable />
    </>
  );
};
