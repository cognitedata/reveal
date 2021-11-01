import React from 'react';
import styled from 'styled-components';
import Text from 'src/modules/Common/Components/Skeleton/layouts/Text';

export const GradientAnimateGridCell = () => (
  <PreviewCell>
    <div className="preview">
      <ImageBox />
      <div className="footer">
        <div className="name">
          <Text />
        </div>
        <div className="badge">
          <Text />
          <Text />
          <Text />
        </div>
      </div>
    </div>
  </PreviewCell>
);

const ImageBox = styled.div`
  height: 100%;
  width: 100%;
  object-fit: cover;
  background: #e8e8e8;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: auto;
`;

const PreviewCell = styled.div`
  height: 400px;
  width: 306px;
  margin-top: 30px;
  padding-left: 20px;
  .preview {
    height: 90%;
    width: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 5px;

    .footer {
      width: 100%;
      display: grid;
      padding: 12px;
      grid-template-rows: auto;
      .name {
        white-space: nowrap;
        overflow: hidden;
        width: 100%;
        font-size: 20px;
      }
      .badge {
        display: grid;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 50px 50px 50px;
        font-size: 20px;
      }
    }
  }
`;
