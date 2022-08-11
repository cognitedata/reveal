import { Icon } from '@cognite/cogs.js';
import { LinkButton } from 'components/LinkButton/LinkButton';
import { PAGES } from 'pages/constants';

import {
  CenteredTitle,
  DivWithMarginBottom,
  EditContainer,
  EditContent,
  FlexColumnSpaceBetween,
  GridPopupHeader,
} from '../elements';

interface Props {
  SubmitButton: React.ComponentType<React.PropsWithChildren<unknown>>;
  title: string;
}

export const EditPopupContent: React.FC<React.PropsWithChildren<Props>> = ({
  SubmitButton,
  title,
  children,
}) => {
  return (
    <EditContainer>
      <EditContent>
        <FlexColumnSpaceBetween>
          <div>
            <GridPopupHeader>
              <LinkButton to={PAGES.HOME} type="ghost">
                <Icon type="ChevronLeft" />
              </LinkButton>
              <CenteredTitle level={5}>Edit {title}</CenteredTitle>
            </GridPopupHeader>
            <DivWithMarginBottom>{children}</DivWithMarginBottom>
          </div>
          <SubmitButton> Save As </SubmitButton>
        </FlexColumnSpaceBetween>
      </EditContent>
    </EditContainer>
  );
};
