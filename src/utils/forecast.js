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

/** 'YYYY-MM-DD' -> 'Thursday' */
export const formatWeekday = (ymd) =>
    new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });

/** City-local "Thursday, 20 November · 14:05" for a unix time. */
export const formatLocalDateTime = (dt, timezone) => {
    const d = shifted(dt, timezone);
    const date = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    return `${date} · ${d.toISOString().slice(11, 16)}`;
};

/**
 * One summary per city-local day:
 * { date, min, max, pop (max chance of rain 0-1), icon, id, description, items }.
 * The icon/description come from the slot closest to midday, so "today" doesn't show a night icon.
 */
export const summarizeDays = (list = [], timezone = 0) =>
    Object.entries(groupByLocalDate(list, timezone)).map(([date, items]) => {
        const temps = items.map((i) => i.main.temp);
        const midday = items.reduce((best, i) => {
            const dist = (it) => Math.abs(Number(localTime(it.dt, timezone).slice(0, 2)) - 12);
            return dist(i) < dist(best) ? i : best;
        });
        return {
            date,
            min: Math.min(...items.map((i) => i.main.temp_min ?? i.main.temp), ...temps),
            max: Math.max(...items.map((i) => i.main.temp_max ?? i.main.temp), ...temps),
            pop: Math.max(...items.map((i) => i.pop ?? 0)),
            icon: midday.weather[0].icon.replace('n', 'd'),
            id: midday.weather[0].id,
            description: midday.weather[0].description,
            items,
        };
    });
