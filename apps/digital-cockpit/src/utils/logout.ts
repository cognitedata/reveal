export const logout = async () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = `https://${window.location.host}/`;
};
