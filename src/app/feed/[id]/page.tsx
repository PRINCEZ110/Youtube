import type { Metadata } from "next";
import TopNav from "@/components/layout/TopNav";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";
import FeedClient from "./FeedClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  await params;
  return { title: `Feed — YouTube Clone`, description: "A custom feed." };
}

export default async function FeedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-full bg-white dark:bg-black">
      <TopNav />
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6">
          <FeedClient id={id} />
        </main>
      </div>
    </div>
  );
}