# PRODUCT REQUIREMENTS DOCUMENT

## QHSSE Document Control & Management System

**Version:** 1.0
**Status:** Product Blueprint / Pre-Development
**Platform:** Web Application
**Primary Users:** QHSSE, Document Controller, Department Staff, Managers, Management
**Authentication:** Supabase Auth
**Database:** Supabase PostgreSQL
**Object Storage:** Cloudflare R2

---

# 1. Executive Summary

QHSSE Document Control & Management System adalah aplikasi internal perusahaan yang digunakan untuk mengelola seluruh siklus hidup dokumen terkendali (*controlled documents*), mulai dari registrasi, review, approval, publishing, distribution, acknowledgement, revision, hingga archival/superseding.

Sistem dirancang sebagai **single source of truth** untuk dokumen perusahaan.

Tujuan utama bukan sekadar menyimpan file, tetapi mencatat:

* siapa yang membuat dokumen;
* siapa yang melakukan review;
* siapa yang menyetujui;
* kapan dokumen disetujui;
* revisi yang sedang berlaku;
* siapa yang menerima dokumen;
* siapa yang telah melakukan acknowledgement;
* riwayat perubahan;
* status dokumen;
* serta seluruh aktivitas terkait dokumen.

---

# 2. Problem Statement

Pengelolaan dokumen QHSSE secara manual memiliki beberapa risiko:

1. Dokumen tersimpan di berbagai lokasi.
2. Sulit mengetahui dokumen mana yang merupakan versi terbaru.
3. Approval tidak memiliki audit trail yang terstruktur.
4. Distribusi dokumen sulit dimonitor.
5. Tidak diketahui siapa yang telah menerima/membaca dokumen.
6. Revision history dapat tidak konsisten.
7. Nomor dokumen berpotensi duplikat.
8. Dokumen obsolete masih berpotensi digunakan.
9. Proses approval bergantung pada komunikasi manual.
10. Audit membutuhkan pencarian dokumen dan bukti approval secara manual.

Sistem ini dibuat untuk mengurangi risiko tersebut melalui workflow digital yang terstruktur.

---

# 3. Product Vision

> **"One controlled system for every document, every revision, every approval, and every distribution."**

Sistem harus membuat seluruh perjalanan dokumen dapat ditelusuri dari:

**Creation → Review → Approval → Publication → Distribution → Acknowledgement → Revision → Supersession → Archive**

---

# 4. Product Goals

## 4.1 Primary Goals

* Menyediakan centralized document management.
* Menyediakan workflow approval yang terstruktur.
* Menjamin hanya dokumen approved/current yang menjadi controlled document.
* Menyediakan revision control.
* Menyediakan masterlist dokumen secara otomatis.
* Menyediakan controlled distribution.
* Menyediakan acknowledgement tracking.
* Menyediakan audit trail.
* Menyediakan role-based access control.
* Menyediakan dashboard interaktif untuk seluruh user.

## 4.2 Secondary Goals

* Mengurangi penggunaan spreadsheet/manual tracking.
* Mempermudah audit QHSSE.
* Mempercepat approval dokumen.
* Mengurangi risiko penggunaan dokumen obsolete.
* Menyediakan reporting dan monitoring status dokumen.

---

# 5. Scope

## Included

### Core

* Authentication
* User Management
* Department Management
* Role & Permission
* Document Registration
* Document Review
* Document Approval
* Document Control
* Document Numbering
* Revision Management
* Masterlist
* Document Distribution
* Document Acknowledgement
* Audit Trail
* Dashboard
* Notification
* Reporting

### Storage

* Document upload
* Document download
* Versioned document storage
* File metadata
* Secure access

---

# 6. Out of Scope for Initial MVP

Fitur berikut tidak menjadi prioritas MVP:

* Electronic signature dengan legal certificate.
* Advanced OCR.
* AI document classification.
* Automatic compliance assessment.
* Full QHSE incident management.
* Risk assessment management.
* Training management.
* Supplier management.
* Mobile native application.

Fitur tersebut dapat menjadi Phase 2/3.

---

# 7. User Roles

Sistem menggunakan **Role-Based Access Control (RBAC)**.

## 7.1 System Administrator

Memiliki kewenangan untuk:

