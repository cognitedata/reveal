import React from "react";
import styled from "styled-components/macro";
import { Loader } from "@cognite/cogs.js";

export const Spinner = () => (
  <StyledContainer className="spinner">
    <Loader width={150} darkMode={false} />
  </StyledContainer>
);

const StyledContainer = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);

  .cogs-loader {
    position: absolute;
  }
`;
