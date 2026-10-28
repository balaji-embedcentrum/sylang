---
**📚 Sylang Help Documentation | Version 3.0.12**
---

> **Strings:** write single-line text in double quotes, `"like this"`. Use triple quotes `"""..."""` for text that spans several lines or contains a `"`. Both forms are valid in every property.

# Specification Document (.spec)

## Overview
Defines **specification documents** with hierarchical sections and dynamic content generation. Auto-populates content from requirements, use cases, functions, blocks, tests, and other Sylang artifacts with advanced filtering and sorting.

Specs can embed live dashboards (`def dashboard`).

## File Structure
- **ONE** `hdef specification` per file
- **MULTIPLE** `def section` statements (hierarchical)
- **MULTIPLE** `def spec`, `def diagram`, `def table`, `def dashboard` within sections
- No `use` statements needed - files referenced via `source` property

## Valid Keywords
```
use, hdef, specification, name, description, owner, version, def, section,
spec, diagram, dashboard, table, source, where, groupby, orderby, columns
```

## Syntax Structure
```
hdef specification [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  version [string-literal]

  def section [identifier]
    name [string-literal]
    description [string-literal]
    
    def spec [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
      where [filter-clause]
      groupby [property]
      orderby [property] [asc|desc]
    
    def diagram [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
    
    def table [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
      where [filter-clause]
      groupby [property]
      orderby [property] [asc|desc]
      columns [property], [property], ...
    
    def dashboard [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
    
    def section [sub-section-id]
      # Nested sections with same structure
```

## Source Property

The `source` property specifies the file(s) to fetch data from. It accepts glob patterns and several files.

### Syntax
```sylang
source [filepath]                                    # Single file
source [filepath1], [filepath2], [filepath3]         # Multiple files
source [glob-pattern]                                # Glob pattern
```

### Single File
```sylang
source """EPB_Requirements.req"""                        # Single file in same directory
source """../features/EPB_Features.fml"""                # Relative path to sibling folder
source """/home/user/project/EPB_Requirements.req"""     # Absolute path
```

### Multiple Files (Comma-Separated)
```sylang
source """EPB_Requirements.req""", """Safety_Requirements.req"""    # Two specific files
source """file1.req""", """file2.req""", """file3.req"""                # Multiple files
source """EPB_Requirements.req""", """../safety/*.req"""            # Mix of single and glob
```

### Glob Patterns
```sylang
# Folder-specific patterns (relative to .spec file)
source """*.req"""                            # All .req files in same directory
source """../safety/*.req"""                  # All .req files in sibling folder
source """requirements/*.req"""               # All .req files in subfolder

# Workspace-wide patterns (starts with **)
source """**/*.req"""                         # ALL .req files in entire workspace
source """**/*.{req,tst}"""                   # ALL .req and .tst files
source """**/epb_*/*.req"""                   # Pattern matching folder names
```

### Path Resolution
- **Relative paths** resolve relative to the `.spec` file directory
- **Absolute paths** use as-is
- **Glob patterns starting with `**`** search entire workspace
- **Glob patterns without `**`** search relative to `.spec` file directory

### Supported File Types
All Sylang file types are supported:
- `.req` (requirements), `.tst` (tests), `.fun` (functions), `.blk` (blocks)
- `.fml` (feature models), `.vml` (variant models), `.ple` (product lines)
- `.ucd` (use cases), `.seq` (sequences), `.smd` (state machines)
- `.flr` (FMEA), `.fta` (fault trees), `.haz` (hazards)
- `.agt` (agents), `.spr` (sprints), `.ifc` (interfaces)
- `.dash` (dashboards)

## Where Clause Syntax
Filter data using logical conditions:

### Operators
- `=` - Equals
- `!=` - Not equals
- `in` - In list (e.g., `reqtype in [functional, safety]`)
- `contains` - Contains substring
- `and` - Logical AND
- `or` - Logical OR
- `()` - Grouping

