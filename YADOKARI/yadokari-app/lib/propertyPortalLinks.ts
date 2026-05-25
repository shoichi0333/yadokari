const SUUMO_AREA_CODES: Record<string, string> = {
  北海道: "010",
  青森県: "020",
  岩手県: "020",
  宮城県: "020",
  秋田県: "020",
  山形県: "020",
  福島県: "020",
  茨城県: "030",
  栃木県: "030",
  群馬県: "030",
  埼玉県: "030",
  千葉県: "030",
  東京都: "030",
  神奈川県: "030",
  新潟県: "040",
  富山県: "040",
  石川県: "040",
  福井県: "040",
  山梨県: "040",
  長野県: "040",
  岐阜県: "050",
  静岡県: "050",
  愛知県: "050",
  三重県: "050",
  滋賀県: "060",
  京都府: "060",
  大阪府: "060",
  兵庫県: "060",
  奈良県: "060",
  和歌山県: "060",
  徳島県: "070",
  香川県: "070",
  愛媛県: "070",
  高知県: "070",
  鳥取県: "080",
  島根県: "080",
  岡山県: "080",
  広島県: "080",
  山口県: "080",
  福岡県: "090",
  佐賀県: "090",
  長崎県: "090",
  熊本県: "090",
  大分県: "090",
  宮崎県: "090",
  鹿児島県: "090",
  沖縄県: "090",
};

const PREFECTURES = Object.keys(SUUMO_AREA_CODES);

function normalizePrefecture(value: string) {
  return PREFECTURES.find((prefecture) => value.startsWith(prefecture)) ?? value;
}

function normalizeAreaName(prefecture: string, areaName?: string) {
  const normalizedPrefecture = normalizePrefecture(prefecture);
  const candidates = [areaName, prefecture.slice(normalizedPrefecture.length)]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  const unique = Array.from(new Set(candidates));
  const area = unique.find((value) => value !== normalizedPrefecture);

  if (!area) return undefined;

  const withoutPrefecture = area.startsWith(normalizedPrefecture)
    ? area.slice(normalizedPrefecture.length).trim()
    : area;

  return withoutPrefecture || undefined;
}

function buildQuery(prefecture: string, areaName?: string) {
  const normalizedPrefecture = normalizePrefecture(prefecture);
  const normalizedAreaName = normalizeAreaName(prefecture, areaName);
  return [normalizedPrefecture, normalizedAreaName, "賃貸"].filter(Boolean).join(" ");
}

function getSuumoAreaCode(prefecture: string) {
  return SUUMO_AREA_CODES[normalizePrefecture(prefecture)] ?? "030";
}

const ATHOME_PREFECTURE_SLUGS: Record<string, string> = {
  北海道: "hokkaido",
  青森県: "aomori",
  岩手県: "iwate",
  宮城県: "miyagi",
  秋田県: "akita",
  山形県: "yamagata",
  福島県: "fukushima",
  茨城県: "ibaraki",
  栃木県: "tochigi",
  群馬県: "gunma",
  埼玉県: "saitama",
  千葉県: "chiba",
  東京都: "tokyo",
  神奈川県: "kanagawa",
  新潟県: "niigata",
  富山県: "toyama",
  石川県: "ishikawa",
  福井県: "fukui",
  山梨県: "yamanashi",
  長野県: "nagano",
  岐阜県: "gifu",
  静岡県: "shizuoka",
  愛知県: "aichi",
  三重県: "mie",
  滋賀県: "shiga",
  京都府: "kyoto",
  大阪府: "osaka",
  兵庫県: "hyogo",
  奈良県: "nara",
  和歌山県: "wakayama",
  鳥取県: "tottori",
  島根県: "shimane",
  岡山県: "okayama",
  広島県: "hiroshima",
  山口県: "yamaguchi",
  徳島県: "tokushima",
  香川県: "kagawa",
  愛媛県: "ehime",
  高知県: "kochi",
  福岡県: "fukuoka",
  佐賀県: "saga",
  長崎県: "nagasaki",
  熊本県: "kumamoto",
  大分県: "oita",
  宮崎県: "miyazaki",
  鹿児島県: "kagoshima",
  沖縄県: "okinawa",
};

const ATHOME_AREA_SEGMENTS: Record<string, string> = {
  "千葉県:千葉市": "chiba-locate",
  "千葉県:千葉市中央区": "chiba_chuo-city",
  "東京都:港区": "minato-city",
  "東京都:中野区": "nakano-city",
  "東京都:新宿区": "shinjuku-city",
  "東京都:台東区・浅草": "taito-city",
  "東京都:大田区": "ota-city",
  "東京都:渋谷区": "shibuya-city",
  "東京都:墨田区": "sumida-city",
  "東京都:文京区": "bunkyo-city",
  "東京都:豊島区・池袋": "toshima-city",
};

function getAthomePrefectureSlug(prefecture: string) {
  return ATHOME_PREFECTURE_SLUGS[normalizePrefecture(prefecture)];
}

export function getSuumoRentSearchUrl(prefecture: string, areaName?: string) {
  const query = encodeURIComponent(buildQuery(prefecture, areaName));
  const areaCode = getSuumoAreaCode(prefecture);
  return `https://suumo.jp/jj/chintai/ichiran/FR301FC005/?ar=${areaCode}&bs=040&fw=${query}`;
}

export function getAthomeRentSearchUrl(prefecture: string, areaName?: string) {
  const normalizedPrefecture = normalizePrefecture(prefecture);
  const normalizedAreaName = normalizeAreaName(prefecture, areaName);
  const prefectureSlug = getAthomePrefectureSlug(normalizedPrefecture);

  if (!prefectureSlug) {
    return "https://www.athome.co.jp/chintai/";
  }

  const areaSegment = normalizedAreaName
    ? ATHOME_AREA_SEGMENTS[`${normalizedPrefecture}:${normalizedAreaName}`]
    : undefined;
  if (areaSegment) {
    return `https://www.athome.co.jp/chintai/${prefectureSlug}/${areaSegment}/list/`;
  }

  return `https://www.athome.co.jp/chintai/${prefectureSlug}/`;
}
