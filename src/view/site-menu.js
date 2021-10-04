import AbstractView from './abstract.js';
import {MenuItem} from './../const.js';

const createSiteMenuTemplate = () => {
  return (
    `<nav class="trip-controls__trip-tabs  trip-tabs">
      <a class="trip-tabs__btn  trip-tabs__btn--active" href="#" data-menu-item="${MenuItem.TABLE}">Table</a>
      <a class="trip-tabs__btn" href="#" data-menu-item="${MenuItem.STATS}">Stats</a>
    </nav>`
  );
};

export default class SiteMenu extends AbstractView {
  constructor() {
    super();

    this._menuClickHandler = this._menuClickHandler.bind(this);
    this._buttonClickValue = MenuItem.TABLE;
  }

  getTemplate() {
    return createSiteMenuTemplate();
  }

  setMenuClickHandler(callback) {
    this._callback.menuClick = callback;
    this.getElement().addEventListener('click', this._menuClickHandler);
  }

  _menuClickHandler(evt) {
    if (evt.target.tagName !== 'A') {
      return;
    }

    if (evt.target.dataset.menuItem === this._buttonClickValue) {
      return;
    }

    evt.preventDefault();
    this._buttonClickValue = evt.target.dataset.menuItem;
    this._callback.menuClick(evt.target.dataset.menuItem);
  }

  setMenuItem(menuItem) {
    this.getElement().querySelector('.trip-tabs__btn--active').classList.remove('trip-tabs__btn--active');

    const item = this.getElement().querySelector(`[data-menu-item=${menuItem}]`);

    if (item !== null) {
      item.classList.add('trip-tabs__btn--active');
    }
  }
}
