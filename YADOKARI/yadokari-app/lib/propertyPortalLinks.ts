function buildQuery(prefecture: string, areaName?: string) {
  return [prefecture, areaName, "賃貸"].filter(Boolean).join(" ");
}

export function getSuumoRentSearchUrl(prefecture: string, areaName?: string) {
  const query = encodeURIComponent(buildQuery(prefecture, areaName));
  return `https://suumo.jp/chintai/?fw=${query}`;
}

export function getAthomeRentSearchUrl(prefecture: string, areaName?: string) {
  const query = encodeURIComponent(buildQuery(prefecture, areaName));
  return `https://www.athome.co.jp/chintai/?keyword=${query}`;
}
