# Twitch Analytics

This is a single page app which allows users to monitor real time data analytics of any user's Twitch stream. It has some trouble getting the total number of viewers for games with a lot of people currently streaming such as Fortnite or Hearthstone. This is due to the fact that Twitch does not have a public API (that I am aware of) which provides the total number of viewers watching a given game. So, in order to find the percentage viewership attributed to the individual streamer you are monitoring, I have to hit every stream for the game and track a running total.

## Table of Contents

1. [Usage](#usage)
1. [Requirements](#requirements)
1. [Development](#development)

## Usage

From within the root directory:
```sh
npm start
```

## Requirements

- Node
- React Router

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
```