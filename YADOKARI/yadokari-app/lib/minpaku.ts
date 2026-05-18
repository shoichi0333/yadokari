// 民泊可否判定ロジック
// 住宅宿泊事業法・旅館業法に基づく用途地域別ルール

export type MinpakuType = "JUUTAKU" | "TOKKU" | "RYOKAN" | "NG";

export interface MinpakuInfo {
  juutaku: boolean;   // 住宅宿泊事業法（年間180日上限）
  tokku: boolean;     // 国家戦略特区（日数上限なし・特定エリアのみ）
  ryokan: boolean;    // 旅館業許可（日数上限なし）
  maxDays: number | null; // 最大営業日数（nullは上限なし）
  note: string;
}

export interface ZoningRule {
  zoneName: string;
  juutaku: boolean;
  tokku: "possible" | "area_dependent" | "no";
  ryokan: boolean;
}

const ZONING_RULES: Record<string, ZoningRule> = {
  "第一種低層住居専用地域": {
    zoneName: "第一種低層住居専用地域",
    juutaku: true,
    tokku: "area_dependent",
    ryokan: false,
  },
  "第二種低層住居専用地域": {
    zoneName: "第二種低層住居専用地域",
    juutaku: true,
    tokku: "area_dependent",
    ryokan: false,
  },
  "第一種中高層住居専用地域": {
    zoneName: "第一種中高層住居専用地域",
    juutaku: true,
    tokku: "area_dependent",
    ryokan: true,
  },
  "第二種中高層住居専用地域": {
    zoneName: "第二種中高層住居専用地域",
    juutaku: true,
    tokku: "area_dependent",
    ryokan: true,
  },
  "第一種住居地域": {
    zoneName: "第一種住居地域",
    juutaku: true,
    tokku: "possible",
    ryokan: true,
  },
  "第二種住居地域": {
    zoneName: "第二種住居地域",
    juutaku: true,
    tokku: "possible",
    ryokan: true,
  },
  "準住居地域": {
    zoneName: "準住居地域",
    juutaku: true,
    tokku: "possible",
    ryokan: true,
  },
  "近隣商業地域": {
    zoneName: "近隣商業地域",
    juutaku: true,
    tokku: "possible",
    ryokan: true,
  },
  "商業地域": {
    zoneName: "商業地域",
    juutaku: true,
    tokku: "possible",
    ryokan: true,
  },
  "準工業地域": {
    zoneName: "準工業地域",
    juutaku: true,
    tokku: "no",
    ryokan: true,
  },
  "工業地域": {
    zoneName: "工業地域",
    juutaku: false,
    tokku: "no",
    ryokan: false,
  },
  "工業専用地域": {
    zoneName: "工業専用地域",
    juutaku: false,
    tokku: "no",
    ryokan: false,
  },
};

export function getMinpakuInfo(zoning: string, isTokkuArea = false): MinpakuInfo {
  const rule = ZONING_RULES[zoning];

  if (!rule) {
    return {
      juutaku: false,
      tokku: false,
      ryokan: false,
      maxDays: null,
      note: "用途地域不明のため要確認",
    };
  }

  const tokku = rule.tokku === "possible" || (rule.tokku === "area_dependent" && isTokkuArea);

  return {
    juutaku: rule.juutaku,
    tokku,
    ryokan: rule.ryokan,
    maxDays: rule.juutaku && !tokku && !rule.ryokan ? 180 : null,
    note: buildNote(rule, tokku),
  };
}

function buildNote(rule: ZoningRule, tokku: boolean): string {
  if (!rule.juutaku && !rule.ryokan) {
    return "この用途地域では民泊営業はできません";
  }
  const parts: string[] = [];
  if (rule.juutaku) parts.push("住宅宿泊事業（年間180日以内）");
  if (tokku) parts.push("国家戦略特区（日数制限なし）");
  if (rule.ryokan) parts.push("旅館業許可（日数制限なし）");
  return parts.join(" / ") + " での運営が可能です";
}

export function getMinpakuBadgeType(info: MinpakuInfo): MinpakuType {
  if (!info.juutaku && !info.tokku && !info.ryokan) return "NG";
  if (info.tokku) return "TOKKU";
  if (info.ryokan) return "RYOKAN";
  return "JUUTAKU";
}

export const MINPAKU_TYPE_LABELS: Record<MinpakuType, string> = {
  JUUTAKU: "住宅宿泊（180日）",
  TOKKU: "特区民泊（無制限）",
  RYOKAN: "旅館業許可（無制限）",
  NG: "民泊不可",
};

export const MINPAKU_TYPE_COLORS: Record<MinpakuType, string> = {
  JUUTAKU: "bg-blue-100 text-blue-800 border-blue-200",
  TOKKU: "bg-emerald-100 text-emerald-800 border-emerald-200",
  RYOKAN: "bg-purple-100 text-purple-800 border-purple-200",
  NG: "bg-red-100 text-red-800 border-red-200",
};
