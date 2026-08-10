import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import GooeyNav from "./GooeyNav";

const Navbar = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const gooeyNavRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (href) => {
    if (href !== "#") {
      navigate(href);
    }
  };

  const isAdmin = user?.role === "admin";

  const items = [
    {
      label: "Home",
      href: "/",
      onClick: () => handleNavigation("/"),
    },
    {
      label: "Notes",
      href: "/notes",
      onClick: () => handleNavigation("/notes"),
    },
    ...(isAdmin
      ? [
          {
            label: "Admin",
            href: "/admin",
            onClick: () => handleNavigation("/admin"),
          },
        ]
      : []),
    { label: "Logout", href: "#", onClick: handleLogout },
  ];

  const getActiveIndex = () => {
    const idx = items.findIndex((item) => item.href === location.pathname);
    return idx >= 0 ? idx : 0;
  };

  // Update active index when location changes
  useEffect(() => {
    if (gooeyNavRef.current && gooeyNavRef.current.setActiveIndex) {
      gooeyNavRef.current.setActiveIndex(getActiveIndex());
    }
  }, [location.pathname]);

  if (!isAuthenticated) return null;

  return (
    <nav className="w-full bg-[#060010] flex justify-center items-center shadow-md border-b border-neutral-900">
      <div style={{ height: "80px", position: "relative" }}>
        <GooeyNav
          ref={gooeyNavRef}
          items={items}
          particleCount={15}
          particleDistances={[90, 10]}
          particleR={100}
          initialActiveIndex={getActiveIndex()}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
        />
      </div>
    </nav>
  );
};

export default Navbar;
