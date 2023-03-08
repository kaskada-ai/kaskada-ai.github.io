import format from "date-fns/format";
import fromUnixTime from "date-fns/fromUnixTime";

export function formatDate(timestamp, formatValue = "MMM dd, yyyy") {
  const date = fromUnixTime(timestamp);
  return format(date, formatValue);
}
