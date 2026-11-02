import React, { useState, useEffect } from 'react';
import { RouteState, SimpleRouteName } from '../types';
import { User } from 'firebase/auth';

interface HeaderNavProps {
  currentRoute: RouteState;
  onNavigate: (route: RouteState) => void;
  adminUser: User | null;
  tagline: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentRoute,
  onNavigate,
  adminUser,
  tagline
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync menu-open class with document.body so CSS animations (.dl, .drawer, .scrim) execute perfectly
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const items: { id: SimpleRouteName; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'team', label: 'Team' },
    { id: 'contact', label: 'Contact' },
    { id: 'apply', label: 'Apply' }
  ];

  const currentActiveName = currentRoute.name === 'emp' ? 'team' : currentRoute.name;

  const handleLinkClick = (e: React.MouseEvent, target: SimpleRouteName) => {
    e.preventDefault();
    setMenuOpen(false);
    onNavigate({ name: target });
  };

  return (
    <header className="nav" id="nav">
      {/* Brand Logo - hidden on Home by CSS, visible on other pages */}
      <a
        className="brand"
        href="#home"
        onClick={e => handleLinkClick(e, 'home')}
        aria-label="Meadow home"
      >
        <i className="logo-mask" role="img" aria-label="Meadow"></i>
      </a>

      {/* Menu Button */}
      <button
        className="menu-btn"
        id="mb"
        aria-expanded={menuOpen}
        aria-controls="drawer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span>Menu</span>
        <i className="burger" aria-hidden="true"></i>
      </button>

      {/* Background Scrim */}
      <div
        className="scrim"
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Slide-out Drawer */}
      <aside className="drawer" id="drawer" aria-label="Main menu">
        <div className="top">
          <i className="logo-mask dlogo" role="img" aria-label="Meadow"></i>
          <button
            className="ic dclose"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Animated Navigation Items */}
        <nav className="dnav">
          {items.map((item, i) => (
            <a
              key={item.id}
              className="dl"
              style={{ ['--i' as string]: i }}
              href={`#${item.id}`}
              aria-current={currentActiveName === item.id ? 'page' : undefined}
              onClick={e => handleLinkClick(e, item.id)}
            >
              <span>{item.label}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          ))}

          {/* Admin link in drawer */}
          <a
            className="dl"
            style={{ ['--i' as string]: 5 }}
            href="#admin"
            aria-current={currentActiveName === 'admin' ? 'page' : undefined}
            onClick={e => handleLinkClick(e, 'admin')}
          >
            <span>{adminUser ? 'Admin Portal' : 'Admin'}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>

          {/* Direct Download ZIP link */}
          <a
            className="dl text-[#FFEFA6]"
            style={{ ['--i' as string]: 6 }}
            href="./meadow-website.zip"
            download="meadow-website.zip"
            onClick={() => setMenuOpen(false)}
          >
            <span>ডাউনলোড কোড (ZIP)</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </a>
        </nav>

        {/* Drawer Footer */}
        <div className="dfoot">
          <span>{tagline || 'Rooted in the field. Growing with people.'}</span>
          <a
            href="#admin"
            onClick={e => handleLinkClick(e, 'admin')}
          >
            {adminUser ? 'Admin Dashboard (Active)' : 'Admin Portal'}
          </a>
        </div>
      </aside>
    </header>
  );
};
