import { parseLevel } from '../core/level';
import firstLevel from './01.json';
import secondLevel from './02.json';
import thirdLevel from './03.json';
import fourthLevel from './04.json';
import fifthLevel from './05.json';
import sixthLevel from './06.json';
import seventhLevel from './07.json';
import eighthLevel from './08.json';
import ninthLevel from './09.json';
import tenthLevel from './10.json';

export const tutorialLevel = parseLevel(firstLevel);
export const levels = [
  tutorialLevel,
  ...[secondLevel, thirdLevel, fourthLevel, fifthLevel, sixthLevel, seventhLevel, eighthLevel, ninthLevel, tenthLevel].map(parseLevel),
];