* mengelola user;
* mengelola department;
* mengelola role;
* mengelola document type;
* mengelola system configuration;
* mengelola approval workflow;
* melihat audit trail.

Administrator tidak otomatis memiliki kewenangan untuk menyetujui isi dokumen.

---

## 7.2 Document Contributor / Staff

Dapat:

* membuat document registration;
* mengupload draft document;
* melihat dokumen miliknya;
* melakukan revisi berdasarkan feedback;
* submit document;
* melihat status approval;
* menerima distributed document;
* melakukan acknowledgement.

---

## 7.3 Department Manager

Dapat:

* melihat dokumen dari department;
* melakukan review;
* approve;
* reject;
* memberikan comments;
* melihat approval history.

---

## 7.4 QHSSE Manager

Dapat:

* melakukan QHSSE review;
* approve;
* reject;
* memberikan comments;
* melihat document compliance;
* melihat masterlist;
* melihat audit trail.

---

## 7.5 Document Controller

Merupakan role penting dalam sistem.

Dapat:

* mengontrol document number;
* mengontrol revision;
* melakukan final document control;
* publish document;
* mengelola masterlist;
* melakukan distribution;
* menarik/supersede dokumen;
* mengontrol obsolete document;
* melihat audit trail.

---

## 7.6 Management

Dapat:

* melihat approved documents;
* melihat dashboard;
* melihat reporting;
* melihat document status;
* melihat compliance metrics.

---

# 8. Authentication

Authentication menggunakan **Supabase Auth**.

Sistem tidak menyimpan password secara langsung di tabel aplikasi.

Flow:

```text
User
 ↓
Login
 ↓
Supabase Authentication
 ↓
Authenticated Session
 ↓
Application
 ↓
Load User Profile
 ↓
Check Role & Permission
 ↓
Dashboard
```

User profile disimpan pada database aplikasi.

Contoh:

```text
profiles

id
name
email
department_id
position_id
role_id
is_active
created_at
```

---

# 9. Recommended Authentication Features

MVP:

* Email/password login
* Logout
* Forgot password
* Password reset
* Session management
* Active/inactive account
* Role-based access
* Department-based access

Future:

* Microsoft/Google SSO
* MFA
* Company domain restriction
* Login activity monitoring

---

# 10. System Architecture

```text
                    USER
                     │
                     ▼
              WEB APPLICATION
             Next.js / React
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    SUPABASE AUTH        APPLICATION API
                                │
                                ▼
                       SUPABASE POSTGRES
                                │
               ┌────────────────┼───────────────┐
               │                │               │
             Users          Documents        Workflow
               │                │               │
               └────────────────┼───────────────┘
                                │
                                ▼
                        CLOUDFLARE R2
                                │
                         Document Files
```

---

# 11. Supabase vs Cloudflare R2

## Supabase

Digunakan untuk:

* Authentication
* PostgreSQL database
* User profiles
* Documents metadata
* Approval workflow
* Distribution
* Acknowledgement
* Audit trail
* Notifications

## Cloudflare R2

Digunakan untuk:

* PDF
* DOCX
* XLSX
* Images
* Other controlled document files

Database hanya menyimpan metadata file dan reference/key menuju R2.

---

# 12. Document Lifecycle

Status utama:

```text
DRAFT
 ↓
PENDING_DEPARTMENT_APPROVAL
 ↓
PENDING_QHSSE_APPROVAL
 ↓
PENDING_DOCUMENT_CONTROL
 ↓
PUBLISHED
 ↓
CURRENT
 ↓
SUPERSEDED
 ↓
ARCHIVED
```

Rejection:

```text
PENDING_APPROVAL
       ↓
    REJECTED
       ↓
REVISION REQUIRED
       ↓
PENDING APPROVAL
```

---

# 13. Core Document Workflow

```text
Staff
 │
 │ Create
 ▼
DRAFT
 │
 │ Submit
 ▼
Department Manager
 │
 ├── Reject → Revision
 │
 └── Approve
       │
       ▼
QHSSE Manager
 │
 ├── Reject → Revision
 │
 └── Approve
       │
       ▼
Document Controller
 │
 ├── Return → Correction
 │
 └── Publish
       │
       ▼
MASTERLIST
       │
       ▼
DISTRIBUTION
       │
       ▼
ACKNOWLEDGEMENT
```

