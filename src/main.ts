import Phaser from 'phaser';
import { PlayScene } from './game/scenes/Play';
import './styles.css';

new Phaser.Game({
  type: Phaser.CANVAS,
  backgroundColor: '#090e20',
  scale: {
    parent: 'game',
    width: 960,
    height: 640,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: { noAudio: true },
  scene: [PlayScene],
});
