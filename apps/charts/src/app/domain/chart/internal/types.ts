export type SessionAPIResponseItem = {
  id: number;
  type: string;
  status:
    | 'READY'
    | 'ACTIVE'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'REVOKED'
    | 'ACCESS_LOST';
  nonce: string;
  clientId: string;
};

export type SessionAPIResponse = {
  items: SessionAPIResponseItem[];
};

export type SessionAPIPayloadCredentials = {
  clientId: string;
  clientSecret: string;
};

export type SessionAPIPayloadTokenExchange = {
  tokenExchange: boolean;
};

export type SessionAPIPayload = {
  items: SessionAPIPayloadCredentials[] | SessionAPIPayloadTokenExchange[];
};
