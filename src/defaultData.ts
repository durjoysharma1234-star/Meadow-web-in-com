import { SiteContent, Employee } from './types';

export const DEFAULTS: SiteContent = {
  site: {
    tagline: 'Rooted in the field. Growing with people.',
    footer: 'Meadow. All rights reserved.'
  },
  home: {
    slides: [
      {
        title: 'About Meadow',
        blurb: 'Who we are and what we stand for.',
        link: 'about',
        cta: 'Read about us',
        points: [
          'Our story and purpose',
          'What we do, step by step',
          'Mission, vision and values',
          'How we work with partners'
        ]
      },
      {
        title: 'Our Team',
        blurb: 'The people who make Meadow work.',
        link: 'team',
        cta: 'Meet the team',
        points: [
          'Search people by name or role',
          'A personal About page for each member',
          'Direct contact details for each member'
        ]
      },
      {
        title: 'Contact',
        blurb: 'Reach us through our official channels.',
        link: 'contact',
        cta: 'See contact details',
        points: [
          'Official email and phone numbers',
          'Office address and working hours',
          'Copy any detail with one tap'
        ]
      },
      {
        title: 'Apply',
        blurb: 'Build your work with Meadow.',
        link: 'apply',
        cta: 'Apply now',
        points: [
          'See the open positions',
          'Apply with the online form',
          'Or use any official channel listed',
          'Our team contacts shortlisted candidates'
        ]
      }
    ]
  },
  about: {
    eyebrow: 'About Meadow',
    title: 'A company built on steady growth',
    ctaTitle: 'Meet the people behind Meadow',
    ctaText: 'Get to know our team, or join us and grow with us.',
    intro: 'Meadow works with care, patience and people who take pride in what they do. This page explains who we are and how we work.',
    sections: [
      {
        id: 'who',
        title: 'Who we are',
        text: 'Meadow is a company made up of people who share one belief: good work grows from good ground. We keep our promises, we keep our processes clear, and we treat partners and colleagues fairly.'
      },
      {
        id: 'what',
        title: 'What we do',
        text: 'We deliver our products and services through a simple, repeatable way of working. We understand the need first, plan the work, deliver with quality checks and follow up to improve, so partners always know what to expect.'
      },
      {
        id: 'mission',
        title: 'Our mission',
        text: 'To create lasting value for our customers, our people and the communities around us through honest and dependable work.'
      },
      {
        id: 'vision',
        title: 'Our vision',
        text: 'To be a company that people choose to work with and to work for, year after year.'
      },
      {
        id: 'values',
        title: 'Our values',
        text: 'Care, honesty, teamwork and responsibility guide everyday decisions across every team. We look after people and resources, say what is true, win together and own our results.'
      }
    ]
  },
  team: {
    title: 'Meet the team',
    intro: 'Search by name, role or department.'
  },
  contact: {
    title: 'Get in touch',
    intro: 'These are the official contact details of Meadow. Please use them when you reach out to us.',
    items: [
      { type: 'email', label: 'Gmail', value: 'info@meadowcorp.com', hint: 'General questions and partnerships' },
      { type: 'whatsapp', label: 'WhatsApp', value: '+880 1711-223344', hint: 'Messages during working hours' },
      { type: 'phone', label: 'Phone', value: '+880 2-9876543', hint: 'Calls during working hours' },
      { type: 'address', label: 'Office address', value: 'Plot 14, Block E, Banani, Dhaka-1213, Bangladesh', hint: 'Visit us by appointment' },
      { type: 'hours', label: 'Working hours', value: 'Saturday to Thursday, 9:00 AM to 6:00 PM', hint: 'Closed on Fridays and Public Holidays' },
      { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/company/meadow-bangladesh', hint: 'Company updates & announcements' },
      { type: 'facebook', label: 'Facebook', value: 'facebook.com/meadow.official.bd', hint: 'Official community page' }
    ]
  },
  apply: {
    title: 'Join Meadow',
    intro: 'Tell us about yourself. Fill in the form or use any of the official channels below.',
    channels: [
      { type: 'website', label: 'Online form', value: 'Use the secure form on this page' },
      { type: 'email', label: 'Email', value: 'careers@meadowcorp.com' },
      { type: 'whatsapp', label: 'Phone or WhatsApp', value: '+880 1711-223344' },
      { type: 'address', label: 'In person', value: 'Visit our Banani office during working hours' }
    ],
    positions: [
      'General application',
      'Field Operations Lead',
      'Accounts & Finance Executive',
      'Brand & Marketing Manager',
      'Customer Relations Officer',
      'Senior Software Engineer'
    ],
    note: 'Only shortlisted candidates are contacted by our talent acquisition team. Meadow never asks applicants for fees or payment.',
    success: 'Thank you. Your application has been securely received in our system. Our team will review your profile and contact you if shortlisted.'
  }
};

export const SAMPLE_EMPS: Employee[] = [
  {
    id: 'p1',
    name: 'Shekhor Sharma',
    role: 'Chief Executive Officer',
    dept: 'Leadership',
    photo: '',
    order: 1,
    bio: 'Founder and strategist guiding Meadow towards sustainable agriculture and ethical enterprise across Bangladesh.',
    about: [
      'Sets long-term strategic vision and corporate partnerships',
      'Over 14 years of executive leadership in agritech and green solutions',
      'M.Sc. in Resource Management, Dhaka University'
    ],
    contact: [
      { type: 'email', label: 'Corporate Email', value: 'ceo@meadowcorp.com' },
      { type: 'whatsapp', label: 'Direct WhatsApp', value: '+880 1711-000001' },
      { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/shekhor-sharma' }
    ]
  },
  {
    id: 'p2',
    name: 'Durjoy Sharma',
    role: 'Director & Technology Lead',
    dept: 'Operations & Tech',
    photo: '',
    order: 2,
    bio: 'Leading technological infrastructure, data security, and platform engineering for modern scalable operations.',
    about: [
      'Oversees digital systems, backend cloud architecture, and data encryption',
      'Experienced in distributed cloud systems and real-time enterprise security',
      'B.Sc. in Computer Science & Engineering'
    ],
    contact: [
      { type: 'email', label: 'Official Email', value: 'tech@meadowcorp.com' },
      { type: 'whatsapp', label: 'WhatsApp', value: '+880 1711-000002' },
      { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/durjoy-sharma' }
    ]
  },
  {
    id: 'p3',
    name: 'Tahmina Akhter',
    role: 'Head of Operations',
    dept: 'Operations',
    photo: '',
    order: 3,
    bio: 'Oversees daily field operations, supply chains, and quality assurance workflows across regional centers.',
    about: [
      'Manages 6 regional hubs and quality distribution networks',
      '10+ years specializing in lean logistical processes',
      'MBA in Supply Chain Management'
    ],
    contact: [
      { type: 'email', label: 'Email', value: 'operations@meadowcorp.com' },
      { type: 'whatsapp', label: 'WhatsApp', value: '+880 1711-000003' }
    ]
  },
  {
    id: 'p4',
    name: 'Rafiqul Islam',
    role: 'Finance & Compliance Lead',
    dept: 'Accounts & Legal',
    photo: '',
    order: 4,
    bio: 'Ensures stringent financial governance, auditing, and corporate statutory compliance.',
    about: [
      'Financial modeling, partner invoicing, and risk mitigation',
      'Chartered Accountant (ACA)',
      'Member of Institute of Chartered Accountants of Bangladesh'
    ],
    contact: [
      { type: 'email', label: 'Accounts', value: 'finance@meadowcorp.com' },
      { type: 'phone', label: 'Phone', value: '+880 2-9876543' }
    ]
  },
  {
    id: 'p5',
    name: 'Nusrat Jahan',
    role: 'Brand & Marketing Manager',
    dept: 'Marketing',
    photo: '',
    order: 5,
    bio: 'Spearheading storytelling, farmer community connections, and partner engagement campaigns.',
    about: [
      'Leads national brand growth and customer success communications',
      '7 years experience in corporate brand management',
      'Master of Marketing Communications'
    ],
    contact: [
      { type: 'email', label: 'Press & Media', value: 'press@meadowcorp.com' },
      { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/nusrat-meadow' }
    ]
  },
  {
    id: 'p6',
    name: 'Kamrul Hasan',
    role: 'Field Coordinator',
    dept: 'Field & Community',
    photo: '',
    order: 6,
    bio: 'Direct bridge between farmers, researchers, and sustainable agrarian implementation on the ground.',
    about: [
      'Conducts field trials and grassroots farmer workshops',
      'Deep agricultural field domain knowledge',
      'B.Sc. in Agriculture'
    ],
    contact: [
      { type: 'whatsapp', label: 'Field WhatsApp', value: '+880 1711-000006' }
    ]
  }
];

export const AUTHORIZED_ADMIN_EMAILS = [
  'shekhor.mmc@gmail.com',
  'durjoysharma1234@gmail.com'
];
