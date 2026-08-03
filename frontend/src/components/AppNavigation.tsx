import {
  House,
  PersonStanding,
  Settings,
  UserRound,
  Utensils,
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
        <img
          src="/evolv-logo.png"
          alt="Logo do Evolv"
          className="app-navigation__brand-logo"
        />
        <span className="app-navigation__brand-text">
          Evolv
        </span>
      </div>

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
    </nav>
  );
}

export default AppNavigation;