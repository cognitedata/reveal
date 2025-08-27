export function getUrlRegex(): RegExp {
  // Adapted from https://gist.github.com/kiennt2/c9a489369562c424c793b8883b98802e
  return /(https?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;()]+[-A-Z0-9+&@#/%=~_|()])/gi;
}
