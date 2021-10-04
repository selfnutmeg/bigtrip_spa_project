import dayjs from 'dayjs';

export const countPriceByType = (events, type) => {
  const eventsOfType = events.filter((event) => event.type === type);

  return {
    label: type.toUpperCase(),
    data: eventsOfType.reduce((accumulator, event) => accumulator + event.price, 0),
  };
};

export const countEventTypes = (events, type) => {
  return {
    label: type.toUpperCase(),
    data: events.filter((event) => event.type === type).length,
  };
};

export const getDurationTypesCount = (events, type) => {
  const eventsOfType = events.filter((event) => event.type === type);
  let typeDuration = 0;

  eventsOfType.forEach((event) => {
    const startDate = dayjs(event.fromDate);
    const endDate = dayjs(event.toDate);

    typeDuration += endDate.diff(startDate);
  });

  return {
    label: type.toUpperCase(),
    data: typeDuration,
  };
};

export const getSortedData = (dataToSort) => {
  const sortedData = dataToSort.sort((a, b) => b.data - a.data);
  const labels = sortedData.map((item) => item.label);
  const data = sortedData.map((item) => item.data);

  return {
    labels,
    data,
  };
};
