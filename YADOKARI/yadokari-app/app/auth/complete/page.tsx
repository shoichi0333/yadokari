import { Suspense } from "react";
import CompleteClient from "./CompleteClient";

export default function AuthCompletePage() {
  return (
    <Suspense>
      <CompleteClient />
    </Suspense>
  );
}
