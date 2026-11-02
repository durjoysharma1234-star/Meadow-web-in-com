import React from 'react';
import { SiteContent } from '../types';
import {
  detectChannelType,
  getChannelHref,
  CHANNELS,
  copyToClipboard
} from '../utils';
import { ArrowRight } from 'lucide-react';

interface ContactViewProps {
  content: SiteContent;
  onToast: (msg: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  content,
  onToast
}) => {
  const { contact } = content;

  const handleCopy = async (val: string) => {
    const success = await copyToClipboard(val);
    onToast(success ? 'Copied to clipboard' : 'Please select and copy text');
  };

  return (
    <>
      <div className="phead">
        <div className="phead-in">
          <div className="eyebrow">Contact</div>
          <h1>{contact.title}</h1>
          {contact.intro && <p className="lead">{contact.intro}</p>}
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

      <div className="page">
        <div className="cgrid">
          {contact.items.map((item, idx) => {
            const detected = detectChannelType(item);
            const config = CHANNELS[detected] || CHANNELS.other;
            const href = getChannelHref(item, detected);

            return (
              <article key={idx} className="chan">
                <span className="chip" style={{ backgroundColor: config.bg }}>
                  {config.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="cm">
                  <span className="lab">{item.label || config.name}</span>
                  <span className="val">{item.value}</span>
                  {item.hint && <span className="hint">{item.hint}</span>}
                </div>
                <div className="acts">
                  {href && config.cta && (
                    <a
                      className="btn solid small"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{config.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    className="copy"
                    onClick={() => handleCopy(item.value)}
                  >
                    Copy
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
};
