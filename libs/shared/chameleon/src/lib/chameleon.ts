import * as defaultChameleon from '@chamaeleonidae/chmln';

declare let window: any;

const DEFAULT_DISABLE_CHEMELEON_LIST = [
  'localhost',
  `local.cognite.ai`,
  'fusion-preview.preview.cogniteapp.com',
];

export class Chameleon {
  private chameleon: any;
  private disableChameleonList: string[];

  constructor(
    disableChameleonList: string[] | undefined = DEFAULT_DISABLE_CHEMELEON_LIST
  ) {
    this.chameleon = defaultChameleon;
    this.disableChameleonList = disableChameleonList;
  }

  initialize() {
    if (
      !window.chmln &&
      !this.disableChameleonList.includes(window.location.hostname)
    ) {
      this.chameleon.init(
        'SFrreW5Y3aeOAclWK6hBcu9gEf4zGdqTj1M2FjmgMBEsed-1QgFe6-Evu1mKr3ObnXxGDZ',
        { fastUrl: 'https://fast.chameleon.io/' }
      );
    }
  }

  identify(id: string, options: defaultChameleon.ChameleonIdentifyOptions) {
    if (window.chmln) {
      this.chameleon.identify(id, options);
    }
  }

  track(event: string) {
    if (window.chmln) {
      this.chameleon.track(event);
    }
  }
}
