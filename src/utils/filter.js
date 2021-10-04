import {isDateExpired, isDateInFuture, isDateCurrent} from './event.js';
import {FilterType} from '../const.js';

export const filter = {
  [FilterType.EVERYTHING]: (events) => events,
  [FilterType.FUTURE]: (events) => events.filter((event) => isDateCurrent(event.fromDate) || isDateInFuture(event.fromDate) || (isDateExpired(event.fromDate) && isDateInFuture(event.toDate))),
  [FilterType.PAST]: (events) => events.filter((event) => isDateExpired(event.toDate) || (isDateExpired(event.fromDate) && isDateInFuture(event.toDate))),
};
