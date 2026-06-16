const MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12
};

const pad = (value) => String(value).padStart(2, "0");

const buildIso = (year, month, day) => {
  const normalizedYear = Number(year);
  const normalizedMonth = Number(month);
  const normalizedDay = Number(day);

  if (
    !Number.isInteger(normalizedYear) ||
    !Number.isInteger(normalizedMonth) ||
    !Number.isInteger(normalizedDay) ||
    normalizedMonth < 1 ||
    normalizedMonth > 12 ||
    normalizedDay < 1 ||
    normalizedDay > 31
  ) {
    return null;
  }

  const date = new Date(Date.UTC(normalizedYear, normalizedMonth - 1, normalizedDay));
  if (
    date.getUTCFullYear() !== normalizedYear ||
    date.getUTCMonth() !== normalizedMonth - 1 ||
    date.getUTCDate() !== normalizedDay
  ) {
    return null;
  }

  return `${normalizedYear}-${pad(normalizedMonth)}-${pad(normalizedDay)}`;
};

const normalizeDate = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return buildIso(isoMatch[1], isoMatch[2], isoMatch[3]);
  }

  const dayFirstMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dayFirstMatch) {
    let year = Number(dayFirstMatch[3]);
    if (year < 100) {
      year += 2000;
    }
    return buildIso(year, dayFirstMatch[2], dayFirstMatch[1]);
  }

  const dayMonthNameMatch = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})$/);
  if (dayMonthNameMatch) {
    const month = MONTHS[dayMonthNameMatch[2].toLowerCase()];
    let year = Number(dayMonthNameMatch[3]);
    if (year < 100) {
      year += 2000;
    }
    return month ? buildIso(year, month, dayMonthNameMatch[1]) : null;
  }

  const monthNameDayMatch = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{2,4})$/);
  if (monthNameDayMatch) {
    const month = MONTHS[monthNameDayMatch[1].toLowerCase()];
    let year = Number(monthNameDayMatch[3]);
    if (year < 100) {
      year += 2000;
    }
    return month ? buildIso(year, month, monthNameDayMatch[2]) : null;
  }

  const nativeDate = new Date(raw);
  if (Number.isNaN(nativeDate.getTime())) {
    return null;
  }

  return buildIso(
    nativeDate.getUTCFullYear(),
    nativeDate.getUTCMonth() + 1,
    nativeDate.getUTCDate()
  );
};

module.exports = { normalizeDate };
