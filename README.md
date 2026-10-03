# Clarity — Mutual-Fund Redemption Decision-Context Workspace

> **Produscope 2026 Product Case Study Prototype**  
> *A context-aware mutual-fund redemption workspace that shows what a specific redemption amount does before the investor confirms it.*

---

## 1. Industry & Product Context

In Indian mutual-fund investing, retail investors frequently redeem partial or full holdings to meet liquidity needs, rebalance portfolios, or book profits. However, existing brokerage and AMC redemption flows present a severe information asymmetry:
- Users type an amount (e.g., ₹50,000) into an input field.
- The platform presents a naked proceeds estimation or simply says "Units will be debited".
- Critical financial deductions—such as scheme exit loads (governed by holding duration per purchase lot), statutory Securities Transaction Tax (STT under Finance Act Section 98), First-In-First-Out (FIFO) unit depletion, and remaining units—remain fragmented across separate scheme documents and account statements.

Investors are forced to calculate or guess deductions on their own, often experiencing post-settlement regret when final bank credits differ from their expected sums.

---

## 2. Problem Statement

When an investor initiates a redemption:
1. **Deductions are opaque**: Investors often do not know whether their units crossed the 365-day exit-load window or how much statutory STT will be deducted.
2. **Lot allocation is invisible**: Investors do not see which specific purchase lots (Lot A vs. Lot B) are liquidated first under mandatory FIFO accounting.
3. **Surrounding context is disconnected**: Investors see volatile market headlines without understanding whether broad market movements actually alter their redemption calculation or settlement.
4. **Steering vs. Clarity**: Most fintech platforms either provide zero explanation or push speculative buy/sell/hold advice and gamified risk scores that steer the user instead of providing objective clarity.

---

## 3. Primary User Persona

### Riya Sharma, 29
**Self-directed retail mutual-fund investor**

- **Age:** 25–35
- **Location:** India
- **Investment style:** Self-directed
- **Experience:** Beginner to intermediate
- **Primary products:** Equity-oriented mutual funds
- **Typical behavior:** Invests systematically through digital platforms and monitors her own portfolio
- **Decision moment:** Considering redeeming part or all of an equity mutual-fund holding for an upcoming planned expenditure
- **Current problem:** Sees only the gross redemption amount entered, but has to piece together deductions, units affected, remaining holding value, and surrounding market context herself
- **Need:** A clear, neutral, verifiable explanation of:  
  > **“What exactly happens if I redeem ₹X?”**
- **Does NOT want:** A buy/sell recommendation, an advisory rating, or an AI telling her what decision to make.

---

## 4. Persona Job-to-be-Done (JTBD)

> **“Before I confirm a redemption, help me understand exactly what changes in my holding, what deductions apply, what I receive, and what remains invested.”**

---

## 5. Key User Friction

### Today's Experience
```text
Enter redemption amount → see proceeds → mentally connect deductions + lots + remaining holding + market context
```

### With Clarity
```text
Enter ₹X → see consequences → understand why → inspect evidence/context → decide myself
```

---

## 6. Product Principle

> **Clarity supports Riya's decision. It does not make the decision for her.**

Clarity provides consequence comprehension, mathematical transparency, and verified regulatory context. It never issues buy/hold/sell recommendations, confidence ratings, or predictive market scores.

---

## 7. Product Insight & Thesis

**Clarity is a context-aware mutual-fund redemption workspace that reveals what a specific redemption amount does before the investor confirms it.**

The governing architecture is strictly deterministic:
```text
USER INPUT (₹X)
       ↓
DETERMINISTIC CALCULATION ENGINE (Single Source of Truth)
       ↓
VERIFIED FINANCIAL CONSEQUENCES (Gross, Units, FIFO, Exit Load, STT, Proceeds, Remaining)
       ↓
CONTEXT LAYER (Market & Regulatory Signals)
       ↓
GROUNDED EXPLANATION (Ask Clarity & Progressive Evidence Trace)
       ↓
USER DECIDES (Self-directed)
```

AI serves exclusively as an explanation and contextual retrieval layer. AI is never the financial calculator.

---

## 8. Persona → Feature Traceability

