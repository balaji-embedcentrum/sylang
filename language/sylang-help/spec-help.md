# Specification Document (.spec)

## Overview
Defines **specification documents** with hierarchical sections and dynamic content generation. Auto-populates content from requirements, use cases, functions, blocks, tests, and other Sylang artifacts with advanced filtering and sorting.

## File Structure
- **ONE** `hdef specification` per file
- **MULTIPLE** `def section` statements (hierarchical)
- **MULTIPLE** `def spec`, `def diagram`, `def table` within sections
- Can `use` any Sylang file types

## Valid Keywords
```
use, hdef, specification, def, section, spec, diagram, table, name, description, 
owner, version, source, where, groupby, orderby, columns, requirementset, 
usecaseset, sequenceset, functionset, blockset, featureset, testcaseset, 
failuremodeset, faulttreeset, hazardset, agentset, sprintset, statemachineset, 
variantset, configset, interfaceset, operationset, signalset
```

## Syntax Structure
```
use requirementset [requirementset-ref]
use functionset [functionset-ref]
use blockset [blockset-ref]

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
      source ref [nodetype] [identifier]
      where [filter-clause]
      groupby [property]
      orderby [property] [asc|desc]
    
    def diagram [identifier]
      name [string-literal]
      description [string-literal]
      source ref [nodetype] [identifier]
      where [filter-clause]
    
    def table [identifier]
      name [string-literal]
      description [string-literal]
      source ref [nodetype] [identifier]
      where [filter-clause]
      groupby [property]
      orderby [property] [asc|desc]
      columns [property], [property], ...
    
    def section [sub-section-id]
      # Nested sections with same structure
```

## Node Types
Valid node types for `source` keyword:
```
requirementset, usecaseset, sequenceset, functionset, blockset, featureset,
testcaseset, failuremodeset, faulttreeset, hazardset, agentset, sprintset,
statemachineset, variantset, configset, interfaceset, operationset, signalset
```

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
where owner contains "John"
where (reqtype = functional or reqtype = safety) and status = approved
```

### Valid Properties for Filtering
Common properties across all node types:
```
identifier, name, description, owner, tags, status, level, safetylevel
```

Type-specific properties:
- **requirementset**: reqtype, rationale, verificationcriteria, proposal
- **functionset**: functiontype, enables, decomposedto, allocatedto
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

## Complete Example
```
use requirementset SystemRequirements
use functionset SystemFunctions
use testset SystemTests

hdef specification SystemRequirementsSpec
  name "System Requirements Specification"
  description "Complete system requirements with traceability"
  owner "Systems Engineering Team"
  version "1.0"

  def section Introduction
    name "Introduction"
    description "Overview of the system requirements"
    
    def spec SystemOverview
      name "System Overview"
      description "High-level system requirements"
      source requirementset SystemRequirements
      where level = system
      orderby identifier asc
  
  def section FunctionalRequirements
    name "Functional Requirements"
    description "Detailed functional requirements"
    
    def table FunctionalReqTable
      name "Functional Requirements Table"
      description "All functional requirements with status"
      source requirementset SystemRequirements
      where reqtype = functional and status in [approved, implemented]
      orderby identifier asc
      columns identifier, name, description, owner, status, safetylevel
    
    def section SafetyRequirements
      name "Safety-Critical Requirements"
      description "ASIL-D safety requirements"
      
      def table SafetyReqTable
        name "Safety Requirements"
        source requirementset SystemRequirements
        where reqtype = safety and safetylevel = ASIL-D
        orderby identifier asc
        columns identifier, name, status, owner, verificationcriteria
  
  def section Traceability
    name "Traceability Matrix"
    description "Requirements to functions to tests"
    
    def table ReqFunctionTrace
      name "Requirements to Functions"
      source functionset SystemFunctions
      where status = approved
      orderby identifier asc
      columns identifier, name, implements, allocatedto, status
    
    def table FunctionTestTrace
      name "Functions to Tests"
      source testset SystemTests
      where testresult in [pass, intest]
      orderby identifier asc
      columns identifier, name, testresult, method, satisfies
```

## Features
- **Hierarchical Sections**: Organize content with nested sections
- **Dynamic Content**: Auto-populate from Sylang artifacts
- **Advanced Filtering**: Complex where clauses with multiple conditions
- **Data Aggregation**: Group and sort data
- **Professional UI**: Clean, modern design with professional blue theme
- **HTML Export**: One-click export to HTML for print-to-PDF
- **Tables & Diagrams**: Mix different content types
- **Source Navigation**: Open raw source file in split view

## Rendering
When you open a `.spec` file:
- Automatically renders as beautiful HTML document
- Click "Open Source" to view/edit raw code
- Click "Download HTML" to export
- All identifiers are clickable for navigation

## Best Practices
1. **Use Descriptive Names**: Give clear names to sections and content blocks
2. **Filter Appropriately**: Use where clauses to show only relevant data
3. **Organize Hierarchically**: Use nested sections for logical structure
4. **Include Traceability**: Add sections showing relationships between artifacts
5. **Version Control**: Update version property when specification changes
6. **Export Regularly**: Export to HTML for reviews and documentation

## Common Patterns

### Requirements Specification
```
def section Requirements
  def table AllRequirements
    source requirementset MyReqs
    where status = approved
    columns identifier, name, reqtype, status, owner
```

### Safety Documentation
```
def section SafetyAnalysis
  def table SafetyRequirements
    source requirementset MyReqs
    where safetylevel in [ASIL-C, ASIL-D]
    columns identifier, name, safetylevel, status
  
  def table FailureModes
    source failuremodeset MyFailures
    where severity in [S2, S3]
    columns identifier, name, severity, detectability, rpn
```

### Test Coverage Report
```
def section TestCoverage
  def table AllTests
    source testcaseset MyTests
    groupby testresult
    columns identifier, name, testresult, method, satisfies
```

## Validation
The extension validates:
- Required `hdef specification` and properties
- Valid node types in `source` statements
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

