import AbstractView from './abstract.js';

const addEventPrice = (accumulator, currentEvent) => accumulator + currentEvent.price;

const getTotalEventsPrice = (events) => events.reduce(addEventPrice, 0);

const reduceEventOffers = (eventsAccumulator, currentEvent) =>
  eventsAccumulator + currentEvent.offers.reduce((offersAccumulator, currentOffer) =>
    offersAccumulator + currentOffer.price, 0);

const getTotalOffersPrice = (events) =>
  events.reduce(reduceEventOffers, 0);

const createTripPriceTemplate = (events) => {
  const totalTripPrice = getTotalEventsPrice(events) + getTotalOffersPrice(events);

  return (
    `<p class="trip-info__cost">
      Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalTripPrice}</span>
    </p>`
  );
};

export default class TripPrice extends AbstractView {
  constructor(events) {
    super();
    this._events = events;
  }

  getTemplate() {
    return createTripPriceTemplate(this._events);
  }
}
