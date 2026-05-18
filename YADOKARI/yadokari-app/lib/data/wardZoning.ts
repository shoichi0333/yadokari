import { getMinpakuInfo } from "@/lib/minpaku";
import type { MinpakuInfo } from "@/lib/minpaku";

export interface WardZoningData {
  prefecture: string;
  ward: string;
  typicalZoning: string;
  tokkuArea: boolean;
  notes: string;
  suumoUrl: string;
}

export const WARD_ZONING_MAP: WardZoningData[] = [
  // 東京23区
  { prefecture: "東京都", ward: "港区", typicalZoning: "商業地域", tokkuArea: false, notes: "麻布・赤坂・六本木など商業・住宅混在。旅館業許可の需要が高いエリア。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_minato/" },
  { prefecture: "東京都", ward: "中野区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅街が中心。住宅宿泊事業（年180日）が可能な地域が多い。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_nakano/" },
  { prefecture: "東京都", ward: "新宿区", typicalZoning: "商業地域", tokkuArea: false, notes: "新宿・高田馬場周辺は商業地域。旅館業・住宅宿泊ともに需要あり。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_shinjuku/" },
  { prefecture: "東京都", ward: "台東区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "浅草・上野周辺。観光地隣接で旅館業需要が高い。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_taito/" },
  { prefecture: "東京都", ward: "大田区", typicalZoning: "第一種住居地域", tokkuArea: true, notes: "国家戦略特区認定。特区民泊（日数制限なし）が可能な東京唯一の区。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_ota/" },
  { prefecture: "東京都", ward: "渋谷区", typicalZoning: "商業地域", tokkuArea: false, notes: "渋谷・原宿・恵比寿。商業地域が多く旅館業が有利。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_shibuya/" },
  { prefecture: "東京都", ward: "世田谷区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅街が中心。住宅宿泊事業（年180日）が中心。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_setagaya/" },
  { prefecture: "東京都", ward: "杉並区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_suginami/" },
  { prefecture: "東京都", ward: "豊島区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "池袋周辺は商業地域。住宅宿泊・旅館業ともに可能な地域が混在。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_toshima/" },
  { prefecture: "東京都", ward: "墨田区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "スカイツリー・錦糸町周辺。観光需要あり。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_sumida/" },
  { prefecture: "東京都", ward: "江東区", typicalZoning: "準工業地域", tokkuArea: false, notes: "臨海部は準工業・工業地域が混在。住所によって判定が異なる場合あり。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_koto/" },
  { prefecture: "東京都", ward: "品川区", typicalZoning: "商業地域", tokkuArea: false, notes: "品川駅周辺は商業地域。住宅宿泊・旅館業ともに需要あり。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_shinagawa/" },
  { prefecture: "東京都", ward: "目黒区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_meguro/" },
  { prefecture: "東京都", ward: "文京区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅・文教地区。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_bunkyo/" },
  { prefecture: "東京都", ward: "千代田区", typicalZoning: "商業地域", tokkuArea: false, notes: "都心商業地区。旅館業許可の需要が高い。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_chiyoda/" },
  { prefecture: "東京都", ward: "中央区", typicalZoning: "商業地域", tokkuArea: false, notes: "銀座・日本橋・月島。商業地域が多い。旅館業需要あり。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_chuo/" },
  { prefecture: "東京都", ward: "荒川区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅・商業混在。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_arakawa/" },
  { prefecture: "東京都", ward: "北区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_kita/" },
  { prefecture: "東京都", ward: "板橋区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_itabashi/" },
  { prefecture: "東京都", ward: "練馬区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "閑静な住宅街が多い。住宅宿泊事業は可能だが需要は限定的。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_nerima/" },
  { prefecture: "東京都", ward: "足立区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_adachi/" },
  { prefecture: "東京都", ward: "葛飾区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_katsushika/" },
  { prefecture: "東京都", ward: "江戸川区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_edogawa/" },
  // 神奈川県
  { prefecture: "神奈川県", ward: "中区", typicalZoning: "商業地域", tokkuArea: false, notes: "横浜中華街・山下公園周辺。観光地で旅館業需要あり。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_naka/" },
  { prefecture: "神奈川県", ward: "西区", typicalZoning: "商業地域", tokkuArea: false, notes: "横浜駅西口・みなとみらい。商業地域が多い。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_nishi/" },
  // 愛知県
  { prefecture: "愛知県", ward: "中区", typicalZoning: "商業地域", tokkuArea: false, notes: "名古屋城・栄周辺。観光と商業が混在。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_naka/" },
  { prefecture: "愛知県", ward: "熱田区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "熱田神宮周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_atsuta/" },
  // 兵庫県
  { prefecture: "兵庫県", ward: "中央区", typicalZoning: "商業地域", tokkuArea: false, notes: "三宮・元町・北野。旅館業需要が高い観光エリア。", suumoUrl: "https://suumo.jp/chintai/hyogo/sc_kobe_chuo/" },
  // 大阪府
  { prefecture: "大阪府", ward: "浪速区", typicalZoning: "商業地域", tokkuArea: true, notes: "なんば・道頓堀。国家戦略特区。特区民泊（日数制限なし）が可能。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_naniwa/" },
  { prefecture: "大阪府", ward: "中央区", typicalZoning: "商業地域", tokkuArea: true, notes: "心斎橋・難波。国家戦略特区。特区民泊・旅館業ともに需要あり。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_chuo/" },
  { prefecture: "大阪府", ward: "北区", typicalZoning: "商業地域", tokkuArea: true, notes: "梅田・大阪駅周辺。国家戦略特区。旅館業需要が高い。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_kita/" },
  { prefecture: "大阪府", ward: "西区", typicalZoning: "商業地域", tokkuArea: true, notes: "肥後橋・堀江。国家戦略特区エリア。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_nishi/" },
  { prefecture: "大阪府", ward: "福島区", typicalZoning: "近隣商業地域", tokkuArea: true, notes: "国家戦略特区。住宅宿泊・特区民泊ともに可能。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_fukushima/" },
  { prefecture: "大阪府", ward: "天王寺区", typicalZoning: "商業地域", tokkuArea: true, notes: "通天閣・新世界周辺。国家戦略特区。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_tennoji/" },
  // 京都府
  { prefecture: "京都府", ward: "東山区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "祇園・清水寺周辺。住宅宿泊は年180日制限。旅館業許可が主流。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_higashiyama/" },
  { prefecture: "京都府", ward: "下京区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "京都駅周辺。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_shimogyo/" },
  { prefecture: "京都府", ward: "中京区", typicalZoning: "商業地域", tokkuArea: false, notes: "四条・三条周辺。観光地隣接で旅館業需要高い。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_nakagyo/" },
  // 福岡県
  { prefecture: "福岡県", ward: "博多区", typicalZoning: "商業地域", tokkuArea: false, notes: "博多駅・中洲周辺。アジア観光客需要あり。旅館業・住宅宿泊ともに可能。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_fukuoka_hakata/" },
  { prefecture: "福岡県", ward: "中央区", typicalZoning: "商業地域", tokkuArea: false, notes: "天神・大濠公園周辺。商業地域が多い。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_fukuoka_chuo/" },
  // 北海道
  { prefecture: "北海道", ward: "中央区", typicalZoning: "商業地域", tokkuArea: false, notes: "札幌すすきの・大通公園。スキー・冬季インバウンド需要。", suumoUrl: "https://suumo.jp/chintai/hokkaido/sc_sapporo_chuo/" },
  // 沖縄県
  { prefecture: "沖縄県", ward: "那覇市", typicalZoning: "商業地域", tokkuArea: false, notes: "国際通り・首里城周辺。リゾート民泊需要が高い。", suumoUrl: "https://suumo.jp/chintai/okinawa/sc_naha/" },
  // 愛知県 名古屋市（残り14区）
  { prefecture: "愛知県", ward: "千種区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "覚王山・今池周辺。住宅宿泊事業向け。学生・若者向け賃貸が多い。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_chikusa/" },
  { prefecture: "愛知県", ward: "東区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "徳川園・白壁周辺。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_higashi/" },
  { prefecture: "愛知県", ward: "北区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_kita/" },
  { prefecture: "愛知県", ward: "西区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "庄内・浄心周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_nishi/" },
  { prefecture: "愛知県", ward: "中村区", typicalZoning: "商業地域", tokkuArea: false, notes: "名古屋駅西側・太閤通周辺。旅館業需要が高いエリア。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_nakamura/" },
  { prefecture: "愛知県", ward: "昭和区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。名古屋大学周辺。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_showa/" },
  { prefecture: "愛知県", ward: "瑞穂区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_mizuho/" },
  { prefecture: "愛知県", ward: "中川区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅・工業混在。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_nakagawa/" },
  { prefecture: "愛知県", ward: "南区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "住宅・商業混在。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_minami/" },
  { prefecture: "愛知県", ward: "港区", typicalZoning: "準工業地域", tokkuArea: false, notes: "名古屋港周辺。工業・住宅混在。住宅宿泊事業向け（一部不可エリアあり）。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_minato/" },
  { prefecture: "愛知県", ward: "守山区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "郊外住宅エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_moriyama/" },
  { prefecture: "愛知県", ward: "緑区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "郊外住宅エリア。閑静な住宅街。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_midori/" },
  { prefecture: "愛知県", ward: "名東区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "郊外住宅エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_meito/" },
  { prefecture: "愛知県", ward: "天白区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "郊外住宅エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_nagoya_tenpaku/" },
  // 愛知県 その他主要市
  { prefecture: "愛知県", ward: "豊橋市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "豊橋駅周辺。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_toyohashi/" },
  { prefecture: "愛知県", ward: "岡崎市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "岡崎城・康生町周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_okazaki/" },
  { prefecture: "愛知県", ward: "一宮市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_ichinomiya/" },
  { prefecture: "愛知県", ward: "豊田市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/aichi/sc_toyota/" },
  // 東京都 多摩地区主要市
  { prefecture: "東京都", ward: "八王子市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "多摩地区最大都市。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_hachioji/" },
  { prefecture: "東京都", ward: "立川市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "多摩地区の商業拠点。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_tachikawa/" },
  { prefecture: "東京都", ward: "武蔵野市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "吉祥寺周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_musashino/" },
  { prefecture: "東京都", ward: "三鷹市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_mitaka/" },
  { prefecture: "東京都", ward: "府中市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅・商業混在。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_fuchu/" },
  { prefecture: "東京都", ward: "調布市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tokyo/sc_chofu/" },
  // 神奈川県 横浜市（残り区）
  { prefecture: "神奈川県", ward: "鶴見区", typicalZoning: "準工業地域", tokkuArea: false, notes: "住宅・工業混在エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_tsurumi/" },
  { prefecture: "神奈川県", ward: "神奈川区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "横浜駅北側。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_kanagawa/" },
  { prefecture: "神奈川県", ward: "港北区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "日吉・綱島周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_kohoku/" },
  { prefecture: "神奈川県", ward: "都筑区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "港北ニュータウン。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_tsuzuki/" },
  { prefecture: "神奈川県", ward: "保土ケ谷区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_hodogaya/" },
  { prefecture: "神奈川県", ward: "旭区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_asahi/" },
  { prefecture: "神奈川県", ward: "磯子区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅・港湾混在。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_isogo/" },
  { prefecture: "神奈川県", ward: "金沢区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "八景島・金沢文庫周辺。住宅宿泊・旅館業可能。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_kanazawa/" },
  { prefecture: "神奈川県", ward: "港南区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_konan/" },
  { prefecture: "神奈川県", ward: "戸塚区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "郊外住宅エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_totsuka/" },
  { prefecture: "神奈川県", ward: "南区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_minami/" },
  { prefecture: "神奈川県", ward: "緑区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_midori/" },
  { prefecture: "神奈川県", ward: "瀬谷区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "閑静な住宅街。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_seya/" },
  { prefecture: "神奈川県", ward: "泉区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "郊外住宅エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_izumi/" },
  { prefecture: "神奈川県", ward: "栄区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "郊外住宅エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_yokohama_sakae/" },
  // 神奈川県 川崎市（全7区）
  { prefecture: "神奈川県", ward: "川崎区", typicalZoning: "準工業地域", tokkuArea: false, notes: "工業・住宅混在。住宅宿泊事業向け（一部不可エリアあり）。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kawasaki_kawasaki/" },
  { prefecture: "神奈川県", ward: "幸区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "川崎駅北側。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kawasaki_saiwai/" },
  { prefecture: "神奈川県", ward: "中原区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "武蔵小杉周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kawasaki_nakahara/" },
  { prefecture: "神奈川県", ward: "高津区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "溝の口周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kawasaki_takatsu/" },
  { prefecture: "神奈川県", ward: "多摩区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "登戸・向ヶ丘遊園周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kawasaki_tama/" },
  { prefecture: "神奈川県", ward: "宮前区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "閑静な住宅街。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kawasaki_miyamae/" },
  { prefecture: "神奈川県", ward: "麻生区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "新百合ヶ丘周辺。閑静な住宅街。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kawasaki_asao/" },
  // 兵庫県 神戸市（追加区）
  { prefecture: "兵庫県", ward: "東灘区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "芦屋・甲南山手周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hyogo/sc_kobe_higashinada/" },
  { prefecture: "兵庫県", ward: "灘区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "六甲道周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hyogo/sc_kobe_nada/" },
  { prefecture: "兵庫県", ward: "兵庫区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "神戸港周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hyogo/sc_kobe_hyogo/" },
  { prefecture: "兵庫県", ward: "長田区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "商業・住宅混在。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hyogo/sc_kobe_nagata/" },
  // 大阪府（追加区）
  { prefecture: "大阪府", ward: "西成区", typicalZoning: "商業地域", tokkuArea: true, notes: "新今宮・通天閣周辺。国家戦略特区。特区民泊可能。訪日外国人需要高い。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_nishinari/" },
  { prefecture: "大阪府", ward: "住之江区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_suminoe/" },
  { prefecture: "大阪府", ward: "住吉区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_sumiyoshi/" },
  { prefecture: "大阪府", ward: "生野区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_ikuno/" },
  { prefecture: "大阪府", ward: "旭区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/osaka/sc_osaka_asahi/" },
  // 北海道 札幌市（追加区）
  { prefecture: "北海道", ward: "豊平区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "月寒・平岸周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hokkaido/sc_sapporo_toyohira/" },
  { prefecture: "北海道", ward: "北区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hokkaido/sc_sapporo_kita/" },
  { prefecture: "北海道", ward: "東区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hokkaido/sc_sapporo_higashi/" },
  // 静岡県
  { prefecture: "静岡県", ward: "葵区", typicalZoning: "商業地域", tokkuArea: false, notes: "静岡駅北側・浅間神社周辺。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/shizuoka/sc_shizuoka_aoi/" },
  { prefecture: "静岡県", ward: "駿河区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "静岡市南部。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/shizuoka/sc_shizuoka_suruga/" },
  { prefecture: "静岡県", ward: "浜松市中央区", typicalZoning: "商業地域", tokkuArea: false, notes: "浜松駅周辺。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/shizuoka/sc_hamamatsu_naka/" },
  // 京都府（追加区）
  { prefecture: "京都府", ward: "上京区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "京都御所・西陣織の街。住宅宿泊事業が中心。歴史的町家の転用需要あり。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_kamigyo/" },
  { prefecture: "京都府", ward: "伏見区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "伏見稲荷・月桂冠大蔵記念館周辺。外国人観光客需要が高い。住宅宿泊向け。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_fushimi/" },
  { prefecture: "京都府", ward: "左京区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "銀閣寺・哲学の道・岡崎周辺。閑静な住宅街が多く住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_sakyo/" },
  { prefecture: "京都府", ward: "右京区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "嵯峨嵐山・渡月橋周辺。観光地に隣接した住宅街。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_ukyo/" },
  { prefecture: "京都府", ward: "北区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "金閣寺・鷹峯周辺。住宅宿泊事業向け。京都北部観光の拠点。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_kita/" },
  { prefecture: "京都府", ward: "西京区", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "桂離宮・松尾大社周辺。閑静な住宅街。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/kyoto/sc_kyoto_nishikyo/" },
  // 福岡県（追加区）
  { prefecture: "福岡県", ward: "早良区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "西新・百道浜周辺。住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_fukuoka_sawara/" },
  { prefecture: "福岡県", ward: "南区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "大橋・高宮周辺。住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_fukuoka_minami/" },
  { prefecture: "福岡県", ward: "東区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "香椎・箱崎周辺。住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_fukuoka_higashi/" },
  { prefecture: "福岡県", ward: "城南区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "七隈・別府周辺。住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_fukuoka_jonan/" },
  { prefecture: "福岡県", ward: "西区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "今宿・姪浜周辺。住宅・工業混在。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_fukuoka_nishi/" },
  // 沖縄県（リゾートエリア）
  { prefecture: "沖縄県", ward: "石垣市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "石垣島全域。リゾート民泊需要が非常に高い。住宅宿泊・旅館業ともに可能なエリアあり。", suumoUrl: "https://suumo.jp/chintai/okinawa/sc_ishigaki/" },
  { prefecture: "沖縄県", ward: "宮古島市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "宮古島全域。リゾートスポットとして外国人観光客需要急増中。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/okinawa/sc_miyakojima/" },
  { prefecture: "沖縄県", ward: "恩納村", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "万座毛・沖縄美ら海水族館近郊。ビーチリゾートエリア。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/okinawa/" },
  // 奈良県
  { prefecture: "奈良県", ward: "奈良市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "東大寺・春日大社周辺。訪日外国人観光客が急増。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/nara/sc_nara/" },
  // 長野県（リゾート・観光地）
  { prefecture: "長野県", ward: "長野市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "善光寺周辺・長野駅エリア。スキーシーズン需要あり。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/nagano/sc_nagano/" },
  { prefecture: "長野県", ward: "松本市", typicalZoning: "商業地域", tokkuArea: false, notes: "松本城周辺。外国人観光客が多く旅館業需要あり。住宅宿泊事業も可能。", suumoUrl: "https://suumo.jp/chintai/nagano/sc_matsumoto/" },
  { prefecture: "長野県", ward: "白馬村", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "白馬スキー場周辺。冬季インバウンド需要が非常に高い。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/nagano/" },
  { prefecture: "長野県", ward: "軽井沢町", typicalZoning: "第一種低層住居専用地域", tokkuArea: false, notes: "軽井沢リゾートエリア。別荘転用型の住宅宿泊が多い。夏季需要が高い。", suumoUrl: "https://suumo.jp/chintai/nagano/sc_karuizawa/" },
  // 千葉県
  { prefecture: "千葉県", ward: "浦安市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "舞浜・東京ディズニーリゾート近郊。観光需要あり。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/chiba/sc_urayasu/" },
  { prefecture: "千葉県", ward: "成田市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "成田空港周辺。外国人旅行者の宿泊需要が高い。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/chiba/sc_narita/" },
  // 広島県
  { prefecture: "広島県", ward: "中区", typicalZoning: "商業地域", tokkuArea: false, notes: "広島駅・原爆ドーム周辺。観光地として外国人需要が増加中。旅館業・住宅宿泊ともに可能。", suumoUrl: "https://suumo.jp/chintai/hiroshima/sc_hiroshima_naka/" },
  { prefecture: "広島県", ward: "廿日市市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "宮島（厳島神社）への玄関口。観光地として外国人需要が高い。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/hiroshima/sc_hatsukaichi/" },
  // 宮城県
  { prefecture: "宮城県", ward: "青葉区", typicalZoning: "商業地域", tokkuArea: false, notes: "仙台駅・国分町周辺。東北最大都市の中心部。旅館業・住宅宿泊ともに可能。", suumoUrl: "https://suumo.jp/chintai/miyagi/sc_sendai_aoba/" },
  { prefecture: "宮城県", ward: "宮城野区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/miyagi/sc_sendai_miyagino/" },
  // 埼玉県
  { prefecture: "埼玉県", ward: "大宮区", typicalZoning: "商業地域", tokkuArea: false, notes: "大宮駅周辺。新幹線停車駅でビジネス需要あり。住宅宿泊・旅館業ともに可能。", suumoUrl: "https://suumo.jp/chintai/saitama/sc_saitama_omiya/" },
  { prefecture: "埼玉県", ward: "浦和区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "浦和駅周辺。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/saitama/sc_saitama_urawa/" },
  // 熊本県
  { prefecture: "熊本県", ward: "熊本市中央区", typicalZoning: "商業地域", tokkuArea: false, notes: "熊本城・下通アーケード周辺。住宅宿泊・旅館業ともに可能。インバウンド需要あり。", suumoUrl: "https://suumo.jp/chintai/kumamoto/sc_kumamoto_chuo/" },
  // 栃木県
  { prefecture: "栃木県", ward: "日光市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "日光東照宮周辺。世界遺産観光地として外国人需要が高い。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/tochigi/sc_nikko/" },
  // 新潟県（国家戦略特区）
  { prefecture: "新潟県", ward: "中央区", typicalZoning: "商業地域", tokkuArea: true, notes: "新潟駅・古町周辺。国家戦略特区認定。特区民泊（日数制限なし）が可能。日本海側の拠点都市。", suumoUrl: "https://suumo.jp/chintai/niigata/sc_niigata_chuo/" },
  { prefecture: "新潟県", ward: "東区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/niigata/sc_niigata_higashi/" },
  { prefecture: "新潟県", ward: "西区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/niigata/sc_niigata_nishi/" },
  // 千葉県（追加区）
  { prefecture: "千葉県", ward: "中央区", typicalZoning: "商業地域", tokkuArea: true, notes: "千葉駅・中心部。国家戦略特区認定エリア。特区民泊（日数制限なし）が可能。", suumoUrl: "https://suumo.jp/chintai/chiba/sc_chiba_chuo/" },
  { prefecture: "千葉県", ward: "花見川区", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "住宅エリアが主体。住宅宿泊事業向け。", suumoUrl: "https://suumo.jp/chintai/chiba/sc_chiba_hanamigawa/" },
  // 福岡県（北九州市）
  { prefecture: "福岡県", ward: "小倉北区", typicalZoning: "商業地域", tokkuArea: true, notes: "小倉駅・旦過市場周辺。国家戦略特区認定。特区民泊可能。九州北部の拠点都市。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_kitakyushu_kokuraminami/" },
  { prefecture: "福岡県", ward: "八幡東区", typicalZoning: "準工業地域", tokkuArea: false, notes: "工業・住宅混在。住宅宿泊事業向け（一部不可エリアあり）。", suumoUrl: "https://suumo.jp/chintai/fukuoka/sc_kitakyushu_yahata_higashi/" },
  { prefecture: "石川県", ward: "金沢市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "金沢駅・香林坊・片町周辺は近隣商業地域。観光都市として旅館業需要が高い。住宅宿泊事業も可能。", suumoUrl: "https://suumo.jp/chintai/ishikawa/sc_kanazawa/" },
  { prefecture: "静岡県", ward: "熱海市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "温泉観光地として旅館業需要が非常に高い。住宅宿泊事業も届出のみで可能。", suumoUrl: "https://suumo.jp/chintai/shizuoka/sc_atami/" },
  { prefecture: "岡山県", ward: "岡山市北区", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "岡山駅周辺は近隣商業地域。住宅宿泊事業・旅館業ともに可能な地域が多い。", suumoUrl: "https://suumo.jp/chintai/okayama/sc_okayama/" },
  { prefecture: "神奈川県", ward: "鎌倉市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "歴史的観光地。住居地域が主体で住宅宿泊事業向け。旅館業は一部エリアで可能。", suumoUrl: "https://suumo.jp/chintai/kanagawa/sc_kamakura/" },
  { prefecture: "長崎県", ward: "長崎市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "観光都市。坂の街として有名。住宅宿泊事業が主体。旅館業許可も取得可能。", suumoUrl: "https://suumo.jp/chintai/nagasaki/sc_nagasaki/" },
  { prefecture: "愛媛県", ward: "松山市", typicalZoning: "近隣商業地域", tokkuArea: false, notes: "道後温泉・松山城周辺は観光地。旅館業需要が高く住宅宿泊事業も可能。", suumoUrl: "https://suumo.jp/chintai/ehime/sc_matsuyama/" },
  { prefecture: "岐阜県", ward: "高山市", typicalZoning: "第一種住居地域", tokkuArea: false, notes: "飛騨高山は外国人観光客が多い観光地。住宅宿泊事業向け。旅館業許可も取得可能。", suumoUrl: "https://suumo.jp/chintai/gifu/sc_takayama/" },
  // 兵庫県
  { prefecture: '兵庫県', ward: '神戸市', typicalZoning: '近隣商業地域', tokkuArea: false, notes: '神戸市全域の代表エントリ。三宮・元町周辺は商業地域で旅館業需要が高い。住宅宿泊事業も可能。', suumoUrl: 'https://suumo.jp/chintai/hyogo/sc_kobe/' },
  { prefecture: '兵庫県', ward: '姫路市', typicalZoning: '第一種住居地域', tokkuArea: false, notes: '姫路城周辺は観光需要あり。住宅宿泊事業が主体。旅館業も一部エリアで可能。', suumoUrl: 'https://suumo.jp/chintai/hyogo/sc_himeji/' },
  // 北海道
  { prefecture: '北海道', ward: '旭川市', typicalZoning: '第一種住居地域', tokkuArea: false, notes: '旭山動物園や大雪山麓の観光拠点。住宅宿泊事業向け。冬季スキー需要も高い。', suumoUrl: 'https://suumo.jp/chintai/hokkaido/sc_asahikawa/' },
  // 宮城県
  { prefecture: '宮城県', ward: '仙台市', typicalZoning: '近隣商業地域', tokkuArea: false, notes: '仙台市全域の代表エントリ。東北最大の都市。商業・住宅混在エリアで住宅宿泊事業・旅館業ともに可能。', suumoUrl: 'https://suumo.jp/chintai/miyagi/sc_sendai/' },
  // 埼玉県
  { prefecture: '埼玉県', ward: 'さいたま市', typicalZoning: '第一種住居地域', tokkuArea: false, notes: 'さいたま市全域の代表エントリ。大宮・浦和周辺は住宅地中心。住宅宿泊事業向け。', suumoUrl: 'https://suumo.jp/chintai/saitama/sc_saitama/' },
  // 千葉県
  { prefecture: '千葉県', ward: '千葉市', typicalZoning: '第一種住居地域', tokkuArea: false, notes: '千葉市全域の代表エントリ。商業地域周辺は住宅宿泊・旅館業ともに可能なエリアあり。', suumoUrl: 'https://suumo.jp/chintai/chiba/sc_chiba/' },
  // 静岡県
  { prefecture: '静岡県', ward: '静岡市', typicalZoning: '近隣商業地域', tokkuArea: false, notes: '静岡市全域の代表エントリ。静岡駅周辺は近隣商業地域。住宅宿泊事業・旅館業ともに可能。', suumoUrl: 'https://suumo.jp/chintai/shizuoka/sc_shizuoka/' },
  { prefecture: '静岡県', ward: '浜松市', typicalZoning: '第一種住居地域', tokkuArea: false, notes: '浜松市全域の代表エントリ。浜松駅周辺は商業地域。住宅宿泊事業が主体。', suumoUrl: 'https://suumo.jp/chintai/shizuoka/sc_hamamatsu/' },
  // 鹿児島県
  { prefecture: '鹿児島県', ward: '鹿児島市', typicalZoning: '近隣商業地域', tokkuArea: false, notes: '鹿児島中央駅・天文館周辺は商業・近隣商業地域。薩摩・屋久島観光の玄関口として旅館業需要が高い。住宅宿泊事業も可能。', suumoUrl: 'https://suumo.jp/chintai/kagoshima/sc_kagoshima/' },
];

export function findWardZoning(normalizedAddress: string): WardZoningData | null {
  for (const ward of WARD_ZONING_MAP) {
    if (normalizedAddress.includes(ward.prefecture) && normalizedAddress.includes(ward.ward)) {
      return ward;
    }
  }
  for (const ward of WARD_ZONING_MAP) {
    if (normalizedAddress.includes(ward.ward)) {
      return ward;
    }
  }
  for (const ward of WARD_ZONING_MAP) {
    const strippedWard = ward.ward.replace(/[区市]$/, "");
    if (
      strippedWard !== ward.ward &&
      normalizedAddress.includes(ward.prefecture) &&
      normalizedAddress.includes(strippedWard)
    ) {
      return ward;
    }
  }
  for (const ward of WARD_ZONING_MAP) {
    const strippedWard = ward.ward.replace(/[区市]$/, "");
    if (strippedWard !== ward.ward && normalizedAddress.includes(strippedWard)) {
      return ward;
    }
  }
  return null;
}

export function getEligibilityFromWard(wardData: WardZoningData): MinpakuInfo {
  return getMinpakuInfo(wardData.typicalZoning, wardData.tokkuArea);
}
