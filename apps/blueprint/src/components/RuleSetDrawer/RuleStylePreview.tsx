import { Rule, RuleOutput } from 'typings';

export const RuleStylePreview = ({ rule }: { rule: Rule<RuleOutput> }) => {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        marginRight: 16,
        background: rule.output?.fill || 'transparent',
        display: 'inline-block',
      }}
    />
  );
};
