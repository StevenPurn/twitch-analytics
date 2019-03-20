import { api, client } from './api_key/api-key';

const fetchTwitch = url => {
  const headers = new Headers({
    'Client-Id': client,
    'Twitch-Api-Token': api,
  });
  const options = {
    headers,
  }
  return fetch(url, options)
  .then(response => response.json());
}

export default fetchTwitch;
