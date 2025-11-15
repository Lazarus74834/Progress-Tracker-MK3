// Progression Engine - Generic evaluation logic for star level progression

const {
  SUBJECT_CODES,
  LEVELS,
  STAR_RULES,
  STAR_ORDER,
  STAR_DISPLAY_NAMES,
  RANK_ORDER
} = require('./syllabusConfig');

/**
 * Parse a cadet's achievements from CSV row into a Set of achieved module codes
 * Handles v2.3 Navigation and Expedition merge logic:
 * - At Basic, 1*, 2*: CSV has separate NAV and EXP columns, but syllabus treats them as combined
 * - At 3*, 4*: They're separate in both CSV and syllabus
 *
 * @param {Object} achievements - Raw achievement data from CSV (e.g., { DT: '1 Star', SAA: 'Basic', ... })
 * @returns {Set<string>} - Set of achieved module codes (e.g., 'basic.DT', '1.DT', '2.DT')
 */
function parseModuleAchievements(achievements) {
  const passedModules = new Set();

  // Helper to determine the minimum achievement level between NAV and EXP
  // v2.3: At Basic/1*/2*, cadet needs BOTH NAV and EXP at the same level
  // We take the minimum (whichever is lower) as the combined NAVEXP level
  function getCombinedNavExpLevel(navAchievement, expAchievement) {
    if (!navAchievement?.trim() || !expAchievement?.trim()) {
      return null; // One or both missing
    }

    const levels = ['Basic', '1 Star', '2 Star', '3 Star', '4 Star'];
    const navLevel = levels.findIndex(l => navAchievement.includes(l));
    const expLevel = levels.findIndex(l => expAchievement.includes(l));

    if (navLevel === -1 || expLevel === -1) return null;

    // Take minimum (lower achievement)
    const minLevel = Math.min(navLevel, expLevel);
    return levels[minLevel];
  }

  // Handle NAVEXP combination for Basic, 1*, and 2*
  const navAch = achievements.NAV;
  const expAch = achievements.EXP;
  const combinedLevel = getCombinedNavExpLevel(navAch, expAch);

  if (combinedLevel) {
    // Add combined NAVEXP achievements for Basic, 1*, 2*
    if (combinedLevel.includes('4 Star') || combinedLevel.includes('3 Star') ||
        combinedLevel.includes('2 Star') || combinedLevel.includes('1 Star') ||
        combinedLevel.includes('Basic')) {
      passedModules.add('basic.NAVEXP');
    }
    if (combinedLevel.includes('4 Star') || combinedLevel.includes('3 Star') ||
        combinedLevel.includes('2 Star') || combinedLevel.includes('1 Star')) {
      passedModules.add('1.NAVEXP');
    }
    if (combinedLevel.includes('4 Star') || combinedLevel.includes('3 Star') ||
        combinedLevel.includes('2 Star')) {
      passedModules.add('2.NAVEXP');
    }

    // At 3* and 4*, NAV and EXP are separate again
    // Add separate NAV achievements
    if (navAch.includes('3 Star') || navAch.includes('4 Star')) {
      passedModules.add('3.NAV');
    }
    if (navAch.includes('4 Star')) {
      passedModules.add('4.NAV');
    }

    // Add separate EXP achievements
    if (expAch.includes('3 Star') || expAch.includes('4 Star')) {
      passedModules.add('3.EXP');
    }
    if (expAch.includes('4 Star')) {
      passedModules.add('4.EXP');
    }
  }

  // Process all other subjects normally (excluding NAV and EXP since we handled them above)
  Object.entries(achievements).forEach(([subject, achievement]) => {
    if (subject === 'NAV' || subject === 'EXP') return; // Already handled
    if (!achievement || !achievement.trim()) return;

    const achievementStr = achievement.trim();

    // For each level achieved, add all levels up to and including that level
    if (achievementStr.includes('4 Star')) {
      passedModules.add(`basic.${subject}`);
      passedModules.add(`1.${subject}`);
      passedModules.add(`2.${subject}`);
      passedModules.add(`3.${subject}`);
      passedModules.add(`4.${subject}`);
    } else if (achievementStr.includes('3 Star')) {
      passedModules.add(`basic.${subject}`);
      passedModules.add(`1.${subject}`);
      passedModules.add(`2.${subject}`);
      passedModules.add(`3.${subject}`);
    } else if (achievementStr.includes('2 Star')) {
      passedModules.add(`basic.${subject}`);
      passedModules.add(`1.${subject}`);
      passedModules.add(`2.${subject}`);
    } else if (achievementStr.includes('1 Star')) {
      passedModules.add(`basic.${subject}`);
      passedModules.add(`1.${subject}`);
    } else if (achievementStr.includes('Basic')) {
      passedModules.add(`basic.${subject}`);
    }
  });

  return passedModules;
}

