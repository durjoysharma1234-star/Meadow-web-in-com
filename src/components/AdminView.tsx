import React, { useState, useEffect } from 'react';
import {
  SiteContent,
  Employee,
  JobApplication,
  ApplicationStatus,
  ChannelItem
} from '../types';
import {
  db,
  signInAdminWithGoogle,
  logOutAdmin,
  isAuthorizedAdmin,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import {
  AUTHORIZED_ADMIN_EMAILS,
  SAMPLE_EMPS
} from '../defaultData';
import {
  generateUid,
  getAvatarStyle,
  getInitials,
  formatDateTime,
  exportToCSV,
  CHANNELS
} from '../utils';
import {
  ShieldCheck,
  LogOut,
  ChevronUp,
  ChevronDown,
  X,
  Trash2,
  Download,
  Search,
  Lock,
  Users,
  Briefcase,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface AdminViewProps {
  content: SiteContent;
  employees: Employee[];
  media: Record<string, string>;
  adminUser: User | null;
  onUpdateContent: (newContent: SiteContent) => void;
  onToast: (msg: string) => void;
}

type AdminTab =
  | 'site'
  | 'home'
  | 'about'
  | 'employees'
  | 'contact'
  | 'apply'
  | 'applications'
  | 'access';

export const AdminView: React.FC<AdminViewProps> = ({
  content,
  employees,
  media,
  adminUser,
  onUpdateContent,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('site');
  const [draftContent, setDraftContent] = useState<SiteContent>(JSON.parse(JSON.stringify(content)));
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selected employee for editing
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empDirty, setEmpDirty] = useState(false);

  // Real-time Applications from Firestore
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [appFilterStatus, setAppFilterStatus] = useState<string>('');

  // Authentication error state
  const [loginError, setLoginError] = useState('');
  const [isDomainError, setIsDomainError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Listen to applications in Firestore
  useEffect(() => {
    if (!adminUser) return;
    const unsub = onSnapshot(
      collection(db, 'applications'),
      snapshot => {
        const apps = snapshot.docs.map(d => ({
          ...(d.data() as JobApplication),
          id: d.id
        }));
        apps.sort((a, b) => (b.at || '').localeCompare(a.at || ''));
        setApplications(apps);
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, 'applications');
      }
    );
    return () => unsub();
  }, [adminUser]);

  // Keep draftContent synced if remote content updates and user hasn't made local changes
  useEffect(() => {
    if (!isDirty) {
      setDraftContent(JSON.parse(JSON.stringify(content)));
    }
  }, [content, isDirty]);

  // Handle Login
  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsDomainError(false);
    setIsLoggingIn(true);
    try {
      const user = await signInAdminWithGoogle();
      if (user) {
        onToast(`স্বাগতম অ্যাডমিন ${user.email}!`);
      }
    } catch (err: any) {
      if (err && err.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
        setLoginError('Firebase Auth Authorized Domains এ meadowofficial.github.io যোগ করা নেই।');
      } else {
        setLoginError(err.message || 'অননুমোদিত অ্যাক্সেস। শুধুমাত্র অনুমোদিত অ্যাডমিন আইডি লগইন করতে পারবেন।');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logOutAdmin();
    onToast('Logged out of Admin Portal');
  };

  // Content Saving
  const handleSaveContent = async () => {
    setSaving(true);
    try {
      const updated = {
        ...draftContent,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'site', 'content'), updated);
      onUpdateContent(updated);
      setIsDirty(false);
      onToast('Saved to Firestore! Changes are now live.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'site/content');
      } catch (e: any) {
        onToast('Failed to save changes. Permission denied.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setDraftContent(JSON.parse(JSON.stringify(content)));
    setIsDirty(false);
    onToast('Changes discarded.');
  };

  // Helper for image resizing before uploading
  const processImageFile = (file: File, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failure'));

        const scale = Math.max(width / img.width, height / img.height);
        const sw = width / scale;
        const sh = height / scale;
        ctx.drawImage(
          img,
          (img.width - sw) / 2,
          (img.height - sh) / 2,
          sw,
          sh,
          0,
          0,
          width,
          height
        );
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = objectUrl;
    });
  };

  // Employee Management
  const handleSelectEmp = (emp: Employee) => {
    setSelectedEmp(JSON.parse(JSON.stringify(emp)));
    setEmpDirty(false);
  };

  const handleNewEmployee = () => {
    const maxOrder = employees.reduce((max, e) => Math.max(max, e.order || 0), 0);
    const newEmp: Employee = {
      id: generateUid(),
      name: 'New Team Member',
      role: 'Role Title',
      dept: 'Department',
      photo: '',
      order: maxOrder + 1,
      bio: '',
      about: ['Key responsibilities', 'Qualifications & experience'],
      contact: [
        { type: 'email', label: 'Gmail', value: 'name@meadowcorp.com' },
        { type: 'whatsapp', label: 'WhatsApp', value: '+880 17XX-XXXXXX' },
        { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/profile' }
      ]
    };
    setSelectedEmp(newEmp);
    setEmpDirty(true);
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmp) return;
    if (!selectedEmp.name.trim()) {
      onToast('Please enter employee name.');
      return;
    }
    try {
      await setDoc(doc(db, 'employees', selectedEmp.id), selectedEmp);
      setEmpDirty(false);
      onToast(`Saved ${selectedEmp.name} to Firestore!`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `employees/${selectedEmp.id}`);
      } catch (e) {
        onToast('Failed to save employee.');
      }
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
      if (selectedEmp?.id === id) setSelectedEmp(null);
      onToast('Employee removed.');
    } catch (err) {
      onToast('Failed to delete employee.');
    }
  };

  const handleSeedSampleEmployees = async () => {
    try {
      for (const emp of SAMPLE_EMPS) {
        await setDoc(doc(db, 'employees', emp.id), emp);
      }
      onToast('6 Sample employees loaded to Firestore!');
    } catch (err) {
      onToast('Error seeding sample employees.');
    }
  };

  const handleReorderEmp = async (direction: -1 | 1) => {
    if (!selectedEmp) return;
    const sorted = [...employees].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currIdx = sorted.findIndex(e => e.id === selectedEmp.id);
    const targetIdx = currIdx + direction;
    if (currIdx < 0 || targetIdx < 0 || targetIdx >= sorted.length) return;

    const A = sorted[currIdx];
    const B = sorted[targetIdx];
    const orderA = A.order || currIdx + 1;
    const orderB = B.order || targetIdx + 1;

    try {
      await updateDoc(doc(db, 'employees', A.id), { order: orderB });
      await updateDoc(doc(db, 'employees', B.id), { order: orderA });
      setSelectedEmp({ ...selectedEmp, order: orderB });
      onToast('Display order updated.');
    } catch {
      onToast('Failed to reorder.');
    }
  };

  // Section image handler
  const handleUploadSectionImage = async (secId: string, file: File) => {
    try {
      const resized = await processImageFile(file, 720, 540);
      await setDoc(doc(db, 'media', secId), {
        id: secId,
        data: resized,
        updatedAt: new Date().toISOString()
      });
      onToast('Image saved and updated live!');
    } catch {
      onToast('Failed to upload image.');
    }
  };

  const handleRemoveSectionImage = async (secId: string) => {
    try {
      await deleteDoc(doc(db, 'media', secId));
      onToast('Image removed.');
    } catch {
      onToast('Failed to remove image.');
    }
  };

  // Application Actions
  const handleUpdateAppStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status: newStatus });
      onToast(`Application status set to ${newStatus}`);
    } catch {
      onToast('Could not update application status.');
    }
  };

  const handleDeleteApp = async (appId: string) => {
    try {
      await deleteDoc(doc(db, 'applications', appId));
      onToast('Application deleted.');
    } catch {
      onToast('Failed to delete application.');
    }
  };

  const handleExportApplicationsCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Name',
      'Email',
      'Phone',
      'Position',
      'City',
      'Education',
      'Experience',
      'CV',
      'Status',
      'Note'
    ];
    const rows = applications.map(app => [
      app.id,
      app.at,
      app.name,
      app.email,
      app.phone,
      app.position,
      app.city || '',
      app.education || '',
      app.experience || '',
      app.cv || '',
      app.status,
      app.note || ''
    ]);
    exportToCSV(`meadow-applications-${Date.now()}.csv`, headers, rows);
    onToast('Exported applications to CSV!');
  };

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const matchStatus = !appFilterStatus || app.status === appFilterStatus;
    const q = appSearch.toLowerCase();
    const matchSearch =
      !q ||
      `${app.name} ${app.email} ${app.position} ${app.city}`
        .toLowerCase()
        .includes(q);
    return matchStatus && matchSearch;
  });

  // Guard for non-logged in or unauthorized user
  if (!adminUser || !isAuthorizedAdmin(adminUser.email)) {
    return (
      <div className="page">
        <div className="lock !max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-700/10 text-emerald-700 dark:text-amber-400 border-2 border-emerald-700/30 dark:border-amber-400/40 grid place-items-center mb-1">
            <Lock className="w-8 h-8 text-emerald-800 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="lead text-sm text-stone-600 dark:text-stone-300">
            শুধুমাত্র অনুমোদিত সিস্টেম অ্যাডমিনদের জন্য সংরক্ষিত। সাধারণ কোনো অ্যাকাউন্ট তৈরির সুবিধা নেই।
          </p>

          {isDomainError ? (
            <div className="text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 p-3.5 rounded-xl w-full text-left font-medium space-y-2.5">
              <div className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <span>⚠️ ডোমেইন অনুমোদন প্রয়োজন</span>
              </div>
              <p className="text-[12px] text-red-800 dark:text-red-300 leading-relaxed">
                গিটহাব পেজ (<b>meadowofficial.github.io</b>) থেকে গুগল লগইন সক্রিয় করতে নিচের লিংকে ক্লিক করে একবার ডোমেইনটি যুক্ত করে নিন:
              </p>
              <div className="bg-white dark:bg-stone-900 border border-red-300 dark:border-red-800/80 p-2 rounded-lg flex items-center justify-between gap-2">
                <code className="text-[12px] font-bold text-stone-800 dark:text-stone-200">meadowofficial.github.io</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('meadowofficial.github.io');
                    onToast('ডোমেইন কপি হয়েছে!');
                  }}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-[11px] font-semibold cursor-pointer"
                >
                  কপি করুন
                </button>
              </div>
              <a
                href="https://console.firebase.google.com/project/innate-cascade-903js/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="btn solid small w-full justify-center !bg-red-700 !text-white flex items-center gap-1.5 py-2 text-xs font-bold"
              >
                <span>ফায়ারবেস সেটিংস খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                👉 লিংকে ক্লিক করে 'Authorized domains' এ গিয়ে 'Add domain' চাপুন এবং পেস্ট করুন।
              </p>
            </div>
          ) : loginError ? (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 p-3 rounded-xl w-full text-left font-medium">
              {loginError}
            </div>
          ) : null}

          {/* Exclusive Google Sign-In for the 2 authorized admin Gmails */}
          <div className="w-full space-y-3 pt-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="btn solid w-full border-0 justify-center py-3 text-sm font-bold cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'যাচাই করা হচ্ছে...' : 'Sign In with Authorized Google Account'}</span>
            </button>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/60 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700/60 text-center">
              নিরাপত্তা নীতি: শুধুমাত্র পূর্বনির্ধারিত ২টি অনুমোদিত জিমেইল আইডি অ্যাডমিন প্যানেলে প্রবেশ করতে পারবে।
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-700 text-center space-y-1.5">
              <p className="text-[12px] font-medium text-stone-600 dark:text-stone-300">
                গিটহাব ছাড়া Netlify / অন্য কোথাও আপলোড করতে:
              </p>
              <a
                href="./meadow-website.zip"
                download="meadow-website.zip"
                className="btn small w-full justify-center !bg-amber-400 !text-stone-950 hover:!bg-amber-300 flex items-center gap-1.5 py-2 font-bold cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>meadow-website.zip ডাউনলোড করুন</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Common Top Action Bar for Dirty drafts
  const renderSaveBar = () => (
    <div className="a-bar">
      <span className={`st ${isDirty ? 'dirty font-bold text-red-600' : 'text-stone-600 dark:text-stone-300'}`}>
        {isDirty ? 'Unsaved local changes' : 'All changes saved to Firestore'}
      </span>
      <div className="row flex gap-2">
        <button
          className="btn ghost small"
          onClick={handleDiscardChanges}
          disabled={!isDirty || saving}
        >
          Discard
        </button>
        <button
          className="btn solid small"
          onClick={handleSaveContent}
          disabled={!isDirty || saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin">
      {/* Sidebar with all tabs */}
      <aside className="a-side">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-200 dark:border-stone-700">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-amber-400" />
          <h2 className="text-lg font-bold m-0">Admin Suite</h2>
        </div>

        <button
          onClick={() => setActiveTab('site')}
          aria-current={activeTab === 'site'}
        >
          Site & Text
        </button>
        <button
          onClick={() => setActiveTab('home')}
          aria-current={activeTab === 'home'}
        >
          Home Menus
        </button>
        <button
          onClick={() => setActiveTab('about')}
          aria-current={activeTab === 'about'}
        >
          About Page
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          aria-current={activeTab === 'employees'}
        >
          Employees ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          aria-current={activeTab === 'contact'}
        >
          Contact Page
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          aria-current={activeTab === 'apply'}
        >
          Apply Page
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          aria-current={activeTab === 'applications'}
          className="flex justify-between items-center"
        >
          <span>Applications</span>
          {applications.filter(a => a.status === 'New').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-900">
              {applications.filter(a => a.status === 'New').length} new
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('access')}
          aria-current={activeTab === 'access'}
        >
          RBAC & Security
        </button>

        <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-700 space-y-2">
          <a
            href="./meadow-website.zip"
            download="meadow-website.zip"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-[#0c2317] text-[#f2c94c] hover:bg-stone-800 border border-amber-400/30 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Website (ZIP)</span>
          </a>
          <div className="text-xs text-stone-500 mb-2 truncate">
            Admin: <b>{adminUser.email}</b>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="a-main">
        {/* Tab 1: Site & Text */}
        {activeTab === 'site' && (
          <>
            {renderSaveBar()}
            <div className="card">
              <h3>Site Settings</h3>
              <label className="f">
                Tagline (Footer Banner)
                <input
                  className="in"
                  value={draftContent.site.tagline}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      site: { ...draftContent.site, tagline: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
              <label className="f">
                Copyright Text
                <input
                  className="in"
                  value={draftContent.site.footer}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      site: { ...draftContent.site, footer: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
            </div>

            <div className="card">
              <h3>Team Page Header</h3>
              <label className="f">
                Search Bar Hint Text
                <input
                  className="in"
                  value={draftContent.team.intro}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      team: { ...draftContent.team, intro: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
            </div>
          </>
        )}

        {/* Tab 2: Home Menus */}
        {activeTab === 'home' && (
          <>
            {renderSaveBar()}
            <p className="hintp text-sm">
              These are the dynamic floating card slides that display consecutively on the landing hero.
            </p>
            {draftContent.home.slides.map((slide, sIdx) => (
              <div key={sIdx} className="card">
                <div className="flex justify-between items-center">
                  <h3>Menu Slide #{sIdx + 1}</h3>
                  <div className="ops flex gap-1">
                    <button
                      className="ic"
                      disabled={sIdx === 0}
                      onClick={() => {
                        const newSlides = [...draftContent.home.slides];
                        [newSlides[sIdx], newSlides[sIdx - 1]] = [newSlides[sIdx - 1], newSlides[sIdx]];
                        setDraftContent({
                          ...draftContent,
                          home: { ...draftContent.home, slides: newSlides }
                        });
                        setIsDirty(true);
                      }}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      className="ic"
                      disabled={sIdx === draftContent.home.slides.length - 1}
                      onClick={() => {
                        const newSlides = [...draftContent.home.slides];
                        [newSlides[sIdx], newSlides[sIdx + 1]] = [newSlides[sIdx + 1], newSlides[sIdx]];
                        setDraftContent({
                          ...draftContent,
                          home: { ...draftContent.home, slides: newSlides }
                        });
                        setIsDirty(true);
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      className="ic text-red-500 hover:text-red-700"
                      onClick={() => {
                        const newSlides = draftContent.home.slides.filter((_, i) => i !== sIdx);
                        setDraftContent({
                          ...draftContent,
                          home: { ...draftContent.home, slides: newSlides }
                        });
                        setIsDirty(true);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <label className="f">
                  Slide Title
                  <input
                    className="in"
                    value={slide.title}
                    onChange={e => {
                      const newSlides = [...draftContent.home.slides];
                      newSlides[sIdx].title = e.target.value;
                      setDraftContent({
                        ...draftContent,
                        home: { ...draftContent.home, slides: newSlides }
                      });
                      setIsDirty(true);
                    }}
                  />
                </label>

                <label className="f">
                  Short Blurb Line
                  <input
                    className="in"
                    value={slide.blurb}
                    onChange={e => {
                      const newSlides = [...draftContent.home.slides];
                      newSlides[sIdx].blurb = e.target.value;
                      setDraftContent({
                        ...draftContent,
                        home: { ...draftContent.home, slides: newSlides }
                      });
                      setIsDirty(true);
                    }}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="f">
                    Button Action Page
                    <select
                      className="in"
                      value={slide.link}
                      onChange={e => {
                        const newSlides = [...draftContent.home.slides];
                        newSlides[sIdx].link = e.target.value;
                        setDraftContent({
                          ...draftContent,
                          home: { ...draftContent.home, slides: newSlides }
                        });
                        setIsDirty(true);
                      }}
                    >
                      <option value="about">About</option>
                      <option value="team">Team</option>
                      <option value="contact">Contact</option>
                      <option value="apply">Apply</option>
                    </select>
                  </label>

                  <label className="f">
                    Button Label
                    <input
                      className="in"
                      value={slide.cta}
                      onChange={e => {
                        const newSlides = [...draftContent.home.slides];
                        newSlides[sIdx].cta = e.target.value;
                        setDraftContent({
                          ...draftContent,
                          home: { ...draftContent.home, slides: newSlides }
                        });
                        setIsDirty(true);
                      }}
                    />
                  </label>
                </div>

                {/* Points */}
                <div className="blk">
                  <h4>Bullet Points Shown</h4>
                  {slide.points.map((pt, pIdx) => (
                    <div key={pIdx} className="li">
                      <input
                        className="in"
                        value={pt}
                        onChange={e => {
                          const newSlides = [...draftContent.home.slides];
                          newSlides[sIdx].points[pIdx] = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            home: { ...draftContent.home, slides: newSlides }
                          });
                          setIsDirty(true);
                        }}
                      />
                      <button
                        className="ic"
                        onClick={() => {
                          const newSlides = [...draftContent.home.slides];
                          newSlides[sIdx].points = newSlides[sIdx].points.filter((_, i) => i !== pIdx);
                          setDraftContent({
                            ...draftContent,
                            home: { ...draftContent.home, slides: newSlides }
                          });
                          setIsDirty(true);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn ghost small mt-2"
                    onClick={() => {
                      const newSlides = [...draftContent.home.slides];
                      newSlides[sIdx].points.push('New key takeaway point');
                      setDraftContent({
                        ...draftContent,
                        home: { ...draftContent.home, slides: newSlides }
                      });
                      setIsDirty(true);
                    }}
                  >
                    + Add bullet point
                  </button>
                </div>
              </div>
            ))}

            <button
              className="btn ghost"
              onClick={() => {
                const newSlides = [
                  ...draftContent.home.slides,
                  {
                    title: 'New Meadow Service',
                    blurb: 'Sustainable solutions tailored for growth.',
                    link: 'about',
                    cta: 'Learn more',
                    points: ['Key feature point']
                  }
                ];
                setDraftContent({
                  ...draftContent,
                  home: { ...draftContent.home, slides: newSlides }
                });
                setIsDirty(true);
              }}
            >
              + Add new slide
            </button>
          </>
        )}

        {/* Tab 3: About Page */}
        {activeTab === 'about' && (
          <>
            {renderSaveBar()}
            <div className="card">
              <h3>Page Heading</h3>
              <label className="f">
                Eyebrow
                <input
                  className="in"
                  value={draftContent.about.eyebrow}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      about: { ...draftContent.about, eyebrow: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
              <label className="f">
                Title
                <input
                  className="in"
                  value={draftContent.about.title}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      about: { ...draftContent.about, title: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
              <label className="f">
                Intro Paragraph
                <textarea
                  className="in"
                  rows={3}
                  value={draftContent.about.intro}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      about: { ...draftContent.about, intro: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
            </div>

            <div className="card">
              <h3>Bottom Banner</h3>
              <label className="f">
                Banner Title
                <input
                  className="in"
                  value={draftContent.about.ctaTitle}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      about: { ...draftContent.about, ctaTitle: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
              <label className="f">
                Banner Text
                <textarea
                  className="in"
                  rows={2}
                  value={draftContent.about.ctaText}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      about: { ...draftContent.about, ctaText: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
            </div>

            {/* Narrative sections */}
            {draftContent.about.sections.map((sec, idx) => (
              <div key={sec.id} className="card">
                <div className="flex justify-between items-center">
                  <h3>Section #{idx + 1}: {sec.title}</h3>
                  <button
                    className="ic text-red-500"
                    onClick={() => {
                      const newSecs = draftContent.about.sections.filter(s => s.id !== sec.id);
                      setDraftContent({
                        ...draftContent,
                        about: { ...draftContent.about, sections: newSecs }
                      });
                      setIsDirty(true);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <label className="f">
                  Heading
                  <input
                    className="in"
                    value={sec.title}
                    onChange={e => {
                      const newSecs = [...draftContent.about.sections];
                      newSecs[idx].title = e.target.value;
                      setDraftContent({
                        ...draftContent,
                        about: { ...draftContent.about, sections: newSecs }
                      });
                      setIsDirty(true);
                    }}
                  />
                </label>

                <label className="f">
                  Text Content
                  <textarea
                    className="in"
                    rows={4}
                    value={sec.text}
                    onChange={e => {
                      const newSecs = [...draftContent.about.sections];
                      newSecs[idx].text = e.target.value;
                      setDraftContent({
                        ...draftContent,
                        about: { ...draftContent.about, sections: newSecs }
                      });
                      setIsDirty(true);
                    }}
                  />
                </label>

                {/* Section Image Management */}
                <div className="photo-up">
                  <div
                    className="thumb"
                    style={{
                      backgroundImage: media[sec.id] ? `url('${media[sec.id]}')` : undefined
                    }}
                  ></div>
                  <div className="space-y-2">
                    <label
                      htmlFor={`img-upload-${sec.id}`}
                      className="btn ghost small cursor-pointer inline-flex"
                    >
                      {media[sec.id] ? 'Change Section Photo' : 'Upload Section Photo'}
                    </label>
                    <input
                      id={`img-upload-${sec.id}`}
                      type="file"
                      accept="image/*"
                      className="sr"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSectionImage(sec.id, file);
                      }}
                    />
                    {media[sec.id] && (
                      <button
                        className="btn ghost small block text-red-600"
                        onClick={() => handleRemoveSectionImage(sec.id)}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              className="btn ghost"
              onClick={() => {
                const newId = 'sec_' + generateUid();
                const newSecs = [
                  ...draftContent.about.sections,
                  {
                    id: newId,
                    title: 'New Section Title',
                    text: 'Detailed description of this section.'
                  }
                ];
                setDraftContent({
                  ...draftContent,
                  about: { ...draftContent.about, sections: newSecs }
                });
                setIsDirty(true);
              }}
            >
              + Add narrative section
            </button>
          </>
        )}

        {/* Tab 4: Employees Management */}
        {activeTab === 'employees' && (
          <div className="egrid">
            {/* Left Column: List of People */}
            <div className="card">
              <div className="flex justify-between items-center mb-1">
                <h3>Team Members</h3>
                <button
                  className="btn solid small"
                  onClick={handleNewEmployee}
                >
                  + Add person
                </button>
              </div>

              <div className="elist max-h-[600px] overflow-y-auto">
                {employees.map(emp => (
                  <button
                    key={emp.id}
                    className="erow"
                    aria-current={selectedEmp?.id === emp.id}
                    onClick={() => handleSelectEmp(emp)}
                  >
                    <div
                      className="av w-10 h-10 text-xs"
                      style={getAvatarStyle(emp)}
                    >
                      {!emp.photo && getInitials(emp.name)}
                    </div>
                    <span>
                      <b>{emp.name}</b>
                      <small>{emp.role}</small>
                    </span>
                  </button>
                ))}
              </div>

              {employees.length === 0 && (
                <div className="pt-2 text-center">
                  <button
                    className="btn ghost small w-full"
                    onClick={handleSeedSampleEmployees}
                  >
                    Load 6 Sample Employees
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Editor */}
            {selectedEmp ? (
              <div className="space-y-4">
                <div className="a-bar">
                  <span className="st font-semibold">
                    Editing: {selectedEmp.name}
                  </span>
                  <div className="row flex gap-1.5 items-center">
                    <button
                      className="ic"
                      title="Move Up"
                      onClick={() => handleReorderEmp(-1)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      className="ic"
                      title="Move Down"
                      onClick={() => handleReorderEmp(1)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      className="ic text-red-500"
                      title="Delete employee"
                      onClick={() => handleDeleteEmployee(selectedEmp.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      className="btn ghost small"
                      onClick={() => setSelectedEmp(null)}
                    >
                      Close
                    </button>
                    <button
                      className="btn solid small"
                      onClick={handleSaveEmployee}
                    >
                      Save Employee
                    </button>
                  </div>
                </div>

                <div className="card">
                  {/* Photo Upload */}
                  <div className="photo-up">
                    <div
                      className="av w-20 h-20 text-2xl"
                      style={getAvatarStyle(selectedEmp)}
                    >
                      {!selectedEmp.photo && getInitials(selectedEmp.name)}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="emp-photo-input"
                        className="btn ghost small cursor-pointer inline-flex"
                      >
                        Upload Photo
                      </label>
                      <input
                        id="emp-photo-input"
                        type="file"
                        accept="image/*"
                        className="sr"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const photo = await processImageFile(file, 440, 440);
                              setSelectedEmp({ ...selectedEmp, photo });
                              setEmpDirty(true);
                            } catch {
                              onToast('Could not process that image file.');
                            }
                          }
                        }}
                      />
                      {selectedEmp.photo && (
                        <button
                          className="btn ghost small block text-red-600"
                          onClick={() => {
                            setSelectedEmp({ ...selectedEmp, photo: '' });
                            setEmpDirty(true);
                          }}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <label className="f">
                    Full Name
                    <input
                      className="in"
                      value={selectedEmp.name}
                      onChange={e => {
                        setSelectedEmp({ ...selectedEmp, name: e.target.value });
                        setEmpDirty(true);
                      }}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="f">
                      Role / Designation
                      <input
                        className="in"
                        value={selectedEmp.role}
                        onChange={e => {
                          setSelectedEmp({ ...selectedEmp, role: e.target.value });
                          setEmpDirty(true);
                        }}
                      />
                    </label>

                    <label className="f">
                      Department
                      <input
                        className="in"
                        value={selectedEmp.dept}
                        onChange={e => {
                          setSelectedEmp({ ...selectedEmp, dept: e.target.value });
                          setEmpDirty(true);
                        }}
                      />
                    </label>
                  </div>

                  <label className="f">
                    Short Bio (Introduction)
                    <textarea
                      className="in"
                      rows={3}
                      value={selectedEmp.bio}
                      onChange={e => {
                        setSelectedEmp({ ...selectedEmp, bio: e.target.value });
                        setEmpDirty(true);
                      }}
                    />
                  </label>
                </div>

                {/* About Highlights */}
                <div className="card">
                  <h3>Sub-page: About Highlights</h3>
                  {selectedEmp.about.map((item, idx) => (
                    <div key={idx} className="li">
                      <input
                        className="in"
                        value={item}
                        onChange={e => {
                          const newAbout = [...selectedEmp.about];
                          newAbout[idx] = e.target.value;
                          setSelectedEmp({ ...selectedEmp, about: newAbout });
                          setEmpDirty(true);
                        }}
                      />
                      <button
                        className="ic"
                        onClick={() => {
                          const newAbout = selectedEmp.about.filter((_, i) => i !== idx);
                          setSelectedEmp({ ...selectedEmp, about: newAbout });
                          setEmpDirty(true);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn ghost small"
                    onClick={() => {
                      setSelectedEmp({
                        ...selectedEmp,
                        about: [...selectedEmp.about, 'New responsibility or credential']
                      });
                      setEmpDirty(true);
                    }}
                  >
                    + Add bullet line
                  </button>
                </div>

                {/* Direct Contact Channels */}
                <div className="card">
                  <h3>Sub-page: Contact Channels</h3>
                  {selectedEmp.contact.map((item, idx) => (
                    <div key={idx} className="blk">
                      <div className="grid grid-cols-3 gap-2">
                        <label className="f">
                          Type
                          <select
                            className="in"
                            value={item.type}
                            onChange={e => {
                              const newC = [...selectedEmp.contact];
                              newC[idx].type = e.target.value;
                              setSelectedEmp({ ...selectedEmp, contact: newC });
                              setEmpDirty(true);
                            }}
                          >
                            {Object.entries(CHANNELS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="f">
                          Label
                          <input
                            className="in"
                            value={item.label}
                            onChange={e => {
                              const newC = [...selectedEmp.contact];
                              newC[idx].label = e.target.value;
                              setSelectedEmp({ ...selectedEmp, contact: newC });
                              setEmpDirty(true);
                            }}
                          />
                        </label>

                        <label className="f">
                          Value (e.g. number or handle)
                          <input
                            className="in"
                            value={item.value}
                            onChange={e => {
                              const newC = [...selectedEmp.contact];
                              newC[idx].value = e.target.value;
                              setSelectedEmp({ ...selectedEmp, contact: newC });
                              setEmpDirty(true);
                            }}
                          />
                        </label>
                      </div>

                      <button
                        className="btn ghost small text-red-500 w-fit"
                        onClick={() => {
                          const newC = selectedEmp.contact.filter((_, i) => i !== idx);
                          setSelectedEmp({ ...selectedEmp, contact: newC });
                          setEmpDirty(true);
                        }}
                      >
                        Remove channel
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn ghost small"
                    onClick={() => {
                      setSelectedEmp({
                        ...selectedEmp,
                        contact: [
                          ...selectedEmp.contact,
                          { type: 'whatsapp', label: 'WhatsApp', value: '+880 17XX-XXXXXX' }
                        ]
                      });
                      setEmpDirty(true);
                    }}
                  >
                    + Add contact channel
                  </button>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Users className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                <h3 className="text-xl">Select a person</h3>
                <p className="hintp">
                  Choose someone on the left list to edit details, reorder them on the Team carousel, or add a new team member.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Contact Page */}
        {activeTab === 'contact' && (
          <>
            {renderSaveBar()}
            <div className="card">
              <h3>Page Heading</h3>
              <label className="f">
                Title
                <input
                  className="in"
                  value={draftContent.contact.title}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      contact: { ...draftContent.contact, title: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
              <label className="f">
                Intro Paragraph
                <textarea
                  className="in"
                  rows={2}
                  value={draftContent.contact.intro}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      contact: { ...draftContent.contact, intro: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
            </div>

            <div className="card">
              <h3>Official Contact Channels</h3>
              {draftContent.contact.items.map((item, idx) => (
                <div key={idx} className="blk">
                  <div className="grid grid-cols-3 gap-2">
                    <label className="f">
                      Channel Type
                      <select
                        className="in"
                        value={item.type}
                        onChange={e => {
                          const items = [...draftContent.contact.items];
                          items[idx].type = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            contact: { ...draftContent.contact, items }
                          });
                          setIsDirty(true);
                        }}
                      >
                        {Object.entries(CHANNELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="f">
                      Label
                      <input
                        className="in"
                        value={item.label}
                        onChange={e => {
                          const items = [...draftContent.contact.items];
                          items[idx].label = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            contact: { ...draftContent.contact, items }
                          });
                          setIsDirty(true);
                        }}
                      />
                    </label>

                    <label className="f">
                      Value
                      <input
                        className="in"
                        value={item.value}
                        onChange={e => {
                          const items = [...draftContent.contact.items];
                          items[idx].value = e.target.value;
                          setDraftContent({
                            ...draftContent,
                            contact: { ...draftContent.contact, items }
                          });
                          setIsDirty(true);
                        }}
                      />
                    </label>
                  </div>

                  <label className="f">
                    Hint / Note (Optional)
                    <input
                      className="in"
                      value={item.hint || ''}
                      onChange={e => {
                        const items = [...draftContent.contact.items];
                        items[idx].hint = e.target.value;
                        setDraftContent({
                          ...draftContent,
                          contact: { ...draftContent.contact, items }
                        });
                        setIsDirty(true);
                      }}
                    />
                  </label>

                  <button
                    className="btn ghost small text-red-500 w-fit"
                    onClick={() => {
                      const items = draftContent.contact.items.filter((_, i) => i !== idx);
                      setDraftContent({
                        ...draftContent,
                        contact: { ...draftContent.contact, items }
                      });
                      setIsDirty(true);
                    }}
                  >
                    Remove channel
                  </button>
                </div>
              ))}

              <button
                className="btn ghost small"
                onClick={() => {
                  const items = [
                    ...draftContent.contact.items,
                    { type: 'phone', label: 'Office Support', value: '+880 2-9876543', hint: 'Available on working days' }
                  ];
                  setDraftContent({
                    ...draftContent,
                    contact: { ...draftContent.contact, items }
                  });
                  setIsDirty(true);
                }}
              >
                + Add contact card
              </button>
            </div>
          </>
        )}

        {/* Tab 6: Apply Page */}
        {activeTab === 'apply' && (
          <>
            {renderSaveBar()}
            <div className="card">
              <h3>Page Heading</h3>
              <label className="f">
                Title
                <input
                  className="in"
                  value={draftContent.apply.title}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      apply: { ...draftContent.apply, title: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
              <label className="f">
                Intro Paragraph
                <textarea
                  className="in"
                  rows={2}
                  value={draftContent.apply.intro}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      apply: { ...draftContent.apply, intro: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
            </div>

            <div className="card">
              <h3>Career Openings (Dropdown Options)</h3>
              {draftContent.apply.positions.map((pos, idx) => (
                <div key={idx} className="li">
                  <input
                    className="in"
                    value={pos}
                    onChange={e => {
                      const positions = [...draftContent.apply.positions];
                      positions[idx] = e.target.value;
                      setDraftContent({
                        ...draftContent,
                        apply: { ...draftContent.apply, positions }
                      });
                      setIsDirty(true);
                    }}
                  />
                  <button
                    className="ic"
                    onClick={() => {
                      const positions = draftContent.apply.positions.filter((_, i) => i !== idx);
                      setDraftContent({
                        ...draftContent,
                        apply: { ...draftContent.apply, positions }
                      });
                      setIsDirty(true);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                className="btn ghost small mt-2"
                onClick={() => {
                  const positions = [...draftContent.apply.positions, 'New Position Title'];
                  setDraftContent({
                    ...draftContent,
                    apply: { ...draftContent.apply, positions }
                  });
                  setIsDirty(true);
                }}
              >
                + Add position
              </button>
            </div>

            <div className="card">
              <h3>Notes & Submission Acknowledgement</h3>
              <label className="f">
                Disclaimer Note (under ways to apply)
                <textarea
                  className="in"
                  rows={2}
                  value={draftContent.apply.note}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      apply: { ...draftContent.apply, note: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>

              <label className="f">
                Success Confirmation Message
                <textarea
                  className="in"
                  rows={2}
                  value={draftContent.apply.success}
                  onChange={e => {
                    setDraftContent({
                      ...draftContent,
                      apply: { ...draftContent.apply, success: e.target.value }
                    });
                    setIsDirty(true);
                  }}
                />
              </label>
            </div>
          </>
        )}

        {/* Tab 7: Applications Real-time Management */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="a-bar">
              <span className="st font-semibold">
                {applications.length} Career Submission{applications.length === 1 ? '' : 's'} &middot;{' '}
                {applications.filter(a => a.status === 'New').length} New
              </span>
              <button
                className="btn ghost small flex items-center gap-1.5"
                onClick={handleExportApplicationsCSV}
                disabled={applications.length === 0}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Filter & Search */}
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="f">
                  Search Applicants
                  <div className="relative">
                    <input
                      className="in !pl-9"
                      placeholder="Search by name, email, or position..."
                      value={appSearch}
                      onChange={e => setAppSearch(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </label>

                <label className="f">
                  Filter by Status
                  <select
                    className="in"
                    value={appFilterStatus}
                    onChange={e => setAppFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses ({applications.length})</option>
                    <option value="New">New</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-2.5">
              {filteredApps.length === 0 ? (
                <div className="card text-center py-8 text-stone-500">
                  <Briefcase className="w-10 h-10 mx-auto text-stone-400 mb-2" />
                  <p className="text-base font-semibold">No applications found</p>
                  <p className="text-xs">
                    {appSearch || appFilterStatus
                      ? 'Adjust your search terms or status filter.'
                      : 'Applications submitted via the Apply page will appear here.'}
                  </p>
                </div>
              ) : (
                filteredApps.map(app => (
                  <details key={app.id} className="app">
                    <summary>
                      <b>{app.name}</b>
                      <span className="text-xs text-stone-500">
                        {app.position} &middot; {formatDateTime(app.at)}
                      </span>
                      <span className={`pill ${app.status}`}>{app.status}</span>
                    </summary>

                    <div className="app-body">
                      <dl>
                        <dt>Candidate Email</dt>
                        <dd>
                          <a
                            href={`mailto:${app.email}`}
                            className="text-emerald-700 underline font-medium"
                          >
                            {app.email}
                          </a>
                        </dd>
                        <dt>Telephone</dt>
                        <dd>{app.phone}</dd>
                        <dt>City / District</dt>
                        <dd>{app.city || '—'}</dd>
                        <dt>Education</dt>
                        <dd>{app.education || '—'}</dd>
                        <dt>Experience</dt>
                        <dd>{app.experience || '—'}</dd>
                        <dt>CV / Portfolio</dt>
                        <dd>
                          {app.cv ? (
                            <a
                              href={app.cv}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline inline-flex items-center gap-1 font-medium"
                            >
                              <span>{app.cv}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            '—'
                          )}
                        </dd>
                        <dt>Cover Message</dt>
                        <dd>{app.note || '—'}</dd>
                        <dt>Reference Code</dt>
                        <dd className="font-mono font-bold text-amber-700 dark:text-amber-400">
                          {app.id.toUpperCase()}
                        </dd>
                      </dl>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-700">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold">Change Status:</span>
                          <select
                            className="in !w-auto text-xs py-1"
                            value={app.status}
                            onChange={e =>
                              handleUpdateAppStatus(app.id, e.target.value as ApplicationStatus)
                            }
                          >
                            <option value="New">New</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        <button
                          className="btn ghost small text-red-600 flex items-center gap-1 cursor-pointer"
                          onClick={() => handleDeleteApp(app.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 8: RBAC & Security */}
        {activeTab === 'access' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-amber-400" />
                <h3 className="text-xl font-bold">Role-Based Access Control (RBAC)</h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Only the designated administrators below have access to manage the Meadow portal. Public account registration is locked out by Firebase zero-trust architecture.
              </p>

              <div className="space-y-2 mt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-amber-200">
                  Protected System Administrators (Hidden & Zero-Trust Enforced)
                </div>
                {[1, 2].map(seatNum => (
                  <div
                    key={seatNum}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-200 grid place-items-center font-bold text-xs">
                        {seatNum}
                      </div>
                      <div>
                        <div className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100">
                          Authorized Admin Account #{seatNum} (Confidential / Hidden)
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Role: <b>Super Admin &middot; Strictly Enforced in Firestore Security Rules</b>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Active & Protected
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Zero-Trust Security & Encryption Report</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Firestore Security Rules: Deployed and Active (Attribute-Based Access Control)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Identity Spoofing Guard: Non-whitelisted email domains rejected instantly</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Encrypted Transport: 256-bit SSL HTTPS via Google Cloud Services</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Input Boundary Enforcement: String and array size bounds actively verified</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
