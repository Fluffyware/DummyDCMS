// Comprehensive Executive Presentation Data for PT Taka Hydrocore Indonesia (THI)
// QHSSE Management System: 10 Operational Elements & 4 Fundamental Pillars

export interface ElementPresentation {
  num: number;
  id: string;
  label: string;
  titleLines: string[];
  fundamentalId: string;
  fundamentalName: string;
  color: string;
  badge: string;
  tagline: string;
  executiveMandate: string;
  offshoreExecution: string;
  laboratoryAndBase: string;
  raciMatrix: {
    role: string;
    raci: 'Accountable' | 'Responsible' | 'Consulted' | 'Informed';
    duty: string;
  }[];
  regulatoryClauses: {
    framework: string;
    clause: string;
    requirement: string;
  }[];
  riskControls: {
    hazardScenario: string;
    barrierLevel: 'Preventive' | 'Mitigative';
    safeguardMethod: string;
    residualRisk: 'Low' | 'Medium';
  }[];
  kpiMetrics: {
    name: string;
    target: string;
    actualYTD: string;
    benchmark: string;
    status: 'EXCEEDED' | 'ACHIEVED' | 'MONITORED';
  }[];
  controlledDocs: {
    number: string;
    title: string;
    revision: string;
    type: string;
    dept: string;
    description: string;
    route: string;
  }[];
}

export interface FundamentalPresentation {
  id: string;
  name: string;
  quadrant: number;
  color: string;
  subtitle: string;
  charterStatement: string;
  pdcaPhase: string;
  coreGovernance: string;
  marineApplication: string;
  strategicDeliverables: string[];
  coveredElementNums: number[];
  fleetMetrics: { label: string; value: string; note: string }[];
  governingStandards: string[];
}

