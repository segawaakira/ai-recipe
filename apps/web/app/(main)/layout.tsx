import { Header } from "components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="p-4">
        <div className="max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
}
