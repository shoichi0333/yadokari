export type ExternalMinpakuPropertyLink = {
  id: string;
  name: string;
  href: string;
  category: "rent" | "sale" | "mixed";
  sourceType: string;
  coverage: string;
  summary: string;
  tags: string[];
  yadokariChecks: string[];
};

export const EXTERNAL_MINPAKU_PROPERTY_LINKS: ExternalMinpakuPropertyLink[] = [
  {
    id: "minpaku-market-rent",
    name: "民泊マーケット 賃貸物件",
    href: "https://www.minpaku-market.com/listings/rent",
    category: "rent",
    sourceType: "民泊可・相談可の賃貸掲載",
    coverage: "首都圏を中心に全国",
    summary:
      "民泊相談可、旅館業相談可、一棟貸し、戸建てなどを探しやすい外部掲載元です。",
    tags: ["賃貸", "民泊相談可", "一棟", "戸建て"],
    yadokariChecks: ["用途地域", "周辺届出数", "想定賃料負担", "消防・許認可の確認"],
  },
  {
    id: "minpaku-bukken",
    name: "民泊物件.com",
    href: "https://minpaku-bukken.com/",
    category: "mixed",
    sourceType: "民泊可能物件専門ポータル",
    coverage: "全国",
    summary:
      "旅館業取得済み、民泊相談可、空室・空家活用などの掲載を確認できる外部ポータルです。",
    tags: ["賃貸", "売買", "旅館業", "空室活用"],
    yadokariChecks: ["制度種別", "運用日数上限", "競合密度", "出口戦略"],
  },
  {
    id: "yukatsu",
    name: "ユウカツ 物件検索",
    href: "https://yukatsu.jp/properties",
    category: "mixed",
    sourceType: "民泊・レンタルスペース向け物件",
    coverage: "全国",
    summary:
      "民泊、レンタルスペース、店舗利用など、用途の幅がある物件を探せる外部サイトです。",
    tags: ["賃貸", "売買", "レンタルスペース", "事業用"],
    yadokariChecks: ["用途地域", "近隣需要", "初期費用", "運営形態"],
  },
  {
    id: "minpaku-information",
    name: "民泊物件ナビ",
    href: "https://www.minpaku-information.com/",
    category: "mixed",
    sourceType: "民泊可能性のある物件情報",
    coverage: "全国",
    summary:
      "民泊利用の可能性がある物件情報を記事型で確認できる外部サイトです。",
    tags: ["賃貸", "売買", "旅館業", "地方物件"],
    yadokariChecks: ["自治体確認", "収益目安", "改修余地", "現地需要"],
  },
  {
    id: "airbnb-minpaku",
    name: "民泊賃貸",
    href: "https://airbnb-minpaku.com/propertylisting/",
    category: "rent",
    sourceType: "転貸・Airbnb可能物件紹介",
    coverage: "全国",
    summary:
      "転貸やAirbnb運用を相談できる物件を探すための外部掲載元です。",
    tags: ["賃貸", "転貸相談", "Airbnb", "運用相談"],
    yadokariChecks: ["転貸承諾", "管理規約", "届出可否", "収支シミュレーション"],
  },
];

export const PROPERTY_LINK_DISCLAIMERS = [
  "YADOKARIは外部掲載元の物件情報を転載せず、掲載元へのリンクと投資判断のチェック項目を提供します。",
  "民泊可・相談可の表記があっても、契約条件、管理規約、転貸承諾、消防・保健所要件は掲載元または専門家へ確認してください。",
  "YADOKARI確認済み物件は、今後の審査フローで別ラベルとして扱います。",
];
