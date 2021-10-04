import EventEditView from '../view/event-edit.js';
import {UserAction, UpdateType} from '../const.js';
import {render, RenderPosition, remove} from '../utils/render.js';

export default class EventNewPresenter {
  constructor(eventsListComponent, changeData, offers, destinations) {
    this._eventsListComponent = eventsListComponent;
    this._changeData = changeData;
    this._offers = offers;
    this._destinations = destinations;

    this._eventEditComponent = null;

    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
  }

  init(buttonNewEvent) {
    if (this._eventEditComponent !== null) {
      return;
    }

    this._buttonNewEvent = buttonNewEvent;

    this._eventEditComponent = new EventEditView(undefined, this._offers, this._destinations, true);
    this._eventEditComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._eventEditComponent.setDeleteClickHandler(this._handleDeleteClick);
    this._eventEditComponent.setDatepickers();

    render(this._eventsListComponent, this._eventEditComponent, RenderPosition.AFTERBEGIN);

    this._buttonNewEvent.disabled = true;
    document.addEventListener('keydown', this._escKeyDownHandler);
  }

  destroy() {
    if (this._eventEditComponent === null) {
      return;
    }

    remove(this._eventEditComponent);
    this._eventEditComponent = null;
    this._buttonNewEvent.disabled = false;
    document.removeEventListener('keydown', this._escKeyDownHandler);
  }

  setSaving() {
    this._eventEditComponent.updateData({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this._eventEditComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this._eventEditComponent.shake(resetFormState);
  }

  _handleFormSubmit(event) {
    this._changeData(
      UserAction.ADD_EVENT,
      UpdateType.MINOR,
      event,
    );
  }

  _handleDeleteClick() {
    this.destroy();
  }

  _escKeyDownHandler(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  }
}
