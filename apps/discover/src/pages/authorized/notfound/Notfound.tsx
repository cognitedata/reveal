import { FC } from 'react';

import PrettyPollyIcon from 'images/DiscoverLogo.svg';
import styled from 'styled-components/macro';

import { useTranslation } from 'hooks/useTranslation';

const Wrapper = styled.div`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Box = styled.div`
  width: 491px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 25px;
  padding-bottom: 54px;
  padding-left: 60px;
  padding-right: 60px;
  text-align: center;
  border-radius: 15px;
`;

export const MESSAGE = 'Page not found!';

export const NotFoundPage: FC = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <Box>
        <div style={{ alignContent: 'center' }}>
          <div style={{ textAlign: 'center', height: '55px' }}>
            <span style={{ fontSize: '65px', fontWeight: 'bold' }}>4</span>
            <img
              src={PrettyPollyIcon}
              style={{ marginTop: '5px' }}
              alt="Parrot icon which simulates zero"
            />
            <span style={{ fontSize: '65px', fontWeight: 'bold' }}>4</span>
          </div>
        </div>
        <span style={{ lineHeight: '70px', fontSize: '20px' }}>
          {t(MESSAGE)}
        </span>
      </Box>
    </Wrapper>
  );
};
