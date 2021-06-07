import styled from 'styled-components';

export const Container = styled.div`
  border-top: 1px solid var(--cogs-greyscale-grey4);
`;

export const Header = styled.div`
  padding: 1rem 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .cogs-badge {
    margin-left: auto;
  }
`;

export const ExpandButton = styled.button`
  display: inline-block;
  appearance: none;
  border: none;
  background: none;
  background-color: transparent;
  cursor: pointer;
  justify-self: flex-end;

  &:focus:not(.focus-visible) {
    outline: none;
  }
`;

export const CollapsePanel = styled.div<{
  expanded: boolean;
  objectsCount: number;
}>`
  max-height: ${(props) =>
    props.expanded ? `${props.objectsCount * 46 + 70}px` : 0};
  overflow-y: ${(props) => (props.expanded ? 'scroll' : 'hidden')};
  transition: all 0.3s ease;
  padding-left: 2rem;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none;
  }

  .cogs-input-container {
    margin-bottom: 22px;

    .input-wrapper {
      width: 96%;

      .cogs-input {
        width: 100%;
      }
    }
  }

  .ant-checkbox-group label.ant-checkbox-wrapper {
    display: block;
    margin-bottom: 18px;
  }
`;
