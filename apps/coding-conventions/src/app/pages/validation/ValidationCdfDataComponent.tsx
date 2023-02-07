import { Select } from '@cognite/cogs.js';

import { validate } from './validation';
import { useEffect, useState } from 'react';
import { Asset, DataSet, FileInfo } from '@cognite/sdk';
import { Centered, Container, RightSide, Scrollable } from './styles';
import { System, Resource } from '../../types';

import { useList } from '@cognite/sdk-react-query-hooks';

interface Props {
  system: System;
}

const ValidationCdfDataComponent = (props: Props) => {
  const [matches, setMatches] = useState<string[]>([]);
  const [notMatches, setNotMatches] = useState<string[]>([]);

  const [selectedDataSets, setSelectedDataSets] = useState<
    { value: string; label: string }[]
  >([]);

  const [fieldId, setFieldId] = useState<{ value: string; label: string }>();
  const [shouldShow, setShouldShow] = useState('none');
  const { data: datasets } = useList<DataSet>('datasets', { limit: 100 });

  const options = getAccessorFields(props.system?.resource || 'files');
  const resourceType = props.system?.resource || 'files';

  const filter =
    selectedDataSets && selectedDataSets.length > 0
      ? {
          filter: {
            dataSetIds: selectedDataSets.map((item) => ({ id: item.value })),
          },
          limit: 100,
        }
      : { limit: 100 };

  const { data: dataToValidate } = useList<Asset | FileInfo>(
    resourceType,
    filter
  );

  useEffect(() => {
    if (!dataToValidate || !props.system) return;
    type Field = keyof (Asset | FileInfo);
    const field = fieldId?.value || 'name';

    const data = dataToValidate.reduce((acc: any, item: any) => {
      if (item[field as Field]) {
        return [...acc, item[field as Field] as string];
      }
      return acc;
    }, [] as string[]) as string[];

    if (!data) return;

    const didMatch = validate(props.system, data);
    setMatches(didMatch);
    setNotMatches(data.filter((item) => !didMatch.includes(item)));
  }, [dataToValidate, props.system, fieldId]);

  return (
    <Container>
      <RightSide>
        <div>
          <Select
            label="Select field to validate"
            placeholder="Select field to validate"
            options={options}
            value={fieldId}
            onChange={(e: any) => {
              setFieldId(e);
            }}
          />
          <Select
            label="Select dataset"
            placeholder="Select dataset"
            options={
              datasets
                ? datasets.map((item: DataSet) => ({
                    value: item.id.toString(),
                    label: item.name?.toString() || '',
                  }))
                : []
            }
            isMulti={true}
            value={selectedDataSets}
            width={250}
            onChange={(e: any) => {
              setSelectedDataSets(e);
            }}
          />
        </div>
      </RightSide>
      <Centered>
        <h3
          onClick={() =>
            setShouldShow(shouldShow === 'matches' ? 'none' : 'matches')
          }
          style={{ cursor: 'pointer' }}
        >
          Matched {matches.length}
        </h3>
        <h3
          onClick={() =>
            setShouldShow(shouldShow === 'notMatches' ? 'none' : 'notMatches')
          }
          style={{ cursor: 'pointer' }}
        >
          Did not match {notMatches.length}
        </h3>
      </Centered>
      <Scrollable>
        {shouldShow === 'matches' && matches.length > 0 && (
          <div>
            <h3>Matched</h3>
            <ul>
              {matches.map((item, index) => (
                <li key={item + index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {shouldShow === 'notMatches' && notMatches.length > 0 && (
          <div>
            <h3>Not matches</h3>
            <ul>
              {notMatches.map((item, index) => (
                <li key={item + index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </Scrollable>
    </Container>
  );
};

const getAccessorFields = (resourceGroup: Resource) => {
  switch (resourceGroup) {
    case 'assets':
      return [
        { value: 'name', label: 'Name' },
        { value: 'externalId', label: 'ExternalId' },
      ];
    case 'files':
      return [
        { value: 'name', label: 'Name' },
        { value: 'externalId', label: 'ExternalId' },
      ];
    default:
      return [];
  }
};

export default ValidationCdfDataComponent;
