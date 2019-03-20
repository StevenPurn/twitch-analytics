import React from 'react';
import './GameAnalytics.css';


const GameAnalytics = ({ viewers, totalGameViewers, viewTimes, gameName }) =>  {
  const percentViews = totalGameViewers < 1 
    ? 0 
    : Math.floor((viewers / totalGameViewers) * 100);
  const sum = viewTimes.length > 0
    ? viewTimes.reduce((a, b) => a + b) 
    : 0;
  const avgViewTime = sum / viewTimes.length;
  const seconds = ((avgViewTime % 60000) / 1000).toFixed(0);
  const minutes = seconds === 60 
  ? Math.floor(avgViewTime / 60000) + 1
  : Math.floor(avgViewTime / 60000);
  const readableViewTime = `${minutes}:${(seconds < 10 ? "0" : "") + seconds}`;
  return (
    <div className="Game-analytics-parent">
      <h1>{gameName}</h1>
      <h3>Current Viewer Count</h3>
      <div className='Stat'>{viewers}</div>
      <h3>Percentage of total views for the game</h3>
      <div className='Stat'>{percentViews}%</div>
      <h3>Average view time for users</h3>
      <div className='Stat'>{readableViewTime}</div>
      <div>Note: only includes viewers who arrived after this site has loaded</div>
    </div>
  );
}

export default GameAnalytics;
