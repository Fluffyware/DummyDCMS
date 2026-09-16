// Mock data for QHSSE Document Control & Management System

export type DocStatus = 'CURRENT' | 'DRAFT' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUPERSEDED' | 'ARCHIVED' | 'PUBLISHED';

export interface Document {
  id: string;
  number: string;
  title: string;
  type: string;
  department: string;
  owner: string;
  revision: string;
  status: DocStatus;
  effectiveDate: string;
  reviewDate: string;
  classification: 'INTERNAL' | 'CONFIDENTIAL' | 'PUBLIC' | 'RESTRICTED';
  description: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  entity: string;
  timestamp: string;
  detail: string;
  type: 'create' | 'approve' | 'reject' | 'publish' | 'distribute' | 'acknowledge' | 'revise' | 'archive';
}

export interface ApprovalItem {
  id: string;
  docNumber: string;
  title: string;
  submittedBy: string;
  department: string;
  revision: string;
  submittedAt: string;
  daysWaiting: number;
  type: string;
}

export interface DistributionItem {
  id: string;
  docNumber: string;
  title: string;
  revision: string;
  recipients: number;
  acknowledged: number;
  pending: number;
  overdue: number;
  distributedAt: string;
}

export const DOCUMENTS: Document[] = [];

export const APPROVAL_QUEUE: ApprovalItem[] = [];

export const DISTRIBUTION: DistributionItem[] = [];

export const AUDIT_LOGS: AuditLog[] = [];


export type UserRole = 'staff' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  roleName: string;
  department: string;
  position: string;
  avatar: string;
}

export const ALL_USERS: UserProfile[] = [
  // ── 2 Akun QMS (Username: rizal / khabil) ──
  {
    id: 'admin-rizal',
    username: 'rizal',
    name: 'Rizal',
    email: 'rizal@thi.co.id',
    role: 'admin',
    roleName: 'QMS',
    department: 'QHSE & QMS',
    position: 'Lead Quality & Management System',
    avatar: 'RZ',
  },
  {
    id: 'admin-khabil',
    username: 'khabil',
    name: 'Khabil',
    email: 'khabil@thi.co.id',
    role: 'admin',
    roleName: 'QMS',
    department: 'QHSE & QMS',
    position: 'Document Controller & QMS',
    avatar: 'KB',
  },

  // ── 1 Akun Tiap Departemen (Staff) ─────────────
  {
    id: 'staff-geo',
    username: 'GT',
    name: 'Staff Geotechnical',
    email: 'geotechnical@thi.co.id',
    role: 'staff',
    roleName: 'Staff Geotechnical',
    department: 'Geotechnical',
    position: 'Document Controller Geotechnical',
    avatar: 'GT',
  },
  {
    id: 'staff-ops',
    username: 'OP',
    name: 'Staff Operations',
    email: 'operations@thi.co.id',
    role: 'staff',
    roleName: 'Staff Operations',
    department: 'Operations',
    position: 'Document Controller Operations',
    avatar: 'OP',
  },
  {
    id: 'staff-eng',
    username: 'EN',
    name: 'Staff Engineering',
    email: 'engineering@thi.co.id',
    role: 'staff',
    roleName: 'Staff Engineering',
    department: 'Engineering',
    position: 'Document Controller Engineering',
    avatar: 'EN',
  },
  {
    id: 'staff-hr',
    username: 'HR',
    name: 'Staff HR & General Affairs',
    email: 'hr.ga@thi.co.id',
    role: 'staff',
    roleName: 'Staff HR & GA',
    department: 'HR & General Affairs',
    position: 'Document Controller HR & GA',
    avatar: 'HR',
  },
  {
    id: 'staff-fin',
    username: 'FA',
    name: 'Staff Finance & Accounting',
    email: 'finance@thi.co.id',
    role: 'staff',
    roleName: 'Staff Finance & Accounting',
    department: 'Finance & Accounting',
    position: 'Document Controller Finance',
    avatar: 'FA',
  },
  {
    id: 'staff-it',
    username: 'IT',
    name: 'Staff Information Technology',
    email: 'it@thi.co.id',
    role: 'staff',
    roleName: 'Staff IT',
    department: 'Information Technology',
    position: 'Document Controller IT',
    avatar: 'IT',
  },
  {
    id: 'staff-env',
    username: 'EV',
    name: 'Staff Environment',
    email: 'environment@thi.co.id',
    role: 'staff',
    roleName: 'Staff Environment',
    department: 'Environment',
    position: 'Document Controller Environment',
    avatar: 'EV',
  },
  {
    id: 'staff-com',
    username: 'CL',
    name: 'Staff Commercial & Logistics',
    email: 'commercial@thi.co.id',
    role: 'staff',
    roleName: 'Staff Commercial & Logistics',
    department: 'Commercial & Logistics',
    position: 'Document Controller Commercial',
    avatar: 'CL',
  },
];

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  admin: ALL_USERS[0], // Rizal (Admin QMS)
  staff: ALL_USERS[2], // Staff Geotechnical
};

