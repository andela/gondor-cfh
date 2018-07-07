/**
 * @description pass the token to header
 *
 *@function authorization
 *
 * @param {void} void
 *
 * @return {void} void
 */
const authorization = () => ({
  headers: {
    'x-access-token': window.localStorage.token
  }
});

export default authorization;
