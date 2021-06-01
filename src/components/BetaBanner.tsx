import { useLocalStorage } from '@cognite/cogs.js';
import Alert from 'antd/lib/alert';
import React from 'react';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';

const BetaBanner = () => {
  const [hideBanner, setHideBanner] = useLocalStorage('beta-banner', false);

  if (!hideBanner) {
    return (
      <Alert
        style={{ marginBottom: '10px' }}
        message={
          <p>
            We’re excited to give you a sneak peek of the latest redesign and
            enhancements to the interactive diagrams before it’s released
            publicly. We encourage all customers to try out the new features and
            <a
              onClick={() => trackUsage(PNID_METRICS.betaBanner.feedback)}
              href="https://hub.cognite.com/contextualization-160/beta-interactive-engineering-diagram-feedback-channel-486?postid=582#post582"
              target="_blank"
              rel="noopener noreferrer"
            >
              {' '}
              give us feedback{' '}
            </a>
            to help us make them better!
          </p>
        }
        type="info"
        closable
        onClose={() => {
          trackUsage(PNID_METRICS.betaBanner.close);
          setHideBanner(true);
        }}
      />
    );
  }
  return <span />;
};

export default BetaBanner;
