import React, { useState, useEffect, useRef } from 'react';
import { SiteContent, RouteState, SimpleRouteName } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface HomeViewProps {
  content: SiteContent;
  onNavigate: (route: RouteState) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ content, onNavigate }) => {
  const slides = content.home.slides || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hop, setHop] = useState(false);

  // Parallax values
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const homeRef = useRef<HTMLElement>(null);

  const SLIDE_DURATION = 7000;

  // Hop animation on logo bird every 8 seconds
  useEffect(() => {
    const hopTimer = setInterval(() => {
      setHop(true);
      setTimeout(() => setHop(false), 900);
    }, 8000);
    return () => clearInterval(hopTimer);
  }, []);

  // Slide timer progress loop
  useEffect(() => {
    if (slides.length <= 1) return;
    let start = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      if (!isPaused && !isTransitioning) {
        const elapsed = now - start;
        const currentProg = Math.min(elapsed / SLIDE_DURATION, 1);
        setProgress(currentProg);

        if (elapsed >= SLIDE_DURATION) {
          goToSlide((activeIdx + 1) % slides.length);
          start = performance.now();
        }
      } else {
        start = performance.now() - progress * SLIDE_DURATION;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeIdx, isPaused, isTransitioning, slides.length]);

  const goToSlide = (newIdx: number) => {
    if (isTransitioning || slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIdx((newIdx + slides.length) % slides.length);
      setProgress(0);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 350);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!homeRef.current) return;
    const rect = homeRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const currentSlide = slides[activeIdx] || {
    title: 'About Meadow',
    blurb: 'Who we are and what we stand for.',
    link: 'about',
    cta: 'Read about us',
    points: []
  };

  const handleCtaClick = (linkName: string) => {
    const valid: SimpleRouteName[] = ['home', 'about', 'team', 'contact', 'apply', 'admin'];
    const target = valid.includes(linkName as SimpleRouteName) ? (linkName as SimpleRouteName) : 'about';
    onNavigate({ name: target });
  };

  return (
    <section
      ref={homeRef}
      className="home"
      onMouseMove={handleMouseMove}
      aria-label="Meadow"
    >
      {/* Background Decorative SVG */}
      <svg
        className="home-deco a"
        viewBox="0 0 520 260"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 70 L520 0 L520 26 L34 104Z" />
        <path d="M30 130 L470 56 L486 84 L82 168Z" />
        <path d="M96 190 L400 112 L424 144 L150 224Z" />
        <path d="M188 238 L330 176 L352 206 L226 260Z" />
      </svg>

      {/* Hero Vector Animated Logo */}
      <div className="home-logo">
        <div className="rings" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </div>
        <svg
          className="lg"
          viewBox="0 0 362.00 237.00"
          role="img"
          aria-label="Meadow logo"
          fill="currentColor"
          fillRule="evenodd"
          style={{
            transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 2}px)`
          }}
        >
          {/* Ground field curves */}
          <g className="lg-fields">
            <path className="lf" style={{ ['--i' as string]: 0 }} d="M19.9 129.2 20.6 129.8 24.6 130.8 38.0 130.8 41.5 131.6 54.5 132.2 57.2 132.9 61.6 133.0 63.9 133.8 67.1 133.9 69.0 134.5 72.2 134.6 78.8 135.9 81.5 136.0 87.6 137.5 93.4 138.2 111.5 142.0 136.0 148.1 157.8 154.6 191.8 166.4 194.8 167.9 199.8 169.5 218.0 177.2 221.1 178.2 244.8 189.4 248.5 190.8 251.4 190.0 277.5 175.2 278.1 174.4 277.6 173.4 276.1 172.5 262.0 166.4 248.1 160.9 228.6 154.0 223.6 152.8 208.5 147.9 203.9 146.9 201.4 145.9 191.6 143.8 186.9 142.1 173.8 139.1 164.2 137.6 158.1 136.0 148.2 134.6 141.4 133.1 130.5 131.8 127.4 131.8 124.0 130.9 120.6 130.9 117.5 130.0 113.8 130.0 110.5 129.4 105.5 129.4 102.9 128.8 95.2 128.6 91.1 127.9 81.1 127.9 78.0 127.2 52.9 127.0 44.9 127.2 41.5 127.9 29.5 127.9 27.0 128.6 21.1 128.8Z" />
            <path className="lf" style={{ ['--i' as string]: 1 }} d="M198.6 135.2 199.1 135.8 204.8 137.5 211.6 139.0 224.2 142.6 235.2 146.4 241.4 148.0 245.0 149.5 246.6 149.5 250.2 148.1 263.8 144.4 285.0 139.9 287.2 139.8 289.6 139.0 301.5 137.6 303.8 136.9 307.2 136.6 309.4 136.0 319.2 135.2 321.5 134.6 326.6 134.5 330.1 133.8 334.9 133.8 337.2 133.0 345.5 132.9 347.2 132.2 347.5 131.6 346.0 130.9 337.8 130.9 334.5 130.0 323.2 130.0 319.9 129.4 304.8 129.4 302.2 128.8 243.6 128.8 241.2 129.4 232.2 129.4 229.0 130.0 223.5 130.0 220.5 130.9 218.2 130.9 215.6 131.6 210.8 131.9 203.5 133.1 199.8 134.1Z" />
            <path className="lf" style={{ ['--i' as string]: 2 }} d="M12.9 139.4 13.0 139.9 14.2 140.5 16.8 140.6 18.5 141.2 28.6 142.8 31.0 143.6 36.5 144.4 51.9 147.9 59.4 150.1 63.2 150.9 71.2 153.5 75.2 154.2 78.5 155.6 95.1 160.8 117.9 169.1 139.9 178.4 165.4 190.5 183.6 200.2 207.6 214.4 208.9 214.5 210.2 214.0 235.9 198.6 235.8 197.6 234.9 196.9 221.6 190.5 202.4 181.9 198.1 180.5 187.6 175.9 173.9 171.0 171.4 169.8 153.9 163.8 122.0 154.2 102.0 149.8 96.4 148.1 80.6 145.1 78.0 145.0 71.9 143.8 68.9 143.6 62.2 142.1 51.9 141.4 49.6 140.8 44.8 140.6 42.1 139.9 36.8 139.9 31.1 139.1 14.5 139.0Z" />
            <path className="lf" style={{ ['--i' as string]: 3 }} d="M347.9 139.5 345.4 139.0 341.0 139.8 337.2 139.9 334.8 140.6 326.1 141.6 304.1 145.9 301.5 146.8 293.4 148.2 274.5 153.4 269.6 154.2 265.8 155.8 265.1 156.6 266.2 157.5 278.5 162.8 288.5 168.0 290.4 168.1 324.0 150.6 342.0 142.4 346.2 140.9Z" />
            <path className="lf" style={{ ['--i' as string]: 4 }} d="M21.9 148.5 22.4 149.2 30.0 153.0 33.6 154.4 52.1 163.9 89.8 184.6 141.5 214.9 173.5 234.2 174.6 234.6 176.2 234.2 193.8 223.9 194.6 222.9 194.5 222.0 193.8 221.2 178.4 211.6 154.1 197.8 126.9 183.8 109.4 175.5 80.5 163.9 62.6 157.8 55.1 155.8 50.6 154.1 43.6 152.8 41.2 151.9 23.9 148.2Z" />
          </g>

          {/* Letterform paths */}
          <g className="lg-word">
            <path className="lt" style={{ ['--i' as string]: 0 }} d="M6.2 46.6 5.9 47.2 6.0 48.5 8.8 51.1 9.2 52.2 8.9 57.1 9.1 68.9 7.9 82.5 8.2 92.6 8.0 102.6 7.1 107.0 5.0 109.4 4.5 110.5 4.6 111.2 7.2 112.8 19.6 112.8 20.6 112.4 21.5 111.1 21.4 110.2 20.6 109.2 18.2 108.0 16.5 106.5 15.5 105.0 15.1 103.6 15.8 92.5 15.8 80.1 15.4 77.9 15.8 75.8 17.2 74.5 18.9 74.5 21.5 75.9 25.9 79.5 27.6 80.2 29.8 80.2 31.8 79.1 36.5 73.6 39.9 70.4 42.0 69.2 43.9 69.0 44.9 69.8 45.1 71.0 43.4 75.0 43.0 79.5 43.2 105.9 42.6 108.1 40.4 110.5 40.4 111.5 41.1 112.2 42.5 112.8 64.5 112.8 65.8 112.2 66.6 110.8 64.4 107.0 64.9 100.4 64.6 91.0 65.1 85.4 65.2 70.4 64.6 59.8 65.0 51.5 67.4 48.2 67.4 46.9 65.8 46.0 60.1 46.0 57.2 46.9 54.4 48.9 41.6 61.6 39.1 62.9 37.2 63.0 34.6 62.0 31.2 59.4 25.4 52.9 18.6 47.2 14.9 46.0 7.9 46.0Z" />
            <path className="lt" style={{ ['--i' as string]: 1 }} d="M96.6 57.1 94.0 57.9 91.1 58.1 86.1 60.0 81.0 64.2 77.6 68.8 75.0 73.9 73.6 78.8 73.1 83.0 73.4 91.4 74.5 97.0 77.1 103.0 79.5 106.2 83.4 109.8 87.0 111.6 93.0 113.4 101.9 113.5 105.8 112.6 113.0 109.4 116.2 106.1 117.1 103.9 117.1 102.0 116.0 99.5 114.5 98.2 112.9 97.8 109.9 98.0 108.4 98.8 107.1 100.0 106.6 101.2 106.5 105.6 105.9 107.0 104.4 108.5 102.2 109.8 99.0 109.9 97.1 109.1 95.8 107.9 94.5 104.2 94.5 99.8 95.0 95.8 95.1 78.5 96.5 76.9 99.4 75.9 104.6 75.9 107.4 76.6 115.9 76.6 117.9 75.6 118.9 74.5 119.1 71.4 118.5 68.5 116.4 64.9 114.9 63.0 111.5 60.4 105.8 58.1 101.0 57.1ZM98.4 61.0 100.2 61.0 102.0 61.8 103.2 63.0 103.6 64.5 103.4 70.4 101.6 72.4 99.8 73.0 98.0 72.9 96.8 72.2 95.6 71.0 95.0 68.9 95.2 63.5 96.4 62.0Z" />
            <path className="lt" style={{ ['--i' as string]: 2 }} d="M129.6 60.6 127.0 63.1 125.8 66.4 125.9 67.9 126.5 69.1 129.1 71.1 134.0 71.4 135.9 70.8 137.2 69.6 139.5 66.5 140.9 63.1 142.1 62.0 144.4 61.0 147.2 61.0 149.2 62.0 150.6 63.9 150.9 67.0 150.0 69.9 148.1 71.6 143.0 74.0 137.5 75.2 131.1 77.5 125.9 80.4 123.2 83.2 121.8 86.8 121.1 90.2 121.1 98.2 122.2 103.5 124.9 108.4 126.8 110.2 129.0 111.8 131.2 112.8 134.9 113.6 138.5 113.5 141.0 112.8 148.6 109.2 150.1 109.5 152.5 111.9 154.5 112.8 168.4 112.8 169.5 112.2 170.4 111.1 170.4 110.1 168.9 106.5 168.4 101.8 168.6 74.0 167.8 69.5 165.9 66.0 162.6 62.5 158.2 59.8 152.9 58.1 147.2 57.2 141.6 57.1 139.4 57.9 136.8 58.0 133.2 59.0ZM148.0 76.0 149.5 77.0 150.1 78.6 148.6 90.1 149.0 94.5 148.6 100.2 149.0 104.1 148.6 105.1 147.9 105.8 146.1 106.0 144.5 105.8 143.4 104.9 141.8 100.1 141.6 84.4 143.6 77.9 144.8 76.9Z" />
            <path className="lt" style={{ ['--i' as string]: 3 }} d="M201.5 36.5 200.8 37.1 201.2 40.0 202.4 41.9 204.8 44.4 203.6 46.0 203.6 47.1 206.0 49.2 206.5 50.4 206.1 53.8 206.4 58.5 205.4 59.5 203.5 60.0 195.4 57.1 192.1 57.2 188.5 58.2 185.1 59.8 181.6 62.9 179.9 65.2 177.2 72.0 176.0 82.1 176.9 94.2 178.5 101.2 180.8 106.1 184.1 109.8 187.4 111.5 191.8 112.8 197.4 112.6 205.4 109.8 207.1 110.1 209.6 112.2 211.1 112.8 226.6 112.6 227.8 111.9 228.0 110.5 226.5 107.8 225.8 104.2 226.1 92.8 225.8 62.0 226.1 55.5 225.1 47.2 223.9 45.6 221.1 44.5 218.9 45.0 214.2 45.0 212.9 44.6 209.9 44.9 209.1 44.2 208.4 40.6 207.1 38.8 204.4 37.2ZM202.4 63.9 204.5 64.2 206.0 66.2 205.2 70.8 205.5 89.9 206.1 93.1 206.1 104.2 205.6 105.8 204.1 106.9 201.5 106.5 200.4 105.4 199.2 103.2 198.1 96.9 198.1 89.5 197.8 87.8 197.6 80.1 198.5 72.5 198.4 67.5 199.6 65.0Z" />
            <path className="lt" style={{ ['--i' as string]: 4 }} d="M258.0 57.1 255.6 57.9 252.9 58.1 246.8 60.5 244.1 62.2 239.2 66.9 236.1 71.9 234.8 75.4 233.5 81.4 233.5 88.8 234.9 95.9 236.4 99.9 238.8 104.0 242.0 107.6 244.8 109.8 248.0 111.5 254.0 113.5 263.5 113.6 267.9 112.5 273.1 110.2 277.0 107.4 279.9 104.5 283.2 99.2 284.9 94.4 286.0 89.2 286.0 83.6 284.9 77.5 282.9 72.0 279.9 66.9 276.2 63.1 271.8 60.0 266.5 58.1 263.6 57.9 261.4 57.1ZM257.2 60.4 258.5 60.4 261.1 61.5 262.8 63.4 263.4 65.5 263.4 102.1 263.6 103.5 265.2 106.9 265.4 108.6 264.1 110.1 262.6 110.6 260.1 110.5 258.4 109.6 256.9 107.9 256.0 104.9 255.6 90.0 256.1 69.5 254.0 64.1 253.9 62.9 255.1 61.2Z" />
            <path className="lt" style={{ ['--i' as string]: 5 }} d="M356.4 56.2 352.8 54.0 348.8 53.8 345.6 55.1 344.0 56.8 343.2 58.1 343.4 60.8 347.4 66.5 349.2 70.6 349.2 73.6 348.2 77.5 347.4 79.2 346.2 80.4 344.4 81.1 342.5 80.5 341.4 79.4 340.5 77.6 339.1 73.4 338.2 65.9 337.2 62.1 335.9 60.1 333.8 58.9 329.0 58.1 326.2 58.6 317.9 58.2 316.0 58.8 315.0 59.5 315.4 60.9 317.5 62.9 318.5 68.5 320.4 75.0 319.8 77.9 318.6 79.1 317.1 79.9 314.9 79.5 312.8 77.4 311.4 73.6 310.4 68.0 309.0 63.8 307.8 60.9 306.6 59.8 305.1 58.9 302.2 58.1 298.8 58.6 292.6 58.6 289.5 58.1 287.2 59.4 287.1 60.5 289.1 63.8 290.4 70.8 292.1 75.4 296.5 92.0 299.2 99.1 302.4 109.8 304.4 112.4 306.5 113.2 307.9 113.2 310.0 112.4 311.9 110.2 316.0 99.4 317.6 93.1 319.1 89.6 320.2 85.4 321.0 84.4 322.0 84.0 323.0 84.1 324.0 84.9 325.1 87.4 326.4 94.1 328.6 99.9 330.4 107.6 332.2 111.2 333.5 112.5 334.8 113.0 338.8 113.0 339.8 112.6 340.8 111.6 347.0 95.8 352.2 80.0 356.4 71.6 358.8 65.5 359.2 62.9 359.0 60.0Z" />
          </g>

          {/* Bird perched on character */}
          <g className="lg-bird">
            <g className={`hop ${hop ? 'go' : ''}`}>
              <path d="M200.2 7.0 200.5 7.8 203.8 10.8 204.5 10.8 207.4 8.0 207.6 6.0 208.2 5.4 209.1 5.4 209.9 6.0 210.2 7.5 212.4 8.5 213.5 9.9 213.6 13.4 218.1 14.2 223.1 17.2 224.0 17.4 217.4 9.9 214.6 5.5 211.4 3.1 208.6 2.1 205.5 2.4 203.2 3.6Z" />
              <path d="M203.4 19.0 202.9 22.5 203.6 24.8 205.6 28.5 210.6 33.4 217.8 37.1 221.9 36.9 224.9 37.4 230.5 34.0 233.0 31.0 233.1 30.1 232.5 29.4 223.9 27.8 217.6 26.0 212.9 23.6 211.2 22.1 210.5 20.6 210.4 15.4 209.4 15.5 205.0 17.5Z" />
              <path d="M229.6 22.4 229.9 23.1 234.2 28.1 236.6 29.6 247.6 32.9 251.5 33.0 253.4 32.2 253.2 31.6 252.4 31.1 235.6 25.4 231.2 22.9Z" />
            </g>
          </g>
        </svg>
      </div>

      {/* Floating Card with Menu Information */}
      <aside
        className={`fc ${isTransitioning ? 'leave' : 'enter'}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-live="polite"
      >
        <div className="fc-in">
          <div className="idx">
            <span>
              Menu {String(activeIdx + 1).padStart(2, '0')} /{' '}
              {String(slides.length).padStart(2, '0')}
            </span>
          </div>
          <h2>
            {[...currentSlide.title].map((char, i) =>
              char === ' ' ? ' ' : (
                <span
                  key={i}
                  className="ch inline-block"
                  style={{ ['--i' as string]: i }}
                >
                  {char}
                </span>
              )
            )}
          </h2>
          <p className="blurb">{currentSlide.blurb}</p>
        </div>

        <ul>
          {(currentSlide.points || []).map((pt, i) => (
            <li key={i} style={{ ['--n' as string]: i }}>
              {pt}
            </li>
          ))}
        </ul>

        <a
          className="btn fc-in cursor-pointer border-0"
          href={`#${currentSlide.link}`}
          onClick={(e) => {
            e.preventDefault();
            handleCtaClick(currentSlide.link);
          }}
        >
          <span>{currentSlide.cta || 'Open'}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </a>
      </aside>

      {/* Steps navigation at bottom */}
      <div className="steps">
        <div className="ctrl">
          <button
            onClick={() => goToSlide(activeIdx - 1)}
            aria-label="Previous menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToSlide(activeIdx + 1)}
            aria-label="Next menu"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div
          className="steps-list"
          style={{ ['--n' as string]: slides.length }}
        >
          {slides.map((s, idx) => (
            <button
              key={idx}
              className="step"
              onClick={() => goToSlide(idx)}
              aria-current={idx === activeIdx}
            >
              <span className="tr">
                <i
                  style={{
                    transform: `scaleX(${
                      idx < activeIdx ? 1 : idx === activeIdx ? progress : 0
                    })`
                  }}
                ></i>
              </span>
              <b>
                <small>{String(idx + 1).padStart(2, '0')}</small>
                <span className="truncate">{s.title}</span>
              </b>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
