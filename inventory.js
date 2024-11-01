import * as Const from './consts.js';
import * as Util from './util.js';
import { eventManager, GameEvents } from '../core/EventManager.js'

export class Inventory {
  constructor(settings, catalog) {
    this.symbols = catalog.symbolsFromString(settings.startingSet);
    this.symbolsDiv = document.querySelector('.game .inventory');
    this.uiDiv = document.querySelector('.game .ui');
    this.infoDiv = document.querySelector('.info');
    
    this.resources = {};
    this.resources[Const.MONEY] = 1;
    this.resources[Const.TURNS] = settings.gameLength;
    this.resources[Const.LUCK] = 0;
    this.tempLuckBonus = 0;
    this.updateUiDisplay();
    this.graveyard = [];
  }
  updateSymbolDisplay() {
    this.symbolsDiv.replaceChildren();
    const map = new Map();
    this.symbols.forEach((symbol) => {
      const name = symbol.emoji();
      if (!map.has(name)) {
        map.set(name, { count: 0, description: symbol.descriptionLong() });
      }
      map.set(name, {
        count: map.get(name).count + 1,
        description: symbol.descriptionLong(),
      });
    });
    map.forEach(({ count, description }, name) => {
      const symbolDiv = document.createElement('div');
      symbolDiv.addEventListener('click', (_) => {
        const interactiveDescription = Util.createInteractiveDescription(
          description,
          /*emoji=*/ name
        );
        Util.drawText(this.infoDiv, interactiveDescription, true);
        eventManager.dispatch(GameEvents.INFO_TEXT_CHANGED, {
          text: interactiveDescription,
          isHtml: true
        })
      });
      symbolDiv.classList.add('inventoryEntry');
      symbolDiv.innerText = name;

      const countSpan = document.createElement('span');
      countSpan.classList.add('inventoryEntryCount');
      countSpan.innerText = count;
      symbolDiv.appendChild(countSpan);
      this.symbolsDiv.appendChild(symbolDiv);
    });
    eventManager.dispatch(GameEvents.INVENTORY_UPDATED, {
      symbolCounts: Array.from(map.entries())
    });
  }
  remove(symbol) {
    const index = this.symbols.indexOf(symbol);
    if (index >= 0) {
      this.symbols.splice(index, 1);
      eventManager.dispatch(GameEvents.SYMBOL_REMOVED, { symbol });
    }
    this.updateSymbolDisplay();
    this.graveyard.push(symbol);
    eventManager.dispatch(GameEvents.SYMBOL_REMOVED, {
      symbol,
      toGraveyard: true
    })
  }
  add(symbol) {
    this.symbols.push(symbol);
    eventManager.dispatch(GameEvents.SYMBOL_ADDED, { symbol });
    this.updateSymbolDisplay();
  }
  getResource(key) {
    return this.resources[key];
  }
  async addResource(key, value) {
    const oldValue = this.resources[key];
    this.resources[key] += value;

    this.updateUiDisplay();
    eventManager.dispatch(GameEvents.UI_UPDATED, {
      resource: key,
      oldValue: oldValue,
      newValue: this.resources[key],
      change: value
    });
  }
  addLuck(bonus) {
    this.tempLuckBonus += bonus;
    eventManager.dispatch(GameEvents.UI_UPDATED, {
      resource: Const.LUCK,
      bonus: bonus
    })
    // `this.updateUi()` -- This call is not needed here!
    // `resetLuck`` is the function to call when luck calculation finished in last turn's Board::score.
    // We technically always use last turn's luck to avoid another round of scoring.
  }
  resetLuck() {
    this.resources[Const.LUCK] = this.tempLuckBonus;
    this.tempLuckBonus = 0;
    this.updateUiDisplay();
    eventManager.dispatch(GameEvents.UI_UPDATED, {
      resource: Const.LUCK,
      newValue: this.resources[Const.LUCK]
    });
  }
  updateUiDisplay() {
    this.uiDiv.replaceChildren();
    const displayKeyValue = (key, value) => {
      const symbolDiv = document.createElement('div');
      symbolDiv.innerText = key;
      const countSpan = document.createElement('span');
      countSpan.classList.add('inventoryEntryCount');
      countSpan.innerText = value;
      symbolDiv.appendChild(countSpan);
      this.uiDiv.appendChild(symbolDiv);
    };
    for (const [key, value] of Object.entries(this.resources)) {
      displayKeyValue(key, value);
    }
    eventManager.dispatch(GameEvents.UI_UPDATED, {
      resources: {...this.resources}
    });
  }
  // Note: This does NOT return a Symbol. It returns an emoji text character for animation purposes.
  getRandomOwnedEmoji() {
    return Util.randomChoose(this.symbols).emoji();
  }
}
