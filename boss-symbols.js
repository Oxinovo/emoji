import {
  chance, Symb, CATEGORY_UNBUYABLE, CATEGORY_EMPTY_SPACE,
  Cherry, Pineapple, Rock, Empty, Coin, Dragon, Diamond
} from "./symbol.js";
import * as Util from "./util.js";

export const CATEGORY_ENEMY = Symbol('Enemy');

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
    if (this.hp <= 0) {
      game.over();
    }
  }
  async damage(game, x, y, dmg) {
    this.hp -= dmg;
    game.board.updateCounter(game, x, y);
    await Util.animate(game.board.getSymbolDiv(x, y), 'bounce', 0.1);
  }
  categories() {
    return [CATEGORY_ENEMY];
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

export class Dagger extends Symb {
  static emoji = '🗡️';
  constructor() {
    super();
    this.rarity = 0.4;
  }
  copy() {
    return new Dagger();
  }
  async score(game, x, y) {
    const coords = game.board.nextToCategory(x, y, CATEGORY_ENEMY);
    if (coords.length === 0) {
      return;
    }
    const [attackX, attackY] = Util.randomRemove(coords);
    await Util.animate(game.board.getSymbolDiv(x, y), 'shake', 0.1);
    await game.board.cells[attackY][attackX].damage(game, attackX, attackY, 3);
  }
  cost() {
    return 11;
  }
  description() {
    return 'deals 3 damage to a random enemy nearby.';
  }
  descriptionLong() {
    return 'deals 3 damage to a random enemy nearby.';
  }
}
