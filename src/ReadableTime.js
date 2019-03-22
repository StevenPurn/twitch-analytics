const SECONDS_IN_MS = 1000;
const MINUTES_IN_MS = 60000;
const HOURS_IN_MS = 3600000;

const getDisplayValue = value => value < 10 ? `0${value}` : value;

const getReadableTime = milliseconds => {
  const seconds = ((milliseconds % MINUTES_IN_MS) / SECONDS_IN_MS).toFixed(0);
  const minutes = ((milliseconds % HOURS_IN_MS) / MINUTES_IN_MS).toFixed(0);
  const hours = (milliseconds / HOURS_IN_MS).toFixed(0);
  let readableMinutes, readableSeconds;
  if (seconds === 60) {
    readableSeconds = '00';
    readableMinutes = minutes + 1;
  } else {
    readableSeconds = getDisplayValue(seconds);
    readableMinutes = getDisplayValue(minutes);
  }
  const readableHours = getDisplayValue(hours);
  return `${readableHours}:${readableMinutes}:${readableSeconds}`
}

export default getReadableTime;