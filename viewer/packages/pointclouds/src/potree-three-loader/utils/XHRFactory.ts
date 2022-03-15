/*!
 * Copyright 2022 Cognite AS
 */
const XHRFactory = {
  config: {
    withCredentials: false,
    customHeaders: [{ header: null, value: null }]
  },

  createXMLHttpRequest: function () {
    const xhr = new XMLHttpRequest();

    if (this.config.customHeaders && Array.isArray(this.config.customHeaders) && this.config.customHeaders.length > 0) {
      const baseOpen = xhr.open;
      const customHeaders = this.config.customHeaders;
      xhr.open = function () {
        baseOpen.apply(this, ([] as any).slice.call(arguments));
        customHeaders.forEach(function (customHeader: any) {
          if (!!customHeader.header && !!customHeader.value) {
            xhr.setRequestHeader(customHeader.header, customHeader.value);
          }
        });
      };
    }

    return xhr;
  }
};

export { XHRFactory };
