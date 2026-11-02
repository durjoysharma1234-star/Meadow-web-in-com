import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Employee, RouteState } from '../types';
import { getAvatarStyle, getInitials } from '../utils';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';

interface TeamViewProps {
  employees: Employee[];
  onNavigate: (route: RouteState) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ employees, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pulse, setPulse] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      `${e.name} ${e.role} ${e.dept}`.toLowerCase().includes(q)
    );
  }, [employees, searchTerm]);

  const currentIdx = Math.min(activeIdx, Math.max(0, filtered.length - 1));
  const activeEmployee = filtered[currentIdx];

  // Auto advance carousel every 8 seconds if not paused
  useEffect(() => {
    if (filtered.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [filtered.length, isPaused, currentIdx]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filtered.length, currentIdx]);

  const handleNext = () => {
    if (filtered.length <= 1) return;
    setPulse(true);
    setActiveIdx((currentIdx + 1) % filtered.length);
    setTimeout(() => setPulse(false), 900);
  };

  const handlePrev = () => {
    if (filtered.length <= 1) return;
    setPulse(true);
    setActiveIdx((currentIdx - 1 + filtered.length) % filtered.length);
    setTimeout(() => setPulse(false), 900);
  };

  const remainingCards = useMemo(() => {
    if (filtered.length <= 1) return [];
    const list: { emp: Employee; index: number }[] = [];
    for (let i = 1; i < filtered.length; i++) {
      const idx = (currentIdx + i) % filtered.length;
      list.push({ emp: filtered[idx], index: idx });
    }
    return list;
  }, [filtered, currentIdx]);

  return (
    <section
      className="team"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Immersive blurred backdrop */}
      <div className="team-bg" aria-hidden="true">
        <div
          className="bgl on"
          style={
            activeEmployee?.photo
              ? { backgroundImage: `url('${activeEmployee.photo}')` }
              : undefined
          }
        ></div>
      </div>

      {/* Search Bar */}
      <div className="search" role="search">
        <Search className="w-4 h-4 text-amber-200/80" />
        <label className="sr" htmlFor="team-search">
          Search team
        </label>
        <input
          id="team-search"
          type="search"
          autoComplete="off"
          placeholder="Search by name, role or department..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setActiveIdx(0);
          }}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        />
        <span className="n">
          {searchTerm
            ? `${filtered.length} of ${employees.length}`
            : `${employees.length} people`}
        </span>
      </div>

      {/* Main Interactive Stage */}
      {filtered.length === 0 ? (
        <div className="empty-stage">
          <h2>No one found</h2>
          <p>Try a different name, role or department.</p>
        </div>
      ) : (
        <div className="stage">
          {/* Active Person Detail */}
          <div className="detail enter">
            <div
              className={`av big ${pulse ? 'pulse' : ''}`}
              style={getAvatarStyle(activeEmployee)}
              role="img"
              aria-label={activeEmployee.name}
            >
              {!activeEmployee.photo && getInitials(activeEmployee.name)}
            </div>
            <h2>{activeEmployee.name}</h2>
            <span className="role">{activeEmployee.role}</span>
            <div className="acts">
              <a
                className="btn border-0 cursor-pointer"
                href={`#e-${activeEmployee.id}-about`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate({
                    name: 'emp',
                    id: activeEmployee.id,
                    tab: 'about'
                  });
                }}
              >
                <span>About</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                className="btn ghost border-0 cursor-pointer"
                href={`#e-${activeEmployee.id}-contact`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate({
                    name: 'emp',
                    id: activeEmployee.id,
                    tab: 'contact'
                  });
                }}
              >
                Contact
              </a>
            </div>
          </div>

          {/* Cards Rail */}
          <div className="rail" ref={railRef}>
            <div className="track">
              {remainingCards.map(({ emp, index }) => (
                <button
                  key={emp.id}
                  className="pc"
                  style={getAvatarStyle(emp)}
                  onClick={() => {
                    setPulse(true);
                    setActiveIdx(index);
                    setTimeout(() => setPulse(false), 900);
                  }}
                  aria-label={`Show ${emp.name}`}
                >
                  {!emp.photo && (
                    <span className="ini">{getInitials(emp.name)}</span>
                  )}
                  <span className="cap">
                    <small>{emp.role}</small>
                    <b>{emp.name}</b>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Footer Navigation */}
      <div className="team-foot">
        <div className="ctrl">
          <button onClick={handlePrev} aria-label="Previous person">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button onClick={handleNext} aria-label="Next person">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="line" aria-hidden="true">
          <i
            style={{
              transform: `scaleX(${
                filtered.length > 0 ? (currentIdx + 1) / filtered.length : 0
              })`
            }}
          ></i>
        </div>
        <span className="count">
          {String(currentIdx + 1).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
};