---

# 14. Document Registration

Document Registration merupakan proses awal untuk mendaftarkan dokumen baru atau revisi dokumen.

## 14.1 Registration Form

### Section A — Basic Information

Fields:

* Document Title *
* Document Type *
* Department *
* Process
* Document Owner *
* Document Classification *
* Applicable Area
* Description/Purpose

---

### Section B — Document Information

Fields:

* Document Category
* Related Procedure
* Applicable Standard/Requirement
* Related Department
* Related Project
* Effective Date
* Review Period

---

### Section C — File

Fields:

* Upload File *
* File Name
* File Type
* File Size
* Version

File akan disimpan ke Cloudflare R2.

---

### Section D — Revision

Untuk dokumen baru:

```text
Revision: Rev.00
```

Untuk revisi:

```text
Current: Rev.01
New: Rev.02
```

System harus mempertahankan seluruh revision history.

---

### Section E — Submission

Sebelum submit:

```text
Document Summary
Approval Route
Uploaded File
Revision
Owner
Department
```

User melakukan:

**Submit for Review**

Setelah submit, document tidak lagi dianggap sebagai draft biasa.

---

# 15. Document Numbering

Staff tidak menentukan document number secara bebas.

Document number dikontrol oleh system/document controller.

Contoh:

```text
SOP-GEO-001
WI-OPS-002
POL-QHSE-001
FRM-HR-003
```

Format numbering harus configurable.

Contoh konfigurasi:

```text
Document Type
+
Department Code
+
Sequence Number
```

System harus mencegah duplicate document number.

---

# 16. Approval Workflow

Approval harus dibuat **configurable**, bukan hard-coded.

Contoh:

```text
Workflow A

Department Manager
        ↓
QHSSE Manager
        ↓
Document Controller
```

Workflow B:

```text
Department Manager
        ↓
Management
        ↓
QHSSE
        ↓
Document Controller
```

Workflow C:

```text
QHSSE Manager
        ↓
Document Controller
```

System Administrator dapat menentukan workflow berdasarkan:

* Document Type
* Department
* Classification
* Risk/importance

---

# 17. Approval Interface

Approver membuka:

```text
DOCUMENT REVIEW

SOP-GEO-001
Soil Investigation Procedure

Revision: Rev.02

Submitted By:
User Name

Department:
Geotechnical

────────────────────

DOCUMENT PREVIEW

[ PDF VIEWER ]

────────────────────

REVIEW CHECKLIST

☐ Document format compliant
☐ Required sections complete
☐ Revision information correct
☐ Applicable requirements reviewed
☐ References reviewed

COMMENTS

[____________________]

[ REJECT ]       [ APPROVE ]
```

---

# 18. Approval Rules

Approver harus memberikan:

* user identity;
* timestamp;
* action;
* comments jika diperlukan.

Approval record tidak boleh dihapus secara biasa.

Jika dokumen diubah setelah approval, approval sebelumnya tidak berlaku untuk revision baru.

---

# 19. Rejection Workflow

Jika reject:

```text
REJECT DOCUMENT

Reason *
[________________________]

[ Submit Rejection ]
```

System membuat status:

```text
REVISION_REQUIRED
```

Submitter menerima notification.

Setelah diperbaiki:

```text
Submitter
 ↓
Resubmit
 ↓
Approval ulang
```

---

# 20. Approval Audit Trail

Contoh:

```text
SOP-GEO-001 Rev.02

Created
05 Sep 2026 — Ali

Submitted
05 Sep 2026 — Ali

Department Approved
05 Sep 2026 — Department Manager

QHSSE Approved
05 Sep 2026 — QHSSE Manager

Published
05 Sep 2026 — Document Controller
```

---

# 21. Masterlist

Masterlist merupakan **single source of truth** untuk controlled documents.

Masterlist tidak diinput secara manual satu per satu.

Document yang telah dipublish secara otomatis menjadi bagian dari masterlist.

Fields:

* Document Number
* Document Title
* Document Type
* Department
* Owner
* Revision
* Status
* Effective Date
* Review Date
* Classification
* Current File
* Published Date

---

# 22. Masterlist Views

## Table View

