import SiteMenuView from './view/site-menu.js';
import StatsView from './view/stats.js';
import BoardPresenter from './presenter/board.js';
import FilterPresenter from './presenter/filter.js';
import EventsModel from './model/events.js';
import FilterModel from './model/filter.js';
import OffersModel from './model/offers.js';
import DestinationsModel from './model/destinations.js';
import {render, RenderPosition, remove} from './utils/render.js';
import {MenuItem, UpdateType, FilterType} from './const.js';
import Api from './api.js';

const END_POINT = 'https://14.ecmascript.pages.academy/big-trip';
const AUTHORIZATION = 'Basic masonfgjeo87fb19d';

const api = new Api(END_POINT, AUTHORIZATION);

const eventsModel = new EventsModel();
const filterModel = new FilterModel();
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();

const siteMenuContainer = document.querySelector('.trip-controls__navigation');
const statsContainer = document.querySelector('.page-main .page-body__container');
const buttonNewEvent = document.querySelector('.trip-main__event-add-btn');
const tripInfoContainer = document.querySelector('.trip-main');
const filtersContainer = document.querySelector('.trip-controls__filters');
const eventsContainer = document.querySelector('.trip-events');

const bodyContainers = Array.from(document.querySelectorAll('.page-body__container'));

const boardPresenter = new BoardPresenter(eventsContainer, tripInfoContainer, buttonNewEvent, eventsModel, filterModel, offersModel, destinationsModel, api);
const filterPresenter = new FilterPresenter(filtersContainer, filterModel, eventsModel);
const siteMenuComponent = new SiteMenuView();

let statsComponent = null;

document.querySelector('.trip-main__event-add-btn').addEventListener('click', (evt) => {
  evt.preventDefault();
  remove(statsComponent);
  boardPresenter.destroy();
  boardPresenter.init();
  boardPresenter.createEvent(evt.target);
});

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.TABLE:
      boardPresenter.init();
      filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
      remove(statsComponent);
      siteMenuComponent.setMenuItem(MenuItem.TABLE);
      bodyContainers.forEach((container) => container.classList.remove('page-body__container--line-hidden'));
      break;

    case MenuItem.STATS:
      boardPresenter.destroy();
      filterPresenter.init({isDisable: true});
      statsComponent = new StatsView(eventsModel.getEvents());
      render(statsContainer, statsComponent, RenderPosition.BEFOREEND);
      siteMenuComponent.setMenuItem(MenuItem.STATS);
      bodyContainers.forEach((container) => container.classList.add('page-body__container--line-hidden'));
      break;
  }
};

siteMenuComponent.setMenuClickHandler(handleSiteMenuClick);

render(siteMenuContainer, siteMenuComponent, RenderPosition.BEFOREEND);

boardPresenter.init();
filterPresenter.init();

Promise
  .all([
    api.getDestinations(),
    api.getOffers(),
    api.getEvents(),
  ])
  .then((values) => {
    destinationsModel.setDestinations(values[0]);
    offersModel.setOffers(values[1]);
    eventsModel.setEvents(UpdateType.INIT, values[2]);
  });
