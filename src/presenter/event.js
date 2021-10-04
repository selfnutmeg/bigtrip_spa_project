import EventView from '../view/event.js';
import EventEditView from '../view/event-edit.js';
import {RenderPosition, render, replace, remove} from '../utils/render.js';
import {UserAction, UpdateType} from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const KeyValue = {
  ESCAPE: 'Escape',
  ESC: 'Esc',
};

export const State = {
  SAVING: 'SAVING',
  DELETING: 'DELETING',
  ABORTING: 'ABORTING',
};

export default class EventPresenter {
  constructor(eventsListComponent, changeData, changeMode, offers, destinations) {
    this._eventsListComponent = eventsListComponent;
    this._changeData = changeData;
    this._changeMode = changeMode;
    this._offers = offers;
    this._destinations = destinations;

    this._eventComponent = null;
    this._eventEditComponent = null;
    this._mode = Mode.DEFAULT;

    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleRollupButtonClick = this._handleRollupButtonClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
  }

  init(event) {
    this._event = event;

    const prevEventComponent = this._eventComponent;
    const prevEventEditComponent = this._eventEditComponent;

    this._eventComponent = new EventView(event);
    this._eventEditComponent = new EventEditView(event, this._offers, this._destinations);

    this._eventComponent.setRollupButtonClickHandler(this._handleRollupButtonClick);
    this._eventComponent.setFavoriteClickHandler(this._handleFavoriteClick);
    this._eventEditComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._eventEditComponent.setRollupButtonClickHandler(this._handleRollupButtonClick);
    this._eventEditComponent.setDeleteClickHandler(this._handleDeleteClick);

    render(this._eventsListComponent, this._eventComponent, RenderPosition.BEFOREEND);

    if (prevEventComponent === null || prevEventEditComponent === null) {
      render(this._eventsListComponent, this._eventComponent, RenderPosition.BEFOREEND);
      return;
    }

    switch (this._mode) {
      case Mode.DEFAULT:
        replace(this._eventComponent, prevEventComponent);
        break;
      case Mode.EDITING:
        replace(this._eventComponent, prevEventEditComponent);
        this._mode = Mode.DEFAULT;
        break;
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  destroy() {
    remove(this._eventComponent);
    remove(this._eventEditComponent);
    document.removeEventListener('keydown', this._escKeyDownHandler);
  }

  resetView() {
    if (this._mode !== Mode.DEFAULT) {
      this._eventEditComponent.reset(this._event);
      this._replaceEditFormToEvent();
    }
  }

  setViewState(state) {
    const resetFormState = () => {
      this._eventEditComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    switch (state) {
      case State.SAVING:
        this._eventEditComponent.updateData({
          isDisabled: true,
          isSaving: true,
        });
        break;
      case State.DELETING:
        this._eventEditComponent.updateData({
          isDisabled: true,
          isDeleting: true,
        });
        break;
      case State.ABORTING:
        this._eventComponent.shake(resetFormState);
        this._eventEditComponent.shake(resetFormState);
        break;
    }
  }

  _replaceEventToEditForm() {
    replace(this._eventEditComponent, this._eventComponent);
    document.addEventListener('keydown', this._escKeyDownHandler);
    this._eventEditComponent.setDatepickers();
    this._changeMode();
    this._mode = Mode.EDITING;
  }

  _replaceEditFormToEvent() {
    replace(this._eventComponent, this._eventEditComponent);
    document.removeEventListener('keydown', this._escKeyDownHandler);
    this._eventEditComponent.removeDatepickers();
    this._mode = Mode.DEFAULT;
  }

  _escKeyDownHandler(evt) {
    if (evt.key === KeyValue.ESCAPE || evt.key === KeyValue.ESC) {
      evt.preventDefault();
      this._eventEditComponent.reset(this._event);
      this._replaceEditFormToEvent();
    }
  }

  _handleFormSubmit(update) {
    this._changeData(
      UserAction.UPDATE_EVENT,
      UpdateType.MINOR,
      update,
    );
  }

  _handleDeleteClick(event) {
    this._changeData(
      UserAction.DELETE_EVENT,
      UpdateType.MINOR,
      event,
    );
  }

  _handleRollupButtonClick() {
    switch (this._mode) {
      case Mode.DEFAULT:
        this._replaceEventToEditForm();
        break;
      case Mode.EDITING:
        this._eventEditComponent.reset(this._event);
        this._replaceEditFormToEvent();
        break;
    }
  }

  _handleFavoriteClick() {
    this._changeData(
      UserAction.UPDATE_EVENT,
      UpdateType.MINOR,
      Object.assign(
        {},
        this._event,
        {
          isFavorite: !this._event.isFavorite,
        },
      ),
    );
  }
}
