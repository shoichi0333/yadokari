import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ | YADOKARI",
  description: "YADOKARIへのお問い合わせはこちらから。民泊可否・料金プラン・物件情報などについてお気軽にどうぞ。",
};

export default function ContactPage() {
  return (
    <Suspense>
      <ContactForm />
    </Suspense>
  );
}
