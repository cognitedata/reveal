import { Flex, Icon } from '@cognite/cogs.js';
import Typography from 'antd/lib/typography';
import styled from 'styled-components';

const { Text } = Typography;

type TabTitleProps = {
  title: string;
  iconType?: string;
};
const TabTitle = ({ iconType, title }: TabTitleProps): JSX.Element => {
  return (
    <Flex direction="row" alignItems="center" gap={6}>
      <Icon type={iconType}></Icon>
      <StyledTitle>{title}</StyledTitle>
    </Flex>
  );
};

const StyledTitle = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
`;

export default TabTitle;
