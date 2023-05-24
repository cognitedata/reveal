import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../../components/Modal/Modal';
import { useConventionListQuery } from '../../service/hooks/query/useConventionListQuery';
import { useSystemQuery } from '../../service/hooks/query/useSystemQuery';
import { generateId } from '../../utils/generators';
import { useConventionUpdateMutate } from '../../service/hooks/mutate/useConventionUpdateMutate';
import { TagDefinitions, TagAbbreviation } from '../../types';
import { Table as EditTable } from './DataCleanupComponent';

const columns = [
  {
    Header: 'Abbreviation',
    accessor: 'key',
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
];

export const EditPage = () => {
  const { conventionId, dependsOnId, systemId } = useParams();

  const { data: system } = useSystemQuery();
  const { data: conventions } = useConventionListQuery();
  const { mutate: updateConventions } = useConventionUpdateMutate();

  const navigate = useNavigate();

  const convention = conventions?.find((item) => {
    return item.id === conventionId;
  });

  const conventionDefinitions = convention?.definitions?.filter((item) => {
    return item.dependsOn === dependsOnId && item.type === 'Abbreviation';
  });

  const [definitions, setDefinitions] = React.useState<TagAbbreviation[]>(
    (conventionDefinitions as TagAbbreviation[]) || []
  );

  const saveData = (data: TagAbbreviation[]) => {
    const filteredData = data.filter((item: TagAbbreviation) => {
      return item.key && item.description;
    });

    const newData = filteredData.map((item) => {
      return {
        id: item.id.includes('idRow') ? generateId() : item.id,
        key: item.key,
        description: item.description,
        type: 'Abbreviation',
        dependsOn: dependsOnId,
      };
    });

    if (convention && newData) {
      const oldDefinitions = convention.definitions?.filter((item) => {
        return item.dependsOn !== dependsOnId || item.type !== 'Abbreviation';
      }) as TagDefinitions[];

      convention.definitions = [
        ...(oldDefinitions || []),
        ...(newData as TagDefinitions[]),
      ];
      updateConventions(conventions!);
    }

    navigate(`/conventions/${system?.id}`);
  };

  return (
    <Modal
      title="Edit data"
      visible={!!true}
      modalWidth="80%"
      modalMaxHeight="80%"
      onCancel={() => navigate(`/conventions/${systemId}`)}
      onOk={() => saveData(definitions)}
    >
      <Container>
        <EditTable
          columns={columns}
          dataSource={definitions}
          onDataSourceChange={setDefinitions}
        />
      </Container>
    </Modal>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
`;
