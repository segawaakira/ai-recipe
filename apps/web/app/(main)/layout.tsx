import { Header } from "components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />
      <div className="p-4">
        <div className="max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
}
