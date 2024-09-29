import {
  chance, Symb, CATEGORY_ANIMAL, CATEGORY_UNBUYABLE, CATEGORY_EMPTY_SPACE,
  Cherry, Pineapple, Rock, Empty, Coin, Dragon, Diamond
} from "./symbol.js";
import * as Util from "./util.js";

export class Wizard extends Symb {
  static emoji = '🧙‍♂️';
  constructor(hp = 100) {
    super();
    this.rarity = -1.0;
    this.hp = hp;
  }
  copy() {
    return new Wizard(this.hp);
  }
  async score(game, x, y) {
  }
  counter(game) {
    return this.hp;
  }
  description() {
    return 'this is the boss to defeat.';
  }
  descriptionLong() {
    return 'this is the boss to defeat. you have to figure out how to defeat it.';
  }
}