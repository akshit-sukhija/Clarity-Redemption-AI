import { calculateRedemption } from './calculationEngine';
import { DEMO_FUND, STATIC_GLOSSARY, RULE_VERIFICATION_SOURCES } from '../data/fundData';
import { generateSnapshotCSV } from './exportService';

export interface TestResultItem {
  id: string;
  name: string;
  amount: number | null;
  expected: string;
  actual: string;
  passed: boolean;
  details?: Record<string, any>;
}

export function runAllTestFixtures(): {
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: TestResultItem[];
} {
  const results: TestResultItem[] = [];

  // Helper for float comparison within epsilon
  const isApproxEqual = (a: number, b: number, eps = 0.01) => Math.abs(a - b) < eps;

  // Test 1: ₹25,000
  try {
    const res25k = calculateRedemption(DEMO_FUND, 25000);
    const passUnits = isApproxEqual(res25k.unitsRedeemed, 164.474, 0.001);
    const passExitLoad = isApproxEqual(res25k.exitLoadAmount, 0.0, 0.001);
    const passSTT = isApproxEqual(res25k.STTAmount, 0.25, 0.001);
    const passProceeds = isApproxEqual(res25k.estimatedProceeds, 24999.75, 0.001);
    const passRemUnits = isApproxEqual(res25k.remainingUnits, 1035.526, 0.001);
    const passRemVal = isApproxEqual(res25k.remainingValueAtIllustrativeNAV, 157400.0, 0.01);

    const passed = passUnits && passExitLoad && passSTT && passProceeds && passRemUnits && passRemVal;
    results.push({
      id: 'fixture-25k',
      name: 'Test Fixture ₹25,000 (Only Lot A touched)',
      amount: 25000,
      expected: 'Units ~164.474, Exit Load: ₹0.00, STT: ₹0.25, Proceeds: ₹24,999.75, Rem: 1,035.526 units (₹1,57,400.00)',
      actual: `Units: ${res25k.unitsRedeemed.toFixed(3)}, Exit Load: ₹${res25k.exitLoadAmount.toFixed(2)}, STT: ₹${res25k.STTAmount.toFixed(2)}, Proceeds: ₹${res25k.estimatedProceeds.toFixed(2)}, Rem: ${res25k.remainingUnits.toFixed(3)} units (₹${res25k.remainingValueAtIllustrativeNAV.toFixed(2)})`,
      passed,
      details: {
        unitsRedeemed: res25k.unitsRedeemed,
        exitLoad: res25k.exitLoadAmount,
        stt: res25k.STTAmount,
        proceeds: res25k.estimatedProceeds,
        remainingUnits: res25k.remainingUnits,
      },
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-25k',
      name: 'Test Fixture ₹25,000',
      amount: 25000,
      expected: 'Successful calculation',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 2: ₹50,000
  try {
    const res50k = calculateRedemption(DEMO_FUND, 50000);
    const passUnits = isApproxEqual(res50k.unitsRedeemed, 328.947, 0.001);
    const passExitLoad = isApproxEqual(res50k.exitLoadAmount, 44.0, 0.001);
    const passSTT = isApproxEqual(res50k.STTAmount, 0.5, 0.001);
    const passProceeds = isApproxEqual(res50k.estimatedProceeds, 49955.5, 0.001);
    const passRemUnits = isApproxEqual(res50k.remainingUnits, 871.053, 0.001);
    const passRemVal = isApproxEqual(res50k.remainingValueAtIllustrativeNAV, 132400.0, 0.01);

    const passed = passUnits && passExitLoad && passSTT && passProceeds && passRemUnits && passRemVal;
    results.push({
      id: 'fixture-50k',
      name: 'Test Fixture ₹50,000 (Lot A full + ₹4,400 from Lot B)',
      amount: 50000,
      expected: 'Units ~328.947, Exit Load: ₹44.00, STT: ₹0.50, Proceeds: ₹49,955.50, Rem: 871.053 units (₹1,32,400.00)',
      actual: `Units: ${res50k.unitsRedeemed.toFixed(3)}, Exit Load: ₹${res50k.exitLoadAmount.toFixed(2)}, STT: ₹${res50k.STTAmount.toFixed(2)}, Proceeds: ₹${res50k.estimatedProceeds.toFixed(2)}, Rem: ${res50k.remainingUnits.toFixed(3)} units (₹${res50k.remainingValueAtIllustrativeNAV.toFixed(2)})`,
      passed,
      details: {
        unitsRedeemed: res50k.unitsRedeemed,
        exitLoad: res50k.exitLoadAmount,
        stt: res50k.STTAmount,
        proceeds: res50k.estimatedProceeds,
        remainingUnits: res50k.remainingUnits,
      },
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-50k',
      name: 'Test Fixture ₹50,000',
      amount: 50000,
      expected: 'Successful calculation',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 3: ₹75,000
  try {
    const res75k = calculateRedemption(DEMO_FUND, 75000);
    const passUnits = isApproxEqual(res75k.unitsRedeemed, 493.421, 0.001);
    const passExitLoad = isApproxEqual(res75k.exitLoadAmount, 294.0, 0.001);
    const passSTT = isApproxEqual(res75k.STTAmount, 0.75, 0.001);
    const passProceeds = isApproxEqual(res75k.estimatedProceeds, 74705.25, 0.001);
    const passRemUnits = isApproxEqual(res75k.remainingUnits, 706.579, 0.001);
    const passRemVal = isApproxEqual(res75k.remainingValueAtIllustrativeNAV, 107400.0, 0.01);

    const passed = passUnits && passExitLoad && passSTT && passProceeds && passRemUnits && passRemVal;
    results.push({
      id: 'fixture-75k',
      name: 'Test Fixture ₹75,000 (Lot A full + ₹29,400 from Lot B)',
      amount: 75000,
      expected: 'Units ~493.421, Exit Load: ₹294.00, STT: ₹0.75, Proceeds: ₹74,705.25, Rem: 706.579 units (₹1,07,400.00)',
      actual: `Units: ${res75k.unitsRedeemed.toFixed(3)}, Exit Load: ₹${res75k.exitLoadAmount.toFixed(2)}, STT: ₹${res75k.STTAmount.toFixed(2)}, Proceeds: ₹${res75k.estimatedProceeds.toFixed(2)}, Rem: ${res75k.remainingUnits.toFixed(3)} units (₹${res75k.remainingValueAtIllustrativeNAV.toFixed(2)})`,
      passed,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-75k',
      name: 'Test Fixture ₹75,000',
      amount: 75000,
      expected: 'Successful calculation',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 4: Edge Case ₹45,600 (Exact older lot boundary)
  try {
    const res45600 = calculateRedemption(DEMO_FUND, 45600);
    const passUnits = isApproxEqual(res45600.unitsRedeemed, 300.0, 0.001);
    const passExitLoad = isApproxEqual(res45600.exitLoadAmount, 0.0, 0.001);
    const lotBTouched = (res45600.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot || 0) > 0;

    const passed = passUnits && passExitLoad && !lotBTouched;
    results.push({
      id: 'fixture-45600',
      name: 'Edge Case ₹45,600 (Exact full older lot boundary)',
      amount: 45600,
      expected: 'Exactly 300.000 units from Lot A, Exit Load ₹0.00, Lot B untouched',
      actual: `Units: ${res45600.unitsRedeemed.toFixed(3)}, Exit Load: ₹${res45600.exitLoadAmount.toFixed(2)}, Lot B units: ${res45600.lotBreakdown.find((l) => l.lotId === 'lot-b')?.unitsRedeemedFromLot.toFixed(3)}`,
      passed,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-45600',
      name: 'Edge Case ₹45,600',
      amount: 45600,
      expected: 'Successful calculation',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 5: Edge Case ₹45,601 (Crosses 1 rupee into newer lot)
  try {
    const res45601 = calculateRedemption(DEMO_FUND, 45601);
    const lotBRedeemed = res45601.lotBreakdown.find((l) => l.lotId === 'lot-b');
    const lotBTouched = (lotBRedeemed?.unitsRedeemedFromLot || 0) > 0;
    const passExitLoad = isApproxEqual(res45601.exitLoadAmount, 0.01, 0.001);

    const passed = lotBTouched && passExitLoad;
    results.push({
      id: 'fixture-45601',
      name: 'Edge Case ₹45,601 (Crosses ₹1 into newer Lot B)',
      amount: 45601,
      expected: 'Lot B touched for ₹1.00, 1% Exit Load applied to ₹1 = ₹0.01',
      actual: `Lot B redemption: ₹${lotBRedeemed?.redemptionValueFromLot.toFixed(2)}, Exit Load: ₹${res45601.exitLoadAmount.toFixed(2)}`,
      passed,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-45601',
      name: 'Edge Case ₹45,601',
      amount: 45601,
      expected: 'Successful calculation',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 6: Full Redemption ₹1,82,400
  try {
    const resFull = calculateRedemption(DEMO_FUND, 182400);
    const passUnits = isApproxEqual(resFull.unitsRedeemed, 1200.0, 0.001);
    const passRemUnits = isApproxEqual(resFull.remainingUnits, 0.0, 0.001);
    const passRemVal = isApproxEqual(resFull.remainingValueAtIllustrativeNAV, 0.0, 0.01);
    const passExitLoad = isApproxEqual(resFull.exitLoadAmount, 1368.0, 0.01);

    const passed = passUnits && passRemUnits && passRemVal && passExitLoad;
    results.push({
      id: 'fixture-full',
      name: 'Edge Case ₹1,82,400 (100% Full Redemption)',
      amount: 182400,
      expected: 'Units: 1,200.000, Remaining Units: 0.000, Remaining Value: ₹0.00, Exit Load: ₹1,368.00',
      actual: `Units: ${resFull.unitsRedeemed.toFixed(3)}, Remaining Units: ${resFull.remainingUnits.toFixed(3)}, Remaining Value: ₹${resFull.remainingValueAtIllustrativeNAV.toFixed(2)}, Exit Load: ₹${resFull.exitLoadAmount.toFixed(2)}`,
      passed,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-full',
      name: 'Full Redemption ₹1,82,400',
      amount: 182400,
      expected: 'Successful calculation',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 7: Validation - Amount exceeding holding (> ₹1,82,400)
  try {
    calculateRedemption(DEMO_FUND, 200000);
    results.push({
      id: 'fixture-val-excess',
      name: 'Validation: Exceeds Available Holding (₹2,00,000)',
      amount: 200000,
      expected: 'Error: Cannot exceed available holding value',
      actual: 'Incorrectly allowed calculation',
      passed: false,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-val-excess',
      name: 'Validation: Exceeds Available Holding (₹2,00,000)',
      amount: 200000,
      expected: 'Error: Cannot exceed available holding value',
      actual: `Correctly rejected: "${err.message}"`,
      passed: true,
    });
  }

  // Test 8: Validation - Zero amount
  try {
    calculateRedemption(DEMO_FUND, 0);
    results.push({
      id: 'fixture-val-zero',
      name: 'Validation: Zero Amount (₹0)',
      amount: 0,
      expected: 'Error: Amount must be greater than zero',
      actual: 'Incorrectly allowed calculation',
      passed: false,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-val-zero',
      name: 'Validation: Zero Amount (₹0)',
      amount: 0,
      expected: 'Error: Amount must be greater than zero',
      actual: `Correctly rejected: "${err.message}"`,
      passed: true,
    });
  }

  // Test 9: Internal NAV Consistency Check
  const navConsistent = isApproxEqual(DEMO_FUND.totalUnits * DEMO_FUND.illustrativeNAV, DEMO_FUND.holdingValue, 0.001);
  results.push({
    id: 'fixture-nav-consistency',
    name: 'Internal Data Consistency: NAV × totalUnits == holdingValue',
    amount: null,
    expected: '1,200.000 × ₹152.00 == ₹1,82,400.00',
    actual: `${DEMO_FUND.totalUnits} × ${DEMO_FUND.illustrativeNAV} = ${DEMO_FUND.totalUnits * DEMO_FUND.illustrativeNAV}`,
    passed: navConsistent,
  });

  // Test 10: Export CSV Concordance Check (Section 28 & 29)
  try {
    const res75k = calculateRedemption(DEMO_FUND, 75000);
    const csvContent = generateSnapshotCSV(res75k, DEMO_FUND);
    const csvHasProceeds = csvContent.includes('74705.25');
    const csvHasExitLoad = csvContent.includes('294.00');
    const csvHasSTT = csvContent.includes('0.75');
    const csvHasUnits = csvContent.includes('493.421');
    const csvHasRemaining = csvContent.includes('706.579');

    const csvPassed = csvHasProceeds && csvHasExitLoad && csvHasSTT && csvHasUnits && csvHasRemaining;
    results.push({
      id: 'fixture-export-consistency',
      name: 'Export Concordance: CSV matches Result Object exactly (₹75,000)',
      amount: 75000,
      expected: 'CSV contains exact proceeds (74705.25), exit load (294.00), STT (0.75), units (493.421)',
      actual: csvPassed ? 'All 5 export figures match screen result object 100%' : 'Mismatch detected in CSV output',
      passed: csvPassed,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-export-consistency',
      name: 'Export Concordance Check',
      amount: 75000,
      expected: 'Successful CSV check',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 11: Single Source of Truth / Non-Recalculation Check
  try {
    const res50k = calculateRedemption(DEMO_FUND, 50000);
    const traceSum = res50k.grossRedemptionValue - res50k.exitLoadAmount - res50k.STTAmount;
    const sstPass = isApproxEqual(res50k.estimatedProceeds, traceSum, 0.0001);
    results.push({
      id: 'fixture-ssot',
      name: 'Architecture: Single Source of Truth consistency (₹50,000)',
      amount: 50000,
      expected: 'estimatedProceeds == grossRedemptionValue - exitLoadAmount - STTAmount',
      actual: `${res50k.estimatedProceeds} == ${traceSum}`,
      passed: sstPass,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-ssot',
      name: 'Architecture Check',
      amount: 50000,
      expected: 'Pass',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 12: Section 8 Invariants Check for Arbitrary Amount (₹60,000)
  try {
    const res60k = calculateRedemption(DEMO_FUND, 60000);
    const inv1 = isApproxEqual(res60k.unitsRedeemed + res60k.remainingUnits, DEMO_FUND.totalUnits, 0.001);
    const inv2 = isApproxEqual(res60k.unitsRedeemed * DEMO_FUND.illustrativeNAV, res60k.grossRedemptionValue, 0.01);
    const inv3 = isApproxEqual(res60k.totalDeductions, res60k.exitLoadAmount + res60k.STTAmount, 0.001);
    const inv4 = isApproxEqual(res60k.estimatedProceeds, res60k.grossRedemptionValue - res60k.totalDeductions, 0.001);
    const lotUnitsSum = res60k.lotBreakdown.reduce((acc, l) => acc + l.unitsRedeemedFromLot, 0);
    const inv5 = isApproxEqual(lotUnitsSum, res60k.unitsRedeemed, 0.001);
    const inv6 = isApproxEqual(res60k.remainingUnits * DEMO_FUND.illustrativeNAV, res60k.remainingValueAtIllustrativeNAV, 0.01);

    const allInvariantsPass = inv1 && inv2 && inv3 && inv4 && inv5 && inv6;
    results.push({
      id: 'fixture-invariants-60k',
      name: 'Financial Invariants Check: Arbitrary Amount (₹60,000)',
      amount: 60000,
      expected: 'Units sum = 1,200; Gross = units × NAV; Proceeds = gross - deductions; Lot units sum = units redeemed',
      actual: allInvariantsPass ? 'All 6 mathematical invariants hold precisely' : 'Invariant violation detected',
      passed: allInvariantsPass,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-invariants-60k',
      name: 'Financial Invariants Check',
      amount: 60000,
      expected: 'Pass',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 13: Feature A — Scenario Net-Proceeds Trend Delta Invariant
  try {
    const res50k = calculateRedemption(DEMO_FUND, 50000);
    const res75k = calculateRedemption(DEMO_FUND, 75000);
    const res25k = calculateRedemption(DEMO_FUND, 25000);

    const delta50to75 = res75k.estimatedProceeds - res50k.estimatedProceeds;
    const delta75to25 = res25k.estimatedProceeds - res75k.estimatedProceeds;

    const passDelta1 = isApproxEqual(delta50to75, 24749.75, 0.01);
    const passDelta2 = isApproxEqual(delta75to25, -49705.50, 0.01);

    results.push({
      id: 'fixture-trend-delta',
      name: 'Feature A: Scenario Net-Proceeds Trend Delta Verification',
      amount: null,
      expected: '₹50k → ₹75k: +₹24,749.75; ₹75k → ₹25k: -₹49,705.50',
      actual: `50k→75k: ${delta50to75 > 0 ? '+' : ''}${delta50to75.toFixed(2)}; 75k→25k: ${delta75to25.toFixed(2)}`,
      passed: passDelta1 && passDelta2,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-trend-delta',
      name: 'Feature A: Trend Delta Verification',
      amount: null,
      expected: 'Pass',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 14: Phase 3 & Section O — Canonical Glossary Dataset Integrity
  try {
    const requiredTerms = ['Exit load', 'STT', 'NAV', 'Units', 'Redemption', 'Estimated proceeds'];
    const termsPresent = requiredTerms.every((t) =>
      STATIC_GLOSSARY.some((g) => g.term.toLowerCase().includes(t.toLowerCase()))
    );
    const rulesComplete = RULE_VERIFICATION_SOURCES.length >= 2 &&
      RULE_VERIFICATION_SOURCES.every((r) => r.sourceOrganization && r.sourceDocument && r.verificationStatus);

    results.push({
      id: 'fixture-canonical-glossary',
      name: 'Phase 3 & Section O: Canonical Glossary & Rules Integrity',
      amount: null,
      expected: 'All core financial terms defined; statutory rules carry authority and verification status',
      actual: termsPresent && rulesComplete ? `${STATIC_GLOSSARY.length} terms & ${RULE_VERIFICATION_SOURCES.length} statutory rules verified` : 'Missing terms or incomplete rules',
      passed: termsPresent && rulesComplete,
    });
  } catch (err: any) {
    results.push({
      id: 'fixture-canonical-glossary',
      name: 'Canonical Glossary Integrity',
      amount: null,
      expected: 'Pass',
      actual: `Error: ${err.message}`,
      passed: false,
    });
  }

  const passedTests = results.filter((r) => r.passed).length;

  return {
    allPassed: passedTests === results.length,
    totalTests: results.length,
    passedTests,
    results,
  };
}
