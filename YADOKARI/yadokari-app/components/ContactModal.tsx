"use client";

import { useState } from "react";
import { Phone, X, CheckCircle2, Send } from "lucide-react";
import type { Property } from "@/lib/data/properties";

export default function ContactModal({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "お名前を入力してください";
    if (!form.email.includes("@")) e.email = "正しいメールアドレスを入力してください";
    if (form.message.trim().length < 10) e.message = "10文字以上入力してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setSent(false); setForm({ name: "", email: "", message: "" }); setErrors({}); }, 300);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
      >
        <Phone size={15} />
        この物件に問い合わせる
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            {sent ? (
              <div className="text-center py-6">
                <CheckCircle2 size={48} className="text-teal-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">お問い合わせを受け付けました</h3>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium text-gray-700">{form.email}</span> 宛に確認メールをお送りしました。
                </p>
                <p className="text-gray-400 text-xs mb-6">通常2営業日以内にご連絡いたします</p>
                <button
                  onClick={handleClose}
                  className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">物件へのお問い合わせ</h3>
                <p className="text-gray-500 text-xs mb-5 leading-relaxed">
                  {property.title}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">お名前</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="山田 太郎"
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.name ? "border-red-300" : "border-gray-200"}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="example@email.com"
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? "border-red-300" : "border-gray-200"}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">お問い合わせ内容</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="内覧希望日時、民泊許可の確認など、お気軽にご記入ください"
                      rows={4}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${errors.message ? "border-red-300" : "border-gray-200"}`}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? "送信中..." : <><Send size={14} /> 送信する</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