export interface THIFundamental {
  id: string;
  name: string;
  quadrant: number;
  color: string;
  subtitle: string;
  description: string;
  dummyExplanation: string;
  keyObjectives: string[];
  coveredElements: number[];
  docCount: number;
  standards: string[];
  kpis: { label: string; value: string; trend?: string }[];
}

export interface THIElement {
  num: number;
  id: string;
  label: string;
  titleLines: string[];
  fundamentalId: string;
  fundamentalName: string;
  color: string;
  summary: string;
  dummyExplanation: string;
  focusAreas: string[];
  standards: string[];
  docCount: number;
  sampleDocs: { number: string; title: string; rev: string; type: string }[];
  keyMetrics: string;
  quickActionRoute: string;
}

export const THI_FUNDAMENTALS: THIFundamental[] = [
  {
    id: 'plan',
    name: 'Plan',
    quadrant: 1,
    color: '#071c2c',
    subtitle: 'Plan: Leadership, Policy, Organization, Risk & Planning (Elements 1–5)',
    description: 'Strategic direction, corporate commitments, resource & competence readiness, risk management, and work planning governing Elements 1 through 5.',
    dummyExplanation: 'The Plan phase encompasses comprehensive corporate preparation: visible executive leadership, strategic policy formulation, organizational resource allocation, proactive risk management, and operational work planning before field mobilization.',
    keyObjectives: [
      'Empower 100% stop-work authority across all drilling & survey crews',
      'Conduct executive QHSSE vessel walkthroughs each quarter',
      'Allocate annual capital for safety gear & marine equipment upgrades',
      'Review corporate QHSSE objectives against actual offshore metrics'
    ],
    coveredElements: [1, 2, 3, 4, 5],
    docCount: 77,
    standards: ['ISO 9001:2015 Cl. 5 & 6', 'ISO 45001:2018 Cl. 5, 6 & 7', 'ISM Code Part A'],
    kpis: [
      { label: 'Stop-Work Invocations Handled', value: '100%' },
      { label: 'Leadership Site Visits (YTD)', value: '18 Visits' },
      { label: 'Management Review Score', value: '96/100' },
    ]
  },
  {
    id: 'do',
    name: 'Do',
    quadrant: 2,
    color: '#0d2d47',
    subtitle: 'Do: Execution of Activities (Element 6)',
    description: 'High-integrity asset performance, process safety, and disciplined offshore & laboratory execution without deviation.',
    dummyExplanation: 'The Do phase represents the disciplined execution of marine geotechnical drilling, geophysical surveys, and laboratory testing. It ensures asset integrity, rig process safety, and adherence to standard operating procedures to eliminate technical and human error.',
    keyObjectives: [
      'Execute task-based Job Safety Analysis (JSA) prior to every offshore shift',
      'Verify 100% BST, HUET, and OGUK medical certifications before vessel departure',
      'Enforce Client-THI QHSSE Interface & Bridging Protocols on offshore contracts',
      'Apply ALARP principle for deep-water soil sampling & high-pressure operations'
    ],
    coveredElements: [6],
    docCount: 24,
    standards: ['ISO 9001:2015 Cl. 8.5', 'IMCA M 187', 'ASTM D1586 / D3441'],
    kpis: [
      { label: 'Equipment PMS Integrity', value: '98.9%' },
      { label: 'Zero-NPT Campaigns', value: '94%' },
      { label: 'Certified Offshore Crew', value: '100%' },
    ]
  },
  {
    id: 'check',
    name: 'Check',
    quadrant: 3,
    color: '#0d2d47',
    subtitle: 'Check: Monitoring, Audit & Review (Element 7)',
    description: 'Systematic monitoring, internal and external audits, IMCA eCMID inspections, and management reviews ensuring quality, safety, and compliance.',
    dummyExplanation: 'The Check phase verifies operational adherence to standards through continuous monitoring, scheduled quality audits, vessel inspections, and comprehensive management system reviews.',
    keyObjectives: [
      'Conduct scheduled internal quality audits across all 9 departments annually',
      'Maintain Planned Maintenance System (PMS) compliance above 98%',
      'Verify 100% eCMID inspection pass rate on chartered survey vessels',
      'Track real-time leading and lagging QHSSE KPIs across all active campaigns'
    ],
    coveredElements: [7],
    docCount: 15,
    standards: ['ISO 9001:2015 Cl. 9', 'ISO 14001:2015 Cl. 9', 'ISO 45001:2018 Cl. 9', 'IMCA eCMID'],
    kpis: [
      { label: 'Audit Findings Closed', value: '96.2%' },
      { label: 'eCMID Pass Rate', value: '100%' },
      { label: 'Active Vessel Audits', value: '8 Ships' },
    ]
  },
  {
    id: 'action',
    name: 'Action',
    quadrant: 4,
    color: '#071c2c',
    subtitle: 'Action: Continual Improvement (Element 8)',
    description: 'Prompt intervention when barriers weaken, thorough incident investigation, CAPA management, and fleetwide lessons learned driving ongoing improvement.',
    dummyExplanation: 'Closing the PDCA loop: The Action phase ensures rapid barrier remediation, systematic non-conformance closeout, root cause investigations, and proactive knowledge sharing across all fleet operations.',
    keyObjectives: [
      'Target 5+ safety hazard observation cards per 1,000 offshore man-hours',
      'Investigate 100% of reported incidents and near-misses within 7 business days',
      'Close out 100% of Corrective and Preventive Actions (CAPA) within target dates',
      'Publish cross-fleet safety alerts and technical bulletins for lessons learned'
    ],
    coveredElements: [8],
    docCount: 11,
    standards: ['ISO 9001:2015 Cl. 10', 'ISO 14001:2015 Cl. 10', 'ISO 45001:2018 Cl. 10'],
    kpis: [
      { label: 'CAPA On-Time Closure', value: '97.5%' },
      { label: 'Near-Miss Closure (7d)', value: '100%' },
      { label: 'LTI-Free Days', value: '1,120+ Days' },
    ]
  }
];

