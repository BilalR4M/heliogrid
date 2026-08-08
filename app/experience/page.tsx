"use client";

import dynamic from "next/dynamic";

const ExperienceCanvas = dynamic(() => import("@/components/scene/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-[#0a0a0a] text-sm text-[#a1a1a1]">
      Loading canvas…
    </div>
  ),
});

export default function ExperiencePage() {
  return <ExperienceCanvas />;
}