```text
Document No.
Title
Department
Type
Revision
Status
Effective Date
Owner
```

## Card View

```text
┌───────────────────────────┐
│ SOP-GEO-001               │
│ Soil Investigation        │
│                           │
│ REV 02                    │
│ CURRENT                   │
│ Geotechnical              │
└───────────────────────────┘
```

## Filters

* Department
* Document Type
* Status
* Revision
* Year
* Owner
* Classification

---

# 23. Document Detail

Ketika user membuka dokumen:

```text
SOP-GEO-001

Soil Investigation Procedure

CURRENT
REV 02

Department
Geotechnical

Owner
Ahmad

Effective Date
01 September 2026
```

Tab:

```text
Overview
Document
Approval
Distribution
Revision History
Audit Trail
```

---

# 24. Revision History

Contoh:

```text
REV 00
Initial Issue
Status: Superseded

REV 01
Updated Section 4
Status: Superseded

REV 02
Updated Emergency Procedure
Status: Current
```

User dapat melihat metadata revision sebelumnya.

Akses terhadap file obsolete dapat dibatasi sesuai permission.

---

# 25. Distribution Management

Distribution dilakukan setelah document menjadi **CURRENT/PUBLISHED**.

Document Controller memilih:

```text
Distribution Target

○ User
○ Department
○ Role
○ Project
```

Contoh:

```text
SOP-GEO-001 Rev02

Distribution:

☑ Geotechnical
☑ Operations
☑ Project Control
☐ Finance
```

atau:

```text
Recipients:

☑ Ahmad
☑ Budi
☑ Citra
```

---

# 26. Distribution Status

Dashboard Document Controller:

```text
DISTRIBUTION STATUS

Recipients       25
Acknowledged     21
Pending           3
Overdue           1
```

Status:

```text
PENDING
DELIVERED
OPENED
ACKNOWLEDGED
OVERDUE
```

---

# 27. Acknowledgement

User menerima controlled document.

Interface:

```text
NEW CONTROLLED DOCUMENT

SOP-GEO-001
Revision 02

Please review the document.

[ VIEW DOCUMENT ]

☐ I acknowledge receipt of this document.

[ ACKNOWLEDGE ]
```

System mencatat:

* User
* Document
* Revision
* Timestamp

Acknowledgement Rev01 tidak berlaku sebagai acknowledgement Rev02.

---

# 28. Distribution Revision Logic

Jika:

```text
SOP-GEO-001 Rev01
```

diganti:

```text
SOP-GEO-001 Rev02
```

system:

```text
Rev01
 ↓
SUPERSEDED

Rev02
 ↓
CURRENT
 ↓
New Distribution
 ↓
New Acknowledgement
```

---

# 29. Dashboard

Dashboard memiliki dua layer:

## Layer 1 — Interactive Management System Hub

Radial menu sebagai primary navigation.

Contoh:

```text
                    QUALITY

            DOCUMENT CONTROL

       COMPLIANCE        HSE


              QHSSE SYSTEM


       RISK             TRAINING
```

---

# 30. Radial Navigation Concept

Dashboard tidak menggunakan radial menu hanya sebagai dekorasi.

Setiap node merupakan interactive entry point.

Ketika hover:

```text
Node expands
      ↓
Icon animates
      ↓
Description appears
      ↓
Sub-menu becomes visible
```

Contoh:

```text
DOCUMENT CONTROL

Control the lifecycle of company
documents from registration to
distribution and revision.
```

Submenu:

```text
Registration
Approval
Masterlist
Distribution
Revision
```

---

# 31. Interactive Animation Principles

Design harus menghindari:

* excessive gradients;
* excessive glow;
* particle effects;
* constant spinning;
* excessive glassmorphism;
* random animations;
* unnecessary 3D;
* decorative animations tanpa fungsi.

Animation harus digunakan untuk membantu user memahami navigation.

---

# 32. Recommended Animation

### Idle

Subtle breathing animation:

```text
Scale 1.00 → 1.01
```

Tidak boleh terlalu mencolok.

### Hover

```text
Node expands
       ↓
Connector line animates
       ↓
Description fades in
       ↓
Submenu appears
```

### Click

```text
Selected node expands
       ↓
Other nodes fade
       ↓
Content panel emerges
       ↓
Page transition
```

