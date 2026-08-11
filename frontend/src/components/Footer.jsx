import React from "react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer
      className="py-8"
      style={{
        borderTop: "1px solid var(--color-border-subtle)",
        background: "var(--color-surface)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Notsify
            </span>
            <nav className="flex items-center gap-4">
              <Link
                to="/"
                className="text-xs transition-colors duration-200 hover:underline"
                style={{ color: "var(--color-text-muted)" }}
              >
                Home
              </Link>
              <Link
                to="/notes"
                className="text-xs transition-colors duration-200 hover:underline"
                style={{ color: "var(--color-text-muted)" }}
              >
                Notes
              </Link>
              <Link
                to="/login"
                className="text-xs transition-colors duration-200 hover:underline"
                style={{ color: "var(--color-text-muted)" }}
              >
                Sign in
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              &copy; {new Date().getFullYear()} Notsify
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--color-border-default)" }}
            >
              &middot;
            </span>
            <a
              href="#"
              className="text-xs transition-colors duration-200 hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs transition-colors duration-200 hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
