import fetchTwitch from '../../fetch-twitch';

const calculateEmoteStats = (emotes, emoteUseCount) => {
  const emoteKeys = Object.keys(emotes);
  for (let i = 0; i < emoteKeys.length; i += 1) {
    const key = emoteKeys[i];
    const count = emotes[key];
    emoteUseCount[key] = emoteUseCount[key] == null
      ? count
      : emoteUseCount[key] + count;
  }
  const newTopTenEmotes = [];
  const keys = Object.keys(emoteUseCount);
  for (let i = 0; i < keys.length; i += 1) {
    const useCount = emoteUseCount[keys[i]];
    newTopTenEmotes.push({ name: keys[i], count: useCount });
  }

  newTopTenEmotes.sort((a, b) => b.count - a.count);
  return {
    topTenEmotes: newTopTenEmotes.slice(0, 10),
    emoteUseCount
  };
}

const calculateMessageStats = (messagesByUser, username) => {
  messagesByUser[username] = messagesByUser[username] == null
    ? 1
    : messagesByUser[username] + 1;
  const newTopTenActiveUsers = [];
  let totalMessages = 0;
  const keys = Object.keys(messagesByUser);
  for (let i = 0; i < keys.length; i += 1) {
    const messages = messagesByUser[keys[i]];
    totalMessages += messages;
    newTopTenActiveUsers.push({name: keys[i], count: messages });
  }

  newTopTenActiveUsers.sort((a, b) => b.count - a.count);
  return {
    topTenActiveUsers: newTopTenActiveUsers.slice(0, 10),
    avgMessagesPerChatter: totalMessages/keys.length,
  };
}

const getNewChatStats = (chat, emotes, message, username) => {
  if (chat.ignoreMessagesFrom.includes(username)){
    return;
  }
  const { messagesByUser, emoteUseCount } = chat;
  let newChat = {};
  if (emotes !== null) {
    const emoteKeys = Object.keys(emotes);
    const emoteNameToCount = {};
    for (let i = 0; i < emoteKeys.length; i += 1) {
      const [ startInd, endInd ] = emotes[emoteKeys[i]][0].split('-');
      const key = message.substring(startInd, parseInt(endInd, 10) + 1);
      emoteNameToCount[key] = emotes[emoteKeys[i]].length;
    }
    newChat = calculateEmoteStats(emoteNameToCount, emoteUseCount);
  }

  newChat = { ...newChat, ...calculateMessageStats(messagesByUser, username) };
  return newChat;
}

const getGameData = (gameId) => {
  const gameUrl = `https://api.twitch.tv/helix/games?id=${gameId}`;
  return fetchTwitch(gameUrl)
  .then(({ data }) => {
    if (data) {
      const name = data[0].name;
      return { gameName: name };
    }
  })
  .catch(err => {
    throw err;
  })
}

const getTotalViewersForGame = (gameId, gameStreams = [], paginationCursor = '') => {
  const page = paginationCursor ? `&after=${paginationCursor}` : '';
  const url = `https://api.twitch.tv/helix/streams?game_id=${gameId}&language=en&first=100${page}`;
  let foundEnd = false;
  return fetchTwitch(url)
  .then(({ data, pagination }) => {
    if (data == null) {
      return data;
    }
    data.forEach((stream) => {
      if (stream.viewer_count < 1) {
        foundEnd = true;
      }
      gameStreams.push(stream);
    });
    if (foundEnd || data.length < 100) {
      return gameStreams;
    } else {
      getTotalViewersForGame(gameId, gameStreams, pagination.cursor);
    }
  })
  .then(streams => {
    if (streams == null) {
      return null;
    }
    let totalViews = 0;
    streams.forEach(({ viewer_count}) => {
      totalViews += viewer_count;
    });
    return totalViews;
  })
  .catch(err => {
    console.log(err);
  });
}

const getStreamDetails = username => {
  const url = `https://api.twitch.tv/helix/streams?user_login=${username}`
  return fetchTwitch(url)
  .then(({ data }) => {
    let streamDetails;
    if (data.length > 0) {
      const streamerData = data[0];
      if (streamerData.type === 'live') {
        streamDetails = {
          user: username,
          game_id: streamerData.game_id,
          viewers: streamerData.viewer_count,
        };
      }
    } else {
      streamDetails = {
        user: '',
        game_id: '',
        viewers: 0,
      };
    }
    return streamDetails;
  })
  .catch(err => {
    console.log(err);
  });
}

export {
  getGameData,
  getNewChatStats,
  getStreamDetails,
  getTotalViewersForGame,
};