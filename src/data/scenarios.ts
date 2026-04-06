import type { Scenario } from '../types';

// Five hand-authored scenarios demonstrating how information degrades as it
// travels up organizational hierarchies. Each scenario has 8 relay levels,
// with messages growing progressively shorter and vaguer at each step.
// The incentive field explains the organizational pressure driving each distortion.

export const SCENARIOS: Scenario[] = [
  // ── Safety Incident ───────────────────────────────────────────────
  {
    id: 'safety-incident',
    title: 'Valve Failure on Line 12',
    category: 'safety',
    originalMessage:
      'Valve V-2847 on Line 12, Section B failed at 180 PSI — 40 PSI above rated capacity. ' +
      'We manually shut it down at 06:14. Two operators were within 15 feet when the pressure alarm triggered. ' +
      'We need an immediate replacement and a full inspection of all V-28 series valves on the line. ' +
      'Our supplier, Meridian Controls, appears to have shipped a defective batch — serial numbers V2840 through V2860 are all suspect.',
    levels: [
      {
        role: 'Shift Supervisor',
        message:
          'Valve V-2847 on Line 12, Section B failed at 180 PSI, 40 above rated. Manually shut down at 06:14. ' +
          'Two operators were nearby when the alarm triggered — no injuries. Need replacement and inspection of the full V-28 series. ' +
          'Meridian Controls batch looks defective; serials V2840–V2860 should be pulled from service.',
        incentive:
          'Supervisor must report accurately to protect their operators and ensure the right parts get ordered. Incentive to be precise.',
        lostDetails: [],
        addedFraming: [],
      },
      {
        role: 'Area Manager',
        message:
          'We had a valve failure on Line 12 this morning — pressure exceeded rated limits and we shut it down manually. ' +
          'No injuries. Two operators were in the area. We\'re looking at replacing the unit and inspecting the valve series. ' +
          'The supplier batch may be involved.',
        incentive:
          'Area manager softens the severity slightly to avoid triggering a formal incident review that would consume their week. ' +
          'Drops the specific PSI reading and serial numbers — those feel like "details" at this level.',
        lostDetails: ['180 PSI / 40 above rated', 'exact time 06:14', 'V-2847 ID', 'Meridian Controls named', 'serial range V2840–V2860'],
        addedFraming: ['may be involved', 'looking at'],
      },
      {
        role: 'Plant Manager',
        message:
          'Line 12 had a pressure event this morning. Equipment was shut down, no personnel injuries. ' +
          'Maintenance is assessing the affected valve and reviewing the broader valve series. ' +
          'Supplier quality may be a contributing factor.',
        incentive:
          'Plant manager reframes "failure" as "pressure event" — failure language invites scrutiny of their maintenance program. ' +
          'Vague supplier language avoids a procurement conflict they don\'t want to own.',
        lostDetails: ['Section B location', 'two operators within 15 feet', 'manual shutdown detail', 'inspect all V-28 series urgency'],
        addedFraming: ['pressure event', 'assessing', 'may be a contributing factor'],
      },
      {
        role: 'Regional Ops Director',
        message:
          'We had a minor equipment event on Line 12 this morning. The line was briefly taken offline as a precaution. ' +
          'No safety incidents to report. Maintenance teams are reviewing.',
        incentive:
          'Director is summarizing for a portfolio of 12 plants — this is one of many items. "Minor" reduces cognitive load on their chain. ' +
          'The words "no safety incidents" are technically true (no injuries) but obscure the near-miss.',
        lostDetails: ['valve failure root cause', 'supplier defect hypothesis', 'urgency of V-28 series inspection', 'two operators at risk'],
        addedFraming: ['minor equipment event', 'briefly taken offline', 'as a precaution'],
      },
      {
        role: 'VP Operations',
        message:
          'Line 12 experienced a brief operational interruption this morning. The issue has been contained and maintenance is on it. ' +
          'No injuries, operations resuming.',
        incentive:
          'VP is preparing for a board call later. An "operational interruption" is a routine talking point; a valve failure is a liability question. ' +
          'All specificity that could trigger follow-up questions is stripped.',
        lostDetails: ['equipment failure', 'pressure overrun', 'supplier defect', 'valve series inspection scope'],
        addedFraming: ['brief operational interruption', 'has been contained', 'on it'],
      },
      {
        role: 'SVP Operations',
        message:
          'Operations reported a routine maintenance item on Line 12. No safety concerns flagged. Crews are on it.',
        incentive:
          'SVP is managing executive perception. Categorizing this as "routine maintenance" keeps it off the safety register and out of the board deck. ' +
          'The word "routine" is doing enormous damage here.',
        lostDetails: ['pressure failure', 'near-miss with two operators', 'supplier defect investigation', 'Line 12 shutdown'],
        addedFraming: ['routine maintenance item', 'no safety concerns flagged'],
      },
      {
        role: 'COO',
        message:
          'Operations: Line 12 maintenance addressed. No incidents.',
        incentive:
          'COO passes a single sentence to the CEO. "No incidents" frames the entire event as non-event status. ' +
          'The COO is not lying — they\'re compressing — but the compression destroys the signal completely.',
        lostDetails: ['nature of the event', 'valve failure and supplier defect', 'inspection urgency', 'near-miss context'],
        addedFraming: ['addressed', 'no incidents'],
      },
      {
        role: 'CEO',
        message:
          'Operations: normal parameters. No incidents.',
        incentive:
          'CEO receives a consolidated status report. "Normal parameters" suggests everything is under control. ' +
          'The original report — a near-miss with defective supplier equipment on a pressurized line — is invisible.',
        lostDetails: ['every specific fact from the original message'],
        addedFraming: ['normal parameters', 'no incidents'],
      },
    ],
  },

  // ── Customer Escalation ───────────────────────────────────────────
  {
    id: 'customer-escalation',
    title: 'Apex Industries API Crisis',
    category: 'customer',
    originalMessage:
      'Apex Industries — our 3rd largest account, $4.2M ARR — is threatening to leave. ' +
      'Their CTO, David Chen, called me directly. Their API integration has been failing 30% of requests for two weeks. ' +
      'They\'ve been evaluating CompetitorX for the past month. David said if we don\'t have a fix by Friday, they are migrating. ' +
      'This needs engineering priority immediately — not next sprint, now.',
    levels: [
      {
        role: 'Support Team Lead',
        message:
          'Apex Industries (3rd largest account, $4.2M ARR) is escalating hard. CTO David Chen called our rep directly. ' +
          'API failure rate is 30% for two weeks and they\'ve been evaluating CompetitorX. ' +
          'He gave us a Friday deadline or they migrate. Engineering needs to prioritize this immediately.',
        incentive:
          'Team lead is the voice of the customer — their job is to be an accurate relay. Specificity protects their credibility.',
        lostDetails: [],
        addedFraming: [],
      },
      {
        role: 'CS Manager',
        message:
          'Apex Industries is escalating. They\'re a significant account and have been experiencing API issues for a couple of weeks. ' +
          'They\'ve mentioned looking at alternatives. They want resolution soon or they may consider switching. ' +
          'Engineering should take a look.',
        incentive:
          'CS manager doesn\'t want to alarm engineering with a hard deadline they can\'t meet — they soften the urgency to avoid conflict. ' +
          'Also, naming a competitor in writing feels risky; it invites uncomfortable questions about the CS team\'s awareness.',
        lostDetails: ['$4.2M ARR', '3rd largest ranking', 'CTO David Chen named', 'CompetitorX named', '30% failure rate', 'Friday deadline explicit'],
        addedFraming: ['significant account', 'a couple of weeks', 'mentioned looking at alternatives', 'may consider'],
      },
      {
        role: 'Director of CS',
        message:
          'One of our enterprise accounts is showing churn risk. There\'s a technical issue that engineering should address as a priority. ' +
          'Customer is evaluating options.',
        incentive:
          'Director frames this as a "churn risk" metric — that\'s their vocabulary for board reporting. ' +
          'Removes the human (David Chen), the dollar amount, and the hard deadline. Feels more manageable this way.',
        lostDetails: ['Apex Industries named', 'ARR value', 'CTO name', 'failure rate percentage', 'competitor evaluation', 'Friday deadline'],
        addedFraming: ['churn risk', 'evaluating options', 'should address'],
      },
      {
        role: 'VP Customer Experience',
        message:
          'We have an enterprise account at elevated churn risk due to a technical integration issue. ' +
          'Engineering has been notified. Monitoring closely.',
        incentive:
          'VP CX is in a QBR preparation cycle. Elevated churn risk is a dashboard metric — it\'s being "monitored." ' +
          '"Engineering has been notified" suggests action without committing to any timeline.',
        lostDetails: ['account identity', 'revenue at risk', 'competitor evaluation stage', 'customer-set deadline', 'two-week issue duration'],
        addedFraming: ['elevated churn risk', 'monitoring closely', 'has been notified'],
      },
      {
        role: 'CRO',
        message:
          'Customer success flagged a retention issue with an enterprise account. Technical root cause — engineering is engaged.',
        incentive:
          'CRO smooths the message for executive consumption. "Retention issue" is softer than "threat to leave." ' +
          '"Engineering is engaged" sounds like progress, regardless of actual priority.',
        lostDetails: ['account name and ARR', 'competitive threat', 'imminent deadline', 'failure rate specifics'],
        addedFraming: ['retention issue', 'engaged'],
      },
      {
        role: 'SVP / CCO',
        message:
          'Revenue: one enterprise account flagged for retention monitoring. Engineering involved.',
        incentive:
          'CCO is condensing dozens of accounts into a status roll-up. One account at risk is a footnote. ' +
          '"Flagged for monitoring" sounds deliberate and controlled — it\'s actually a customer threatening to leave by Friday.',
        lostDetails: ['urgency of the situation', 'customer named deadline', 'competitor evaluation', 'revenue at risk'],
        addedFraming: ['flagged for retention monitoring', 'involved'],
      },
      {
        role: 'COO',
        message:
          'Revenue operations: customer retention metrics within normal range. One watch item.',
        incentive:
          'COO sees this as one bullet in a hundred-item org summary. "Within normal range" with a watch item is green-to-yellow. ' +
          'The original Friday deadline has evaporated completely.',
        lostDetails: ['account at risk', 'churn threat', 'engineering engagement status', 'timeline'],
        addedFraming: ['within normal range', 'watch item'],
      },
      {
        role: 'CEO',
        message:
          'Revenue: customer retention remains strong. No significant churn events.',
        incentive:
          'CEO receives a clean executive summary. "No significant churn events" is technically accurate on the day it\'s written — ' +
          'but Apex Industries is on the phone with CompetitorX right now.',
        lostDetails: ['every actionable detail from the original message'],
        addedFraming: ['remains strong', 'no significant churn events'],
      },
    ],
  },

  // ── Innovation Proposal ───────────────────────────────────────────
  {
    id: 'innovation-proposal',
    title: 'Streaming Pipeline Breakthrough',
    category: 'innovation',
    originalMessage:
      'I have a working prototype that replaces our batch ETL pipeline with a streaming architecture. ' +
      'Benchmarks show 94% latency reduction: from 45 minutes to under 3 minutes. ' +
      'That translates to $380,000 per year in saved compute costs and eliminates the 6 AM data freshness complaints from the sales team. ' +
      'I can have it production-ready in 3 weeks with one additional engineer.',
    levels: [
      {
        role: 'Tech Lead',
        message:
          'One of our engineers built a working prototype replacing batch ETL with a streaming pipeline. ' +
          'Benchmarks show 94% latency reduction — 45 minutes down to under 3 minutes. ' +
          'That\'s $380K/yr in compute savings and fixes the 6 AM data freshness issue. ' +
          'They estimate 3 weeks to production with one additional engineer assigned.',
        incentive:
          'Tech lead is advocating for their team member. Precise numbers protect the proposal\'s credibility.',
        lostDetails: [],
        addedFraming: [],
      },
      {
        role: 'Engineering Manager',
        message:
          'We have a promising prototype from the data infrastructure team. It significantly reduces pipeline latency and could save meaningful compute costs. ' +
          'The engineer estimates a few weeks to production readiness with some additional resources.',
        incentive:
          'EM doesn\'t want to over-promise on behalf of an engineer whose estimate they can\'t vouch for. ' +
          '"Significant" and "meaningful" hedge without lying. They also don\'t want to create a hard resource commitment without approval.',
        lostDetails: ['94% latency figure', '45-minute to 3-minute improvement', '$380K annual savings', '6 AM sales team complaints', 'one specific engineer needed'],
        addedFraming: ['promising', 'could save', 'meaningful', 'some additional resources'],
      },
      {
        role: 'Director of Engineering',
        message:
          'The data infrastructure team has a prototype showing pipeline performance improvements. ' +
          'There\'s potential for cost reduction and better data freshness. Needs further evaluation before we can commit.',
        incentive:
          'Director is protecting their planning cycle. A specific proposal with a timeline and cost savings creates pressure to act — ' +
          '"needs further evaluation" buys time and kills urgency.',
        lostDetails: ['latency percentages', 'dollar savings figure', 'sales team impact', 'production timeline', 'resource ask'],
        addedFraming: ['potential for', 'further evaluation', 'before we can commit'],
      },
      {
        role: 'VP Engineering',
        message:
          'We\'re exploring infrastructure optimizations in the data pipeline space. Early exploration looks encouraging. ' +
          'No resourcing decisions made yet.',
        incentive:
          'VP is managing a roadmap and doesn\'t want a bottom-up initiative bypassing their prioritization process. ' +
          '"Exploring" positions this as their initiative, not the engineer\'s breakthrough.',
        lostDetails: ['working prototype exists', 'specific performance metrics', 'cost savings', 'timeline', 'business impact on sales'],
        addedFraming: ['exploring', 'early exploration', 'looks encouraging', 'no decisions made yet'],
      },
      {
        role: 'SVP Technology',
        message:
          'Engineering is evaluating potential improvements to data infrastructure. Work ongoing.',
        incentive:
          'SVP summarizes engineering as a portfolio. One initiative at the prototype stage is background noise. ' +
          '"Work ongoing" signals activity without any commitment.',
        lostDetails: ['prototype maturity', 'quantified impact', 'resource need', 'sales team benefit'],
        addedFraming: ['evaluating potential improvements', 'work ongoing'],
      },
      {
        role: 'CTO',
        message:
          'Technology: data infrastructure under continuous improvement. Teams executing on plan.',
        incentive:
          'CTO is writing their board update. "Continuous improvement" is evergreen language — it sounds positive and requires no follow-up. ' +
          'A specific employee\'s specific prototype has dissolved into org-level boilerplate.',
        lostDetails: ['breakthrough prototype', 'quantified latency and cost gains', 'resource ask', 'production timeline'],
        addedFraming: ['continuous improvement', 'executing on plan'],
      },
      {
        role: 'COO',
        message:
          'Technology function: executing roadmap. No blockers reported.',
        incentive:
          'COO is compressing 5 functional areas into a single executive summary. An engineer\'s prototype that could save $380K/yr ' +
          'is invisible next to quarterly revenue numbers.',
        lostDetails: ['any mention of the innovation', 'savings opportunity', 'team need'],
        addedFraming: ['executing roadmap', 'no blockers reported'],
      },
      {
        role: 'CEO',
        message:
          'Technology: executing on plan. Infrastructure performing within expectations.',
        incentive:
          'CEO sees a clean status report. "Within expectations" means no action needed. ' +
          'The engineer\'s prototype — a 94% latency improvement and $380K in savings — will not make it onto the roadmap this quarter.',
        lostDetails: ['every specific detail, saving, and opportunity from the original message'],
        addedFraming: ['executing on plan', 'within expectations'],
      },
    ],
  },

  // ── Strategic Risk ────────────────────────────────────────────────
  {
    id: 'strategic-risk',
    title: 'Competitor Parity Threat',
    category: 'strategy',
    originalMessage:
      'CompetitorY just launched a free tier targeting our mid-market segment. ' +
      'They hired 40 enterprise sales reps in Q1 alone. Their pricing is 35% below ours and they\'re actively building the three features ' +
      'that are our top differentiators according to our own customer surveys. ' +
      'I estimate we have a 6-month window before they reach parity. ' +
      'We need to accelerate the enterprise roadmap and consider a defensive pricing adjustment now.',
    levels: [
      {
        role: 'Market Intel Lead',
        message:
          'CompetitorY launched a free tier targeting our mid-market segment and hired 40 enterprise reps in Q1. ' +
          'Pricing is 35% below ours. They\'re replicating our top 3 differentiators per customer survey data. ' +
          'Estimate: 6-month window to parity. Recommend accelerating enterprise roadmap and a defensive pricing adjustment.',
        incentive:
          'Intel analyst\'s credibility depends on the accuracy and actionability of their reports. Specificity is their currency.',
        lostDetails: [],
        addedFraming: [],
      },
      {
        role: 'Director of Strategy',
        message:
          'CompetitorY is making aggressive moves in our mid-market space — new free tier, significant sales hiring, and pricing well below ours. ' +
          'They\'re investing in features that overlap with our differentiators. We may have a limited window before the gap narrows. ' +
          'Worth discussing roadmap and pricing response.',
        incentive:
          'Director softens the recommendation to avoid creating alarm before they\'ve validated the analysis internally. ' +
          '"Worth discussing" defers the decision upward without advocating a position.',
        lostDetails: ['40 reps in Q1', '35% pricing gap', '6-month timeline estimate', 'top 3 differentiators specified', 'explicit recommendation to act now'],
        addedFraming: ['aggressive moves', 'may have a limited window', 'worth discussing'],
      },
      {
        role: 'VP Strategy',
        message:
          'The market intelligence team flagged increased competitive activity from CompetitorY in the mid-market. ' +
          'They\'ve expanded sales capacity and adjusted pricing. We\'re monitoring the feature roadmap overlap. ' +
          'Will bring a formal analysis to the next planning cycle.',
        incentive:
          'VP Strategy is protecting the planning process — they don\'t want a bottom-up intel report driving an unplanned strategy change. ' +
          '"Next planning cycle" pushes the urgency past the 6-month window the analyst estimated.',
        lostDetails: ['free tier targeting strategy', 'rep count specifics', 'pricing percentage gap', 'parity timeline', 'specific recommendation'],
        addedFraming: ['increased competitive activity', 'monitoring', 'next planning cycle'],
      },
      {
        role: 'CSO',
        message:
          'Competitive landscape shows increased activity in mid-market. Standard monitoring protocols in place. ' +
          'Strategy team will incorporate findings into Q3 planning.',
        incentive:
          'CSO is framing this for the executive team in language that signals control. "Standard protocols" sounds managed. ' +
          '"Q3 planning" removes urgency — if the window is 6 months and Q3 is 5 months away, the window may close before the plan is written.',
        lostDetails: ['CompetitorY named', 'pricing gap', 'feature replication threat', 'parity estimate', 'recommendation for immediate action'],
        addedFraming: ['standard monitoring protocols', 'incorporate into planning'],
      },
      {
        role: 'SVP / CCO',
        message:
          'Market conditions: competitive environment stable. Strategy team monitoring mid-market dynamics.',
        incentive:
          'CCO is in investor relations mode — "stable" is the preferred adjective in every executive communication. ' +
          'The intel analyst\'s 6-month warning has become "stable."',
        lostDetails: ['competitor threat specifics', 'urgency', 'recommendation', 'any quantified risk'],
        addedFraming: ['competitive environment stable', 'monitoring dynamics'],
      },
      {
        role: 'COO',
        message:
          'Strategy: market position holding. Routine competitive monitoring ongoing.',
        incentive:
          'COO sees a calm report from the CCO and forwards the same tone. ' +
          '"Holding" implies strength. "Routine monitoring" implies nothing unusual is happening.',
        lostDetails: ['competitor free tier launch', 'sales hiring surge', 'feature parity timeline', 'any sense of urgency'],
        addedFraming: ['holding', 'routine monitoring ongoing'],
      },
      {
        role: 'President',
        message:
          'Commercial: competitive position remains favorable. No strategic shifts required at this time.',
        incentive:
          'President summarizes the org for the CEO. "No strategic shifts required" is the ultimate signal that the alarm has been fully diffused. ' +
          'It also protects the President from being blamed for missing the threat — the paper trail shows they said "favorable."',
        lostDetails: ['specific competitor', 'quantified risk', 'any action recommendation'],
        addedFraming: ['remains favorable', 'no strategic shifts required'],
      },
      {
        role: 'CEO',
        message:
          'Market: competitive position remains favorable. Strategy execution on track.',
        incentive:
          'CEO is writing the board letter. "Favorable" and "on track" are the two words investors want to see. ' +
          'The original report — a 6-month parity warning with a specific competitor — has become invisible.',
        lostDetails: ['every specific finding and recommendation from the original report'],
        addedFraming: ['remains favorable', 'on track'],
      },
    ],
  },

  // ── Operational Bottleneck ────────────────────────────────────────
  {
    id: 'operational-bottleneck',
    title: 'Packing Line Throughput Drop',
    category: 'operations',
    originalMessage:
      'Packing line throughput has dropped from 1,200 to 780 units per hour — a 35% decline — since we installed the new conveyor firmware last Tuesday. ' +
      'Root cause is a timing mismatch: gate_delay_ms is set to 340, it should be 220. ' +
      'It\'s a 2-hour fix. We\'re losing $8,400 per hour in output. ' +
      'I need authorization to roll back the firmware update or push the corrected config now.',
    levels: [
      {
        role: 'Shift Supervisor',
        message:
          'Packing line throughput dropped from 1,200 to 780 units/hr (35%) since the firmware update Tuesday. ' +
          'Root cause identified: gate_delay_ms set to 340, should be 220. 2-hour fix. ' +
          'We\'re losing $8,400/hr. Need authorization to roll back firmware or push corrected config.',
        incentive:
          'Supervisor has diagnosed the problem completely. Their job is to get authorization — precision is the path to a fast yes.',
        lostDetails: [],
        addedFraming: [],
      },
      {
        role: 'Production Manager',
        message:
          'The packing line is running below capacity following the firmware update last week. ' +
          'We\'ve identified the issue — a configuration parameter — and have a fix ready. ' +
          'Requesting authorization to apply the corrective update.',
        incentive:
          'Production manager doesn\'t want to escalate a technical config error — it implies their team missed something in the update process. ' +
          'Vague language obscures the specific miss and avoids blame.',
        lostDetails: ['35% throughput figure', 'before/after unit count', '$8,400/hr loss', 'gate_delay_ms specifics', '2-hour fix timeline'],
        addedFraming: ['below capacity', 'identified the issue', 'corrective update'],
      },
      {
        role: 'Director of Manufacturing',
        message:
          'Packing line performance is suboptimal following a recent system update. ' +
          'Engineering is working a resolution. Expected to be addressed in the near term.',
        incentive:
          'Director doesn\'t want to surface a production issue to VP level unless they have to — it reflects on their management of the update process. ' +
          '"Near term" is intentionally vague.',
        lostDetails: ['throughput numbers', 'cost of delay', 'fix is already identified and ready', 'authorization needed'],
        addedFraming: ['suboptimal', 'working a resolution', 'near term'],
      },
      {
        role: 'VP Manufacturing',
        message:
          'Manufacturing: minor performance variance on the packing line post-update. Team is on it.',
        incentive:
          'VP is briefing the SVP. "Minor variance" dramatically undersells a 35% throughput drop. ' +
          '"Team is on it" signals engagement without revealing that the fix has been ready for hours waiting on authorization.',
        lostDetails: ['severity of throughput drop', 'revenue impact', 'ready fix waiting for sign-off', 'root cause clarity'],
        addedFraming: ['minor performance variance', 'team is on it'],
      },
      {
        role: 'SVP Operations',
        message:
          'Operations: post-update adjustment ongoing on packing line. Normal course.',
        incentive:
          'SVP frames this as routine post-update stabilization — something that happens all the time. ' +
          '"Normal course" is false; a 35% throughput loss costing $8,400/hr is not normal. But it sounds managed.',
        lostDetails: ['throughput loss magnitude', 'cost accumulation', 'configuration root cause', 'fix awaiting authorization'],
        addedFraming: ['post-update adjustment', 'ongoing', 'normal course'],
      },
      {
        role: 'COO',
        message:
          'Manufacturing: packing line update in stabilization phase. No production stoppages.',
        incentive:
          'COO is writing the executive operations summary. "No production stoppages" is technically true — the line is running, just at 35% lower output. ' +
          'The authorization request that triggered all of this has never reached anyone with the authority to grant it.',
        lostDetails: ['throughput decline', 'hourly cost', 'root cause and fix', 'authorization bottleneck'],
        addedFraming: ['stabilization phase', 'no production stoppages'],
      },
      {
        role: 'CSCO',
        message:
          'Supply chain: manufacturing operations proceeding. Modernization investments on track.',
        incentive:
          'CSCO (Chief Supply Chain Officer) receives a calm report and reframes the firmware update as part of planned modernization. ' +
          '"On track" is the language of controlled execution, not active production loss.',
        lostDetails: ['performance degradation', 'revenue loss', 'any indication a problem exists'],
        addedFraming: ['modernization investments on track', 'proceeding'],
      },
      {
        role: 'CEO',
        message:
          'Operations: production systems performing as expected. Modernization investments on track.',
        incentive:
          'CEO receives a supply chain summary letter. "Performing as expected" means the board gets nothing actionable. ' +
          'By the time this message reaches the CEO, the company has lost tens of thousands of dollars in output — ' +
          'and the fix has been sitting, authorized, for 8 hours.',
        lostDetails: ['every specific fact, cost, and action item from the original message'],
        addedFraming: ['performing as expected', 'on track'],
      },
    ],
  },
];
