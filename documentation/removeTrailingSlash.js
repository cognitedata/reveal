if (window.location.href.endsWith('/')) {
  window.history.pushState({}, '', window.location.href.replace(/\/$/, ''));
}