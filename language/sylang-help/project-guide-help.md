---
**📚 Sylang Help Documentation | Version 3.0.12**
---

# Project Guide: which files to create, and where

**Read this first when you start or extend a Sylang project.** It tells you, for each kind of project, which Sylang file types to use, which to skip, how to lay out the folders, which property values fit, and in what order to build the model. The per-file help (`req-help.md`, `blk-help.md` and so on) gives the full syntax of each file type.

## 1. How to use this guide (instructions for AI assistants)

1. **Identify the domain** from the user's request or from existing files: IT and software, automotive, aerospace, medical devices, or industrial, rail and energy. If it is unclear, ask. Do not assume automotive.
2. **Pick the file set** for that domain from the table in section 3. Create only the files the project needs. An IT project has no hazard analysis unless the system can harm people.
3. **Create the folder structure** shown for the domain in section 4, and an empty `.sylangrules` file at the workspace root. The extension activates only when that file exists.
4. **Add a `.sylangextend`** at the root when the domain needs properties Sylang does not have built in, such as a DO-178C DAL or an IEC 62304 software class. Section 4 gives the exact lines.
5. **Build in the order** given for the domain, so that every `ref` points at something that already exists.
6. **Follow the rules in section 2**, then run the checks in section 6 before you finish.

## 2. Rules that apply to every project

- **One header per file.** Each file starts with optional `use` lines, then exactly one `hdef`, then its `def` elements.
- **One block per `.blk` file.** A `.blk` file *is* a block: its `hdef block` is the block, and its `def`s are characteristics. Model each service, subsystem or component as its own `.blk` file, and connect parent to children with `decomposesto ref block Child1, Child2`. All other file types hold many `def`s.
- **Import before you reference.** To use an element from another file, add `use <headerkind> <HeaderName>` at the top, for example `use functionset OrderFunctions` or `use block PaymentService`. A `ref` to something that has not been imported is a validation error.
- **Identifiers are unique across the whole workspace.** Prefix them by area, as in `ORD_REQ_001`, `PAY_REQ_004` or `TM_REQ_002`, and use PascalCase for named elements (`OrderService`, `PlaceOrder`).
- **Indent with 2 spaces** in model files (4 in `.sylangextend`).
- **Comments:** `#` or `//` starts a comment, on its own line or after a value (`status draft  # pending review`); `/* … */` spans several lines. Inside `"…"` or a `"""…"""` text block, `#` is text, so Markdown headings in descriptions are safe.
- **Strings:** write single-line text in double quotes, `"like this"`. Use triple quotes `"""..."""` for text that spans several lines or contains a `"`.
- **Variants:** at most one `.fml` and one `.vcf` per folder; any number of `.vml`. Create `.vml` with *Create .vml template* (right-click a `.fml`) and generate `.vcf` with *Generate variant config (.vcf)* (right-click a `.vml`). Never write a `.vcf` by hand.
- **Use only values the language defines.** The built-in values most projects need:

| Property | Values |
|---|---|
| `reqtype` | `functional` `nonfunctional` `system` `software` `hardware` `interface` `safety` `stakeholder` `process` `compliance` `quality` `IT` `manufacturing` `supplier` `program` `others` |
| `level` | `product` `system` `subsystem` `component` `subcomponent` `module` `submodule` `part` `subpart` `external` `customer` `supplier` `externalstakeholder` `internalstakeholder` `vehicle`, and the Automotive SPICE levels `sys1`–`sys5`, `swe1`–`swe6`, `hwe1`–`hwe4` |
| `status` | `draft` `review` `approved` `deprecated` `implemented` `accepted` `rejected` `notapplicable` `unknown` |
| `safetylevel` | `QM` `ASIL-A` `ASIL-B` `ASIL-C` `ASIL-D` `SIL-1` `SIL-2` `SIL-3` `SIL-4` |
| `method` (tests) | `MIL` `SIL` `PIL` `HIL` `VIL` `manual` `automated` |
| `testresult` | `pass` `fail` `intest` `notrun` `blocked` |
| `blocktype` | `object` `objectelement` `buildingblock` `component` `part` |
| `issuestatus` (sprints) | `backlog` `open` `inprogress` `blocked` `canceled` `done` |
| `priority` | `low` `medium` `high` `critical` |

