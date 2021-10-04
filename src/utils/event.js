import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const DatetimeFormat = {
  MINUTE: 'mm[M]',
  HOUR: 'HH[H] mm[M]',
  DAY: 'DD[D] HH[H] mm[M]',
};

const DatetimeLimit = {
  MINUTE: 60,
  HOUR: 24,
};

export const formatDate = (date, format) => dayjs(date).format(format);

export const getTimeDuration = (fromDate, toDate) => {
  const startDate = dayjs(fromDate);
  const endDate = dayjs(toDate);

  return endDate.diff(startDate);
};

export const formateDuration = (difference) => {
  const timeDuration = dayjs.duration(difference);

  if (timeDuration.asMinutes() < DatetimeLimit.MINUTE) {
    return timeDuration.format(DatetimeFormat.MINUTE);
  }

  if (timeDuration.asHours() < DatetimeLimit.HOUR) {
    return timeDuration.format(DatetimeFormat.HOUR);
  }

  return timeDuration.format(DatetimeFormat.DAY);
};

export const isDateCurrent = (date) => dayjs().isSame(dayjs(date), 'm');

export const isDateExpired = (date) => dayjs().isAfter(dayjs(date), 'm');

export const isDateInFuture = (date) => dayjs().isBefore(dayjs(date), 'm');

export const getAvailableTypeOffers = (availableOffers, currentType) => {
  return availableOffers.find(({type}) => type === currentType).offers;
};

const getWeightForNullValue = (valueA, valueB) => {
  if (valueA === null && valueB === null) {
    return 0;
  }

  if (valueA === null) {
    return 1;
  }

  if (valueB === null) {
    return -1;
  }

  return null;
};

export const sortEventsByDate = (eventA, eventB) => {
  const weight = getWeightForNullValue(eventA.fromDate, eventB.fromDate);

  if (weight !== null) {
    return weight;
  }

  return eventA.fromDate - eventB.fromDate;
};

export const sortEventsByTime = (eventA, eventB) => {
  const eventADuration = dayjs(eventA.toDate).diff(dayjs(eventA.fromDate));
  const eventBDuration = dayjs(eventB.toDate).diff(dayjs(eventB.fromDate));

  const weight = getWeightForNullValue(eventADuration, eventBDuration);

  if (weight !== null) {
    return weight;
  }

  return eventBDuration - eventADuration;
};

export const sortEventsByPrice = (eventA, eventB) => {
  const weight = getWeightForNullValue(eventA.price, eventB.price);

  if (weight !== null) {
    return weight;
  }

  return eventB.price - eventA.price;
};
