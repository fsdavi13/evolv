import {
  Activity,
  House,
  PersonStanding,
  UserRound,
  Utensils,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "./AppNavigation.css";

const navigationItems = [
  {
    label: "Início",
    path: "/",
    icon: House,
  },
  {
    label: "Academia",
    path: "/academia",
    icon: Settings,
  },
  {
    label: "Corridas",
    path: "/corridas",
    icon: PersonStanding,
  },
  {
    label: "Dieta",
    path: "/dieta",
    icon: Utensils,
  },
  {
    label: "Perfil",
    path: "/perfil",
    icon: UserRound,
  },
];

function AppNavigation() {
  return (
    <nav
      className="app-navigation"
      aria-label="Navegação principal"
    >
      <div className="app-navigation__brand">
        <span className="app-navigation__brand-icon">
          <Activity
            size={23}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </span>

        <span className="app-navigation__brand-name">
          Evolv
        </span>
      </div>

      <div className="app-navigation__links">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                [
                  "app-navigation__link",
                  isActive
                    ? "app-navigation__link--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
              end={item.path === "/"}
              to={item.path}
            >
              <Icon
                className="app-navigation__icon"
                size={20}
                aria-hidden="true"
              />

              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default AppNavigation;