### Examples
```
where status = approved
where reqtype = functional and safetylevel = ASIL-D
where status in [approved, implemented]
where owner contains """John"""
where (reqtype = functional or reqtype = safety) and status = approved
```

### Valid Properties for Filtering
Common properties across all node types:
```
identifier, name, description, owner, tags, status, level, safetylevel
```

Type-specific properties:
- **requirementset**: reqtype, rationale, verificationcriteria, proposal
- **functionset**: functiontype, enables, decomposesto, allocatedto
- **blockset**: blocktype, chartype, specification, tolerance
- **testcaseset**: testresult, method, testlevel, passcriteria
- **failuremodeset**: severity, detectability, occurrence, rpn
- **sprintset**: issuestatus, priority, startdate, enddate, points

## GroupBy and OrderBy
Organize and sort data:

### GroupBy
Groups items by a property value:
```
groupby reqtype          # Group requirements by type
groupby status           # Group by status
groupby owner            # Group by owner
```

### OrderBy
Sorts items by a property:
```
orderby identifier       # Sort by identifier (ascending, default)
orderby identifier asc   # Sort by identifier (ascending)
orderby priority desc    # Sort by priority (descending)
orderby name             # Sort by name
```

## Columns
Specify which properties to display in tables:
```
columns identifier, name, description, owner, status
columns identifier, name, reqtype, safetylevel, status
columns identifier, name, testresult, method
```

## Multi-Source Examples

### Example 1: Gather Requirements from Multiple Files
```sylang
def section AllRequirements
  name """All System Requirements"""
  
  def table Requirements
    source """EPB_Requirements.req""", """Safety_Requirements.req""", """Performance_Requirements.req"""
    where status = approved
    columns identifier, name, reqtype, status
```

### Example 2: Gather All .req Files in a Folder
```sylang
def section ProjectRequirements
  name """Project Requirements"""
  
  def table AllReqs
    source """../requirements/*.req"""
    groupby reqtype
    orderby identifier asc
    columns identifier, name, status, owner
```

### Example 3: Workspace-Wide Aggregation
```sylang
def section WorkspaceOverview
  name """Entire Workspace Requirements"""
  
  def table AllRequirements
    source """**/*.req"""
    where safetylevel in (ASIL-C, ASIL-D)
    orderby safetylevel desc
    columns identifier, name, safetylevel, owner
```

## Complete Example
```sylang
hdef specification SystemRequirementsSpec
  name """System Requirements Specification"""
  description """Complete system requirements with traceability and metrics"""
  owner """Systems Engineering Team"""
  version """1.0"""

  def section Introduction
    name """Introduction"""
    description """Overview of the system requirements"""
    
    def spec SystemOverview
      name """System Overview"""
      description """High-level system requirements"""
      source """SystemRequirements.req"""
      where level = system
      orderby identifier asc
  
  def section FunctionalRequirements
    name """Functional Requirements"""
    description """Detailed functional requirements"""
    
    def table FunctionalReqTable
      name """Functional Requirements Table"""
      description """All functional requirements with status"""
      source """SystemRequirements.req"""
      where reqtype = functional and status in (approved, implemented)
      orderby identifier asc
      columns identifier, name, description, owner, status, safetylevel
    
    def section SafetyRequirements
      name """Safety-Critical Requirements"""
      description """ASIL-D safety requirements"""
      
      def table SafetyReqTable
        name """Safety Requirements"""
        source """SystemRequirements.req"""
        where reqtype = safety and safetylevel = ASIL-D
        orderby identifier asc
        columns identifier, name, status, owner, verificationcriteria
  
  def section Traceability
    name """Traceability Matrix"""
    description """Requirements to functions to tests"""
    
    def table ReqFunctionTrace
      name """Requirements to Functions"""
      source """SystemFunctions.fun"""
      where status = approved
      orderby identifier asc
      columns identifier, name, implements, allocatedto, status
    
    def table FunctionTestTrace
      name """Functions to Tests"""
      source """SystemTests.tst"""
      where testresult in (pass, intest)
      orderby identifier asc
      columns identifier, name, testresult, method, satisfies
  
  def section Metrics
    name """System Metrics Dashboard"""
    description """Live metrics showing project health"""
    
    def dashboard SystemMetrics
      name """System Dashboard"""
      description """Real-time metrics for requirements, tests, and coverage"""
      source """SystemMetrics.dash"""
```

