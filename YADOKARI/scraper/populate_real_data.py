"""
Populate yadokari-app/public/data/minpaku_listings.json with real minpaku data.

Sources:
- Minato City January 2026 CSV, explicitly verified by the project.
- Tokyo Metropolitan CKAN package_search results for housing accommodation
  notification datasets.
"""

from __future__ import annotations

import hashlib
import io
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_FILE = ROOT_DIR / "yadokari-app" / "public" / "data" / "minpaku_listings.json"

CKAN_API_URL = "https://catalog.data.metro.tokyo.lg.jp/api/action/package_search"
CKAN_QUERY = "住宅宿泊事業届出住宅"
MINATO_202601_URL = (
    "https://opendata.city.minato.tokyo.jp/dataset/"
    "a5897786-586e-4f35-8670-cb6f9b3c88ba/resource/"
    "fa2a84e2-502d-4d2a-9d48-f6d6697a1b44/download/jyutakusyukuhaku_202601.csv"
)

TARGET_KEYWORDS = (
    "住宅宿泊事業届出住宅",
    "住宅宿泊事業届出情報",
    "住宅宿泊事業届出",
)


@dataclass(frozen=True)
class CsvSource:
    source_id: str
    name: str
    url: str
    package_title: str
    resource_name: str


def text_value(value: Any) -> str:
    if value is None:
        return ""
    if pd.isna(value):
        return ""
    return str(value).strip()


def normalize_col_name(value: Any) -> str:
    return re.sub(r"\s+", "", text_value(value).replace("\ufeff", ""))


def make_id(source_id: str, permit_number: str, address: str, name: str) -> str:
    raw = f"{source_id}|{permit_number}|{address}|{name}"
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]


def safe_source_id(name: str, url: str) -> str:
    host = urlparse(url).netloc.replace(".", "_")
    base = re.sub(r"[^0-9A-Za-z_]+", "_", name).strip("_")
    if not base:
        base = host
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]
    return f"{base}_{digest}"


def resource_sort_key(resource: dict[str, Any]) -> tuple[int, str]:
    text = f"{resource.get('name') or ''} {resource.get('url') or ''}"
    numbers = [int(match) for match in re.findall(r"20\d{4}", text)]
    return (max(numbers) if numbers else 0, text)


def is_target_package(package: dict[str, Any]) -> bool:
    title = text_value(package.get("title"))
    resource_text = " ".join(
        f"{resource.get('name') or ''} {resource.get('url') or ''}"
        for resource in package.get("resources", [])
    )
    haystack = f"{title} {resource_text}"
    return any(keyword in haystack for keyword in TARGET_KEYWORDS)


def is_csv_resource(resource: dict[str, Any]) -> bool:
    url = text_value(resource.get("url"))
    fmt = text_value(resource.get("format")).upper()
    return bool(url) and (fmt == "CSV" or url.lower().split("?")[0].endswith(".csv"))


def extract_sources_from_ckan(data: dict[str, Any]) -> list[CsvSource]:
    sources: list[CsvSource] = []
    for package in data.get("result", {}).get("results", []):
        if not is_target_package(package):
            continue

        csv_resources = [r for r in package.get("resources", []) if is_csv_resource(r)]
        if not csv_resources:
            continue

        latest = max(csv_resources, key=resource_sort_key)
        organization = package.get("organization") or {}
        name = text_value(organization.get("title")) or text_value(package.get("title")) or "東京都"
        sources.append(
            CsvSource(
                source_id=safe_source_id(name, text_value(latest.get("url"))),
                name=name,
                url=text_value(latest.get("url")),
                package_title=text_value(package.get("title")),
                resource_name=text_value(latest.get("name")),
            )
        )
    return sources


def dedupe_sources(sources: list[CsvSource]) -> list[CsvSource]:
    seen: set[str] = set()
    deduped: list[CsvSource] = []
    for source in sources:
        if source.url in seen:
            continue
        seen.add(source.url)
        deduped.append(source)
    return deduped


def find_column(df: pd.DataFrame, candidates: tuple[str, ...], contains: tuple[str, ...] = ()) -> str | None:
    normalized = {normalize_col_name(col): col for col in df.columns}
    for candidate in candidates:
        if candidate in normalized:
            return normalized[candidate]
    if not contains:
        return None
    for norm, original in normalized.items():
        if all(part in norm for part in contains):
            return original
    return None


def read_csv_bytes(content: bytes) -> pd.DataFrame:
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "cp932", "shift_jis"):
        try:
            return pd.read_csv(io.BytesIO(content), encoding=encoding, dtype=str)
        except Exception as exc:
            last_error = exc
    raise RuntimeError(f"CSV decoding failed: {last_error}")


def parse_float(value: Any) -> float | None:
    text = text_value(value).replace(",", "")
    if not text:
        return None
    try:
        number = float(text)
    except ValueError:
        return None
    return number


