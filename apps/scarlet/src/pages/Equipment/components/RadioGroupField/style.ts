import styled from 'styled-components';

export const Label = styled.label`
  display: block;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 6px;
`;

export const RadioGroupContainer = styled.div`
  display: flex;
  border: 1px solid var(--cogs-border-default);
  border-radius: 5px;
`;

export const RadioContainer = styled.div`
  position: relative;
  height: 46px;
  width: 100%;
  display: flex;
  overflow: hidden;
  padding: 0 12px;

  &:after {
    content: '';
    display: block;
    height: 28px;
    width: 1px;
    background-color: var(--cogs-border-default);
    top: 50%;
    position: absolute;
    transform: translateY(-50%);
    right: 0;
  }

  &:last-child:after {
    display: none;
  }

  .cogs-radio {
    width: 100%;
  }

  .radio-ui {
    flex-shrink: 0;
  }

  .radio-ui + span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;
