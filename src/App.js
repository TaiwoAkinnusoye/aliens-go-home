import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Canvas from './components/Canvas';
import {getCanvasPosition} from './utils/formulas';
import * as Auth0 from 'auth0-web';
import io from 'socket.io-client';

Auth0.configure({
  scope: 'openid profile mange:points',
  responseType: 'token id_token',
  domain: 'taiwoakinnusoye.eu.auth0.com',
  clientID: 'MnJ3H9VwMKPtg5tV5oZetXHdYZaVe86T',
  redirectUri: 'http://localhost:3000/',
  audience: 'https://aliens-go-home.digituz.com.br',
})

class App extends Component {

  constructor(props) {
    super();
    this.socket = null;
    this.currentPlayer = null;
  }

  componentDidMount() {
    const self = this;

    Auth0.handleAuthCallback();
    Auth0.subscribe((auth) => {
      if (!auth) return;

      self.playerProfile = Auth0.getProfile();
      self.currentPlayer = {
        id: self.playerProfile.sub,
        maxScore: 0,
        name: self.playerProfile.name,
        picture: self.playerProfile.picture,
      };

      this.props.loggedIn(self.currentPlayer);

      self.socket = io('http://localhost:3001', {
        query: `token=${Auth0.getAccessToken()}`,
      });

      self.socket.on('players', (players) => {
        this.props.leaderboardLoaded(players);

        players.forEach((player) => {
          if (player.id === self.currentPlayer.id) {
            self.currentPlayer.maxScore = player.maxScore;
          }
        });
      });
    });

    setInterval(() => {
      self.props.moveObjects(self.canvasMousePosition)
    }, 10);

    window.onresize = () => {
      const cnv = document.getElementById('aliens-go-home-canvas');
      cnv.style.width  = `${window.innerWidth}px`;
      cnv.style.height = `${window.innerHeight}px`;
    }
    window.onresize();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.gameState.started && this.props.gameState.started) {
      if (this.currentPlayer.maxScore < this.props.gameState.kills) {
        this.socket.emit('new-max-score', {
          ...this.currentPlayer,
          maxScore: this.props.gameState.kills
        });
      }
    }
  }

  trackMouse(event) {
    this.canvasMousePosition = getCanvasPosition(event)
  }

  shoot = () => {
    this.props.shoot(this.canvasMousePosition)
  }

  render() {
    return (
      <div className="App">
        <Canvas angle={this.props.angle} trackMouse={event => this.trackMouse(event)} gameState={this.props.gameState} startGame={this.props.startGame} currentPlayer={this.props.currentPlayer} players={this.props.players} shoot={this.shoot} />
      </div>
    );
  }
}

App.propTypes  = {
  angle: PropTypes.number.isRequired,
  gameState: PropTypes.shape({
    started: PropTypes.bool.isRequired,
    kills: PropTypes.number.isRequired,
    lives: PropTypes.number.isRequired,
    flyingObjects: PropTypes.arrayOf(PropTypes.shape({
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      id: PropTypes.number.isRequired,
    })).isRequired,
  }).isRequired,
  moveObjects: PropTypes.func.isRequired,
  startGame: PropTypes.func.isRequired,
  currentPlayer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    maxScore: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
  }),
  leaderboardLoaded: PropTypes.func.isRequired,
  loggedIn: PropTypes.func.isRequired,
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    maxScore: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
  })),
  shoot: PropTypes.func.isRequired,
};

App.defaultProps = {
  currentPlayer: null,
  players: null,
};

export default App;
