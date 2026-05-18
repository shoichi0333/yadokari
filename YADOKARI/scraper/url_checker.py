"""
Check current minpaku open-data URLs for selected prefectures.

The script searches CKAN-compatible open-data portals and also checks known
official candidate URLs. Results are printed as JSON so changed URLs can be
reviewed before updating prefectures.py.
"""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin

import httpx


SEARCH_QUERIES = ["minpaku", "民泊", "届出住宅"]

CKAN_PORTALS = [
    {
        "prefecture": "大阪府",
        "name": "BODIK ODCS",
        "base_url": "https://data.bodik.jp/",
    },
    {
        "prefecture": "福岡県",
        "name": "BODIK ODCS",
        "base_url": "https://data.bodik.jp/",
    },
    {
        "prefecture": "神奈川県",
        "name": "神奈川県オープンデータカタログサイト",
        "base_url": "https://catalog.opendata.pref.kanagawa.jp/",
    },
    {
        "prefecture": "北海道",
        "name": "北海道オープンデータポータルサイト",
        "base_url": "https://www.harp.lg.jp/opendata/",
    },
    {
        "prefecture": "沖縄県",
        "name": "BODIK ODCS",
        "base_url": "https://data.bodik.jp/",
    },
]

URL_CANDIDATES = [
    {
        "prefecture": "大阪府",
        "description": "requested legacy page",
        "url": "https://www.pref.osaka.lg.jp/hoken/minpaku/index.html",
    },
    {
        "prefecture": "大阪府",
        "description": "requested Osaka minpaku site",
        "url": "https://www.osaka-minpaku.jp/",
    },
    {
        "prefecture": "大阪府",
        "description": "current official page",
        "url": "https://www.pref.osaka.lg.jp/o100090/kankyoeisei/minnpaku/index.html",
    },
    {
        "prefecture": "大阪府",
        "description": "current official Excel",
        "url": "https://www.pref.osaka.lg.jp/documents/34854/jyuhaku080401.xlsx",
    },
    {
        "prefecture": "福岡県",
        "description": "requested legacy page",
        "url": "https://www.pref.fukuoka.lg.jp/contents/minpaku-list.html",
    },
    {
        "prefecture": "福岡県",
        "description": "current official page",
        "url": "https://www.pref.fukuoka.lg.jp/contents/juutakusyukuhakujigyouhou.html",
    },
    {
        "prefecture": "福岡県",
        "description": "current official PDF",
        "url": "https://www.pref.fukuoka.lg.jp/uploaded/life/816773_62884944_misc.pdf",
    },
    {
        "prefecture": "神奈川県",
        "description": "requested legacy page",
        "url": "https://www.pref.kanagawa.jp/osirase/1023602.html",
    },
    {
        "prefecture": "神奈川県",
        "description": "current official page",
        "url": "https://www.pref.kanagawa.jp/docs/e8z/cnt/f762/p1195197.html",
    },
    {
        "prefecture": "神奈川県",
        "description": "current official Excel",
        "url": "https://www.pref.kanagawa.jp/documents/26258/20260331_jyutakusyukuhakujigyou_sisetuitiran_.xlsx",
    },
    {
        "prefecture": "北海道",
        "description": "current official page",
        "url": "https://www.pref.hokkaido.lg.jp/kz/kkd/minpaku/portal.html",
    },
    {
        "prefecture": "北海道",
        "description": "current official PDF",
        "url": "https://www.pref.hokkaido.lg.jp/fs/1/3/1/0/1/1/1/6/_/R8.03.15%E5%B1%8A%E5%87%BA%E4%BD%8F%E5%AE%85%E4%B8%80%E8%A6%A7.pdf",
    },
    {
        "prefecture": "沖縄県",
        "description": "current official page",
        "url": "https://www.pref.okinawa.lg.jp/iryokenko/eiseiyakuji/1006591/1006594/1006595.html",
    },
    {
        "prefecture": "沖縄県",
        "description": "current official PDF",
        "url": "https://www.pref.okinawa.lg.jp/_res/projects/default_project/_page_/001/006/595/r7zigyousyameibo.pdf",
    },
]


def _compact_resource(resource: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": resource.get("name"),
        "format": resource.get("format"),
        "url": resource.get("url"),
        "last_modified": resource.get("last_modified"),
    }


async def search_ckan(
    client: httpx.AsyncClient,
    portal: dict[str, str],
    query: str,
) -> dict[str, Any]:
    api_url = urljoin(portal["base_url"], "api/3/action/package_search")
    result: dict[str, Any] = {
        "prefecture": portal["prefecture"],
        "portal": portal["name"],
        "api_url": api_url,
        "query": query,
        "ok": False,
        "status_code": None,
        "error": None,
        "matches": [],
    }

    try:
        response = await client.get(api_url, params={"q": query, "rows": 5})
        result["status_code"] = response.status_code
        response.raise_for_status()
        payload = response.json()
        result["ok"] = bool(payload.get("success", False))
        datasets = payload.get("result", {}).get("results", [])
        result["matches"] = [
            {
                "title": dataset.get("title"),
                "name": dataset.get("name"),
                "url": dataset.get("url"),
                "metadata_modified": dataset.get("metadata_modified"),
                "resources": [
                    _compact_resource(resource)
                    for resource in dataset.get("resources", [])[:5]
                ],
            }
            for dataset in datasets
        ]
    except Exception as exc:
        result["error"] = str(exc)

    return result


async def check_url(
    client: httpx.AsyncClient,
    candidate: dict[str, str],
) -> dict[str, Any]:
    result: dict[str, Any] = {
        **candidate,
        "ok": False,
        "status_code": None,
        "final_url": None,
        "content_type": None,
        "content_length": None,
        "error": None,
    }

    try:
        response = await client.get(candidate["url"])
        result["status_code"] = response.status_code
        result["final_url"] = str(response.url)
        result["content_type"] = response.headers.get("content-type")
        result["content_length"] = response.headers.get("content-length")
        result["ok"] = 200 <= response.status_code < 400
    except Exception as exc:
        result["error"] = str(exc)

    return result


async def main() -> None:
    timeout = httpx.Timeout(30.0, connect=10.0)
    headers = {"User-Agent": "YADOKARI-url-checker/1.0"}
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=timeout,
        headers=headers,
    ) as client:
        ckan_tasks = [
            search_ckan(client, portal, query)
            for portal in CKAN_PORTALS
            for query in SEARCH_QUERIES
        ]
        url_tasks = [check_url(client, candidate) for candidate in URL_CANDIDATES]
        ckan_results, url_results = await asyncio.gather(
            asyncio.gather(*ckan_tasks),
            asyncio.gather(*url_tasks),
        )

    output = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "queries": SEARCH_QUERIES,
        "ckan_results": ckan_results,
        "url_results": url_results,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
