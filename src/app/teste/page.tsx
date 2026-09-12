import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Fazer o teste",
  robots: { index: false },
};

export default function TestePage() {
  return <Quiz />;
}