/**
 * Check if cadet has achieved a specific module
 * @param {Set<string>} passedModules
 * @param {string} moduleCode
 * @returns {boolean}
 */
function hasModule(passedModules, moduleCode) {
  return passedModules.has(moduleCode);
}

/**
 * Check if cadet meets group requirements (min N from M modules)
 * @param {Set<string>} passedModules
 * @param {Object} group - { modules: [], minRequired: N }
 * @returns {boolean}
 */
function checkGroup(passedModules, group) {
  const count = group.modules.filter(m => hasModule(passedModules, m)).length;
  return count >= group.minRequired;
}

/**
 * Check special predicates (rank, courses, etc.)
 * @param {Object} cadetInfo - { rank: string, flags: {} }
 * @param {Array<string>} predicates
 * @returns {boolean}
 */
function checkPredicates(cadetInfo, predicates = []) {
  if (!predicates || predicates.length === 0) return true;

  return predicates.every(p => {
    switch (p) {
      case 'rank_at_least_sergeant':
        return rankIsAtLeastSergeant(cadetInfo.rank);
      case 'has_master_cadet_course':
        return cadetInfo.flags?.hasMasterCourse || false;
      case 'commandant_awarded':
        return cadetInfo.flags?.commandantAwarded || false;
      default:
        return false;
    }
  });
}

/**
 * Check if rank meets sergeant requirement
 * @param {string} rank
 * @returns {boolean}
 */
function rankIsAtLeastSergeant(rank) {
  const rankValue = RANK_ORDER[rank] || 0;
  const sergeantValue = RANK_ORDER['Sgt'];
  return rankValue >= sergeantValue;
}

/**
 * Check if a star level is complete
 * @param {Set<string>} passedModules
 * @param {Object} cadetInfo - { rank: string, flags: {} }
 * @param {string} starId
 * @returns {boolean}
 */
function starComplete(passedModules, cadetInfo, starId) {
  const rule = STAR_RULES[starId];
  if (!rule) return false;

  // 1. Check prerequisite star
  if (rule.prereq && !starComplete(passedModules, cadetInfo, rule.prereq)) {
    return false;
  }

  // 2. Check mandatory modules
  if (rule.mandatory) {
    const allMandatory = rule.mandatory.every(m => hasModule(passedModules, m));
    if (!allMandatory) return false;
  }

  // 3. Check groups (any-of / min-of logic)
  if (rule.groups) {
    const allGroupsOk = rule.groups.every(g => checkGroup(passedModules, g));
    if (!allGroupsOk) return false;
  }

  // 4. Check extra predicates (rank, Master Cadet, etc.)
  if (!checkPredicates(cadetInfo, rule.extraPredicates)) {
    return false;
  }

  return true;
}

/**
 * Determine highest star level completed and what they're training towards
 * @param {Object} achievements - Raw achievement data from CSV
 * @param {Object} cadetInfo - { rank: string, flags: {} }
 * @returns {Object} - { highestComplete: string, training: string, passedModules: Set }
 */
