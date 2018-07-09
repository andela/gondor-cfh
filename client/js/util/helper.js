/**
 * @description pass the token to header
 *
 *@function authorization
 *
 * @param {void} void
 *
 * @return {void} void
 */
function authorization() {
  return {
    headers: {
      'x-access-token': window.localStorage.token
    }
  };
};
