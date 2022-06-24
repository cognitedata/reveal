import {
  Button,
  Detail,
  Flex,
  Icon,
  IconType,
  Label,
  Title,
} from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

import { TextWrapper } from '../elements';

interface Props {
  mainText: string;
  subText: string;
  labels: string[];
  iconType?: IconType;
  disableRoute?: boolean;
  handleEdit: () => void;
}

export const PopupContent: React.FC<Props> = ({
  iconType = 'Cube',
  mainText,
  subText,
  labels,
  disableRoute = false,
  handleEdit,
}) => {
  return (
    <Flex
      direction="column"
      justifyContent="space-around"
      style={{ height: '100%' }}
    >
      <div>
        <Flex justifyContent="space-between" style={{ marginBottom: '5%' }}>
          <div style={{ width: '100%' }}>
            <Icon size={54} type={iconType} />
            <TextWrapper>
              <Title level={3}>{mainText}</Title>
              <Detail>{subText}</Detail>
            </TextWrapper>
          </div>
          <Button icon="Edit" onClick={handleEdit} />
          <Link to="/home">
            <Button type="ghost" icon="Close" style={{ marginLeft: '4px' }} />
          </Link>
        </Flex>
      </div>

      <Flex gap={6}>
        {labels.map((label) => (
          <Label variant="unknown" key={label}>
            {label}
          </Label>
        ))}
      </Flex>
      <Flex justifyContent="flex-end">
        <Button type="primary" disabled={disableRoute}>
          Directions
        </Button>
      </Flex>
    </Flex>
  );
};
