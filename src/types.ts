export type ApplicationStatus = 'New' | 'Reviewing' | 'Shortlisted' | 'Rejected';

export interface ChannelItem {
  type: string;
  label: string;
  value: string;
  hint?: string;
}

export interface HomeSlide {
  title: string;
  blurb: string;
  link: string;
  cta: string;
  points: string[];
}

export interface AboutSection {
  id: string;
  title: string;
  text: string;
}

export interface SiteContent {
  site: {
    tagline: string;
    footer: string;
  };
  home: {
    slides: HomeSlide[];
  };
  about: {
    eyebrow: string;
    title: string;
    ctaTitle: string;
    ctaText: string;
    intro: string;
    sections: AboutSection[];
  };
  team: {
    title: string;
    intro: string;
  };
  contact: {
    title: string;
    intro: string;
    items: ChannelItem[];
  };
  apply: {
    title: string;
    intro: string;
    channels: ChannelItem[];
    positions: string[];
    note: string;
    success: string;
  };
  updatedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  photo?: string;
  order: number;
  bio: string;
  about: string[];
  contact: ChannelItem[];
}

export interface JobApplication {
  id: string;
  at: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  city?: string;
  education?: string;
  experience?: string;
  cv?: string;
  note?: string;
  status: ApplicationStatus;
}

export interface AdminUser {
  email: string;
  role: 'superadmin' | 'admin';
  name?: string;
  addedAt?: string;
}

export type SimpleRouteName = 'home' | 'about' | 'team' | 'contact' | 'apply' | 'admin';

export type RouteState =
  | { name: SimpleRouteName }
  | { name: 'emp'; id: string; tab: 'about' | 'contact' };
