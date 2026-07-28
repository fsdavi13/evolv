import { Outlet } from "react-router-dom";

import AppNavigation from "../components/AppNavigation";
import "./AppLayout.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <AppNavigation />

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;