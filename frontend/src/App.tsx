import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AcademiaPage from "./pages/AcademiaPage";
import CorridasPage from "./pages/CorridasPage";
import DashboardPage from "./pages/DashboardPage";
import DietaPage from "./pages/DietaPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/academia"
            element={<AcademiaPage />}
          />
          <Route
            path="/corridas"
            element={<CorridasPage />}
          />
          <Route path="/dieta" element={<DietaPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;