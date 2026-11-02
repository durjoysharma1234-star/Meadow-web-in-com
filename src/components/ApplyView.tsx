import React, { useState } from 'react';
import { SiteContent, JobApplication } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { detectChannelType, CHANNELS, generateUid } from '../utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface ApplyViewProps {
  content: SiteContent;
  onToast: (msg: string) => void;
}

const EXPERIENCE_OPTIONS = [
  'Fresher',
  'Less than 1 year',
  '1 to 3 years',
  '3 to 5 years',
  '5 to 10 years',
  'More than 10 years'
];

export const ApplyView: React.FC<ApplyViewProps> = ({ content, onToast }) => {
  const { apply } = content;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    city: '',
    education: '',
    experience: EXPERIENCE_OPTIONS[0],
    cv: '',
    note: '',
    agree: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (formData.phone.replace(/\D/g, '').length < 6) {
      setErrorMsg('Please enter a valid telephone number.');
      return;
    }
    if (!formData.position) {
      setErrorMsg('Please select a position from the dropdown.');
      return;
    }
    if (!formData.agree) {
      setErrorMsg('Please check the confirmation box before submitting.');
      return;
    }
    if (formData.cv && !/^https?:\/\//i.test(formData.cv)) {
      setErrorMsg('CV link must begin with http:// or https://');
      return;
    }

    setSubmitting(true);
    const appId = generateUid();
    const newApplication: JobApplication = {
      id: appId,
      at: new Date().toISOString(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      position: formData.position,
      city: formData.city.trim() || undefined,
      education: formData.education.trim() || undefined,
      experience: formData.experience,
      cv: formData.cv.trim() || undefined,
      note: formData.note.trim() || undefined,
      status: 'New'
    };

    try {
      await setDoc(doc(db, 'applications', appId), newApplication);
      setSubmittedApp(newApplication);
      onToast('Application submitted successfully!');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `applications/${appId}`);
      } catch (e) {
        setErrorMsg('The application could not be saved right now. Please verify your connection or try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="phead">
        <div className="phead-in">
          <div className="eyebrow">Careers</div>
          <h1>{apply.title}</h1>
          {apply.intro && <p className="lead">{apply.intro}</p>}
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
        <div className="apply-grid">
          {/* Ways to apply */}
          <div>
            <h3 className="text-2xl font-bold mb-3">Ways to apply</h3>
            <div className="ways">
              {apply.channels.map((ch, idx) => {
                const detected = detectChannelType(ch);
                const config = CHANNELS[detected] || CHANNELS.other;
                return (
                  <div key={idx} className="way">
                    <span
                      className="chip sm"
                      style={{ backgroundColor: config.bg }}
                    >
                      {config.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <b>{ch.label || config.name}</b>
                      <span>{ch.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="note mt-5 text-sm text-stone-600 dark:text-stone-400">
              {apply.note}
            </p>
          </div>

          {/* Form / Success Screen */}
          <div className="panel">
            {submittedApp ? (
              <div className="done">
                <div className="tick">
                  <CheckCircle2 className="w-8 h-8 text-emerald-900" />
                </div>
                <h3>Application received</h3>
                <p className="lead !mx-auto text-stone-600 dark:text-stone-300">
                  {apply.success}
                </p>
                <div className="ref">
                  Reference: {submittedApp.id.toUpperCase()}
                </div>
                <div className="mt-6">
                  <button
                    className="btn ghost border-0 cursor-pointer text-sm"
                    onClick={() => {
                      setSubmittedApp(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        position: '',
                        city: '',
                        education: '',
                        experience: EXPERIENCE_OPTIONS[0],
                        cv: '',
                        note: '',
                        agree: false
                      });
                    }}
                  >
                    Submit another application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="frm" noValidate>
                <label className="f full" htmlFor="a-name">
                  <span>
                    Full name <em>*</em>
                  </span>
                  <input
                    className="in"
                    id="a-name"
                    required
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your legal full name"
                  />
                </label>

                <label className="f" htmlFor="a-email">
                  <span>
                    Email <em>*</em>
                  </span>
                  <input
                    className="in"
                    id="a-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@gmail.com"
                  />
                </label>

                <label className="f" htmlFor="a-phone">
                  <span>
                    Phone <em>*</em>
                  </span>
                  <input
                    className="in"
                    id="a-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+880 17XX-XXXXXX"
                  />
                </label>

                <label className="f" htmlFor="a-pos">
                  <span>
                    Position <em>*</em>
                  </span>
                  <select
                    className="in"
                    id="a-pos"
                    required
                    value={formData.position}
                    onChange={e =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  >
                    <option value="">Choose a position</option>
                    {apply.positions.map((pos, idx) => (
                      <option key={idx} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="f" htmlFor="a-city">
                  <span>City or district</span>
                  <input
                    className="in"
                    id="a-city"
                    value={formData.city}
                    onChange={e =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="e.g. Dhaka, Bogura"
                  />
                </label>

                <label className="f" htmlFor="a-edu">
                  <span>Highest education</span>
                  <input
                    className="in"
                    id="a-edu"
                    value={formData.education}
                    onChange={e =>
                      setFormData({ ...formData, education: e.target.value })
                    }
                    placeholder="e.g. B.Sc. in Agriculture, BBA"
                  />
                </label>

                <label className="f" htmlFor="a-exp">
                  <span>Experience</span>
                  <select
                    className="in"
                    id="a-exp"
                    value={formData.experience}
                    onChange={e =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  >
                    {EXPERIENCE_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="f full" htmlFor="a-cv">
                  <span>Link to your CV / Portfolio</span>
                  <input
                    className="in"
                    id="a-cv"
                    type="url"
                    value={formData.cv}
                    onChange={e =>
                      setFormData({ ...formData, cv: e.target.value })
                    }
                    placeholder="https://drive.google.com/..."
                  />
                </label>

                <label className="f full" htmlFor="a-note">
                  <span>Why would you like to join Meadow?</span>
                  <textarea
                    className="in"
                    id="a-note"
                    rows={3}
                    value={formData.note}
                    onChange={e =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="Briefly describe your interest and goals..."
                  />
                </label>

                <label className="chk full" htmlFor="a-agree">
                  <input
                    type="checkbox"
                    id="a-agree"
                    checked={formData.agree}
                    onChange={e =>
                      setFormData({ ...formData, agree: e.target.checked })
                    }
                  />
                  <span>
                    I confirm the information above is correct and agree that Meadow may
                    contact me regarding this career application.
                  </span>
                </label>

                <div className="full">
                  <button
                    className="btn solid border-0 cursor-pointer"
                    type="submit"
                    disabled={submitting}
                  >
                    <span>
                      {submitting ? 'Submitting...' : 'Submit application'}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                  {errorMsg && <div className="err">{errorMsg}</div>}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
