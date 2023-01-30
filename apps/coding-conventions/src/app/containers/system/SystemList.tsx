import { useNavigate } from 'react-router-dom';
import { dummyConventions } from '../../service/conventions';
import { SystemItem } from './SystemItem';

interface Props {
  toggleVisibility: () => void;
}

export const SystemList: React.FC<Props> = ({ toggleVisibility }) => {
  const navigate = useNavigate();

  return (
    <>
      {dummyConventions.map((item) => (
        <SystemItem
          key={item.id}
          // icon={item.icon as IconType}
          title={item.title}
          subtitle={item.subtitle}
          structure={item.structure}
          onClick={() => {
            if (item.structure) {
              navigate(`/conventions/${item.id}`);
            } else {
              toggleVisibility();
            }
          }}
        />
      ))}
    </>
  );
};
