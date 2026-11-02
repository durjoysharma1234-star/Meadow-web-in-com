import React, { useState } from 'react';
import { SiteContent, RouteState } from '../types';
import { ArrowRight } from 'lucide-react';

interface AboutViewProps {
  content: SiteContent;
  media: Record<string, string>;
  onNavigate: (route: RouteState) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  content,
  media,
  onNavigate
}) => {
  const { about } = content;
  const [activeSectionId, setActiveSectionId] = useState<string>(
    about.sections[0]?.id || 's0'
  );

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(`sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="phead">
        <div className="phead-in">
          <div className="eyebrow">{about.eyebrow}</div>
          <h1>{about.title}</h1>
          {about.intro && <p className="lead">{about.intro}</p>}
        </div>
        <svg
          className="deco"
          viewBox="0 0 520 260"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 70 L520 0 L520 26 L34 104Z" />
          <path d="M30 130 L470 56 L486 84 L82 168Z" />
          <path d="M96 190 L400 112 L424 144 L150 224Z" />
          <path d="M188 238 L330 176 L352 206 L226 260Z" />
        </svg>
      </div>

      {/* Main Content with Sticky TOC */}
      <div className="page">
        <div className="aboutx">
          {/* Table of contents */}
          <nav className="toc" aria-label="On this page">
            {about.sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                aria-current={activeSectionId === sec.id}
              >
                {sec.title}
              </button>
            ))}
          </nav>

          {/* Narrative sections */}
          <div>
            {about.sections.map((sec, idx) => {
              const imageSrc = media[sec.id];
              return (
                <section
                  key={sec.id}
                  id={`sec-${sec.id}`}
                  className={`asec ${idx % 2 ? 'flip' : ''}`}
                >
                  <div className="atext">
                    <span className="num">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h2>{sec.title}</h2>
                    <div className="mt-3.5 space-y-3">
                      {sec.text.split(/\n+/).filter(Boolean).map((p, pIdx) => (
                        <p key={pIdx} className="text-stone-700 dark:text-stone-300">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  <figure className="aimg">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={sec.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="ph" aria-hidden="true">
                        <svg
                          className="deco"
                          viewBox="0 0 520 260"
                          fill="currentColor"
                        >
                          <path d="M0 70 L520 0 L520 26 L34 104Z" />
                          <path d="M30 130 L470 56 L486 84 L82 168Z" />
                          <path d="M96 190 L400 112 L424 144 L150 224Z" />
                          <path d="M188 238 L330 176 L352 206 L226 260Z" />
                        </svg>
                      </div>
                    )}
                  </figure>
                </section>
              );
            })}

            {/* Closing CTA */}
            <div className="cta">
              <svg
                className="deco"
                viewBox="0 0 520 260"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M0 70 L520 0 L520 26 L34 104Z" />
                <path d="M30 130 L470 56 L486 84 L82 168Z" />
                <path d="M96 190 L400 112 L424 144 L150 224Z" />
                <path d="M188 238 L330 176 L352 206 L226 260Z" />
              </svg>
              <h2>{about.ctaTitle || 'Meet the people behind Meadow'}</h2>
              <p>
                {about.ctaText ||
                  'Get to know our team, or join us and grow with us.'}
              </p>
              <div className="row">
                <a
                  className="btn border-0"
                  href="#team"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate({ name: 'team' });
                  }}
                >
                  <span>Meet the team</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  className="btn ghost border-0"
                  href="#apply"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate({ name: 'apply' });
                  }}
                >
                  Apply to join
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
