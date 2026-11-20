// Helpers for the OpenWeather 3-hour forecast list.
// `dt` is a UTC Unix timestamp (seconds); `timezone` is the city's UTC offset in seconds.
// Shifting by the offset and reading the UTC fields gives the city's local date/time,
// independent of the viewer's own time zone.

const shifted = (dt, timezone = 0) => new Date((dt + timezone) * 1000);

/** City-local date, 'YYYY-MM-DD'. */
export const localDate = (dt, timezone) => shifted(dt, timezone).toISOString().slice(0, 10);

/** City-local time, 'HH:MM'. */
export const localTime = (dt, timezone) => shifted(dt, timezone).toISOString().slice(11, 16);

/** { 'YYYY-MM-DD': [items...] } in city-local days, in time order. */
export const groupByLocalDate = (list = [], timezone = 0) =>
    list.reduce((days, item) => {
        const day = localDate(item.dt, timezone);
        if (!days[day]) days[day] = [];
        days[day].push(item);
        return days;
    }, {});

/** 'YYYY-MM-DD' -> 'Thu, 20 Nov' */
export const formatDay = (ymd) =>
    new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    });
