import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Body, Colors } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import InteractiveIcon from 'components/InteractiveIcon';
import DiagramReviewStatus from 'components/DiagramReviewStatus';

type FileItemProps = {
  file: FileInfo;
  isSelected: boolean;
  onClick: () => void;
};

export default function FileItem({ file, isSelected, onClick }: FileItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  return (
    <FileItem.Wrapper
      isSelected={isSelected}
      onClick={onClick}
      className={`${file.id}-file-item`}
      ref={itemRef}
    >
      <FileItem.Header>
        <InteractiveIcon />
      </FileItem.Header>
      <FileItem.Title>
        <Body level={2}>{file.name}</Body>
      </FileItem.Title>
      <FileItem.Tag>
        <DiagramReviewStatus fileId={file.id} size="small" />
      </FileItem.Tag>
    </FileItem.Wrapper>
  );
}

const Wrapper = styled.div<{ isSelected: boolean }>`
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  background: ${Colors.white.hex()};
  border-radius: 4px 4px 0px 0px;
  cursor: pointer;
  min-width: 100%;
  max-width: 100%;
  border-radius: 6px;
  border: ${(props) =>
    props.isSelected
      ? `2px solid ${Colors['link-primary-default'].hex()}`
      : `2px solid ${Colors['greyscale-grey4'].hex()}`};
`;
const Header = styled.div`
  width: 100%;
  height: 32px;
  background: ${Colors['greyscale-grey2'].hex()};
  border-radius: 4px 4px 0px 0px;
  img {
    position: relative;
    width: 16px;
    margin: 20px 0 0 8px;
  }
`;
const Title = styled.div`
  padding: 16px 8px 0;
`;
const Tag = styled.div`
  padding: 8px 8px 16px;
`;

FileItem.Wrapper = Wrapper;
FileItem.Header = Header;
FileItem.Title = Title;
FileItem.Tag = Tag;
