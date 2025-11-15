// Test script specifically for v2.3 Navigation + Expedition merge logic

const { getStarProgress, STAR_DISPLAY_NAMES } = require('./src/progressionEngine');

console.log('Testing v2.3 Navigation + Expedition Merge Logic\n');
console.log('='.repeat(80));

const testCases = [
  {
    name: 'Both NAV and EXP at Basic',
    achievements: {
      DT: 'Basic', SH: 'Basic', FC: 'Basic', NAV: 'Basic', EXP: 'Basic',
      FA: 'Basic', CIS: 'Basic', PHYS: 'Basic'
    },
    expected: 'Basic',
    description: 'Should complete Basic with combined NAVEXP'
  },
  {
    name: 'NAV at 1*, EXP at Basic (minimum)',
    achievements: {
      DT: '1 Star', SAA: '1 Star', SH: '1 Star', FC: '1 Star',
      NAV: '1 Star', EXP: 'Basic',  // EXP is lower
      FA: '1 Star', CIS: '1 Star', PHYS: '1 Star', CE: '1 Star', AT: '1 Star'
    },
    expected: 'Basic',
    description: 'Should only get Basic because EXP is limiting factor'
  },
  {
    name: 'Both NAV and EXP at 1*',
    achievements: {
      DT: '1 Star', SAA: '1 Star', SH: '1 Star', FC: '1 Star',
      NAV: '1 Star', EXP: '1 Star',
      FA: '1 Star', CIS: '1 Star', PHYS: '1 Star', CE: '1 Star', AT: '1 Star'
    },
    expected: '1*',
    description: 'Should complete 1* with both NAV and EXP at 1*'
  },
  {
    name: 'NAV at 2*, EXP at 1* (minimum) - has all 1* prereqs',
    achievements: {
      DT: '1 Star', SAA: '1 Star', SH: '1 Star', FC: '1 Star',
      NAV: '2 Star', EXP: '1 Star',  // EXP is lower, limits NAVEXP to 1*
      FA: '1 Star', CIS: '1 Star', PHYS: '1 Star', CE: '1 Star', AT: '1 Star'
    },
    expected: '1*',
    description: 'Should get 1* because combined NAVEXP is limited to 1* by EXP'
  },
  {
    name: 'Both NAV and EXP at 2* with full prereqs',
    achievements: {
      DT: '2 Star', SAA: '2 Star', SH: '2 Star', FC: '2 Star',
      NAV: '2 Star', EXP: '2 Star',  // Both at 2*, gives 2* NAVEXP
      FA: '2 Star', PHYS: '2 Star', CE: '2 Star',
      CIS: '1 Star', AT: '1 Star'  // 1* prereqs
    },
    expected: '2*',
    description: 'Should complete 2* with both NAV and EXP at 2*'
  },
  {
    name: '3* with NAV separate (EXP in optionals)',
    achievements: {
      DT: '3 Star', SAA: '3 Star', SH: '3 Star', FC: '3 Star',
      NAV: '3 Star', EXP: '3 Star',  // Both at 3*, but EXP counts as optional
      JCIC: '3 Star', AT: '3 Star',
      MK: '3 Star',  // 2 optionals (MK + EXP)
      // Need all 2* prereqs
      FA: '2 Star', CIS: '2 Star', PHYS: '2 Star', CE: '2 Star'
    },
    expected: '3*',
    description: 'At 3*, NAV and EXP are separate. NAV at 3* mandatory + EXP as 1 of 2 optionals'
  },
  {
    name: 'Missing NAV at Basic level',
    achievements: {
      DT: 'Basic', SH: 'Basic', FC: 'Basic',
      NAV: '',  // Missing NAV
      EXP: 'Basic',
      FA: 'Basic', CIS: 'Basic', PHYS: 'Basic'
    },
    expected: 'Recruit',
    description: 'Should be Recruit because combined NAVEXP needs both'
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, idx) => {
  const cadetInfo = { rank: 'Cdt', flags: {} };
  const { highestComplete, passedModules } = getStarProgress(test.achievements, cadetInfo);
  const starLevel = STAR_DISPLAY_NAMES[highestComplete];

  const pass = starLevel === test.expected;

  if (pass) {
    passed++;
    console.log(`✓ Test ${idx + 1}: ${test.name}`);
    console.log(`  Expected: ${test.expected}, Got: ${starLevel}`);
    console.log(`  ${test.description}`);
  } else {
    failed++;
    console.log(`✗ Test ${idx + 1}: ${test.name}`);
    console.log(`  Expected: ${test.expected}, Got: ${starLevel}`);
    console.log(`  ${test.description}`);
    console.log(`  Modules passed:`, Array.from(passedModules).filter(m => m.includes('NAV') || m.includes('EXP')));
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`NAV+EXP Merge Tests: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✓ All NAV+EXP merge tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