Durasi ideal:

```text
200–500ms
```

---

# 33. Contextual Dashboard

Radial menu tetap sama, tetapi content/action berbeda berdasarkan role.

## Staff

```text
My Documents
My Submissions
Pending Actions
Acknowledgements
```

## Manager

```text
Pending Approval
Department Documents
Team Distribution
```

## QHSSE Manager

```text
QHSSE Approval
Document Compliance
Masterlist
Audit Trail
```

## Document Controller

```text
Registration Queue
Approval Queue
Masterlist
Distribution
Revision Control
Audit Trail
```

---

# 34. Action Center

Dashboard harus selalu menunjukkan action yang membutuhkan user.

Contoh:

```text
GOOD MORNING

You have 4 pending actions.

2 Documents require your approval
1 Document requires acknowledgement
1 Document requires revision
```

User dapat langsung klik action tersebut.

---

# 35. Notification System

Notifications untuk:

### Submitter

* Document submitted
* Document approved
* Document rejected
* Revision requested
* Document published

### Approver

* Document requires approval
* Approval overdue

### Recipient

* New document distributed
* Revision update
* Acknowledgement reminder

### Document Controller

* Document ready for publishing
* Distribution pending
* Acknowledgement overdue

---

# 36. Notification Channels

MVP:

* In-app notification
* Email

Future:

* Microsoft Teams
* WhatsApp notification
* Push notification

---

# 37. Audit Trail

Semua aktivitas penting dicatat.

Contoh:

```text
CREATE_DOCUMENT
UPLOAD_FILE
SUBMIT_DOCUMENT
APPROVE_DOCUMENT
REJECT_DOCUMENT
PUBLISH_DOCUMENT
DISTRIBUTE_DOCUMENT
OPEN_DOCUMENT
ACKNOWLEDGE_DOCUMENT
CREATE_REVISION
SUPERSEDE_DOCUMENT
ARCHIVE_DOCUMENT
CHANGE_METADATA
```

Audit log minimal:

```text
user_id
action
entity_type
entity_id
timestamp
metadata
```

Audit log sebaiknya append-only untuk user biasa.

---

# 38. Database Architecture

Recommended entities:

```text
profiles
departments
roles
permissions
positions

documents
document_versions
document_types
document_categories

approval_workflows
approval_workflow_steps
document_approvals

document_distributions
document_acknowledgements

notifications
audit_logs
system_settings
```

---

# 39. Core Database Relationship

```text
                    profiles
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        departments            roles
             │
             │
             ▼
         documents
             │
             ▼
      document_versions
             │
       ┌─────┼─────────────┐
       ▼     ▼             ▼
 approvals distributions revision
                 │
                 ▼
          acknowledgements
```

---

# 40. Documents Table

Recommended fields:

```text
id
document_number
title
document_type_id
department_id
owner_id
classification
status
current_version_id
effective_date
review_date
created_by
created_at
updated_at
```

---

# 41. Document Versions

```text
id
document_id
revision
file_name
file_key
file_size
mime_type
change_summary
effective_date
status
created_by
created_at
```

---

# 42. Approval Table

```text
id
document_version_id
workflow_step_id
approver_id
status
comments
action_at
```

---

# 43. Distribution Table

```text
id
document_version_id
recipient_type
recipient_id
distributed_at
due_date
status
```

---

# 44. Acknowledgement Table

```text
id
distribution_id
user_id
status
acknowledged_at
```

---

# 45. Audit Log

```text
id
user_id
action
entity_type
entity_id
metadata
created_at
```

---

# 46. R2 Storage Architecture

Recommended object structure:

```text
documents/
    2026/
        SOP/
            SOP-GEO-001/
                Rev00/
                    document.pdf
                Rev01/
                    document.pdf
                Rev02/
                    document.pdf
```

System database menyimpan:

```text
file_key
```

bukan file binary.

---

# 47. Security Requirements

## Authentication

* Supabase Auth
* Secure sessions
* Password reset
* Account activation/deactivation

## Authorization

Database menggunakan Row Level Security (RLS).

Contoh:

Staff hanya dapat:

```text
READ own documents
CREATE registration
UPDATE own draft
```

Manager dapat:

```text
READ department documents
APPROVE assigned documents
```

