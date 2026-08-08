import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-start justify-center gap-4 p-8 font-sans">
      <h1 className="text-2xl font-medium tracking-tight text-[#ededed]">
        HelioGrid Complex
      </h1>
      <p className="max-w-md text-sm text-[#a1a1a1]">
        Empty shell placeholder. Landing terminal arrives in milestone 2.
      </p>
      <Link
        href="/experience"
        className="text-sm text-[#ededed] underline underline-offset-4 hover:text-white"
      >
        Enter /experience
      </Link>
    </main>
  );
}
