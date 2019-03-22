import React from 'react';
import getReadableTime from '../../ReadableTime';
import './GameAnalytics.css';


const GameAnalytics = ({ viewers, totalGameViewers, viewTimes, gameName }) =>  {
  const percentViews = totalGameViewers < 1 
    ? 0 
    : ((viewers / totalGameViewers) * 100).toFixed(2);
  const sum = viewTimes.length > 0
    ? viewTimes.reduce((a, b) => a + b) 
    : 0;
  const time = viewTimes.length > 0 ? sum / viewTimes.length : 0;
  const viewTime = time === 0 ? 'Not enough data' : getReadableTime(time);
  return (
    <div className="Game-analytics-parent">
      <h1>{gameName}</h1>
      <h3>Current Viewer Count</h3>
      <div className='Stat'>{viewers}</div>
      <h3>Percentage of total views for the game</h3>
      <div className='Stat'>{percentViews}%</div>
      <h3>Average view time for users</h3>
      <div className='Stat'>{viewTime}</div>
      <div>Note: only includes viewers who arrived after this site has loaded</div>
    </div>
  );
}

export default GameAnalytics;
