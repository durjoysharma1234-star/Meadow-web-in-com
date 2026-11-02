import React from 'react';
import { SiteContent, RouteState } from '../types';

interface FooterProps {
  content: SiteContent;
  onNavigate: (route: RouteState) => void;
}

export const Footer: React.FC<FooterProps> = ({
  content,
  onNavigate
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="foot-in">
        <a
          href="#home"
          onClick={e => {
            e.preventDefault();
            onNavigate({ name: 'home' });
          }}
          className="border-0 bg-transparent p-0 cursor-pointer block"
          aria-label="Meadow home"
        >
          <i className="logo-mask" role="img" aria-label="Meadow"></i>
        </a>

        <span>{content.site.tagline || 'Rooted in the field. Growing with people.'}</span>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span>
            &copy; {currentYear} {content.site.footer || 'Meadow. All rights reserved.'}
          </span>
          <span>&middot;</span>
          <a
            href="./meadow-website.zip"
            download="meadow-website.zip"
            className="text-[#FFEFA6] hover:text-white underline text-xs font-semibold"
          >
            ডাউনলোড কোড (ZIP)
          </a>
          <span>&middot;</span>
          <a
            href="#admin"
            onClick={e => {
              e.preventDefault();
              onNavigate({ name: 'admin' });
            }}
            className="text-[#FFEFA6] hover:text-white underline text-xs"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
};