Leave out `safetylevel` entirely when a project has no safety integrity classification. Do not invent an ASIL for an IT system.

### The traceability chain

These are the links Studio's matrix, coverage and compliance views count. Use them in every domain.

| From | Link | To | Meaning |
|---|---|---|---|
| requirement (`.req`) | `implements ref function` | function | The function realises the requirement |
| requirement | `derivedfrom ref requirement` / `refinedfrom ref requirement` | requirement | Requirement breakdown |
| function (`.fun`) | `allocatedto ref block` | block | Where the function runs |
| function / block | `enables ref feature` | feature | Which feature it delivers |
| function / block | `needs` / `provides ref operation`, `ref signal` | interface element | What it consumes and offers |
| block (`.blk`) | `decomposesto ref block` | block | Architecture breakdown |
| block | `implements ref function` | function | The block implements the function |
| testcase (`.tst`) | `satisfies ref requirement` | requirement | The test verifies the requirement |
| use case (`.ucd`) | `from ref actor` … `to ref function` | function | Who triggers which function |
| task / story (`.spr`) | `assignedto ref agent` | agent | Who does the work |

## 3. Which files each domain uses

**Core**: create it. **Use**: create it when the project has that content. **Optional**: only when asked. **Skip**: not meaningful for the domain.

| File | IT and software | Automotive | Aerospace | Medical devices | Industrial, rail, energy |
|---|---|---|---|---|---|
| `.req` requirements | Core | Core | Core | Core | Core |
| `.fun` functions | Core | Core | Core | Core | Core |
| `.blk` blocks | Core | Core | Core | Core | Core |
| `.ifc` interfaces | Core: APIs, events, schemas | Core | Core | Core | Core |
| `.tst` tests | Core | Core | Core | Core | Core |
| `.ucd` use cases | Core: user journeys | Use | Use | Core: user needs | Use |
| `.seq` sequences | Use: request flows | Use | Use | Use | Use |
| `.smd` state machines | Use: order, ticket and workflow lifecycles | Use | Use | Use | Use |
| `.spr` / `.agt` sprints and team | Core | Use | Use | Use | Use |
| `.ple` / `.fml` / `.vml` / `.vcf` | Use: editions, tenants, feature flags | Core: vehicle variants | Use | Use: device models | Use |
| `.flr` FMEA | Optional: service reliability | Core | Core | Core: risk analysis | Core |
| `.fta` fault trees | Optional: availability | Use | Core | Use | Core |
| `.itm` item definition | Skip | Core | Optional | Optional | Optional |
| `.haz` hazard analysis | Skip | Core | Use (with extensions) | Core (with extensions) | Core |
| `.sgl` safety goals | Skip | Core | Use | Use | Use |
| `.sam` safety mechanisms | Skip | Core | Use | Core: risk controls | Core |
| `.asm` / `.fem` | Skip | Optional | Optional | Optional | Optional |
| `.spec` / `.dash` | Use: SRS, release reports | Use | Use | Use: design history file | Use |
| `.sylangextend` | Use | Optional | Core: DAL | Core: software class | Optional |

Studio's **Compliance** view scores ISO 26262 and Automotive SPICE. For other standards, use the traceability matrix, coverage, `.spec` documents and `.dash` dashboards to show the evidence.

## 4. Domains

### 4.1 IT and software projects

Web and mobile applications, SaaS platforms, enterprise and cloud systems, data platforms, internal tools.

**How IT concepts map to Sylang**

