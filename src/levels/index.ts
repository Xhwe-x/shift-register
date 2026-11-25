import { parseLevel } from '../core/level';
import firstLevel from './01.json';
import secondLevel from './02.json';
import thirdLevel from './03.json';

export const tutorialLevel = parseLevel(firstLevel);
export const levels = [tutorialLevel, parseLevel(secondLevel), parseLevel(thirdLevel)];
