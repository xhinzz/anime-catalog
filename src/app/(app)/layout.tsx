import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0B14]">
      <Sidebar />
      <main className="ml-[210px]">{children}</main>
    </div>
  );
}
