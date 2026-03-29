import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-black overflow-hidden selection:bg-white selection:text-black">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="w-full max-w-[900px] mx-auto p-8 relative min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
