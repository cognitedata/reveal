import { Buffer } from 'buffer';
import { createHmac } from 'crypto';

export const generateSasToken = (
  resourceUri: string,
  signingKey: string,
  policyName: string,
  expiresInMins: number = 60
) => {
  resourceUri = encodeURIComponent(resourceUri);

  // Set expiration in seconds
  const expires = Math.ceil(Date.now() / 1000 + expiresInMins * 60);
  const toSign = resourceUri + '\n' + expires;

  // Use crypto
  const hmac = createHmac('sha256', Buffer.from(signingKey, 'base64'));
  hmac.update(toSign);
  const base64UriEncoded = encodeURIComponent(hmac.digest('base64'));

  // Construct authorization string
  let token =
    'SharedAccessSignature sr=' +
    resourceUri +
    '&sig=' +
    base64UriEncoded +
    '&se=' +
    expires;
  if (policyName) {
    token += '&skn=' + policyName;
  }
  return token;
};
