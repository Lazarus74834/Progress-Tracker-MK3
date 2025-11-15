// Syllabus Configuration for ACF Star Progression System
// This configuration drives the progression logic without hardcoded conditionals

// Subject code mappings (CSV columns to full names)
const SUBJECT_CODES = {
  DT: 'Drill and Turnout',
  SAA: 'Skill at Arms',
  SH: 'Shooting',
  NAV: 'Navigation',
  FC: 'Fieldcraft and Tactics',
  FA: 'First Aid',
  EXP: 'Expedition',
  PHYS: 'Keeping Active',
  CE: 'Community Engagement',
  MK: 'Military Knowledge',
  JCIC: 'Junior Cadet Instructor Cadre',
  SCIC: 'Senior Cadet Instructor Cadre',
  AT: 'Adventurous Training',
  CIS: 'Communications and Information Systems'
};

// Achievement level hierarchy
const LEVELS = ['Basic', '1 Star', '2 Star', '3 Star', '4 Star'];

/**
 * Star level requirements configuration
 * Each star level defines:
 * - prereq: Previous star level that must be completed
 * - mandatory: Array of module codes that must all be completed
 * - groups: Arrays of modules where cadet needs minRequired from that group
 * - extraPredicates: Special conditions (rank, courses, etc.)
 */
const STAR_RULES = {
  recruit: {
    // Recruit = hasn't completed Basic yet
    mandatory: []
  },

  basic: {
    mandatory: [
      'basic.DT',
      'basic.SH',
      'basic.FC',
      'basic.NAV',
      'basic.EXP',
      'basic.FA',
      'basic.CIS',
      'basic.PHYS'
    ]
  },

  '1': {
    prereq: 'basic',
    mandatory: [
      '1.DT',
      '1.SAA',
      '1.SH',
      '1.FC',
      '1.NAV',
      '1.EXP',
      '1.FA',
      '1.CIS',
      '1.PHYS',
      '1.CE',
      '1.AT'
    ]
  },

  '2': {
    prereq: '1',
    mandatory: [
      '2.DT',
      '2.SAA',
      '2.SH',
      '2.FC',
      '2.NAV',
      '2.EXP',
      '2.FA',
      '2.PHYS',
      '2.CE'
    ]
  },

  '3': {
    prereq: '2',
    mandatory: [
      '3.DT',
      '3.SAA',
      '3.SH',
      '3.FC',
      '3.NAV',
      '3.JCIC',
      '3.AT'
    ],
    groups: [
      {
        id: '3.optional_block',
        modules: [
          '3.MK',
          '3.EXP',
          '3.FA',
          '3.CIS',
          '3.PHYS',
          '3.CE'
        ],
        minRequired: 2
      }
    ]
  },

  '4': {
    prereq: '3',
    groups: [
      {
        id: '4.any_subjects',
        modules: [
          '4.DT',
          '4.SAA',
          '4.SH',
          '4.FC',
          '4.NAV',
          '4.EXP',
          '4.FA',
          '4.CIS',
          '4.PHYS',
          '4.CE',
          '4.AT',
          '4.SCIC',
          '4.MK'
        ],
        minRequired: 2
      }
    ]
  },

  master: {
    prereq: '4',
    extraPredicates: [
      'rank_at_least_sergeant',
      'has_master_cadet_course',
      'commandant_awarded'
    ]
  }
};

// Star level ordering for progression
const STAR_ORDER = ['recruit', 'basic', '1', '2', '3', '4', 'master'];

// Display names for star levels
const STAR_DISPLAY_NAMES = {
  recruit: 'Recruit',
  basic: 'Basic',
  '1': '1*',
  '2': '2*',
  '3': '3*',
  '4': '4*',
  master: 'Master Cadet'
};

// Rank hierarchy for predicate checking
const RANK_ORDER = {
  'Rct': 0,
  'Cdt': 1,
  'LCpl': 2,
  'Cpl': 3,
  'Sgt': 4,
  'SSgt': 5,
  'CSM': 6,
  'RSM': 7,
  'Sgt Maj': 4  // Alternate spelling
};

module.exports = {
  SUBJECT_CODES,
  LEVELS,
  STAR_RULES,
  STAR_ORDER,
  STAR_DISPLAY_NAMES,
  RANK_ORDER
};