QHSSE:

```text
READ controlled documents
APPROVE QHSSE workflow
```

Document Controller:

```text
FULL DOCUMENT CONTROL
```

---

# 48. File Security

File R2 tidak sebaiknya diberikan sebagai public URL.

Recommended:

```text
User
 ↓
Authentication
 ↓
Authorization check
 ↓
Backend
 ↓
Generate temporary signed URL
 ↓
R2 File
```

Dengan demikian file tidak dapat diakses sembarang orang yang mengetahui URL.

---

# 49. Data Integrity Rules

System harus memastikan:

1. Document number unique.
2. Revision valid.
3. Hanya satu current revision per document.
4. Published document tidak dapat diedit langsung.
5. Perubahan menghasilkan revision baru.
6. Approval terkait dengan revision tertentu.
7. Acknowledgement terkait dengan revision tertentu.
8. Obsolete document tidak menjadi current.
9. Audit trail tidak dapat dihapus oleh normal user.
10. File reference harus memiliki document version.

---

# 50. Reporting

MVP reports:

### Document Status

```text
Total Documents
Current
Draft
Pending Approval
Rejected
Superseded
Archived
```

### Approval Performance

```text
Pending Approvals
Average Approval Time
Overdue Approvals
Approval by Department
```

### Distribution Compliance

```text
Total Distributed
Acknowledged
Pending
Overdue
```

### Revision Report

```text
Documents revised
Documents approaching review date
Expired review dates
```

---

# 51. Search

Global search harus dapat mencari:

* Document Number
* Title
* Department
* Owner
* Revision
* Document Type
* Keyword

Contoh:

```text
Search:
"Soil Investigation"
```

menghasilkan:

```text
SOP-GEO-001
Soil Investigation Procedure
Rev02
Current
```

---

# 52. Review Date / Expiry

System dapat memiliki:

```text
Review Date
```

Contoh:

```text
Next Review:
05 September 2027
```

Notification:

```text
90 days before
60 days before
30 days before
```

Jika melewati review date:

```text
REVIEW OVERDUE
```

Status ini tidak otomatis membuat dokumen obsolete kecuali kebijakan perusahaan menetapkan demikian.

---

# 53. Admin Configuration

Administrator dapat mengatur:

* Departments
* Roles
* Positions
* Document Types
* Document Categories
* Classification
* Numbering format
* Approval workflow
* Review period
* Notification settings

---

# 54. UX Principles

System harus terasa:

**Professional
Controlled
Modern
Industrial
Trustworthy
Clear**

Bukan seperti:

**Generic SaaS dashboard
AI-generated landing page
Overly futuristic dashboard**

---

# 55. Visual Direction

Recommended style:

* clean corporate interface;
* strong typography;
* subtle motion;
* structured grid;
* restrained use of color;
* meaningful iconography;
* high readability;
* desktop-first;
* responsive.

Radial dashboard digunakan sebagai **experience layer**, sedangkan halaman internal tetap menggunakan interface yang sangat usable.

---

# 56. Accessibility

Minimum:

* readable contrast;
* keyboard navigation;
* visible focus state;
* animation can be reduced;
* clear status labels;
* icon tidak menjadi satu-satunya indicator;
* confirmation untuk destructive actions.

---

# 57. Responsive Design

Desktop merupakan primary platform.

Tablet:

* supported.

Mobile:

* basic support untuk:

  * approval;
  * acknowledgement;
  * document viewing;
  * notification.

Radial menu pada mobile tidak dipaksakan.

Mobile dapat menggunakan simplified navigation.

---

# 58. MVP User Journey

## New Document

```text
Login
 ↓
Dashboard
 ↓
Document Control
 ↓
Registration
 ↓
Fill Form
 ↓
Upload File
 ↓
Submit
 ↓
Manager Approval
 ↓
QHSSE Approval
 ↓
Document Control
 ↓
Publish
 ↓
Masterlist
 ↓
Distribution
 ↓
Acknowledgement
```

---

# 59. Existing Document Revision

```text
Masterlist
 ↓
Open Document
 ↓
Create Revision
 ↓
Upload New File
 ↓
Change Summary
 ↓
Submit
 ↓
Approval
 ↓
Publish
 ↓
Previous Revision → Superseded
 ↓
New Revision → Current
 ↓
Redistribution
```

