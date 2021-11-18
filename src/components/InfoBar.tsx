import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

const Container = styled(motion.div).attrs({
  initial: { top: 0 },
  animate: { top: 48 },
  exit: { top: 0 },
})`
  height: 2.5rem;
  width: 100%;
  background-color: rgba(74, 103, 251, 0.1);
  position: absolute;
  left: 0;
`;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

export const InfoBar: React.FC<{ visible?: boolean }> = ({
  visible,
  children,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <Container>
          <Wrapper>{children}</Wrapper>
        </Container>
      )}
    </AnimatePresence>
  );
};
