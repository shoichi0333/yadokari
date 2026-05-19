"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, Crown, Info, TrendingUp } from "lucide-react";
import PlanGate from "@/components/PlanGate";
import { simulate, formatCurrency, SimulatorInput } from "@/lib/simulator";
import { getCurrentPlan } from "@/lib/plan";

interface Props {
  propertyRent: number;
  maxDays: number | null;
}

export default function RevenueSimulator({ propertyRent, maxDays }: Props) {
  const operatingDaysMax = maxDays ?? 365;
  const currentPlan = getCurrentPlan();
  const isFree = currentPlan === "free";
  const isPaid = !isFree;

  const [input, setInput] = useState<SimulatorInput>({
    propertyRent,
    nightlyRate: 15000,
    occupancyRate: 70,
    operatingDaysPerYear: Math.min(operatingDaysMax, 180),
    cleaningFee: 3000,
    platformFee: 15,
    otherMonthlyCost: 20000,
  });

  const result = useMemo(() => simulate(input), [input]);

  const update = (key: keyof SimulatorInput, value: number) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const isProfit = result.monthlyProfit > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-white" />
          <h3 className="text-white font-bold">収益シミュレーター</h3>
        </div>
        {!isPaid && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
            <Crown size={11} />基本版
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* 基本スライダー（全プラン） */}
        <SliderField
          label="宿泊単価"
          value={input.nightlyRate}
          min={5000}
          max={80000}
          step={1000}
          format={(v) => `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1)}万円/泊`}
          onChange={(v) => update("nightlyRate", v)}
        />
        <SliderField
          label="稼働率"
          value={input.occupancyRate}
          min={10}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => update("occupancyRate", v)}
          disabled={isFree}
          note={isFree ? "稼働率はフリープランでは70%固定です" : undefined}
        />
        <SliderField
          label="年間営業日数"
          value={input.operatingDaysPerYear}
          min={30}
          max={operatingDaysMax}
          step={10}
          format={(v) => `${v}日/年`}
          onChange={(v) => update("operatingDaysPerYear", v)}
          note={maxDays === 180 ? "住宅宿泊事業法の上限は180日/年" : undefined}
        />

        {/* 詳細スライダー（有料プランのみ） */}
        <div className="relative min-h-64">
          <div className={isPaid ? "space-y-5" : "pointer-events-none space-y-5 select-none blur-sm"}>
            <SliderField
              label="清掃費"
              value={input.cleaningFee}
              min={1000}
              max={15000}
              step={500}
              format={(v) => formatCurrency(v) + "/回"}
              onChange={(v) => update("cleaningFee", v)}
            />
            <SliderField
              label="プラットフォーム手数料"
              value={input.platformFee}
              min={3}
              max={25}
              step={1}
              format={(v) => `${v}%`}
              onChange={(v) => update("platformFee", v)}
            />
            <SliderField
              label="その他月間経費"
              value={input.otherMonthlyCost}
              min={0}
              max={100000}
              step={5000}
              format={(v) => formatCurrency(v) + "/月"}
              onChange={(v) => update("otherMonthlyCost", v)}
            />
          </div>
          {!isPaid && (
            <PlanGate
              title="詳細設定はスタンダードプラン以上で利用可能"
              description="清掃費・手数料・その他経費を調整して、より精度の高い収益試算ができます。"
              buttonLabel="スタンダードプランにアップグレード"
            />
          )}
        </div>

        {/* 結果 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className={isProfit ? "text-emerald-600" : "text-red-500"} />
            <h4 className="text-sm font-bold text-gray-900">シミュレーション結果</h4>
          </div>

          <div className="grid gap-3">
            <ResultCard
              label="月間収益"
              value={formatCurrency(result.monthlyProfit)}
              sub="賃料・運営費控除後"
              positive={isProfit}
            />
            <ResultCard
              label="年間収益"
              value={formatCurrency(result.annualProfit)}
              sub="月間収益 × 12か月"
              positive={isProfit}
            />
            <ResultCard
              label="実質利回り"
              value={`${result.netYield}%`}
              sub="年間収益 ÷ 年間賃料"
              positive={isProfit}
            />
          </div>

          {isPaid ? (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-4">
              <ResultItem label="月間売上" value={formatCurrency(result.monthlyRevenue)} />
              <ResultItem label="月間コスト" value={formatCurrency(result.monthlyOperatingCost + propertyRent)} />
              <ResultItem label="表面利回り" value={`${result.grossYield}%`} />
              <ResultItem label="損益分岐稼働率" value={`${result.breakEvenOccupancy}%`} />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="grid grid-cols-2 gap-2 blur-sm select-none sm:grid-cols-4">
                <ResultItem label="月間売上" value="¥XXX,XXX" />
                <ResultItem label="月間コスト" value="¥XXX,XXX" />
                <ResultItem label="表面利回り" value="XX.X%" />
                <ResultItem label="損益分岐稼働率" value="XX%" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-teal-700 transition-colors"
                >
                  <Crown size={11} />
                  詳細データを見る（有料）
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 flex items-start gap-1">
          <Info size={11} className="mt-0.5 flex-shrink-0" />
          あくまで試算です。実際の収益は物件状況・管理状況・季節等により異なります。
        </p>
      </div>
    </div>
  );
}

function SliderField({
  label, value, min, max, step, format, onChange, note, disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  note?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm text-gray-700 font-medium">{label}</label>
        <span className="text-sm font-bold text-teal-700">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {note && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <Info size={10} /> {note}
        </p>
      )}
    </div>
  );
}

function ResultCard({
  label, value, sub, positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  const tone = positive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-600";

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tone}`}>
      <p className="text-xs font-bold text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-normal sm:text-3xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function ResultItem({
  label, value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="truncate text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}