| Riya's Need | Clarity Feature | Implementation |
|---|---|---|
| **Understand exactly what happens** | Redemption Snapshot Hero | Live recalculation displaying gross requested, deductions, net proceeds, and remaining holding |
| **Know how much she receives** | Estimated Net Proceeds Badge | Highlighted proceeds figure with indicative timeline disclosure |
| **Understand deductions** | Consequence Breakdown Pillars | Explicit breakdown of Exit Load (scheme rule) and STT (statutory rate) |
| **Know which units are affected** | FIFO Lot Allocation Visualizer | Segmented consumption bar displaying Lot A (>365d, 0% load) vs Lot B (≤365d, 1% demo load) |
| **Know what remains** | Remaining Holding Card | Live updated remaining units and remaining portfolio value at NAV |
| **Understand why numbers appear** | Calculation Trace (`01 – 06`) | Progressive step-by-step mathematical derivation from gross to net |
| **Understand applicable rules** | Rule Transparency & Rules Register | Full citation of Section 98 Finance (No. 2) Act 2004, SEBI Master Circulars, and scheme SID |
| **Understand relevant external context** | Relevant Context Panel | Factual signals answering Signal, Why Relevant, Source, and Effect on Calculation (None) |
| **Ask follow-up questions** | Ask Clarity (Analyst Drawer) | Multi-turn conversational explainer bounded to current scenario figures with non-advisory guardrail |
| **Explore different amounts** | Quick Actions (`₹10K · ₹25K · ₹50K · ₹1L · Full`) + Slider | Instant recalculation with visual redemption-percentage indicator bar |
| **Make her own decision** | Neutral Product Design | 100% free of buy/sell recommendations, predicted NAVs, and risk scores |

---

## 9. Information Architecture

The main decision workspace follows this strict visual hierarchy:

```text
1. Decision Context Header
   “Redeem ₹50,000 from Northstar Equity Opportunities Fund”
   Supporting: consequences + relevant context + evidence | Boundary: non-advisory

2. Compact Market Context
   NIFTY 50 · SENSEX · INDIA VIX · USD/INR (Demo snapshot · Context only · Does not alter calculation)

3. Primary Decision Workspace (3-Column Layout)
   ┌───────────────────────┬───────────────────────────────┬─────────────────────────┐
   │ YOUR HOLDING (Col 1)  │ REDEMPTION SNAPSHOT (Col 2)   │ RELEVANT CONTEXT (Col 3)│
   │ - Total value & units │ - Amount to redeem            │ - Factual signal        │
   │ - Lot A & Lot B       │ - Quick Actions row           │ - Why relevant          │
   │ - FIFO allotment      │ - % Holding progress bar      │ - Official source       │
   │ - Holding prospectus  │ - Estimated net proceeds      │ - Effect: None          │
   │                       │ - 4 Consequence pillars       │ - On-demand grounding   │
   │                       │ - FIFO lot consumption bar    │ - “Why am I seeing this?”│
   └───────────────────────┴───────────────────────────────┴─────────────────────────┘

4. Consequence Explanation
   - Why this number? (RuleTransparency)
   - How this was calculated (CalculationTrace)

5. Scenario Exploration
   - Benchmark scenario comparison table
   - Explored session history

6. Support & Utility
   - Ask Clarity · Save Snapshot · Rules Register · Glossary · Diagnostics
```

---

## 10. Temporal Model & Data Integrity

The application strictly isolates three distinct temporal concepts:
1. **Demo Financial Scenario Date (`01 Oct 2026`)**: Fixed illustrative date (`DEMO_SCENARIO_DATE`) used for deterministic lot age (Lot A: 412 days; Lot B: 214 days), exit-load eligibility, and reproducible test fixtures.
2. **Current Application Time**: Live browser system timestamp used strictly for UI interaction history, diagnostics re-run logs, and export timestamps.
3. **External / Grounded Information Time**: Primary source publication date and retrieval timestamp for public contextual citations.

---

## 11. Verification & Quality Assurance

- **15 / 15 Checks Passed**: Automated deterministic test fixture suite (`npm test`) verifying FIFO boundaries, full liquidation, 365-day holding period logic, and mathematical invariants.
- **TypeScript Integrity**: `npm run lint` (`tsc --noEmit`) passes with 0 errors.
- **Production Build**: `npm run build` compiles cleanly into an optimized Vite bundle.