| IT concept | Sylang element |
|---|---|
| Platform, application | top-level `hdef block` with `level system` |
| Service, microservice, front end, database, queue | one `.blk` per item, `level subsystem` or `component`, `blocktype component` |
| Capability or business function ("Place order", "Refund payment") | `def function` in `.fun`, `allocatedto ref block` |
| REST or gRPC endpoint, command | `def operation` in `.ifc` |
| Event, message, topic, webhook | `def signal` in `.ifc` |
| Request and response schema, DTO, table row | `def datatype` in `.ifc` |
| Configuration value, limit, timeout | `def parameter` in `.ifc` |
| User role, external system | `def actor` in `.ucd` |
| User journey, user story scenario | `def usecase` in `.ucd` |
| Order, ticket, subscription lifecycle | `.smd` with `state` and `transition` |
| Edition, plan tier, tenant type, feature flag | `def feature` in `.fml`, chosen per `.vml` |
| Epic, story, task, team member, AI agent | `.spr` (`epic`, `story`, `task`) and `.agt` (`agent`) |
| Unit, integration, end-to-end or load test | `def testcase` in `.tst`, `method automated` or `manual` |
| Outage, timeout, data loss (for SRE reviews) | `def failuremode` in `.flr` |

**Requirement types:** `reqtype functional` for behaviour, `nonfunctional` or `quality` for performance, availability and usability, `interface` for API contracts, `compliance` for GDPR, SOC 2, ISO 27001 or PCI DSS, `stakeholder` for business needs, and `IT` for operational and infrastructure needs.

**Folder structure**

```
shop-platform/
├── .sylangrules                 # empty; marks the Sylang project
├── .sylangextend                # optional: story points, SLOs, data classes
├── Product/
│   ├── ShopPlatform.ple         # optional: editions or tenants
│   ├── ShopFeatures.fml         # optional: plan tiers, feature flags
│   ├── Standard.vml
│   └── Enterprise.vml
├── System/
│   ├── ShopPlatform.blk         # top-level block: decomposesto the services
│   ├── ShopPlatform.req         # stakeholder and system requirements
│   ├── ShopPlatform.fun         # end-to-end capabilities
│   ├── ShopPlatform.ucd         # actors and user journeys
│   └── PublicApi.ifc            # external API, events and schemas
├── Services/
│   ├── Orders/
│   │   ├── OrderService.blk
│   │   ├── Orders.req
│   │   ├── Orders.fun
│   │   ├── Orders.ifc
│   │   ├── OrderLifecycle.smd
│   │   ├── PlaceOrder.seq
│   │   └── Orders.tst
│   └── Payments/
│       ├── PaymentService.blk
│       ├── Payments.req
│       ├── Payments.fun
│       ├── Payments.ifc
│       └── Payments.tst
├── Data/
│   └── OrdersDatabase.blk       # databases, caches and queues are blocks too
├── Operations/
│   └── Reliability.flr          # optional: failure modes for SRE reviews
├── Delivery/
│   ├── Team.agt
│   ├── Sprint01.spr
│   └── Sprint02.spr
└── Docs/
    ├── SoftwareRequirementsSpec.spec
    └── ReleaseDashboard.dash
```

**Build order:** `System/*.req` and `*.ucd` → `System/*.blk` and `*.fun` → one folder per service with `.blk`, `.ifc`, `.req`, `.fun` → `.smd` and `.seq` where behaviour matters → `.tst` linking every requirement with `satisfies` → `.spr` and `.agt` for the delivery plan → `.spec` and `.dash` last.

**Useful extensions** (`.sylangextend`)

```
extend nodetype requirement
    property slo string
    property dataclass enum public internal confidential restricted

extend nodetype testcase
    property testtype enum unit integration endtoend performance security
```

**Example** (`Services/Orders/Orders.req`)

```sylang
use functionset OrderFunctions

hdef requirementset OrderRequirements
  name "Order Service Requirements"
  owner "Orders Team"

  def requirement ORD_REQ_001
    name "Place an order"
    description "The order service SHALL create an order from a valid basket and return its identifier within 300 ms at the 95th percentile."
    reqtype functional
    level subsystem
    status draft
    implements ref function PlaceOrder
```

