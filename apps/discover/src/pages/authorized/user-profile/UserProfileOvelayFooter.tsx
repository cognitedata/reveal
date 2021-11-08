// import { useTranslation } from 'react-i18next';

// import { Graphic } from '@cognite/cogs.js';
// import { fetchGet } from '_helpers/fetch';
// import {
//   UserProfileFooterContainer,
//   VersionWrapper,
// } from 'pages/authorized/user-profile/elements';

export const UserProfileOverlayFooter: React.FC = () => {
  // const { t } = useTranslation('general');

  // try and get version headers:
  // fetchGet(window.location.origin, {
  //   mode: 'no-cors',
  //   headers: {},
  // }).then((result) => {
  //   console.log('result', result);
  // });

  // NOTE: Temporarily disabled. Uncomment everything and remove the line below to enable
  return null;

  // return (
  //   <UserProfileFooterContainer>
  //     <Graphic
  //       type="Cognite"
  //       style={{
  //         width: 32,
  //         height: 19,
  //       }}
  //     />
  //     <VersionWrapper>
  //       <div className="cogs-micro" aria-label="Version">
  //         {t('Version')} {process.env.REACT_APP_VERSION}
  //       </div>
  //     </VersionWrapper>
  //   </UserProfileFooterContainer>
  // );
};
