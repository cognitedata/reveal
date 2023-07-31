import * as React from 'react';

import { Title } from '@cognite/cogs.js';
import { ErrorPage } from '@cognite/react-errors';

import { Loading } from 'components/Loading';

import {
  GeneralItem,
  useFetchMapConfigGeneral,
} from '../hooks/useMapConfigGeneralQueries';
import { MODEL_ID_GENERAL, SPACE_ID } from '../service/constants';
import { SCHEMA_GENERAL } from '../service/createMapConfigModels';

import { Wrapper } from './elements';
import { BooleanField } from './fieldTypes/BooleanField';
import { InputField } from './fieldTypes/InputField';
import { NumberField } from './fieldTypes/NumberField';
import { UnknownField } from './fieldTypes/UnknownField';
import { Node, useNodeUpdate } from './useNodeUpdate';

const MAP_CONFIG_NODE_EXTERNAL_ID_GENERAL = 'mapConfigGeneral';

const config = [
  {
    title: 'General',
    id: [SPACE_ID, MODEL_ID_GENERAL] as const,
    fields: SCHEMA_GENERAL,
    externalId: MAP_CONFIG_NODE_EXTERNAL_ID_GENERAL,
  },
];

export const applyDefaultsGeneral = (
  data: Partial<GeneralItem>
): GeneralItem => {
  return {
    zoom: 4,
    center: '[12, 60]',
    minimap: true,
    cluster: false,
    externalId: MAP_CONFIG_NODE_EXTERNAL_ID_GENERAL,
    ...data,
  };
};

/**
 * NOTE: there is one bug here
 *
 * that is that existing will be out of date after a change is made
 * so if you change two fields, the second will use old data
 * this is because each save needs to update the whole object
 * not just the key you are changing.
 *
 * this will be solved when we use react-query though, as it will keep it fresh.
 *
 */
export const MapConfigEdit: React.FC = () => {
  const [existing, setExisting] = React.useState<Node>();
  const [error, _setError] = React.useState(false);
  const handleUpdateField = useNodeUpdate(existing);
  const getConfigGeneral = useFetchMapConfigGeneral();

  /**
   * this is setup just for one model at the moment
   * but we can easily modify it to process all models
   * thus add more pages to our config
   */
  const getExistingData = async () => {
    const result = await getConfigGeneral();
    if ('error' in result) {
      console.error('Cannot find existing value', { error: result });
    } else {
      const found = result.listgeneral.items.find(
        (item) => item.externalId === MAP_CONFIG_NODE_EXTERNAL_ID_GENERAL
      );
      if (found) {
        setExisting(applyDefaultsGeneral(found));
      } else {
        console.error(
          `Cannot find ${MAP_CONFIG_NODE_EXTERNAL_ID_GENERAL} in results`,
          {
            result,
          }
        );
        setExisting(applyDefaultsGeneral({}));
      }
    }
  };

  React.useEffect(() => {
    getExistingData();
  }, []);

  if (error) {
    return <ErrorPage />;
  }

  if (!existing) {
    return <Loading />;
  }

  return (
    <Wrapper>
      {config.map((category) => {
        return (
          <div key={category.title}>
            <Title>{category.title}</Title>
            {Object.entries(category.fields.properties).map(([key, field]) => {
              if (field.type === 'text') {
                return (
                  <InputField
                    key={key}
                    id={key}
                    initialValue={existing[key] as string}
                    categoryId={category.id}
                    onUpdate={handleUpdateField}
                  />
                );
              }

              if (field.type === 'int') {
                return (
                  <NumberField
                    key={key}
                    id={key}
                    initialValue={existing[key] as number}
                    categoryId={category.id}
                    onUpdate={handleUpdateField}
                  />
                );
              }

              if (field.type === 'boolean') {
                return (
                  <BooleanField
                    key={key}
                    id={key}
                    initialValue={existing[key] as boolean}
                    categoryId={category.id}
                    onUpdate={handleUpdateField}
                  />
                );
              }

              return <UnknownField key={key} id={key} type={field.type} />;
            })}
          </div>
        );
      })}
    </Wrapper>
  );
};