export const THI_ELEMENTS: THIElement[] = [
  {
    num: 1,
    id: "elem-1",
    label: "1. Leadership & Commitment",
    titleLines: ["1.", "Leadership &", "Commitment"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#071c2c",
    summary: "Commitment is essential to OMS success, establishing individual accountability and visible leadership across all levels.",
    dummyExplanation: "Commitment is essential to the success of the OMS, as is everyone's accountability for their actions. Everyone must understand their accountability for OMS policies, systems, decisions, and outcomes; this is a fundamental requirement for those who lead and control activities. Managers foster a strong culture, establish strategic objectives, communicate requirements, and provide clear direction to guide the organization in sustaining responsible operations.",
    focusAreas: ["Management Accountability", "Proactive Safety Culture", "Strategic Direction", "Empowered Stop-Work Authority"],
    standards: ["ISO 9001:2015 Clause 5.1", "ISO 45001:2018 Clause 5.1", "ISM Code Section 5"],
    docCount: 8,
    sampleDocs: [
      { number: "POL-QHSSE-001", title: "Corporate QHSSE Policy Statement", rev: "Rev.04", type: "Policy" },
      { number: "MAN-QHSSE-001", title: "QHSSE Leadership & Governance Charter", rev: "Rev.02", type: "Manual" },
    ],
    keyMetrics: "100% Stop-Work Authority Upheld · 18 Executive Site Visits YTD",
    quickActionRoute: "/dashboard/masterlist",
  },
  {
    num: 2,
    id: "elem-2",
    label: "2. Policies & Strategic Objectives",
    titleLines: ["2.", "Policies &", "Strategic Objectives"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#0d2d47",
    summary: "Clear statements of organizational intent, risk tolerance, and measurable long-term performance objectives.",
    dummyExplanation: "Policies, standards, and objectives (PSO) must contain clear statements of what the enterprise intends to achieve. Policies articulate high-level commitments to general principles, boundaries, and statements of intent regarding how the enterprise will operate. Standards and objectives support those policies with more detailed requirements and long-term targets, both reflecting the scope of the OMS concerning specific types of risks, impacts, or threats. Corporate PSOs reflect established values applied across the organization. However, assets, business units, projects, or other organizational levels may establish supplementary PSOs as needed (aligned with corporate levels) to manage specific projects, operational activities, and local issues.",
    focusAreas: ["Corporate QHSSE Commitments", "Measurable Annual Targets", "Supplementary Project PSOs", "Statutory Compliance"],
    standards: ["ISO 9001:2015 Clause 5.2 / 6.2", "ISO 14001:2015 Clause 5.2 / 6.2", "ISO 45001:2018 Clause 5.2 / 6.2"],
    docCount: 12,
    sampleDocs: [
      { number: "OBJ-QHSSE-2026", title: "Annual Corporate QHSSE Strategic Objectives", rev: "Rev.01", type: "Objective" },
      { number: "STD-QHSSE-002", title: "Offshore Marine Environmental Protection Standard", rev: "Rev.03", type: "Standard" },
    ],
    keyMetrics: "100% Annual Policy Review · 94% Objectives On-Track",
    quickActionRoute: "/dashboard/masterlist",
  },
  {
    num: 3,
    id: "elem-3",
    label: "3. Organization, Resources & Documentation",
    titleLines: ["3.", "Organization, Resources", "& Documentation"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#1a4a6e",
    summary: "Thorough organization, competent personnel, equipment readiness, and rigorous document control extending to contractors.",
    dummyExplanation: "Thorough preparation in terms of organization, resources, and capability forms the foundation for delivering consistent performance to meet corporate objectives and internal requirements, as well as responding to stakeholder expectations. This is achieved by ensuring the availability of the right equipment, processes, and people equipped with the appropriate skills at the right time. It is vital to extend OMS consistency to contractors, who serve as key resources when engaged to enhance organizational capability.",
    focusAreas: ["Workforce Competence & Training", "Contractor QHSSE Alignment", "Equipment Mobilization", "Document Lifecycle Control"],
    standards: ["ISO 9001:2015 Clause 7.1 - 7.5", "ISO 45001:2018 Clause 7", "IMCA C 002"],
    docCount: 22,
    sampleDocs: [
      { number: "PRO-HR-003", title: "Offshore Competency & Training Procedure", rev: "Rev.03", type: "Procedure" },
      { number: "SOP-DCC-001", title: "Document Control & Masterlist Governance SOP", rev: "Rev.05", type: "Procedure" },
    ],
    keyMetrics: "100% Certified Offshore Crew · 122 Controlled Master Documents",
    quickActionRoute: "/dashboard/masterlist",
  },
  {
    num: 4,
    id: "elem-4",
    label: "4. Risk Management",
    titleLines: ["4.", "Risk", "Management"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#30256f",
    summary: "Managing risks and opportunities affecting stakeholders, clients, and marine operations for long-term sustainable value.",
    dummyExplanation: "Many stakeholders are affected by, and may need to be engaged with (or directly involved in), enterprise activities. Both parties can derive economic, social, or environmental benefits, over both the short and long term, from such relationships. The enterprise must be capable of managing risks and opportunities that could potentially impact its stakeholders and customers.",
    focusAreas: ["Stakeholder & Community Engagement", "HAZID / ENVID Risk Assessments", "Client Bridging Agreements", "Opportunity Capitalization"],
    standards: ["ISO 31000:2018", "ISO 14001:2015 Clause 6.1", "ISO 45001:2018 Clause 6.1", "IMCA S 003"],
    docCount: 16,
    sampleDocs: [
      { number: "PRO-RSK-001", title: "Enterprise Risk Assessment & Matrix Procedure", rev: "Rev.03", type: "Procedure" },
      { number: "PLN-ENG-004", title: "Stakeholder & Client Interface Bridging Plan", rev: "Rev.02", type: "Plan" },
    ],
    keyMetrics: "42 High-Risk Operations Safeguarded · 94.2% Client Satisfaction",
    quickActionRoute: "/dashboard/masterlist",
  },
  {
    num: 5,
    id: "elem-5",
    label: "5. Planning & Work Management",
    titleLines: ["5.", "Planning &", "Work Management"],
    fundamentalId: "plan",
    fundamentalName: "Plan",
    color: "#071c2c",
    summary: "Systematic work planning and barrier controls to manage residual risks to personnel, environment, assets, and reputation.",
    dummyExplanation: "The OMS aims to deliver benefits to the enterprise and its stakeholders while controlling its risks. These risks encompass potential injury and ill health, security threats, environmental and social impacts, process safety incidents, and damage to enterprise assets, reputation, and/or enterprise value. It is often impossible to eliminate risk completely, making it essential for the enterprise to determine the level of tolerable residual risk acceptable to its business and stakeholders, while continually improving controls wherever practicable.",
    focusAreas: ["Permit-to-Work (PTW) System", "SIMOPS Risk Coordination", "Residual Risk Determination", "Geotechnical Survey Campaign Planning"],
    standards: ["ISO 45001:2018 Clause 8.1", "ISO 9001:2015 Clause 8.1", "IMCA M 103"],
    docCount: 19,
    sampleDocs: [
      { number: "SOP-OPS-012", title: "Permit-to-Work & SIMOPS Control Procedure", rev: "Rev.04", type: "Procedure" },
      { number: "PRO-HSE-008", title: "Task-Based Job Safety Analysis (JSA) Protocol", rev: "Rev.03", type: "Procedure" },
    ],
    keyMetrics: "100% Pre-Spud JSA Completion · Zero Unplanned SIMOPS Conflicts",
    quickActionRoute: "/dashboard/masterlist",
  },
  {
    num: 6,
    id: "elem-6",
    label: "6. Execution of Activities",
    titleLines: ["6.", "Execution of", "Activities"],
    fundamentalId: "do",
    fundamentalName: "Do",
    color: "#0d2d47",
    summary: "High-integrity asset performance, process safety, and disciplined execution preventing technical and human error.",
    dummyExplanation: "Assets must meet or exceed applicable standards and function reliably for business activities to be productive and their risks effectively managed. Asset design and integrity (including process safety) address significant risks arising from technical failure and/or human error through robust risk elimination or control measures.",
    focusAreas: ["Asset Integrity & Planned Maintenance", "Drill Rig Process Safety", "Operational Discipline", "Human Factor & Error Elimination"],
    standards: ["ISO 9001:2015 Clause 8.5", "IMCA M 187", "ASTM D1586 / D3441"],
    docCount: 24,
    sampleDocs: [
      { number: "SOP-RIG-005", title: "Seabed Geotechnical Drilling & CPT Operations SOP", rev: "Rev.04", type: "Procedure" },
      { number: "MAN-PMS-002", title: "Planned Maintenance System (PMS) Rig Standards", rev: "Rev.03", type: "Manual" },
    ],
    keyMetrics: "98.9% Equipment PMS Integrity Rate · 0.8% Non-Productive Time (NPT)",
    quickActionRoute: "/dashboard/masterlist",
  },
  {
    num: 7,
    id: "elem-7",
    label: "7. Monitoring, Audit & Review",
    titleLines: ["7.", "Monitoring, Audit", "& Review"],
    fundamentalId: "check",
    fundamentalName: "Check",
    color: "#1a4a6e",
    summary: "Clear plans, standardized operating procedures, and thorough reviews ensuring precision, consistency, and risk control.",
    dummyExplanation: "Plans and procedures consist of clearly defined requirements to ensure risks are appropriately managed and objectives are achieved. Plans are also designed to optimize performance and drive continual improvement, typically outlining what needs to be done at a relatively high level and referencing procedures for detailed instructions. Depending on the issue, organizational level, and audience (end-users), procedures describe in detail how tasks must be carried out to ensure accuracy and consistency of approach when implementing risk controls. Such procedures may include operating/maintenance procedures, action plans, work instructions, or other job aids.",
    focusAreas: ["Audits & Inspections", "Procedural Compliance", "Performance Monitoring & KPIs", "Management System Reviews"],
    standards: ["ISO 9001:2015 Clause 9", "ISO 14001:2015 Clause 9", "ISO 45001:2018 Clause 9", "IMCA eCMID"],
    docCount: 15,
    sampleDocs: [
      { number: "PRO-AUD-001", title: "Internal Quality & HSE Audit Procedure", rev: "Rev.03", type: "Procedure" },
      { number: "WIN-OPS-022", title: "Offshore Vessel eCMID Inspection Work Instruction", rev: "Rev.02", type: "Work Instruction" },
    ],
    keyMetrics: "96.2% Audit Findings Closed on Time · 100% eCMID Inspection Pass",
    quickActionRoute: "/dashboard/masterlist",
  },
  {
    num: 8,
    id: "elem-8",
    label: "8. Continual Improvement",
    titleLines: ["8.", "Continual", "Improvement"],
    fundamentalId: "action",
    fundamentalName: "Action",
    color: "#30256f",
    summary: "Disciplined execution, prompt interventions when barriers weaken, and ongoing resource readiness driving improvement.",
    dummyExplanation: "The execution of safe, reliable, and responsible activities encompasses the consistent application of plans and procedures, along with intervention actions whenever risk controls/barriers prove ineffective or specified requirements are not met. To consistently fulfill established requirements, adequate resources (personnel and assets) must be properly prepared for the task (including supervision, competence, and work readiness), underpinned by a culture of discipline.",
    focusAreas: ["Barrier Failure Intervention", "Corrective & Preventive Action (CAPA)", "Workforce Readiness & Discipline", "Fleetwide Lessons Learned"],
    standards: ["ISO 9001:2015 Clause 10", "ISO 14001:2015 Clause 10", "ISO 45001:2018 Clause 10"],
    docCount: 11,
    sampleDocs: [
      { number: "PRO-CAPA-001", title: "Non-Conformance & CAPA Management Procedure", rev: "Rev.04", type: "Procedure" },
      { number: "PRO-INC-002", title: "Incident Investigation & Root Cause Analysis Procedure", rev: "Rev.03", type: "Procedure" },
    ],
    keyMetrics: "100% Near-Miss Investigations Closed in 7 Days · Zero Lost-Time Injuries (3+ Yrs)",
    quickActionRoute: "/dashboard/masterlist",
  },
];

export const THE_FUNDAMENTALS_OVERVIEW = {
  id: 'the-fundamentals',
  title: 'Management System',
  subtitle: 'PT Taka Hydrocore Indonesia QHSSE Management System',
  description: 'The core operational philosophy that unites Plan, Do, Check, and Action across all marine geotechnical & geophysical survey operations.',
  dummyExplanation: 'PT Taka Hydrocore Indonesia operates with an integrated QHSSE management system designed to deliver high-precision seabed engineering data while protecting human lives and the marine environment. The 4 Fundamental Pillars (Plan, Do, Check, Action) govern 8 interconnected Operational Elements, ensuring compliance with ISO 9001, ISO 14001, ISO 45001, and IMCA offshore marine standards.',
  pillars: [
    { name: 'Plan', elements: 'Elements 1 & 2', focus: 'Commitment, Accountability, Policies & Strategic Objectives' },
    { name: 'Do', elements: 'Elements 3 & 4', focus: 'Organization, Resources, Documentation & Risk Management' },
    { name: 'Check', elements: 'Elements 5 & 6', focus: 'Planning, Work Management & Execution of Activities' },
    { name: 'Action', elements: 'Elements 7 & 8', focus: 'Monitoring, Audit, Review & Continual Improvement' }
  ],
  totalElements: 8,
  totalControlledDocs: 122,
  complianceRate: '96.8%',
  activeVessels: 8,
  certifiedStandards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'IMCA Marine Guidelines', 'ISM Code']
};

export const RADIAL_MENU_DATA = [
  {
    id: 'document-control',
    label: 'Document Control',
    icon: '📋',
    color: '#071c2c',
    description: 'Control the lifecycle of company documents from registration to distribution and revision.',
    subitems: ['Registration', 'Approval Queue', 'Masterlist', 'Distribution', 'Revision Control'],
    routes: ['/dashboard/registration', '/dashboard/approval', '/dashboard/masterlist', '/dashboard/distribution', '/dashboard/masterlist'],
    stats: { label: 'Active Documents', value: '47' },
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: '✅',
    color: '#0d2d47',
    description: 'Monitor compliance status, acknowledgements, and document review schedules.',
    subitems: ['Acknowledgements', 'Review Schedule', 'Overdue Review', 'Compliance Report'],
    routes: ['/dashboard/distribution', '/dashboard/masterlist', '/dashboard/masterlist', '/dashboard/audit-trail'],
    stats: { label: 'Pending Ack.', value: '23' },
  },
  {
    id: 'risk',
    label: 'Risk & HSE',
    icon: '⚠️',
    color: '#071c2c',
    description: 'Risk management, HSE monitoring, and incident-related document controls.',
    subitems: ['HSE Documents', 'Risk Procedures', 'Incident Forms', 'Safety WI'],
    routes: ['/dashboard/masterlist', '/dashboard/masterlist', '/dashboard/masterlist', '/dashboard/masterlist'],
    stats: { label: 'HSE Docs', value: '12' },
  },
  {
    id: 'quality',
    label: 'Quality',
    icon: '🏆',
    color: '#30256f',
    description: 'Quality management documents, ISO standards, and process procedures.',
    subitems: ['Quality Procedures', 'ISO Documents', 'Audit Records', 'NCR Forms'],
    routes: ['/dashboard/masterlist', '/dashboard/masterlist', '/dashboard/audit-trail', '/dashboard/masterlist'],
    stats: { label: 'Quality Docs', value: '18' },
  },
  {
    id: 'audit-trail',
    label: 'Audit Trail',
    icon: '🔍',
    color: '#1a4a6e',
    description: 'Full activity log for all document events, approvals, and user actions.',
    subitems: ['Activity Log', 'Approval History', 'User Actions', 'System Events'],
    routes: ['/dashboard/audit-trail', '/dashboard/audit-trail', '/dashboard/audit-trail', '/dashboard/audit-trail'],
    stats: { label: 'Events Today', value: '34' },
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📊',
    color: '#0d2d47',
    description: 'Comprehensive reporting on document status, approval performance, and distribution compliance.',
    subitems: ['Document Status', 'Approval Performance', 'Distribution Report', 'Revision Report'],
    routes: ['/dashboard/masterlist', '/dashboard/approval', '/dashboard/distribution', '/dashboard/audit-trail'],
    stats: { label: 'Reports', value: '6' },
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: '⚙️',
    color: '#071c2c',
    description: 'System configuration, user management, department setup, and workflow configuration.',
    subitems: ['User Management', 'Departments', 'Roles & Permissions', 'Workflow Config'],
    routes: ['/dashboard/settings', '/dashboard/settings', '/dashboard/settings', '/dashboard/settings'],
    stats: { label: 'Users', value: '48' },
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '🔔',
    color: '#30256f',
    description: 'System notifications, pending actions, and alerts for document activities.',
    subitems: ['Pending Actions', 'Approval Alerts', 'Distribution Alerts', 'Overdue Reminders'],
    routes: ['/dashboard/approval', '/dashboard/approval', '/dashboard/distribution', '/dashboard/masterlist'],
    stats: { label: 'Unread', value: '7' },
  },
];

export function getDocStatusClass(status: DocStatus): string {
  const map: Record<DocStatus, string> = {
    CURRENT: 'badge-current',
    DRAFT: 'badge-draft',
    PENDING_APPROVAL: 'badge-pending',
    REJECTED: 'badge-rejected',
    SUPERSEDED: 'badge-superseded',
    ARCHIVED: 'badge-archived',
    PUBLISHED: 'badge-published',
  };
  return map[status] || 'badge-draft';
}

export function getDocStatusLabel(status: DocStatus): string {
  const map: Record<DocStatus, string> = {
    CURRENT: 'Current',
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Pending Approval',
    REJECTED: 'Rejected',
    SUPERSEDED: 'Superseded',
    ARCHIVED: 'Archived',
    PUBLISHED: 'Published',
  };
  return map[status] || status;
}
