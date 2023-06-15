import { MatchColorsByGroupIndex } from 'components/pipeline-run-results-table/ExpandedRule';

type HighlightedRegexProps = {
  matchColorsByGroupIndex: MatchColorsByGroupIndex;
  pattern: string;
  text: string;
};

const getMatchGroups = (text: string, pattern: string): string[] => {
  try {
    const regExp = new RegExp(pattern, 'u');
    const matchGroups = text.match(regExp);

    if (matchGroups) {
      return matchGroups.slice(1);
    }
    return [];
  } catch {
    return [];
  }
};

const HighlightedRegex = ({
  matchColorsByGroupIndex,
  pattern,
  text,
}: HighlightedRegexProps): JSX.Element => {
  const matchGroups = getMatchGroups(text, pattern);

  if (matchGroups) {
    return (
      <>
        {matchGroups.map((group, groupIndex) => (
          <span key={group}>
            {matchColorsByGroupIndex[groupIndex] ? (
              <span
                style={{
                  color: matchColorsByGroupIndex[groupIndex],
                  backgroundColor: `${matchColorsByGroupIndex[groupIndex]}11`,
                }}
              >
                {group}
              </span>
            ) : (
              <span>{group}</span>
            )}
            <span>&nbsp;</span>
          </span>
        ))}
      </>
    );
  }

  return <div>HighlightedRegex</div>;
};

export default HighlightedRegex;
