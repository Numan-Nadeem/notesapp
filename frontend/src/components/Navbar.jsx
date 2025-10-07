import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import GooeyNav from "./GooeyNav";

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();
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

  const getActiveIndex = () => {
    if (location.pathname === "/") return 0;
    if (location.pathname === "/notes") return 1;
    return 0;
  };

  // Update active index when location changes
  useEffect(() => {
    if (gooeyNavRef.current && gooeyNavRef.current.setActiveIndex) {
      gooeyNavRef.current.setActiveIndex(getActiveIndex());
    }
  }, [location.pathname]);

  if (!isAuthenticated) return null;

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
    { label: "Logout", href: "#", onClick: handleLogout },
  ];

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
