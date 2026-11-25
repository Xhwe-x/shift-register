import Phaser from 'phaser';
import { BootScene } from './game/scenes/Boot';
import { LevelSelectScene } from './game/scenes/LevelSelect';
import { MenuScene } from './game/scenes/Menu';
import { PlayScene } from './game/scenes/Play';
import { ResultScene } from './game/scenes/Result';
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
  scene: [BootScene, MenuScene, LevelSelectScene, PlayScene, ResultScene],
});
