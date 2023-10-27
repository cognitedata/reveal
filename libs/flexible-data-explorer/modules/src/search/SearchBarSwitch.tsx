import styled, { css } from 'styled-components';

import { useLocation } from '@fdx/shared/hooks/useLocation';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import { useViewModeParams } from '@fdx/shared/hooks/useParams';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button, Tooltip } from '@cognite/cogs.js';

interface Props {
  inverted?: boolean;
}

export const SearchBarSwitch: React.FC<Props> = ({ inverted }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useViewModeParams();
  const location = useLocation();
  const navigate = useNavigation();

  const handle3DViewClick = () => {
    if (location.isHomePage) {
      navigate.toSearchPage(undefined, undefined, {
        viewMode: '3d',
      });
    } else {
      setViewMode('3d');
    }
  };
  const handleListViewClick = () => {
    setViewMode('list');
  };

  return (
    <Container inverted={inverted}>
      <Tooltip content={t('SEARCH_BAR_SWITCH_LIST_VIEW')}>
        <StyledButton
          type={viewMode === 'list' ? 'secondary' : 'ghost'}
          icon="List"
          onClick={handleListViewClick}
          aria-label="List view"
        />
      </Tooltip>

      <Tooltip content={t('SEARCH_BAR_SWITCH_3D_VIEW')}>
        <StyledButton
          type={viewMode === '3d' ? 'secondary' : 'ghost'}
          icon="Cube"
          onClick={handle3DViewClick}
          aria-label="3D view"
        />
      </Tooltip>
    </Container>
  );
};

const StyledButton = styled(Button)`
  &&& {
    border-radius: 10px;
  }
`;

const Container = styled.div<{
  width?: string;
  inverted?: boolean;
}>`
  width: 92px;
  height: 52px;
  && {
    background-color: #ffffff;
  }
  border-radius: 10px;
  padding: 8px;
  gap: 4px;
  display: flex;

  ${(props) => {
    if (props.inverted) {
      return css`
        background-color: #f3f4f8 !important;
        outline: 1px solid rgba(210, 212, 218, 0.56);
      `;
    }

    return css`
      filter: drop-shadow(0px 1px 8px rgba(79, 82, 104, 0.06))
        drop-shadow(0px 1px 1px rgba(79, 82, 104, 0.1));
    `;
  }};
`;
