import { FlexColumn, FlexAlignItems } from 'styles/layout';

import { Separator, Bar, Title, Subtitle, Wrapper } from './elements';

export interface Props {
  isVisible: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const TableBulkActions = ({ isVisible, title, subtitle, children }: Props) => {
  return (
    <Wrapper visible={isVisible} data-testid="table-bulk-actions">
      <Bar visible={isVisible}>
        <FlexColumn>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </FlexColumn>
        <FlexAlignItems>{children}</FlexAlignItems>
      </Bar>
    </Wrapper>
  );
};

TableBulkActions.Separator = Separator;

export default TableBulkActions;