### 4.2 Automotive

Vehicle systems, ECUs, powertrain, ADAS, body electronics. Standards: ISO 26262 functional safety, Automotive SPICE, and ISO/SAE 21434 cybersecurity through extensions.

- Use the whole set: `.itm`, `.haz`, `.sgl`, `.sam`, `.flr` and `.fta` give the ISO 26262 safety case, and Studio's Compliance view scores it.
- `safetylevel` takes `QM` or `ASIL-A` to `ASIL-D`. Hazards use `severity S0`–`S3`, `exposure E0`–`E4` and `controllability C0`–`C3`.
- Set `level` to the Automotive SPICE level where a process assessment matters (`sys2`, `swe1` and so on), otherwise `system`, `subsystem` or `component`.
- Tests use `method MIL`, `SIL`, `PIL`, `HIL` or `VIL`.
- Vehicle variants go in `.fml` and `.vml` at the root; elements switch on and off with `when ref config`.

```
inverter/
├── .sylangrules
├── InverterProductLine.ple
├── InverterFeatures.fml
├── Inverter_150kW.vml
├── Inverter_250kW.vml
├── InverterFeatures_Config.vcf   # generated
├── System/            # top block, system .req .fun .ifc .ucd, system FMEA (.flr)
├── PowerStage/        # one folder per subsystem: .blk files, .req, .fun, .ifc, .flr, .tst
├── ControlSystem/     #   (also .smd for control modes)
├── Safety/            # .itm  .haz  .sgl  .sam  .fta  safety .spec and .dash
└── ProjectManagement/ # .agt  .spr
```

**Build order:** `.ple` and `.fml` → `.itm` → `.haz` → `.sgl` → system `.req`, `.fun`, `.blk`, `.ifc` → subsystem folders → `.flr` → `.sam` → `.fta` → `.tst` → `.spec` and `.dash`.

The `autoinverter` sample model follows this layout.

### 4.3 Aerospace

Avionics, flight controls, space systems. Standards: ARP4754A (development), ARP4761 (safety assessment), DO-178C (software), DO-254 (hardware).

- There is **no built-in DAL**: add it with `.sylangextend` and set it on requirements, functions, blocks and tests. Leave `safetylevel` out.
- Record the functional hazard assessment in `.haz`. Omit the ISO 26262 `severity`, `exposure` and `controllability` ratings and use a `failurecondition` property instead.
- `.fta` and `.flr` are central: they carry the PSSA and SSA fault trees and FMEAs.
- Tests: built-in `method manual` or `automated`, plus your own `verificationmethod` and structural coverage properties.

```
extend nodetype requirement
    property dal enum a b c d e
    property verificationmethod enum test analysis inspection review

extend nodetype function
    property dal enum a b c d e

extend nodetype block
    property dal enum a b c d e

extend nodetype hazard
    property failurecondition enum catastrophic hazardous major minor noeffect

extend nodetype testcase
    property dal enum a b c d e
    property coverage enum statement decision mcdc
```

```
flight-control/
├── .sylangrules
├── .sylangextend
├── Aircraft/          # aircraft-level functions (.fun), requirements (.req), use cases (.ucd)
├── Safety/            # FHA (.haz), safety objectives (.sgl), PSSA/SSA fault trees (.fta), FMEA (.flr)
├── System/            # system architecture: top .blk, system .req .fun .ifc
├── Software/          # one folder per software item: .blk .req .fun .ifc .smd .tst
├── Hardware/          # one folder per hardware item: .blk .req .ifc .flr .tst
└── Certification/     # PSAC and compliance documents (.spec), status (.dash)
```

**Build order:** aircraft functions → FHA (`.haz`) → system requirements and architecture → PSSA (`.fta`, `.flr`) → software and hardware items → tests → certification documents.

### 4.4 Medical devices

Active and software medical devices, including software as a medical device. Standards: ISO 14971 (risk management), IEC 62304 (software life cycle), IEC 60601 (electrical safety), IEC 62366 (usability), FDA design controls.