export const THI_PRESENTATION_ELEMENTS: Record<number, ElementPresentation> = {
  1: {
    num: 1,
    id: "elem-1",
    label: "1. Leadership & Commitment",
    titleLines: ["1.", "Leadership &", "Commitment"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#071c2c",
    badge: "ELEMENT 01 · GOVERNANCE & ACCOUNTABILITY",
    tagline: "Executive commitment and individual accountability guiding responsible operations and safety leadership.",
    executiveMandate: "Commitment is essential to the success of the OMS, as is everyone's accountability for their actions. Everyone must understand their accountability for OMS policies, systems, decisions, and outcomes; this is a fundamental requirement for those who lead and control activities. Managers foster a strong culture, establish strategic objectives, communicate requirements, and provide clear direction to guide the organization in sustaining responsible operations.",
    offshoreExecution: "Vessel Masters, Party Chiefs, and Drilling Superintendents visibly demonstrate leadership by conducting daily safety walk-throughs, chairing pre-shift safety briefings, and unconditionally upholding Stop-Work Authority without operational compromise.",
    laboratoryAndBase: "Base and laboratory managers ensure adequate resourcing, maintain transparent safety communications, and lead regular management reviews to cultivate a proactive culture of compliance and technical excellence.",
    raciMatrix: [
      { role: "Managing Director / Board", raci: "Accountable", duty: "Provide strategic governance, approve corporate policies, and allocate capital for safety systems." },
      { role: "QHSSE Manager", raci: "Responsible", duty: "Develop, implement, and maintain OMS framework integrity across all marine divisions." },
      { role: "Vessel Master / Party Chief", raci: "Responsible", duty: "Enforce shipboard safety standards, verify daily compliance, and uphold stop-work decisions." },
      { role: "All Offshore & Lab Staff", raci: "Informed", duty: "Adhere to OMS policies and exercise personal responsibility for safe individual conduct." },
    ],
    regulatoryClauses: [
      { framework: "ISO 9001:2015", clause: "5.1", requirement: "Leadership and commitment with respect to the Quality Management System" },
      { framework: "ISO 45001:2018", clause: "5.1", requirement: "Leadership and worker participation in Occupational Health and Safety" },
      { framework: "ISM Code", clause: "Part A (1.4)", requirement: "Company responsibilities and authority for safety and environmental protection" },
    ],
    riskControls: [
      { hazardScenario: "Commercial pressure superseding offshore safety requirements", barrierLevel: "Preventive", safeguardMethod: "Unconditional Stop-Work Authority backed by executive decree with zero reprisal guarantee", residualRisk: "Low" },
      { hazardScenario: "Ambiguous responsibility leading to deferred safety interventions", barrierLevel: "Preventive", safeguardMethod: "Clearly defined RACI matrices and cascaded individual accountability charters", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Executive Shipboard Walkthroughs", target: "16 Visits / Year", actualYTD: "18 Visits", benchmark: "IMCA Marine Benchmark", status: "EXCEEDED" },
      { name: "Stop-Work Authority Invocations Upheld", target: "100%", actualYTD: "100%", benchmark: "Zero Retaliation Policy", status: "ACHIEVED" },
    ],
    controlledDocs: [
      { number: "POL-QHSSE-001", title: "Corporate QHSSE Policy Statement", revision: "Rev.04", type: "Policy", dept: "Corporate Governance", description: "Executive declaration of corporate commitment to zero harm, environmental protection, and quality.", route: "/dashboard/masterlist" },
      { number: "MAN-QHSSE-001", title: "QHSSE Leadership & Governance Manual", revision: "Rev.02", type: "Manual", dept: "Management", description: "Defines roles, responsibilities, authorities, and accountability matrices across all entities.", route: "/dashboard/masterlist" },
    ],
  },
  2: {
    num: 2,
    id: "elem-2",
    label: "2. Policies & Strategic Objectives",
    titleLines: ["2.", "Policies &", "Strategic Objectives"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#0d2d47",
    badge: "ELEMENT 02 · STRATEGIC DIRECTION",
    tagline: "Clear policies and measurable objectives defining boundaries, values, and operational targets.",
    executiveMandate: "Policies, standards, and objectives (PSO) must contain clear statements of what the enterprise intends to achieve. Policies articulate high-level commitments to general principles, boundaries, and statements of intent regarding how the enterprise will operate. Standards and objectives support those policies with more detailed requirements and long-term targets, both reflecting the scope of the OMS concerning specific types of risks, impacts, or threats. Corporate PSOs reflect established values applied across the organization. However, assets, business units, projects, or other organizational levels may establish supplementary PSOs as needed (aligned with corporate levels) to manage specific projects, operational activities, and local issues.",
    offshoreExecution: "Corporate policies and campaign-specific objectives are posted prominently aboard all vessels; daily tool-box talks explicitly reference how immediate tasks contribute to overall campaign QHSSE targets.",
    laboratoryAndBase: "Onshore testing facilities maintain localized quality objectives, calibration standards, and turnaround KPIs directly linked to corporate strategic milestones.",
    raciMatrix: [
      { role: "Board of Directors", raci: "Accountable", duty: "Sign off corporate policies annually and establish 5-year strategic corporate objectives." },
      { role: "Operations Director", raci: "Responsible", duty: "Cascade corporate objectives into measurable divisional and vessel-level performance targets." },
      { role: "Project Managers", raci: "Responsible", duty: "Draft supplementary project-level PSOs aligned with client contractual expectations." },
    ],
    regulatoryClauses: [
      { framework: "ISO 9001:2015", clause: "5.2 & 6.2", requirement: "Establishing quality policy and measurable quality objectives" },
      { framework: "ISO 14001:2015", clause: "5.2 & 6.2", requirement: "Environmental policy and planning to achieve environmental objectives" },
      { framework: "ISO 45001:2018", clause: "5.2 & 6.2", requirement: "OH&S policy and planning to achieve occupational health & safety targets" },
    ],
    riskControls: [
      { hazardScenario: "Divergence between client contract terms and internal QHSSE standards", barrierLevel: "Preventive", safeguardMethod: "Formal Project Bridging Documents and supplementary project-specific PSO charters", residualRisk: "Low" },
      { hazardScenario: "Vague or unmeasurable safety objectives leading to lack of operational focus", barrierLevel: "Preventive", safeguardMethod: "SMART KPI scorecard system reviewed monthly by the QHSSE steering committee", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Annual Policy Review & Re-endorsement", target: "100%", actualYTD: "100%", benchmark: "Statutory Requirement", status: "ACHIEVED" },
      { name: "Strategic Objectives On-Schedule", target: "90%", actualYTD: "94.2%", benchmark: "Internal Business Plan", status: "EXCEEDED" },
    ],
    controlledDocs: [
      { number: "OBJ-QHSSE-2026", title: "Corporate QHSSE Strategic Objectives", revision: "Rev.01", type: "Objective", dept: "Strategic Planning", description: "Cascaded performance targets, milestones, and measurement methods for the current calendar year.", route: "/dashboard/masterlist" },
      { number: "STD-ENV-002", title: "Offshore Marine Environmental Protection Standard", revision: "Rev.03", type: "Standard", dept: "QHSSE", description: "Establishes emission thresholds, waste segregation, and biodiversity protection rules at sea.", route: "/dashboard/masterlist" },
    ],
  },
  3: {
    num: 3,
    id: "elem-3",
    label: "3. Organization, Resources & Documentation",
    titleLines: ["3.", "Organization, Resources", "& Documentation"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#1a4a6e",
    badge: "ELEMENT 03 · COMPETENCE & RESOURCING",
    tagline: "Structured organization, capable resources, and rigorous documentation across operations.",
    executiveMandate: "Thorough preparation in terms of organization, resources, and capability forms the foundation for delivering consistent performance to meet corporate objectives and internal requirements, as well as responding to stakeholder expectations. This is achieved by ensuring the availability of the right equipment, processes, and people equipped with the appropriate skills at the right time. It is vital to extend OMS consistency to contractors, who serve as key resources when engaged to enhance organizational capability.",
    offshoreExecution: "Mobilization checklists verify that all offshore personnel hold verified BOSIET, HUET, and OGUK medical certificates; vessel documentation and operating manuals are audited and up-to-date prior to departure.",
    laboratoryAndBase: "Geotechnical test equipment undergoes certified calibration; standard operating procedures are systematically distributed, archived, and updated via digital document control.",
    raciMatrix: [
      { role: "Human Resources & Training Manager", raci: "Accountable", duty: "Maintain verified training matrices, competency certifications, and crew deployment records." },
      { role: "Document Controller (DCC)", raci: "Responsible", duty: "Oversee document lifecycle, revision numbering, distribution stamping, and masterlist maintenance." },
      { role: "Procurement / Contractor Manager", raci: "Responsible", duty: "Enforce contractor pre-qualification audits and ensure contractor compliance with THI OMS." },
    ],
    regulatoryClauses: [
      { framework: "ISO 9001:2015", clause: "7.1 - 7.5", requirement: "Resources, competence, awareness, communication, and documented information" },
      { framework: "ISO 45001:2018", clause: "7.2 & 7.5", requirement: "Competence verification and control of documented information" },
      { framework: "IMCA C 002", clause: "Guidance", requirement: "Competence assurance and assessment for offshore marine survey personnel" },
    ],
    riskControls: [
      { hazardScenario: "Deployment of unqualified contractor personnel during high-risk offshore operations", barrierLevel: "Preventive", safeguardMethod: "Automated gate-check verifying mandatory offshore training certificates prior to crew vessel boarding", residualRisk: "Low" },
      { hazardScenario: "Frontline crews utilizing superseded or obsolete operating procedures", barrierLevel: "Preventive", safeguardMethod: "Centralized digital Document Control System with unique QR verification and automated obsolescence flags", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Offshore Competency Matrix Compliance", target: "100%", actualYTD: "100%", benchmark: "IMCA Standard", status: "ACHIEVED" },
      { name: "Document Masterlist Currency Rate", target: "98%", actualYTD: "99.1%", benchmark: "ISO 9001 Audit", status: "EXCEEDED" },
    ],
    controlledDocs: [
      { number: "PRO-HR-003", title: "Offshore Competency & Training Procedure", revision: "Rev.03", type: "Procedure", dept: "Human Resources", description: "Outlines mandatory certifications, refresher intervals, and competency assessment guidelines.", route: "/dashboard/masterlist" },
      { number: "SOP-DCC-001", title: "Document Control & Masterlist Governance SOP", revision: "Rev.05", type: "Procedure", dept: "Document Control", description: "Specifies creation, review, approval workflow, distribution, and obsolescence tracking of company documents.", route: "/dashboard/masterlist" },
    ],
  },
  4: {
    num: 4,
    id: "elem-4",
    label: "4. Risk Management",
    titleLines: ["4.", "Risk", "Management"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#30256f",
    badge: "ELEMENT 04 · STAKEHOLDER & RISK CONTROL",
    tagline: "Proactive identification and mitigation of operational risks and stakeholder impacts.",
    executiveMandate: "Many stakeholders are affected by, and may need to be engaged with (or directly involved in), enterprise activities. Both parties can derive economic, social, or environmental benefits, over both the short and long term, from such relationships. The enterprise must be capable of managing risks and opportunities that could potentially impact its stakeholders and customers.",
    offshoreExecution: "Pre-mobilization HAZID/ENVID workshops identify marine geotechnical hazards, shallow gas risks, dynamic positioning drift potential, and local fishing community interface protocols.",
    laboratoryAndBase: "Chemical handling risk assessments, autoclave pressure containment safety checks, and ergonomic evaluations protect onshore facility technicians and surrounding communities.",
    raciMatrix: [
      { role: "QHSSE Risk Lead", raci: "Accountable", duty: "Maintain the corporate risk register and facilitate campaign HAZID/ENVID assessments." },
      { role: "Operations Manager", raci: "Responsible", duty: "Implement preventive and mitigative barriers across offshore vessels and marine bases." },
      { role: "Commercial & Client Interface Lead", raci: "Responsible", duty: "Manage stakeholder relations, community liaison, and client bridging documentation." },
    ],
    regulatoryClauses: [
      { framework: "ISO 31000:2018", clause: "Core", requirement: "Principles and guidelines on risk management design, implementation, and review" },
      { framework: "ISO 14001:2015", clause: "6.1", requirement: "Actions to address risks and opportunities regarding environmental aspects" },
      { framework: "ISO 45001:2018", clause: "6.1", requirement: "Hazard identification and assessment of occupational health and safety risks" },
    ],
    riskControls: [
      { hazardScenario: "Encountering unpredicted shallow gas pockets during geotechnical seabed drilling", barrierLevel: "Preventive", safeguardMethod: "Pre-drilling high-resolution geophysical survey review and real-time gas monitoring sensors", residualRisk: "Low" },
      { hazardScenario: "Conflict with artisanal fishing vessels operating in survey corridors", barrierLevel: "Mitigative", safeguardMethod: "Dedicated Chase Boat deployment, community liaison officers, and Notice to Mariners broadcasts", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Pre-Mobilization HAZID Completion Rate", target: "100%", actualYTD: "100%", benchmark: "Client Contract Mandate", status: "ACHIEVED" },
      { name: "High-Risk Operations Mitigated under ALARP", target: "100%", actualYTD: "100%", benchmark: "Corporate Safety Standard", status: "ACHIEVED" },
    ],
    controlledDocs: [
      { number: "PRO-RSK-001", title: "Enterprise Risk Assessment & Matrix Procedure", revision: "Rev.03", type: "Procedure", dept: "Risk & Safety", description: "Defines the 5x5 qualitative risk matrix, ALARP evaluation criteria, and hazard classification rules.", route: "/dashboard/masterlist" },
      { number: "PLN-ENG-004", title: "Marine Stakeholder & Interface Bridging Plan", revision: "Rev.02", type: "Plan", dept: "Operations", description: "Protocols for coordinating with port authorities, naval commands, fishing cooperatives, and clients.", route: "/dashboard/masterlist" },
    ],
  },
  5: {
    num: 5,
    id: "elem-5",
    label: "5. Planning & Work Management",
    titleLines: ["5.", "Planning &", "Work Management"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#071c2c",
    badge: "ELEMENT 05 · WORK PLANNING & CONTROLS",
    tagline: "Comprehensive work planning and systematic controls balancing residual risk and operational excellence.",
    executiveMandate: "The OMS aims to deliver benefits to the enterprise and its stakeholders while controlling its risks. These risks encompass potential injury and ill health, security threats, environmental and social impacts, process safety incidents, and damage to enterprise assets, reputation, and/or enterprise value. It is often impossible to eliminate risk completely, making it essential for the enterprise to determine the level of tolerable residual risk acceptable to its business and stakeholders, while continually improving controls wherever practicable.",
    offshoreExecution: "Strict implementation of Permit-to-Work (PTW) protocols, task-specific Job Safety Analysis (JSA), simultaneous operations (SIMOPS) coordination, and dynamic weather-window evaluations before each shift.",
    laboratoryAndBase: "Testing schedules, hazardous material handling plans, and preventive maintenance sequences are planned and coordinated with clear task assignments and verification stages.",
    raciMatrix: [
      { role: "Operations Manager / Party Chief", raci: "Accountable", duty: "Authorize Permit-to-Work certificates and review SIMOPS plans before high-risk tasks." },
      { role: "Offshore HSE Officer", raci: "Responsible", duty: "Facilitate daily JSAs, inspect work areas, and verify safety controls are active on site." },
      { role: "Shift Supervisor / Lead Driller", raci: "Responsible", duty: "Conduct Tool Box Talks (TBT) and ensure frontline crew execute tasks strictly per the approved PTW." },
    ],
    regulatoryClauses: [
      { framework: "ISO 45001:2018", clause: "8.1", requirement: "Operational planning and control; eliminating hazards and reducing OH&S risks" },
      { framework: "ISO 9001:2015", clause: "8.1", requirement: "Operational planning and control of product and service provision" },
      { framework: "IMCA M 103", clause: "Guidelines", requirement: "Guidelines for the design and operation of dynamically positioned vessels and marine works" },
    ],
    riskControls: [
      { hazardScenario: "Uncontrolled SIMOPS between seabed drilling and side-scan sonar deployment", barrierLevel: "Preventive", safeguardMethod: "Mandatory SIMOPS matrix, umbilical separation zones, and bridge-controlled operational sequencing", residualRisk: "Low" },
      { hazardScenario: "Extreme weather or sudden sea-state deterioration during downhole soil sampling", barrierLevel: "Preventive", safeguardMethod: "Real-time meteorological monitoring with predefined heave/swell operational cutoff thresholds", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Pre-Shift JSA & TBT Compliance Rate", target: "100%", actualYTD: "100%", benchmark: "Marine Industry Standard", status: "ACHIEVED" },
      { name: "Permit-to-Work Audit Non-Conformances", target: "0 Cases", actualYTD: "0 Cases", benchmark: "Internal Target", status: "ACHIEVED" },
    ],
    controlledDocs: [
      { number: "SOP-OPS-012", title: "Permit-to-Work & SIMOPS Control Procedure", revision: "Rev.04", type: "Procedure", dept: "Marine Operations", description: "Comprehensive rules for cold work, hot work, confined space entry, overside work, and SIMOPS.", route: "/dashboard/masterlist" },
      { number: "PRO-HSE-008", title: "Task-Based Job Safety Analysis (JSA) Protocol", revision: "Rev.03", type: "Procedure", dept: "QHSSE", description: "Methodology for breaking down offshore geotechnical tasks and establishing frontline controls.", route: "/dashboard/masterlist" },
    ],
  },
  6: {
    num: 6,
    id: "elem-6",
    label: "6. Execution of Activities",
    titleLines: ["6.", "Execution of", "Activities"],
    fundamentalId: "do",
    fundamentalName: "Do",
    color: "#0d2d47",
    badge: "ELEMENT 06 · ASSET INTEGRITY & DISCIPLINE",
    tagline: "High-integrity asset performance and disciplined execution preventing technical and human failures.",
    executiveMandate: "Assets must meet or exceed applicable standards and function reliably for business activities to be productive and their risks effectively managed. Asset design and integrity (including process safety) address significant risks arising from technical failure and/or human error through robust risk elimination or control measures.",
    offshoreExecution: "Strict adherence to standardized drilling procedures, continuous monitoring of hydraulic pressures and drill-string loads, and execution of scheduled preventive maintenance aboard chartered vessels.",
    laboratoryAndBase: "Precision soil specimen preparation, ASTM-compliant triaxial compression and consolidation testing, and computerized data recording to eliminate manual transcription errors.",
    raciMatrix: [
      { role: "Technical Director / Rig Superintendent", raci: "Accountable", duty: "Assure physical asset integrity, structural certifications, and technical maintenance standards." },
      { role: "Chief Engineer / Chief Mechanic", raci: "Responsible", duty: "Execute planned maintenance routines on hydraulic power units, drilling winches, and heave compensators." },
      { role: "Lead Geotechnical Engineer", raci: "Responsible", duty: "Oversee operational drilling parameters and downhole testing data fidelity." },
    ],
    regulatoryClauses: [
      { framework: "ISO 9001:2015", clause: "8.5", requirement: "Production and service provision; control of monitoring and measuring resources" },
      { framework: "IMCA M 187", clause: "Guidelines", requirement: "Guidelines for lifting operations and vessel technical integrity management" },
      { framework: "ASTM D1586 / D3441", clause: "Standards", requirement: "Standard Test Method for Standard Penetration Test (SPT) and Cone Penetration Test (CPT)" },
    ],
    riskControls: [
      { hazardScenario: "Hydraulic hose burst or high-pressure fluid injection during seabed drilling", barrierLevel: "Preventive", safeguardMethod: "Whip-checks, safety burst shielding, and certified pressure-relief valves inspected daily", residualRisk: "Low" },
      { hazardScenario: "Piezocone sensor drift leading to erroneous seabed stratigraphic interpretation", barrierLevel: "Preventive", safeguardMethod: "Multi-point pre-dive electronic calibration checks and independent laboratory verification testing", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Planned Maintenance System (PMS) Integrity", target: "98%", actualYTD: "98.9%", benchmark: "Offshore Rig Standard", status: "EXCEEDED" },
      { name: "Equipment Non-Productive Time (NPT)", target: "< 2.0%", actualYTD: "0.8%", benchmark: "Client Contract Benchmark", status: "EXCEEDED" },
    ],
    controlledDocs: [
      { number: "SOP-RIG-005", title: "Seabed Geotechnical Drilling & CPT Operations SOP", revision: "Rev.04", type: "Procedure", dept: "Drilling Division", description: "Technical operating specifications for marine drill rigs, casing advancement, and coring techniques.", route: "/dashboard/masterlist" },
      { number: "MAN-PMS-002", title: "Planned Maintenance System (PMS) Rig Standards", revision: "Rev.03", type: "Manual", dept: "Technical Support", description: "Lubrication schedules, pressure vessel certifications, wire-rope inspection intervals, and overhaul protocols.", route: "/dashboard/masterlist" },
    ],
  },
  7: {
    num: 7,
    id: "elem-7",
    label: "7. Monitoring, Audit & Review",
    titleLines: ["7.", "Monitoring, Audit", "& Review"],
    fundamentalId: "check",
    fundamentalName: "Check",
    color: "#1a4a6e",
    badge: "ELEMENT 07 · AUDIT & ASSURANCE",
    tagline: "Rigorous procedures, systematic audits, and regular reviews ensuring consistent risk control.",
    executiveMandate: "Plans and procedures consist of clearly defined requirements to ensure risks are appropriately managed and objectives are achieved. Plans are also designed to optimize performance and drive continual improvement, typically outlining what needs to be done at a relatively high level and referencing procedures for detailed instructions. Depending on the issue, organizational level, and audience (end-users), procedures describe in detail how tasks must be carried out to ensure accuracy and consistency of approach when implementing risk controls. Such procedures may include operating/maintenance procedures, action plans, work instructions, or other job aids.",
    offshoreExecution: "Routine shipboard audits, daily safety tours by the Vessel Master and Party Chief, IMCA eCMID inspections, and real-time operational KPI tracking against project parameters.",
    laboratoryAndBase: "Internal laboratory quality control rounds, proficiency testing blind trials, statutory calibration verification, and scheduled departmental management reviews.",
    raciMatrix: [
      { role: "Lead QHSSE Auditor", raci: "Accountable", duty: "Plan and direct the corporate internal audit programme covering all departments and vessels." },
      { role: "Vessel Master / Base Manager", raci: "Responsible", duty: "Facilitate audit inspections and provide evidence of procedural adherence." },
      { role: "Managing Director", raci: "Informed", duty: "Review annual management review findings and allocate resources for system improvements." },
    ],
    regulatoryClauses: [
      { framework: "ISO 9001:2015", clause: "9.1, 9.2, 9.3", requirement: "Monitoring, measurement, analysis, internal audit, and management review" },
      { framework: "ISO 14001:2015", clause: "9.1 - 9.3", requirement: "Evaluation of compliance, internal audit, and environmental management review" },
      { framework: "ISO 45001:2018", clause: "9.1 - 9.3", requirement: "Performance evaluation, compliance evaluation, and OH&S management review" },
    ],
    riskControls: [
      { hazardScenario: "Frontline procedural drift remaining undetected during long marine campaigns", barrierLevel: "Preventive", safeguardMethod: "Structured weekly behavioral safety audits and mid-campaign peer-review inspections", residualRisk: "Low" },
      { hazardScenario: "Audit non-conformances left open without effective root-cause remediation", barrierLevel: "Mitigative", safeguardMethod: "Mandatory 30-day corrective action close-out tracking with automated executive escalation", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Internal Audit Programme On-Time Execution", target: "100%", actualYTD: "100%", benchmark: "Annual Audit Plan", status: "ACHIEVED" },
      { name: "Audit Finding Close-out within SLA (30 Days)", target: "95%", actualYTD: "96.2%", benchmark: "Corporate Standard", status: "EXCEEDED" },
    ],
    controlledDocs: [
      { number: "PRO-AUD-001", title: "Internal Quality & HSE Audit Procedure", revision: "Rev.03", type: "Procedure", dept: "QHSSE Assurance", description: "Schedules, auditor competence criteria, reporting standards, and finding classification rules.", route: "/dashboard/masterlist" },
      { number: "WIN-OPS-022", title: "Offshore Vessel eCMID Inspection Work Instruction", revision: "Rev.02", type: "Work Instruction", dept: "Marine Operations", description: "Guidelines for conducting IMCA electronic Common Marine Inspection Document (eCMID) vessel surveys.", route: "/dashboard/masterlist" },
    ],
  },
  8: {
    num: 8,
    id: "elem-8",
    label: "8. Continual Improvement",
    titleLines: ["8.", "Continual", "Improvement"],
    fundamentalId: "action",
    fundamentalName: "Action",
    color: "#30256f",
    badge: "ELEMENT 08 · LEARNING & EVOLUTION",
    tagline: "Disciplined execution, proactive interventions, and workforce readiness for perpetual improvement.",
    executiveMandate: "The execution of safe, reliable, and responsible activities encompasses the consistent application of plans and procedures, along with intervention actions whenever risk controls/barriers prove ineffective or specified requirements are not met. To consistently fulfill established requirements, adequate resources (personnel and assets) must be properly prepared for the task (including supervision, competence, and work readiness), underpinned by a culture of discipline.",
    offshoreExecution: "Hazard observation reporting (HOC cards), rapid safety flashes distributed to all vessels after near-misses, and 5-Why root cause investigations conducted within 48 hours of any operational anomaly.",
    laboratoryAndBase: "Systematic review of testing deviations, implementation of client feedback improvements, and modernization of geotechnical software and analytical apparatus.",
    raciMatrix: [
      { role: "Continuous Improvement Committee", raci: "Accountable", duty: "Approve systemic corrective actions and prioritize company-wide improvement initiatives." },
      { role: "Incident Investigation Lead", raci: "Responsible", duty: "Lead root-cause analysis on reported events and verify barrier effectiveness." },
      { role: "All Supervisors & Frontline Personnel", raci: "Informed", duty: "Submit safety cards, participate in post-incident debriefs, and apply lessons learned." },
    ],
    regulatoryClauses: [
      { framework: "ISO 9001:2015", clause: "10.1 - 10.3", requirement: "Non-conformity, corrective action, and continual improvement of the QMS" },
      { framework: "ISO 14001:2015", clause: "10.1 - 10.3", requirement: "Environmental non-conformity, corrective action, and continual improvement" },
      { framework: "ISO 45001:2018", clause: "10.1 - 10.2", requirement: "Incident, non-conformity, corrective action, and continual improvement" },
    ],
    riskControls: [
      { hazardScenario: "Repetition of past offshore equipment failures or procedural breakdowns", barrierLevel: "Preventive", safeguardMethod: "Fleetwide Safety Flash bulletin system and mandatory incorporation into pre-mobilization briefings", residualRisk: "Low" },
      { hazardScenario: "Superficial corrective action addressing symptoms rather than root causes", barrierLevel: "Mitigative", safeguardMethod: "Mandatory TapRooT / 5-Why root-cause investigation required for all incidents and near-misses", residualRisk: "Low" },
    ],
    kpiMetrics: [
      { name: "Near-Miss Investigations Closed in 7 Days", target: "100%", actualYTD: "100%", benchmark: "Safety Charter", status: "ACHIEVED" },
      { name: "Fleetwide Safety Flash Dissemination Velocity", target: "< 24 Hours", actualYTD: "14 Hours", benchmark: "Crisis Protocol", status: "EXCEEDED" },
    ],
    controlledDocs: [
      { number: "PRO-CAPA-001", title: "Non-Conformance & CAPA Management Procedure", revision: "Rev.04", type: "Procedure", dept: "QHSSE", description: "Step-by-step workflow from non-conformance logging to verification of corrective action effectiveness.", route: "/dashboard/masterlist" },
      { number: "PRO-INC-002", title: "Incident Investigation & Root Cause Analysis Procedure", revision: "Rev.03", type: "Procedure", dept: "Safety & Operations", description: "Investigation team composition, evidence preservation, 5-Why analysis, and reporting requirements.", route: "/dashboard/masterlist" },
    ],
  },
};

export const THI_PRESENTATION_FUNDAMENTALS: Record<string, FundamentalPresentation> = {
  plan: {
    id: 'plan',
    name: 'Plan',
    quadrant: 1,
    color: '#071c2c',
    subtitle: 'Plan: Leadership, Policy, Organization, Risk & Planning (Elements 1–5)',
    charterStatement:
      'Plan represents the primary strategic driving force of the THI QHSSE Management System. Covering Elements 1 through 5, it establishes executive commitment, clear policies, competent resourcing, risk management, and disciplined work planning prior to operational mobilization.',
    pdcaPhase: 'PLAN (Elements 01 - 05: Leadership, Policies, Organization, Risk & Planning)',
    coreGovernance:
      'Governance operates through the QHSSE Steering Committee, chaired by the Managing Director. The committee reviews leading indicators, allocates safety and engineering capital, evaluates statutory compliance with Indonesian maritime laws, and endorses corporate policies.',
    marineApplication:
      'Visible leadership is demonstrated through executive presence on chartered geotechnical drillships and survey vessels. Leadership empowers Vessel Masters and offshore Party Chiefs with unconditional Stop-Work Authority, guaranteeing zero commercial retaliation for halts called in the interest of safety.',
    strategicDeliverables: [
      'Zero-tolerance policy for commercial compromise over maritime safety',
      'Uncompromising endorsement of 100% Stop-Work Authority across all crews',
      'Annual capital allocation for cutting-edge offshore safety and drilling technology',
      'Cascaded executive scorecards tying management bonuses to safety milestones',
    ],
    coveredElementNums: [1, 2, 3, 4, 5],
    fleetMetrics: [
      { label: 'Executive Shipboard Walkthroughs', value: '18 Visits', note: 'Conducted across 8 active survey vessels' },
      { label: 'Stop-Work Authority Invocations', value: '100% Upheld', note: 'Zero disciplinary or commercial penalties' },
      { label: 'BOD Policy Review Rate', value: '100% Annual', note: 'Signed by Board of Commissioners & Directors' },
    ],
    governingStandards: ['ISO 9001:2015 Clause 5 & 6', 'ISO 45001:2018 Clause 5 & 6', 'ISM Code Part A', 'SMK3 PP 50/2012'],
  },

  do: {
    id: 'do',
    name: 'Do',
    quadrant: 2,
    color: '#0d2d47',
    subtitle: 'Do: Execution of Activities (Element 6)',
    charterStatement:
      'Do embodies the disciplined, high-integrity execution of offshore geotechnical drilling, geophysical surveys, and onshore laboratory operations. It ensures robust asset integrity, process safety, and rigorous operational control eliminating technical and human error.',
    pdcaPhase: 'DO (Element 06: Execution of Activities)',
    coreGovernance:
      'Execution governance is anchored in standardized operating procedures (SOPs), comprehensive Planned Maintenance Systems (PMS), and active operational supervision across all drilling rigs, vessels, and testing laboratories.',
    marineApplication:
      'Offshore execution enforces rig integrity checklists, heave compensation limits, hydraulic pressure monitoring, and standardized core sampling protocols (ASTM/BS) with zero operational compromise.',
    strategicDeliverables: [
      'Planned Maintenance System (PMS) compliance maintained above 98% fleetwide',
      'Zero non-productive time (NPT) caused by mechanical or sensor breakdowns',
      'Standardized offshore core sampling and downhole CPT testing procedures',
      'Mandatory pre-shift Tool Box Talks and Permit-to-Work adherence on deck',
    ],
    coveredElementNums: [6],
    fleetMetrics: [
      { label: 'Equipment PMS Integrity Rate', value: '98.9%', note: 'Scheduled maintenance executed on time' },
      { label: 'Operational NPT', value: '0.8%', note: 'Well below 2.0% corporate ceiling' },
      { label: 'Standardized SOP Compliance', value: '100%', note: 'Zero unapproved procedural deviations' },
    ],
    governingStandards: ['ISO 9001:2015 Clause 8.5', 'IMCA M 187', 'ASTM D1586 / D3441'],
  },

  check: {
    id: 'check',
    name: 'Check',
    quadrant: 3,
    color: '#0d2d47',
    subtitle: 'Check: Monitoring, Audit & Review (Element 7)',
    charterStatement:
      'Check ensures systematic oversight, routine inspection, internal and external audits, and management reviews to assure that risk controls are active and corporate objectives are consistently achieved.',
    pdcaPhase: 'CHECK (Element 07: Monitoring, Audit & Review)',
    coreGovernance:
      'Governed by the annual internal audit programme, IMCA eCMID vessel inspection schedules, regulatory compliance evaluations, and formal Management System Reviews led by the executive committee.',
    marineApplication:
      'Routine vessel safety walk-throughs, eCMID marine inspections, calibration verification of piezocone sensors, and daily KPI tracking provide continuous verification of operational integrity.',
    strategicDeliverables: [
      '100% completion of scheduled internal quality, safety, and environmental audits',
      '100% eCMID inspection pass rate across all dedicated and chartered survey vessels',
      'Comprehensive monthly KPI dashboards reviewed by executive management',
      'Early detection and escalation of procedural drift or barrier degradation',
    ],
    coveredElementNums: [7],
    fleetMetrics: [
      { label: 'Annual Audit Execution', value: '100%', note: 'Across all 9 corporate departments' },
      { label: 'eCMID Vessel Pass Rate', value: '100%', note: 'Zero Category-1 findings' },
      { label: 'KPI Audit Compliance', value: '96.2%', note: 'Leading & lagging safety metrics' },
    ],
    governingStandards: ['ISO 9001:2015 Clause 9', 'ISO 14001:2015 Clause 9', 'ISO 45001:2018 Clause 9', 'IMCA eCMID'],
  },

  action: {
    id: 'action',
    name: 'Action',
    quadrant: 4,
    color: '#071c2c',
    subtitle: 'Action: Continual Improvement (Element 8)',
    charterStatement:
      'Action closes the PDCA loop by turning audit findings, incident investigations, and lessons learned into systematic corrective actions and permanent operational improvements across the organization.',
    pdcaPhase: 'ACTION (Element 08: Continual Improvement)',
    coreGovernance:
      'Continual improvement operates via structured CAPA workflows, root cause analysis (TapRooT / 5-Why), cross-fleet Safety Flash alerts, and executive management review commitments.',
    marineApplication:
      'Offshore personnel log safety observation cards, participate in post-campaign debriefs, and apply newly standardized operating techniques derived from fleet lessons.',
    strategicDeliverables: [
      'Rapid close-out of all reported incidents and near-misses within 7 business days',
      'Prompt intervention when operational barriers weaken or non-conformances occur',
      'Dissemination of cross-fleet safety alerts within 24 hours of any incident',
      'Systematic CAPA verification ensuring root-cause recurrence is eliminated',
    ],
    coveredElementNums: [8],
    fleetMetrics: [
      { label: 'Near-Miss Closure (7 Days)', value: '100%', note: 'Thorough root cause analysis completed' },
      { label: 'CAPA Resolution Rate', value: '97.5%', note: 'Closed within SLA target dates' },
      { label: 'LTI-Free Marine Days', value: '1,120+ Days', note: 'Over 3 continuous years of safe operations' },
    ],
    governingStandards: ['ISO 9001:2015 Clause 10', 'ISO 14001:2015 Clause 10', 'ISO 45001:2018 Clause 10'],
  },
};

export const THI_MASTER_FRAMEWORK = {
  title: 'Management System & 8 Operational Elements',
  subtitle: 'PT Taka Hydrocore Indonesia Integrated QHSSE Management System (IMS)',
  corporateMandate:
    'PT Taka Hydrocore Indonesia is committed to providing marine geophysical, hydrographic, and geotechnical investigation services of the highest engineering integrity while safeguarding human life and marine environments. Our management system integrates ISO 9001:2015 (Quality), ISO 14001:2015 (Environment), ISO 45001:2018 (Occupational Health & Safety), SMK3 PP 50/2012, and IMCA international marine guidelines into an inseparable operational framework.',
  fourPillarsOverview: [
    {
      pillar: 'Plan',
      quadrant: 'Quadrant 01 · Plan',
      elements: 'Elements 1 - 5',
      focus: 'Leadership & Commitment, Policies & Objectives, Organization & Resources, Risk Management, Planning & Work Management',
      governingBody: 'Board of Directors & QHSSE Steering Committee',
    },
    {
      pillar: 'Do',
      quadrant: 'Quadrant 02 · Do',
      elements: 'Element 6',
      focus: 'Execution of Activities, Asset Integrity, Process Safety & Disciplined Operations',
      governingBody: 'Technical Division & Offshore Operations Superintendents',
    },
    {
      pillar: 'Check',
      quadrant: 'Quadrant 03 · Check',
      elements: 'Element 7',
      focus: 'Monitoring, Audit & Review, IMCA eCMID Surveys & Quality Assurance',
      governingBody: 'Corporate QHSSE Assurance & Lead Auditors',
    },
    {
      pillar: 'Action',
      quadrant: 'Quadrant 04 · Action',
      elements: 'Element 8',
      focus: 'Continual Improvement, Incident Investigation, CAPA & Lessons Learned',
      governingBody: 'Continuous Improvement Committee & Managing Director',
    },
  ],
  fleetStatistics: [
    { label: 'Active Survey Vessels', value: '8 Ships', sub: 'Chartered & Dedicated Geotechnical Fleet' },
    { label: 'Zero Lost-Time Injury (LTI)', value: '3+ Years', sub: 'Over 1.4 Million Offshore Man-Hours' },
    { label: 'System Compliance Rate', value: '96.8%', sub: 'Audited across ISO 9001/14001/45001' },
    { label: 'Total Controlled Documents', value: '122 Docs', sub: 'SOPs, Policies, Work Instructions, Forms' },
  ],
  certifiedAccreditations: [
    'ISO 9001:2015 Quality Management System',
    'ISO 14001:2015 Environmental Management System',
    'ISO 45001:2018 Occupational Health & Safety System',
    'SMK3 PP No. 50/2012 Kemenaker RI',
    'IMCA Marine Contractor Guidelines (M 103, M 187, C 002)',
    'ISM Code & ISPS Maritime Port Security Compliance',
  ],
};
