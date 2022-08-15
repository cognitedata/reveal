import { AvatarButton } from 'components/AvatarButton';
import { ChangeLayerButtons } from 'components/ChangeLayerButtons/ChangeLayerButtons';
import { AbsoluteHeader } from 'components/Header';
import { SearchBarAndList } from 'components/SearchBarAndList/SearchBarAndList';
import { PAGES } from 'pages/constants';
import { Link } from 'react-router-dom';

export const DefaultOverlay = () => (
  <>
    <AbsoluteHeader>
      <AbsoluteHeader.Left>
        <SearchBarAndList placeholder="What are you looking for?" />
      </AbsoluteHeader.Left>
      <Link to={PAGES.PROFILE}>
        <AvatarButton />
      </Link>
    </AbsoluteHeader>
    <ChangeLayerButtons />
  </>
);
