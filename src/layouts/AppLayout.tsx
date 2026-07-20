import type { ReactNode } from "react";
import Sidebar from "../components/navigation/Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-layout__content">{children}</div>
    </div>
  );
}

export default AppLayout;