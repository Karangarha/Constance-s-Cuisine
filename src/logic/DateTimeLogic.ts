import {
  isSameDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

type Range = "Day" | "Week" | "Month" | "All" | "Range";

export default function DateTimeLogic(
  date: Date,
  range: Range,
  dateRange?: [Date, Date] | null
): boolean {
  const now = new Date();

  switch (range) {
    case "Day":
      return isSameDay(date, now);

    case "Week":
      return isWithinInterval(date, {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      });

    case "Month":
      return isWithinInterval(date, {
        start: startOfMonth(now),
        end: endOfMonth(now),
      });

    case "Range":
      if (dateRange) {
        const [start, end] = dateRange;
        return isWithinInterval(date, { start, end });
      }
      return true;

    case "All":
      return true;

    default:
      return false;
  }
}
