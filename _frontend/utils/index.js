export function getQueryParam(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function sortByDateTitle(item1, item2) {
  let rv = item1.date - item2.date;

  if (rv === 0) {
    rv = item1.title.localeCompare(item2.title);
  }

  return rv;
}

export function filterByQuery(item, query) {
  if (query === "") {
    return true;
  }

  const words = query
    .toLowerCase()
    .trim()
    .split(/[.\-=/_ ]/);
  const regex = new RegExp(`(${words.join("|")})`);

  const filterOutRestrictedKeys = (key) =>
    !["link", "date", "image"].includes(key);

  return Object.keys(item)
    .filter(filterOutRestrictedKeys)
    .some((key) => {
      const value = item[key].trim().toLowerCase();
      return value.match(regex);
    });
}