## Features
- **Hierarchical Sections**: Organize content with nested sections
- **Dynamic Content**: Auto-populate from Sylang artifacts
- **Advanced Filtering**: Complex where clauses with multiple conditions
- **Data Aggregation**: Group and sort data
- **Dashboard Embedding**: Embed live dashboards with metrics and charts
- **Sylang Studio**: Opens as a document in VS Code, in Claude's colours or your VS Code theme
- **HTML Export**: One-click export to HTML for print-to-PDF
- **Tables & Diagrams**: Mix different content types
- **Source Navigation**: Open the source file beside the document

## Rendering
When you open a `.spec` file:
- It opens as a rendered document, with a contents outline and search
- **Source** opens the `.spec` text beside it
- **Export HTML** saves the document as a standalone HTML file
- Click a table row to open that element

## Best Practices
1. **Use Descriptive Names**: Give clear names to sections and content blocks
2. **Filter Appropriately**: Use where clauses to show only relevant data
3. **Organize Hierarchically**: Use nested sections for logical structure
4. **Include Traceability**: Add sections showing relationships between artifacts
5. **Version Control**: Update version property when specification changes
6. **Export Regularly**: Export to HTML for reviews and documentation

## Common Patterns

### Requirements Specification
```sylang
def section Requirements
  def table AllRequirements
    source """MyRequirements.req"""
    where status = approved
    columns identifier, name, reqtype, status, owner
```

### Safety Documentation
```sylang
def section SafetyAnalysis
  def table SafetyRequirements
    source """MyRequirements.req"""
    where safetylevel in (ASIL-C, ASIL-D)
    columns identifier, name, safetylevel, status
  
  def table FailureModes
    source """MyFailures.flr"""
    where severity in (S2, S3)
    columns identifier, name, severity, detectability, rpn
```

### Test Coverage Report
```sylang
def section TestCoverage
  def table AllTests
    source """MyTests.tst"""
    groupby testresult
    columns identifier, name, testresult, method, satisfies
```

### Dashboard Embedding (NEW!)
```sylang
def section Metrics
  name """System Metrics"""
  description """Live dashboard with project health indicators"""
  
  def dashboard ProjectMetrics
    name """Project Dashboard"""
    description """Real-time metrics for requirements, tests, and coverage"""
    source """ProjectMetrics.dash"""
```

## Content Types

### 1. Spec Content (`def spec`)
Display full details of all items from a file.

**Use when**: You want to show complete information with all properties

### 2. Table Content (`def table`)
Display data in tabular format with specific columns.

**Use when**: You want a structured, columnar view of specific properties

### 3. Diagram Content (`def diagram`)
Embed a live diagram of the model elements in its `source`.

**Use when**: You want to include visual diagrams in your spec

### 4. Dashboard Content (`def dashboard`) - NEW!
Embed full interactive dashboards with metrics, charts, and tables.

**Use when**: You want live metrics and visualizations in your spec

## Validation
The extension validates:
- Required `hdef specification` and properties
- File paths in `source` statements (relative or absolute)
- Where clause syntax (operators, parentheses, quotes)
- Column names are valid properties
- Proper keyword usage in context

## Tips
- Use `groupby` to categorize data (e.g., by status, type, owner)
- Use `orderby` to sort data logically (e.g., by identifier, priority)
- Combine `where` clauses with `and`/`or` for complex filtering
- Use `columns` to show only relevant information in tables
- Nest sections to create hierarchical document structure
- Export to HTML and use browser's print-to-PDF for final documents

