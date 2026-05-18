// 民泊収益シミュレーターロジック

export interface SimulatorInput {
  propertyRent: number;       // 物件賃料（円/月）
  nightlyRate: number;        // 宿泊単価（円/泊）
  occupancyRate: number;      // 稼働率（0〜100の%値）
  operatingDaysPerYear: number; // 年間営業日数（最大365、住宅宿泊は180）
  cleaningFee: number;        // 清掃費（円/回）
  platformFee: number;        // プラットフォーム手数料（%）
  otherMonthlyCost: number;   // その他月間経費（管理費・消耗品等）
}

export interface SimulatorOutput {
  monthlyRevenue: number;       // 月間売上
  monthlyOperatingCost: number; // 月間運営コスト（清掃費 + 手数料 + その他）
  monthlyProfit: number;        // 月間利益（売上 - 運営コスト - 賃料）
  annualRevenue: number;        // 年間売上
  annualProfit: number;         // 年間利益
  grossYield: number;           // 表面利回り（%）— 年間売上 / (賃料×12) × 100
  netYield: number;             // 実質利回り（%）— 年間利益 / (賃料×12) × 100
  monthlyBookings: number;      // 月間予約件数
  breakEvenOccupancy: number;   // 損益分岐点稼働率（%）
}

export function simulate(input: SimulatorInput): SimulatorOutput {
  const {
    propertyRent,
    nightlyRate,
    occupancyRate,
    operatingDaysPerYear,
    cleaningFee,
    platformFee,
    otherMonthlyCost,
  } = input;

  // 月換算営業日数
  const monthlyOperatingDays = operatingDaysPerYear / 12;

  // 稼働率を適用した月間宿泊日数
  const occupancyDecimal = occupancyRate / 100;
  const monthlyBookedDays = monthlyOperatingDays * occupancyDecimal;

  // 月間売上（宿泊料）
  const monthlyRevenue = monthlyBookedDays * nightlyRate;

  // 清掃費（平均1.5泊に1回）
  const monthlyCleanings = monthlyBookedDays / 1.5;
  const monthlyCleaning = monthlyCleanings * cleaningFee;

  // プラットフォーム手数料
  const monthlyPlatformFee = monthlyRevenue * (platformFee / 100);

  // 月間運営コスト合計
  const monthlyOperatingCost = monthlyCleaning + monthlyPlatformFee + otherMonthlyCost;

  // 月間利益（賃料控除後）
  const monthlyProfit = monthlyRevenue - monthlyOperatingCost - propertyRent;

  // 年間数値
  const annualRevenue = monthlyRevenue * 12;
  const annualProfit = monthlyProfit * 12;

  // 利回り計算（賃料×12を元本として計算）
  const annualRentCost = propertyRent * 12;
  const grossYield = annualRentCost > 0 ? (annualRevenue / annualRentCost) * 100 : 0;
  const netYield = annualRentCost > 0 ? (annualProfit / annualRentCost) * 100 : 0;

  // 月間予約件数（平均2泊/予約と仮定）
  const monthlyBookings = monthlyBookedDays / 2;

  // 損益分岐点稼働率（賃料 + 運営コスト固定分 をカバーできる稼働率）
  const fixedMonthlyCost = propertyRent + otherMonthlyCost;
  const revenuePerBookedDay = nightlyRate - (cleaningFee / 1.5) - (nightlyRate * platformFee / 100);
  const breakEvenDays = revenuePerBookedDay > 0 ? fixedMonthlyCost / revenuePerBookedDay : 0;
  const breakEvenOccupancy = (breakEvenDays / monthlyOperatingDays) * 100;

  return {
    monthlyRevenue: Math.round(monthlyRevenue),
    monthlyOperatingCost: Math.round(monthlyOperatingCost),
    monthlyProfit: Math.round(monthlyProfit),
    annualRevenue: Math.round(annualRevenue),
    annualProfit: Math.round(annualProfit),
    grossYield: Math.round(grossYield * 10) / 10,
    netYield: Math.round(netYield * 10) / 10,
    monthlyBookings: Math.round(monthlyBookings * 10) / 10,
    breakEvenOccupancy: Math.min(100, Math.round(breakEvenOccupancy * 10) / 10),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}
