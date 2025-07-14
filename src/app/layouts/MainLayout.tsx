import { RequestInfo } from "rwsdk/worker";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

type MainLayoutProps = {
  children: React.ReactNode;
  ctx: RequestInfo["ctx"];
};

export function MainLayout({ children, ctx }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation ctx={ctx} />

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