def parse_date(value: Any) -> str:
    text = text_value(value)
    if not text:
        return ""
    parsed = pd.to_datetime(text, errors="coerce")
    if pd.isna(parsed):
        return text
    return parsed.strftime("%Y-%m-%d")


def normalize_dataframe(df: pd.DataFrame, source: CsvSource) -> list[dict[str, Any]]:
    address_col = find_column(
        df,
        ("所在地", "住宅の所在地", "住所", "所在地住所"),
        contains=("所在地",),
    )
    building_col = find_column(df, ("建物名等", "住宅の方書", "建物名", "方書"))
    permit_col = find_column(df, ("届出番号", "番号", "届出受付番号"), contains=("届出", "番号"))
    date_col = find_column(df, ("届出年月日[西暦]", "届出年月日", "届出日"), contains=("届出", "年月日"))
    lat_col = find_column(df, ("緯度", "lat", "latitude"), contains=("緯度",))
    lng_col = find_column(df, ("経度", "lng", "lon", "longitude"), contains=("経度",))
    prefecture_col = find_column(df, ("都道府県名", "都道府県"))
    city_col = find_column(df, ("市区町村名", "区市町村名", "市区町村"))

    if not address_col or not lat_col or not lng_col:
        return []

    listings: list[dict[str, Any]] = []
    for _, row in df.iterrows():
        lat = parse_float(row.get(lat_col))
        lng = parse_float(row.get(lng_col))
        if lat is None or lng is None:
            continue
        if not (20.0 <= lat <= 46.5 and 122.0 <= lng <= 154.0):
            continue

        address = text_value(row.get(address_col))
        if not address:
            continue

        prefecture = text_value(row.get(prefecture_col)) or "東京都"
        city = text_value(row.get(city_col))
        if city and city not in address:
            address = f"{prefecture}{city}{address}"
        elif prefecture and not address.startswith(prefecture):
            address = f"{prefecture}{address}"

        building = text_value(row.get(building_col)) if building_col else ""
        permit_number = text_value(row.get(permit_col)) if permit_col else ""
        permit_date = parse_date(row.get(date_col)) if date_col else ""
        name = building or address

        listings.append(
            {
                "id": make_id(source.source_id, permit_number, address, name),
                "prefecture": prefecture,
                "address": address,
                "permitNumber": permit_number,
                "permitDate": permit_date,
                "name": name,
                "lat": round(lat, 7),
                "lng": round(lng, 7),
                "minpakuType": "JUUTAKU",
                "sourceId": source.source_id,
            }
        )
    return listings


def fetch_ckan_sources(client: httpx.Client) -> list[CsvSource]:
    response = client.get(CKAN_API_URL, params={"q": CKAN_QUERY, "rows": 30})
    response.raise_for_status()
    data = response.json()
    if not data.get("success"):
        raise RuntimeError("CKAN package_search returned success=false")

    return extract_sources_from_ckan(data)


def download_and_normalize(client: httpx.Client, source: CsvSource) -> list[dict[str, Any]]:
    response = client.get(source.url)
    response.raise_for_status()
    df = read_csv_bytes(response.content)
    return normalize_dataframe(df, source)


def main() -> int:
    explicit_minato = CsvSource(
        source_id="minato_202601",
        name="港区",
        url=MINATO_202601_URL,
        package_title="港区の住宅宿泊事業届出情報一覧",
        resource_name="住宅宿泊事業届出情報一覧（2026年（令和8年）1月31日現在）",
    )

    with httpx.Client(
        timeout=httpx.Timeout(45.0, connect=15.0),
        follow_redirects=True,
        headers={"User-Agent": "YADOKARI real data populator/1.0"},
    ) as client:
        sources = dedupe_sources([explicit_minato, *fetch_ckan_sources(client)])

        all_listings: list[dict[str, Any]] = []
        source_counts: list[tuple[CsvSource, int]] = []
        failed: list[tuple[CsvSource, str]] = []

        for source in sources:
            try:
                listings = download_and_normalize(client, source)
            except Exception as exc:
                failed.append((source, str(exc)))
                continue
            all_listings.extend(listings)
            source_counts.append((source, len(listings)))

    seen_ids: set[str] = set()
    deduped_listings: list[dict[str, Any]] = []
    for listing in all_listings:
        if listing["id"] in seen_ids:
            continue
        seen_ids.add(listing["id"])
        deduped_listings.append(listing)

    deduped_listings.sort(key=lambda item: (item["prefecture"], item["address"], item["permitNumber"]))

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "totalCount": len(deduped_listings),
        "listings": deduped_listings,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Output: {OUTPUT_FILE}")
    print(f"Total valid listings: {len(deduped_listings)}")
    print("Source results:")
    for source, count in source_counts:
        print(f"- {source.name}: {count} listings ({source.resource_name})")
    if failed:
        print("Failed sources:")
        for source, error in failed:
            print(f"- {source.name}: {error}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