- There is **no built-in IEC 62304 software class**: add `softwareclass` with `.sylangextend`. Leave `safetylevel` out unless you also follow IEC 61508.
- Use cases (`.ucd`) hold user needs and intended use. Requirements with `reqtype stakeholder` are design inputs, and `.blk`, `.fun` and `.ifc` are the design outputs.
- Risk management: hazards and hazardous situations in `.haz` (with your own `harm`, `harmseverity` and `probability` properties rather than the ISO 26262 ratings), FMEA in `.flr`, risk controls as `.sam` safety mechanisms.
- Verification is `.tst` with `satisfies`. Put validation against user needs in its own test set.

```
extend nodetype requirement
    property softwareclass enum a b c

extend nodetype block
    property softwareclass enum a b c

extend nodetype hazard
    property harm string
    property harmseverity enum negligible minor serious critical catastrophic
    property probability enum improbable remote occasional probable frequent
```

```
infusion-pump/
├── .sylangrules
├── .sylangextend
├── UserNeeds/         # intended use and user needs (.ucd), stakeholder requirements (.req)
├── System/            # system .blk, system requirements (.req), .fun, .ifc
├── Software/          # software items with softwareclass: .blk .req .fun .ifc .smd .tst
├── Hardware/          # electrical and mechanical blocks: .blk .req .ifc .tst
├── RiskManagement/    # hazards (.haz), FMEA (.flr), risk controls (.sam), fault trees (.fta)
├── Verification/      # verification .tst files
├── Validation/        # validation .tst files against user needs
└── DesignHistory/     # design history file and trace reports (.spec), status (.dash)
```

**Build order:** user needs → system requirements → architecture and software classification → risk analysis (`.haz`, `.flr`) → risk controls (`.sam`) linked back to requirements → verification and validation tests → design history documents.

### 4.5 Industrial, rail and energy

Machinery, process plants, robotics, signalling, power systems. Standards: IEC 61508 and its sector standards (IEC 61511 process, IEC 62061 and ISO 13849 machinery, EN 50126/50128/50129 rail).

- `safetylevel` takes `SIL-1` to `SIL-4` natively. Use it on safety goals, requirements, functions and blocks.
- Record the hazard and risk analysis in `.haz`; add a performance level with `.sylangextend` for ISO 13849.
- `.sam` holds the safety functions and diagnostics. `.flr` and `.fta` give FMEDA-style and fault tree evidence.
- Variants (`.fml`, `.vml`) suit machine options and plant configurations.

```
extend nodetype requirement
    property performancelevel enum a b c d e
```

```
press-line/
├── .sylangrules
├── Machine/           # top block, machine requirements and functions, operating modes (.smd)
├── Safety/            # hazards (.haz), safety goals (.sgl), safety functions (.sam), .fta, .flr
├── Control/           # PLC and safety PLC software: .blk .req .fun .ifc .tst
├── Drives/            # one folder per drive or actuator group
└── Documents/         # safety requirements specification (.spec), status (.dash)
```

## 5. Starting a project when you are unsure of the domain

1. Create `.sylangrules`, then `System/` with a top-level `.blk`, a `.req` and a `.fun`.
2. Add `.ifc` for the interfaces and `.tst` for the tests.
3. Ask the user which standards apply before adding any safety files, `safetylevel` or extensions.

## 6. Checks before you finish

- The Problems panel shows no Sylang errors: every `ref` resolves and every reference has its `use` import.
- Every requirement is implemented by a function or a block (`implements`), and every function is allocated to a block (`allocatedto`).
- Every requirement has at least one test that `satisfies` it, or a recorded reason why not.
- Identifiers follow one prefix scheme and are unique in the workspace.
- Safety properties appear only where the domain uses them: `safetylevel` ASIL for automotive, SIL for industrial, and your extension properties for aerospace and medical.
- *Sylang: Home* and the traceability matrix show the links you expect. For automotive projects, *Compliance* shows no unexpected gaps.
