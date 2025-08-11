import Header from "@/components/shared/layout/Header";
import MobileNav from "@/components/shared/layout/mobile/MobileNav";
import Footer from "@/components/shared/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="w-full border-b top-0 fixed bg-background z-50">
        <Header />
      </div>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-2 md:gap-8">
        <div className="mt-14 md:mt-16">{children}</div>
        <MobileNav className="flex md:hidden" />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
