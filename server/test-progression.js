// Quick test script to verify progression logic

const { getStarProgress, generateProgressionPath, STAR_DISPLAY_NAMES } = require('./src/progressionEngine');

// Test cases from the CSV
const testCases = [
  {
    name: 'Cdt F S ABRAHAM',
    rank: 'Cdt',
    achievements: {
      DT: '1 Star',
      SAA: 'Basic',
      SH: '1 Star',
      NAV: '1 Star',
      FC: '1 Star',
      FA: 'Basic',
      EXP: '1 Star',
      PHYS: '1 Star',
      CE: 'Basic',
      MK: '1 Star',
      AT: '1 Star',
      CIS: '1 Star'
    },
    expected: 'Basic' // Has most 1* but SAA and others are only Basic
  },
  {
    name: 'Cdt M A AMOAH',
    rank: 'Cdt',
    achievements: {
      DT: '1 Star',
      SAA: '1 Star',
      SH: '1 Star',
      NAV: '1 Star',
      FC: '1 Star',
      FA: '1 Star',
      EXP: '1 Star',
      PHYS: '1 Star',
      CE: '1 Star',
      MK: '1 Star',
      AT: '1 Star',
      CIS: '1 Star'
    },
    expected: '1*' // All subjects at 1 Star
  },
  {
    name: 'Cdt Cpl S ANDERSON',
    rank: 'Cpl',
    achievements: {
      DT: '3 Star',
      SAA: '4 Star',
      SH: '3 Star',
      NAV: '3 Star',
      FC: '3 Star',
      FA: '2 Star',
      EXP: '2 Star',
      PHYS: '3 Star',
      CE: '2 Star',
      MK: '2 Star',
      JCIC: '3 Star',
      AT: '2 Star',
      CIS: '3 Star'
    },
    expected: '2*' // Missing some 3* requirements
  },
  {
    name: 'Cdt CSM B L MAHONEY',
    rank: 'CSM',
    achievements: {
      DT: '3 Star',
      SAA: '4 Star',
      SH: '4 Star',
      NAV: '3 Star',
      FC: '4 Star',
      FA: '2 Star',
      EXP: '4 Star',
      PHYS: '3 Star',
      CE: '3 Star',
      MK: '2 Star',
      JCIC: '3 Star',
      SCIC: '4 Star',
      AT: '4 Star',
      CIS: '4 Star'
    },
    expected: '4*' // Has multiple 4 Star subjects
  },
  {
    name: 'Recruit with no achievements',
    rank: 'Cdt',
    achievements: {
      DT: '',
      SAA: '',
      SH: '',
      NAV: '',
      FC: '',
      FA: '',
      EXP: '',
      PHYS: '',
      CE: '',
      MK: '',
      AT: '',
      CIS: ''
    },
    expected: 'Recruit'
  }
];

console.log('Testing Progression Engine\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, idx) => {
  const cadetInfo = { rank: test.rank, flags: {} };
  const { highestComplete, training, passedModules } = getStarProgress(test.achievements, cadetInfo);
  const starLevel = STAR_DISPLAY_NAMES[highestComplete];

  const progressionPath = generateProgressionPath(test.achievements, highestComplete, passedModules);

  const pass = starLevel === test.expected;

  if (pass) {
    passed++;
    console.log(`✓ Test ${idx + 1}: ${test.name}`);
  } else {
    failed++;
    console.log(`✗ Test ${idx + 1}: ${test.name}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Got: ${starLevel}`);
  }

  console.log(`  Star Level: ${starLevel}`);
  console.log(`  Training Towards: ${progressionPath.nextLevel}`);
  console.log(`  Required (${progressionPath.requiredSubjects.length}): ${progressionPath.requiredSubjects.slice(0, 3).join(', ')}${progressionPath.requiredSubjects.length > 3 ? '...' : ''}`);
  console.log('');
});

console.log('='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
