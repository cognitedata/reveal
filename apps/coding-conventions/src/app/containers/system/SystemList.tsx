import { useNavigate } from 'react-router-dom';

import { Flex, Icon, Loader } from '@cognite/cogs.js';

import { EmptyCard } from '../../components/Card';
import { useSystemListQuery } from '../../service/hooks/query/useSystemListQuery';

import { SystemItem } from './SystemItem';

interface Props {
  onCreateClick: () => void;
}

export const SystemList: React.FC<Props> = ({ onCreateClick }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useSystemListQuery();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {(data || [])
        .sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))
        .map((item) => (
          <SystemItem
            key={item.id}
            resource={item.resource}
            title={item.title}
            description={item.description}
            structure={item.structure}
            onClick={() => {
              navigate(`/conventions/${item.id}`);
            }}
          />
        ))}

      <EmptyCard onClick={onCreateClick}>
        <Flex
          alignItems="center"
          justifyContent="center"
          style={{ height: '100%' }}
        >
          <Icon type="Plus" size={48} />
        </Flex>
      </EmptyCard>
    </>
  );
};
