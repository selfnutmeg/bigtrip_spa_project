import SortView from '../view/sort.js';
import EventsListView from '../view/events-list.js';
import NoEventsView from '../view/no-events.js';
import EventPresenter, {State as EventViewState} from './event.js';
import EventNewPresenter from './event-new.js';
import TripInfoView from '../view/trip-info.js';
import TripPriceView from '../view/trip-price.js';
import LoadingView from '../view/loading.js';
import {render, RenderPosition, remove} from '../utils/render.js';
import {SortType, UpdateType, UserAction, FilterType} from '../const.js';
import {sortEventsByDate, sortEventsByTime, sortEventsByPrice} from '../utils/event.js';
import {filter} from '../utils/filter.js';

export default class BoardPresenter {
  constructor(eventsContainer, tripInfoContainer, buttonNewEvent, eventsModel, filterModel, offersModel, destinationsModel, api) {
    this._eventsModel = eventsModel;
    this._filterModel = filterModel;
    this._offersModel = offersModel;
    this._destinationsModel = destinationsModel;
    this._tripInfoContainer = tripInfoContainer;
    this._eventsContainer = eventsContainer;
    this._buttonNewEvent = buttonNewEvent;
    this._eventPresenter = {};
    this._currentSortType = SortType.DAY;
    this._isLoading = true;
    this._api = api;

    this._tripInfoComponent = null;
    this._tripPriceComponent = null;
    this._sortComponent = null;
    this._eventsListComponent = new EventsListView();
    this._noEventsComponent = new NoEventsView();
    this._loadingComponent = new LoadingView();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
  }

  init() {
    this._buttonNewEvent.disabled = false;
    this._renderBoard();

    this._eventsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
  }

  createEvent() {
    this._buttonNewEvent.disabled = true;
    this._currentSortType = SortType.DAY;
    this._filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this._eventNewPresenter.init(this._buttonNewEvent);
  }

  destroy() {
    this._buttonNewEvent.disabled = true;
    this._clearBoard({resetSortType: true});
    remove(this._noEventsComponent);

    this._eventsModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
  }

  _getEvents({isSource = false} = {}) {
    const filterType = isSource ? FilterType.EVERYTHING : this._filterModel.getFilter();
    const sortType = isSource ? SortType.DAY : this._currentSortType;
    const events = this._eventsModel.getEvents();
    const filteredEvents = filter[filterType](events);

    switch (sortType) {
      case SortType.TIME:
        return filteredEvents.sort(sortEventsByTime);
      case SortType.PRICE:
        return filteredEvents.sort(sortEventsByPrice);
    }

    return filteredEvents.sort(sortEventsByDate);
  }

  _getOffers() {
    return this._offersModel.getOffers();
  }

  _getDestinations() {
    return this._destinationsModel.getDestinations();
  }

  _handleModeChange() {
    this._eventNewPresenter.destroy();
    Object
      .values(this._eventPresenter)
      .forEach((presenter) => presenter.resetView());
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    this._clearBoard();
    this._renderBoard();
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this._eventPresenter[update.id].setViewState(EventViewState.SAVING);
        this._api.updateEvent(update)
          .then((response) => {
            this._eventsModel.updateEvent(updateType, response);
          })
          .catch(() => {
            this._eventPresenter[update.id].setViewState(EventViewState.ABORTING);
          });
        break;

      case UserAction.ADD_EVENT:
        this._eventNewPresenter.setSaving();
        this._api.addEvent(update)
          .then((response) => {
            this._eventsModel.addEvent(updateType, response);
          })
          .catch(() => {
            this._eventNewPresenter.setAborting();
          });
        break;

      case UserAction.DELETE_EVENT:
        this._eventPresenter[update.id].setViewState(EventViewState.DELETING);
        this._api.deleteEvent(update)
          .then(() => {
            this._eventsModel.deleteEvent(updateType, update);
          })
          .catch(() => {
            this._eventPresenter[update.id].setViewState(EventViewState.ABORTING);
          });
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._eventPresenter[data.id].init(data);
        break;

      case UpdateType.MINOR:
        this._clearBoard();
        this._renderBoard();
        break;

      case UpdateType.MAJOR:
        this._clearBoard({resetSortType: true});
        this._renderBoard();
        break;

      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderBoard();
        this._eventNewPresenter = new EventNewPresenter(this._eventsListComponent, this._handleViewAction,  this._getOffers(), this._getDestinations());
        break;
    }
  }

  _renderSort() {
    if (this._sortComponent) {
      this._sortComponent = null;
    }

    this._sortComponent = new SortView(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
    render(this._eventsContainer, this._sortComponent, RenderPosition.AFTERBEGIN);
  }

  _renderEvents() {
    const events = this._getEvents();
    events.forEach((eventItem) => this._renderEvent(eventItem));
  }

  _clearBoard({resetSortType = false} = {}) {
    this._eventNewPresenter.destroy();
    Object
      .values(this._eventPresenter)
      .forEach((presenter) => presenter.destroy());
    this._eventPresenter = {};
    remove(this._sortComponent);
    remove(this._loadingComponent);

    if (resetSortType) {
      this._currentSortType = SortType.DAY;
    }
  }

  _renderEventList() {
    render(this._eventsContainer, this._eventsListComponent, RenderPosition.BEFOREEND);
  }

  _renderNoEvents() {
    render(this._eventsContainer, this._noEventsComponent, RenderPosition.BEFOREEND);
  }

  _renderTripInfo() {
    if (this._tripInfoComponent) {
      remove(this._tripInfoComponent);
      this._tripInfoComponent = null;
    }

    this._tripInfoComponent = new TripInfoView(this._getEvents({isSource: true}));
    render(this._tripInfoContainer, this._tripInfoComponent, RenderPosition.AFTERBEGIN);
  }

  _renderTripPrice() {
    if (this._tripPriceComponent) {
      remove(this._tripPriceComponent);
      this._tripPriceComponent = null;
    }

    this._tripPriceComponent = new TripPriceView(this._getEvents({isSource: true}));
    render(this._tripInfoComponent, this._tripPriceComponent, RenderPosition.BEFOREEND);
  }

  _renderEvent(event) {
    const eventPresenter = new EventPresenter(this._eventsListComponent, this._handleViewAction, this._handleModeChange, this._getOffers(), this._getDestinations());
    eventPresenter.init(event);
    this._eventPresenter[event.id] = eventPresenter;
  }

  _renderLoading() {
    render(this._eventsContainer, this._loadingComponent, RenderPosition.BEFOREEND);
  }

  _renderBoard() {
    if (this._isLoading) {
      this._buttonNewEvent.disabled = true;
      this._renderLoading();
      return;
    }

    if (this._getEvents().length === 0) {
      remove(this._tripInfoComponent);
      this._buttonNewEvent.disabled = false;
      this._renderEventList();
      this._renderNoEvents();
    } else {
      this._buttonNewEvent.disabled = false;
      remove(this._noEventsComponent);
      this._renderTripInfo();
      this._renderTripPrice();
      this._renderSort();
      this._renderEvents();
      this._renderEventList();
    }
  }
}
