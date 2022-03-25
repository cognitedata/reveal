import styled from 'styled-components';

interface StatusPaneProps {
  color: string;
  message: string;
}

const StatusDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 20px;
  display: inline-block;
`;

const StatusWrapper = styled.div`
  display: inline;
`;

const StatusPane = (props: StatusPaneProps) => {
  return (
    <StatusWrapper>
      <StatusDot style={{ background: props.color }} /> {props.message}
    </StatusWrapper>
  );
};

export default StatusPane;