---

# 60. Success Metrics

MVP dianggap berhasil apabila:

* 100% controlled documents dapat ditelusuri.
* Tidak terdapat duplicate document number.
* Setiap current document memiliki revision yang jelas.
* Setiap approval memiliki timestamp dan identity.
* Distribution dapat dilacak.
* Acknowledgement dapat dilacak.
* User dapat menemukan dokumen melalui masterlist/search.
* Audit trail tersedia untuk aktivitas utama.

---

# 61. Development Phases

## Phase 0 — Discovery

* Confirm organization structure.
* Confirm roles.
* Confirm document types.
* Confirm approval matrix.
* Review existing forms.
* Review existing masterlist.
* Define numbering convention.

## Phase 1 — Foundation

* Project setup
* Supabase project
* Authentication
* Database
* RLS
* User management
* Department
* Role

## Phase 2 — Document Registration

* Registration form
* File upload
* R2 integration
* Draft
* Submit
* Document metadata

## Phase 3 — Approval

* Approval workflow
* Manager approval
* QHSSE approval
* Rejection
* Comments
* Approval history

## Phase 4 — Document Control

* Document numbering
* Revision
* Publishing
* Superseding
* Masterlist

## Phase 5 — Distribution

* Distribution
* Recipient management
* Notification
* Acknowledgement
* Compliance tracking

## Phase 6 — Audit & Reporting

* Audit trail
* Dashboard
* Reports
* Review reminders

## Phase 7 — Experience Layer

* Interactive radial dashboard
* Motion design
* System visualization
* Advanced interactions

---

# 62. Future Development

Potential Phase 2:

### AI Document Assistant

* document summarization;
* compare revisions;
* identify changed sections;
* extract metadata;
* OCR;
* document classification.

### Advanced QHSSE

* Incident Management
* Risk Management
* Training Management
* Audit Management
* Corrective Action / CAPA
* Legal Compliance
* HSE Inspection

### Integration

* Microsoft 365
* SharePoint
* Microsoft Teams
* Email
* ERP
* HRIS

---

# 63. Critical Design Decision

Sistem harus membedakan:

```text
DOCUMENT
```

dan

```text
DOCUMENT VERSION
```

Contoh:

```text
SOP-GEO-001
│
├── Rev00
├── Rev01
└── Rev02 ← CURRENT
```

Approval, file, distribution, acknowledgement dan audit harus merujuk pada **specific document version**, bukan hanya document ID.

Ini merupakan salah satu prinsip database paling penting dalam sistem.

---

# 64. Recommended Final Architecture

```text
                         QHSSE SYSTEM
                              │
                    ┌─────────┴─────────┐
                    │                   │
               AUTHENTICATION       DASHBOARD
                    │                   │
              SUPABASE AUTH       RADIAL HUB
                    │                   │
                    └─────────┬─────────┘
                              │
                       APPLICATION
                              │
                     SUPABASE DATABASE
                              │
        ┌─────────────┬───────┼──────────────┐
        │             │       │              │
      USERS        DOCUMENT  WORKFLOW     AUDIT
        │             │       │              │
        │             │       │              │
        │             └───────┼──────────────┘
        │                     │
        │                MASTERLIST
        │                     │
        │                DISTRIBUTION
        │                     │
        │               ACKNOWLEDGEMENT
        │
        └───────────────────────────────

                         │
                         ▼
                    CLOUDFLARE R2
                         │
                         ▼
                 CONTROLLED FILES
```

---

# 65. Information Required From Stakeholder

Sebelum development dimulai, informasi berikut harus dikonfirmasi.

## A. Organization

Wajib:

* Daftar department.
* Department code.
* Manager masing-masing department.
* Struktur QHSSE.
* Siapa Document Controller.

---

## B. User Roles

Wajib menentukan:

```text
Staff
Supervisor
Manager
QHSSE
Document Controller
Management
Administrator
```

Dan permission masing-masing.

---

## C. Document Types

Contoh:

```text
Policy
Manual
Procedure
SOP
Work Instruction
Form
Template
Guideline
Report
```

Mohon dikonfirmasi jenis yang benar-benar digunakan perusahaan.

