import { Title } from '@cognite/cogs.js';
import { Table as EditTable } from './DataCleanupComponent';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useConventionListQuery } from '../../service/hooks/query/useConventionListQuery';
import { useSystemQuery } from '../../service/hooks/query/useSystemQuery';
import { generateId } from '../../utils/generators';
import { useConventionUpdateMutate } from '../../service/hooks/mutate/useConventionUpdateMutate';
import { TagDefinitions, TagAbbreviation } from '../../types';

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
  const { conventionId } = useParams();

  const { data: system } = useSystemQuery();
  const { data: conventions } = useConventionListQuery();
  const { mutate: updateConventions } = useConventionUpdateMutate();

  const navigate = useNavigate();

  const convention = conventions?.find((item) => {
    return item.id === conventionId;
  });

  const definitions = convention?.definitions;

  const saveData = (data: TagAbbreviation[]) => {
    const filteredData = data.filter((item: TagAbbreviation) => {
      return item.key && item.description;
    });

    const newData = filteredData.map((item: any) => {
      return {
        id: item.id.includes('idRow') ? generateId() : item.id,
        key: item.key,
        description: item.description,
        type: 'Abbreviation',
      };
    });

    if (convention && newData) {
      convention.definitions = newData as TagDefinitions[];
      updateConventions(conventions!);
    }

    navigate(`/conventions/${system?.id}`);
  };
  return (
    <div>
      <Header>
        <Title level={2}>Edit {system?.title}</Title>
      </Header>
      <Container>
        <EditTable
          columns={columns}
          dataSource={definitions || []}
          onSaveDataClick={saveData}
        />
      </Container>
    </div>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
`;

const Header = styled.div`
  border-top: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
  height: 70px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  gap: 8px;
  margin-bottom: 16px;
`;
