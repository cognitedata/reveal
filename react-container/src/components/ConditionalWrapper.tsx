interface ConditionalWrapperProps {
  condition: boolean;
  wrap: React.FC<React.ReactElement>;
  children: React.ReactElement;
}
export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({
  condition,
  wrap,
  children,
}) => (condition ? wrap(children) : children);