---

## D. Document Numbering

Mohon berikan contoh nomor dokumen existing.

Contoh:

```text
SOP-QHSSE-001
THI-QHSE-PRO-001
```

Dari sini format numbering system dapat dibuat.

---

## E. Existing Masterlist

Sangat disarankan memberikan masterlist yang sekarang digunakan.

Informasi yang akan dipelajari:

* column;
* numbering;
* revision;
* document status;
* department;
* owner;
* effective date;
* review date.

---

## F. Existing Registration Form

Jika perusahaan sudah memiliki form registrasi dokumen, gunakan sebagai referensi utama.

---

## G. Approval Matrix

Wajib menentukan:

```text
Document Type
        ↓
Who prepares?
        ↓
Who reviews?
        ↓
Who approves?
        ↓
Who controls?
        ↓
Who publishes?
```

---

## H. Distribution Policy

Perlu ditentukan:

* Distribution berdasarkan department?
* Berdasarkan user?
* Berdasarkan role?
* Berdasarkan project?
* Apakah acknowledgement wajib?
* Berapa lama acknowledgement diberikan?
* Apakah email notification diperlukan?

---

## I. Revision Policy

Perlu dikonfirmasi:

* kapan Rev00 digunakan;
* kapan revision bertambah;
* siapa yang boleh membuat revision;
* siapa yang approve revision;
* bagaimana obsolete document diperlakukan;
* berapa lama obsolete document disimpan.

---

## J. Document Classification

Contoh:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
RESTRICTED
```

Perlu disesuaikan dengan kebijakan perusahaan.

---

## K. Review Period

Contoh:

```text
Annual
2 Years
3 Years
As Required
```

---

# 66. Supabase Information Required

Saat blueprint sudah final, aku akan membutuhkan kamu untuk membuat project Supabase dan memberikan **configuration information yang aman**, bukan password.

Yang nantinya diperlukan:

* Supabase Project URL
* Supabase Anon/Publishable Key
* Database configuration bila diperlukan
* Authentication settings
* Redirect URL
* Email configuration

**Jangan pernah memberikan database password atau service-role key melalui chat.**

Service-role key harus tetap berada di server/environment variable.

---

# 67. Cloudflare R2 Information Required

Untuk R2 nantinya diperlukan:

* R2 bucket name;
* Cloudflare account configuration;
* R2 endpoint;
* access credentials khusus application;
* allowed bucket/path;
* CORS configuration.

Access key/secret juga sebaiknya dibuat khusus untuk aplikasi dan tidak dibagikan sembarangan.

---

# 68. Recommended Environment Variables

Secara konsep aplikasi akan menggunakan:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ENDPOINT
```

Nilai sebenarnya tidak perlu ditulis di PRD dan tidak boleh di-hardcode ke source code.

---

# 69. Final Product Principle

Sistem harus mengikuti prinsip:

> **Create once. Approve properly. Control centrally. Distribute securely. Track continuously. Revise transparently.**

Setiap controlled document harus memiliki:

```text
OWNER
NUMBER
REVISION
STATUS
APPROVAL
EFFECTIVE DATE
DISTRIBUTION
ACKNOWLEDGEMENT
AUDIT TRAIL
```

Dengan demikian aplikasi dapat berkembang dari Document Control System menjadi platform QHSSE Management System yang lebih besar tanpa harus membangun ulang fondasi database.

---

# 70. Immediate Next Step

Sebelum coding, urutan yang direkomendasikan adalah:

```text
1. Confirm Organization
        ↓
2. Confirm Roles
        ↓
3. Confirm Document Types
        ↓
4. Confirm Numbering
        ↓
5. Confirm Approval Matrix
        ↓
6. Confirm Registration Form
        ↓
7. Confirm Masterlist
        ↓
8. Confirm Distribution Rules
        ↓
9. Design Final ERD
        ↓
10. Design Status Machine
        ↓
11. Setup Supabase
        ↓
12. Setup R2
        ↓
13. Build MVP
        ↓
14. Build Interactive Dashboard
```

**Jangan mulai dari UI.**

Fondasi yang harus dikunci terlebih dahulu adalah:

**Organization → Roles → Document Lifecycle → Approval Matrix → Database → Storage → Security → baru UI.**