function getStarProgress(achievements, cadetInfo) {
  const passedModules = parseModuleAchievements(achievements);

  let highestComplete = null;

  // Check each star level in order
  for (const star of STAR_ORDER) {
    if (star === 'recruit') continue; // Skip recruit check

    if (starComplete(passedModules, cadetInfo, star)) {
      highestComplete = star;
    } else {
      break; // Stop at first incomplete level
    }
  }

  // Determine training level
  let training = null;
  if (!highestComplete) {
    training = 'basic';
  } else {
    const idx = STAR_ORDER.indexOf(highestComplete);
    training = STAR_ORDER[idx + 1] || null;
  }

  return {
    highestComplete: highestComplete || 'recruit',
    training,
    passedModules
  };
}

/**
 * Generate what's needed for next progression
 * @param {Object} achievements - Raw achievement data
 * @param {string} currentStarLevel - Current star level ID
 * @param {Set<string>} passedModules - Already computed passed modules
 * @returns {Object} - { nextLevel: string, requiredSubjects: Array }
 */
function generateProgressionPath(achievements, currentStarLevel, passedModules) {
  const nextLevelIdx = STAR_ORDER.indexOf(currentStarLevel) + 1;

  if (nextLevelIdx >= STAR_ORDER.length) {
    return {
      nextLevel: STAR_DISPLAY_NAMES[currentStarLevel],
      requiredSubjects: []
    };
  }

  const nextLevelId = STAR_ORDER[nextLevelIdx];
  const nextLevel = STAR_DISPLAY_NAMES[nextLevelId];
  const rule = STAR_RULES[nextLevelId];
  const requiredSubjects = [];

  // Check mandatory modules
  if (rule.mandatory) {
    rule.mandatory.forEach(moduleCode => {
      if (!hasModule(passedModules, moduleCode)) {
        // Parse module code to get subject and level
        const [level, subject] = moduleCode.split('.');
        const subjectName = SUBJECT_CODES[subject] || subject;
        const levelDisplay = level === 'basic' ? 'Basic' : `${level} Star`;
        requiredSubjects.push(`${subjectName} (${levelDisplay})`);
      }
    });
  }

  // Check groups
  if (rule.groups) {
    rule.groups.forEach(group => {
      const completedInGroup = group.modules.filter(m => hasModule(passedModules, m));
      const stillNeeded = group.minRequired - completedInGroup.length;

      if (stillNeeded > 0) {
        const missing = group.modules.filter(m => !hasModule(passedModules, m));

        // Add suggestions for missing modules
        missing.slice(0, stillNeeded).forEach(moduleCode => {
          const [level, subject] = moduleCode.split('.');
          const subjectName = SUBJECT_CODES[subject] || subject;
          const levelDisplay = level === 'basic' ? 'Basic' : `${level} Star`;
          requiredSubjects.push(`${subjectName} (${levelDisplay})`);
        });
      }
    });
  }

  // Check for special requirements
  if (rule.extraPredicates) {
    if (rule.extraPredicates.includes('rank_at_least_sergeant')) {
      requiredSubjects.push('Rank: At least Sergeant');
    }
    if (rule.extraPredicates.includes('has_master_cadet_course')) {
      requiredSubjects.push('Master Cadet Course Certificate');
    }
    if (rule.extraPredicates.includes('commandant_awarded')) {
      requiredSubjects.push('Commandant Award');
    }
  }

  // If all requirements met or list is too long, show summary
  if (requiredSubjects.length === 0 && nextLevelId === 'master') {
    requiredSubjects.push('Complete other requirements for Master Cadet qualification');
  }

  return {
    nextLevel,
    requiredSubjects
  };
}

/**
 * Main function to determine star level from achievements
 * @param {Object} achievements - Raw achievement data from CSV
 * @param {string} rank - Cadet's rank
 * @returns {string} - Star level display name (e.g., 'Basic', '1*', '2*')
 */
function determineStarLevel(achievements, rank = 'Cdt') {
  const cadetInfo = { rank, flags: {} };
  const { highestComplete } = getStarProgress(achievements, cadetInfo);
  return STAR_DISPLAY_NAMES[highestComplete];
}

module.exports = {
  parseModuleAchievements,
  getStarProgress,
  generateProgressionPath,
  determineStarLevel,
  STAR_DISPLAY_NAMES
};
