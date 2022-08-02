import { AvatarButton } from 'components/AvatarButton';
import { ChangeLayerButtons } from 'components/ChangeLayerButtons/ChangeLayerButtons';
import { AbsoluteHeader } from 'components/Header';
import { NavigateToSearchButton } from 'components/SearchBar';
import { PAGES } from 'pages/constants';
import { Link } from 'react-router-dom';

export const DefaultOverlay = () => (
  <>
    <AbsoluteHeader>
      <AbsoluteHeader.Left>
        <NavigateToSearchButton />
      </AbsoluteHeader.Left>
      <Link to={PAGES.PROFILE}>
        <AvatarButton />
      </Link>
    </AbsoluteHeader>
    <ChangeLayerButtons />
  </>
);
