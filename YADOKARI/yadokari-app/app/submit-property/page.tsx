import type { Metadata } from "next";
import SubmitPropertyForm from "./SubmitPropertyForm";

export const metadata: Metadata = {
  title: "民泊物件を掲載する | YADOKARI",
  description:
    "YADOKARIに民泊物件を掲載しませんか？民泊投資家・運営代行会社に向けて物件情報を公開し、問い合わせを受け付けます。",
};

export default function SubmitPropertyPage() {
  return <SubmitPropertyForm />;
}
