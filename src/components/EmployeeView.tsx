import React from 'react';
import { Employee, RouteState } from '../types';
import {
  getAvatarStyle,
  getInitials,
  detectChannelType,
  getChannelHref,
  CHANNELS,
  copyToClipboard
} from '../utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface EmployeeViewProps {
  employeeId: string;
  initialTab: 'about' | 'contact';
  employees: Employee[];
  onNavigate: (route: RouteState) => void;
  onToast: (msg: string) => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  employeeId,
  initialTab,
  employees,
  onNavigate,
  onToast
}) => {
  const employee = employees.find(e => e.id === employeeId);

  if (!employee) {
    return (
      <>
        <div className="phead">
          <div className="phead-in">
            <button
              className="back border-0 bg-transparent cursor-pointer p-0 mb-4"
              onClick={() => onNavigate({ name: 'team' })}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> All team members
            </button>
            <h1>Person not found</h1>
            <p className="lead">This team member is no longer listed.</p>
          </div>
        </div>
        <div className="page">
          <button
            className="btn solid border-0 cursor-pointer"
            onClick={() => onNavigate({ name: 'team' })}
          >
            All team members
          </button>
        </div>
      </>
    );
  }

  const handleCopy = async (val: string) => {
    const success = await copyToClipboard(val);
    onToast(success ? 'Copied to clipboard' : 'Please select and copy text');
  };

  return (
    <>
      {/* Header Banner */}
      <div className="phead">
        <div className="phead-in">
          <button
            className="back border-0 bg-transparent cursor-pointer p-0 mb-3 text-emerald-950 hover:text-black font-semibold"
            onClick={() => onNavigate({ name: 'team' })}
          >
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> All team members
          </button>
          <div className="eyebrow mt-4">{employee.dept || 'Team member'}</div>
          <h1>{employee.name}</h1>
          <p className="lead">{employee.role}</p>
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

      {/* Main Profile Content */}
      <div className="page !pt-0">
        <div className="emp">
          {/* Avatar side */}
          <div className="emp-side">
            <div
              className="av"
              style={getAvatarStyle(employee)}
              role="img"
              aria-label={employee.name}
            >
              {!employee.photo && getInitials(employee.name)}
            </div>
          </div>

          {/* Details & Tabs */}
          <div className="pt-6 md:pt-10">
            <div className="tabs" role="tablist">
              <a
                role="tab"
                href={`#e-${employee.id}-about`}
                aria-current={initialTab === 'about' ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate({
                    name: 'emp',
                    id: employee.id,
                    tab: 'about'
                  });
                }}
              >
                About
              </a>
              <a
                role="tab"
                href={`#e-${employee.id}-contact`}
                aria-current={initialTab === 'contact' ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate({
                    name: 'emp',
                    id: employee.id,
                    tab: 'contact'
                  });
                }}
              >
                Contact
              </a>
            </div>

            {/* Tab content */}
            {initialTab === 'about' ? (
              <div className="space-y-6">
                {employee.bio && (
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Introduction</h2>
                    <div className="lead !mt-0 space-y-2">
                      {employee.bio.split(/\n+/).filter(Boolean).map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-emerald-800 dark:text-amber-300">
                    Background & Qualifications
                  </h3>
                  {employee.about && employee.about.length > 0 ? (
                    <ul className="pts">
                      {employee.about.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="lead">No additional highlights added yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">Official Channels</h2>
                <div className="cgrid">
                  {employee.contact && employee.contact.length > 0 ? (
                    employee.contact.map((item, idx) => {
                      const detected = detectChannelType(item);
                      const channelConfig = CHANNELS[detected] || CHANNELS.other;
                      const href = getChannelHref(item, detected);

                      return (
                        <article key={idx} className="chan">
                          <span
                            className="chip"
                            style={{ backgroundColor: channelConfig.bg }}
                          >
                            {channelConfig.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="cm">
                            <span className="lab">
                              {item.label || channelConfig.name}
                            </span>
                            <span className="val">{item.value}</span>
                            {item.hint && <span className="hint">{item.hint}</span>}
                          </div>
                          <div className="acts">
                            {href && channelConfig.cta && (
                              <a
                                className="btn solid small"
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>{channelConfig.cta}</span>
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
                    })
                  ) : (
                    <p className="lead">No contact channels added yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
