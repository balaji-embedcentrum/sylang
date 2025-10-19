# Sylang Dashboard (.dash) - Complete Reference

## Overview

Sylang Dashboards provide **real-time, interactive visualizations** of your system data. Create custom dashboards with metrics, charts, and tables that automatically query your Sylang files using the Symbol Manager.

**Key Features:**
- 📊 **Grid-based layout** - Flexible rows × columns configuration
- 📈 **Interactive widgets** - Metrics, charts, and tables
- 🔍 **Powerful queries** - Simple, complex, and very complex query support
- 🔗 **Relationship analysis** - Track broken links, orphans, and coverage
- 🎨 **Professional UI** - Modern, responsive design with Chart.js

---

## File Structure

```sylang
hdef dashboard <identifier>
  name "Dashboard Name"
  owner "Owner Name"
  version "1.0"
  grid <rows>x<columns>

def metric|chart|table <identifier>
  name "Widget Name"
  type <type>
  source type <nodetype> [where <conditions>]
  [correlate type <nodetype> via <relationship>]
  [analyze <status>]
  [groupby <property>]
  [orderby <property> [asc|desc]]
  [columns <prop1>, <prop2>, ...]
  [span <rows>x<columns>]
```

---

## Header Definition

### Syntax
```sylang
hdef dashboard <identifier>
  name "Dashboard Name"
  owner "Owner Name"
  version "1.0"
  grid <rows>x<columns>
```

### Properties
| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `name` | ✅ | Dashboard title | `"EPB System Metrics"` |
| `owner` | ✅ | Dashboard owner | `"Systems Team"` |
| `version` | ✅ | Version string | `"1.0"` |
| `grid` | ✅ | Layout grid (rows×columns) | `3x4` (12 widgets) |

### Example
```sylang
hdef dashboard EPB_METRICS
  name "EPB System Dashboard"
  owner "Systems Engineering Team"
  version "1.0"
  grid 3x4
```

---

## Widget Types

### 1. Metric Widget

Display a single numeric value with optional unit.

**Syntax:**
```sylang
def metric <identifier>
  name "Metric Name"
  type count|percentage|sum|avg|min|max|gauge
  source type <nodetype> [where <conditions>]
  [property <property_name>]
  [span <rows>x<columns>]
```

**Metric Types:**
- `count` - Count symbols
- `percentage` - Calculate percentage (requires `correlate`)
- `sum` - Sum numeric property
- `avg` - Average numeric property
- `min` - Minimum numeric property
- `max` - Maximum numeric property
- `gauge` - Display as gauge (0-100)

**Examples:**
```sylang
# Simple count
def metric TOTAL_REQUIREMENTS
  name "Total Requirements"
  type count
  source type requirement

# Count with filter
def metric APPROVED_REQUIREMENTS
  name "Approved Requirements"
  type count
  source type requirement where status = approved

# Coverage percentage
def metric TEST_COVERAGE
  name "Test Coverage"
  type percentage
  source type requirement where status = approved
  correlate type testcase via satisfies

# Average (requires property)
def metric AVG_PRIORITY
  name "Average Priority"
  type avg
  source type requirement
  property priority
```

---

### 2. Chart Widget

Visualize data with various chart types.

**Syntax:**
```sylang
def chart <identifier>
  name "Chart Name"
  type bar|line|pie|scatter|gauge|sankey
  source type <nodetype> [where <conditions>]
  [correlate type <nodetype> via <relationship>]
  [analyze <status>]
  [groupby <property>]
  [orderby <property> [asc|desc]]
  [xaxis "Label"]
  [yaxis "Label"]
  [span <rows>x<columns>]
```

**Chart Types:**
- `bar` - Bar chart
- `line` - Line chart
- `pie` - Pie chart (requires `groupby`)
- `scatter` - Scatter plot
- `gauge` - Gauge chart
- `sankey` - Sankey flow diagram (requires `correlate`)

**Examples:**
```sylang
# Pie chart with groupby
def chart REQ_BY_STATUS
  name "Requirements by Status"
  type pie
  source type requirement
  groupby status

# Bar chart with filter and sort
def chart REQ_BY_LEVEL
  name "Requirements by Safety Level"
  type bar
  source type requirement where reqtype = functional
  groupby safetylevel
  orderby safetylevel desc

# Sankey flow (traceability)
def chart TRACEABILITY_FLOW
  name "Traceability Flow"
  type sankey
  source type requirement
  correlate type function via implements
  correlate type testcase via satisfies
  span 2x2
```

---

### 3. Table Widget

Display data in tabular format.

**Syntax:**
```sylang
def table <identifier>
  name "Table Name"
  description "Table description"
  source type <nodetype> [where <conditions>]
  [groupby <property>]
  [orderby <property> [asc|desc]]
  columns <prop1>, <prop2>, <prop3>, ...
  [span <rows>x<columns>]
```

**Examples:**
```sylang
# Simple table
def table APPROVED_REQS
  name "Approved Requirements"
  source type requirement where status = approved
  orderby name asc
  columns name, reqtype, safetylevel, owner

# Table with analysis
def table ISOLATED_SYMBOLS
  name "Isolated Symbols"
  description "Symbols with no relationships"
  source type all
  analyze isolated
  columns symbolName, symbolType, status
  span 2x2
```

---

## Query Syntax

### Source Keyword

Specify the primary data source.

**Syntax:**
```sylang
source type <nodetype> [where <conditions>]
```

**Node Types:**
- `requirement`, `function`, `feature`, `block`, `interface`, `operation`, `signal`
- `testcase`, `failuremode`, `hazard`, `agent`, `usecase`, `state`, `transition`
- `config`, `productline`, `featureset`, `functionset`, etc.
- `all` - All symbols from all files

**Examples:**
```sylang
source type requirement
source type requirement where status = approved
source type all
```

---

### Where Clause

Filter source data with boolean expressions.

**Syntax:**
```sylang
where <property> <operator> <value>
where <complex_expression>
```

**Operators:**
| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal | `status = approved` |
| `!=` | Not equal | `status != rejected` |
| `in` | In list | `status in (approved, draft)` |
| `contains` | String contains | `tags contains safety` |
| `and` | Logical AND | `status = approved and reqtype = functional` |
| `or` | Logical OR | `safetylevel = ASIL-D or safetylevel = ASIL-C` |
| `()` | Grouping | `(A or B) and C` |

**Examples:**
```sylang
where status = approved
where reqtype != non-functional
where status in (approved, draft, review)
where tags contains safety
where status = approved and reqtype = functional
where (safetylevel = ASIL-D or safetylevel = ASIL-C) and status = approved
```

---

### Correlate Keyword (Complex Queries)

Follow relationships across files.

**Syntax:**
```sylang
correlate type <nodetype> via <relationship>
```

**Relationship Keywords:**
- `implements`, `satisfies`, `verifies`, `validates`, `traces`
- `allocatedto`, `enables`, `requires`, `excludes`
- `derivedfrom`, `refinedfrom`, `mitigates`, `composedof`
- `needs`, `assignedto`, `provides`

**Examples:**
```sylang
# Single hop
source type requirement
correlate type testcase via satisfies

# Multi-hop (traceability chain)
source type requirement
correlate type function via implements
correlate type testcase via satisfies
```

---

### Analyze Keyword (Complex Queries)

Aggregate relationship analysis.

**Syntax:**
```sylang
analyze <status>
```

**Analyze Types:**
| Type | Description |
|------|-------------|
| `broken` | Symbols with broken outgoing links |
| `orphan` | Symbols with no incoming links |
| `sink` | Symbols with no outgoing links |
| `isolated` | Symbols with no links at all |
| `connected` | Symbols with valid links |
| `relationships` | All relationship types used |
| `all` | All symbols (for general analysis) |

**Examples:**
```sylang
# Count broken links
def metric BROKEN_LINKS
  name "Broken Links"
  type count
  source type all
  analyze broken

# Broken links by node type
def chart BROKEN_BY_TYPE
  name "Broken Links by Type"
  type bar
  source type all
  analyze broken
  groupby nodetype

# Orphaned requirements
def table ORPHANED_REQS
  name "Orphaned Requirements"
  source type requirement
  analyze orphan
  columns symbolName, symbolType, outgoingCount
```

---

### GroupBy Keyword

Group results by property.

**Syntax:**
```sylang
groupby <property>
```

**Examples:**
```sylang
groupby status
groupby reqtype
groupby safetylevel
groupby nodetype
```

---

### OrderBy Keyword

Sort results by property.

**Syntax:**
```sylang
orderby <property> [asc|desc]
```

**Examples:**
```sylang
orderby name asc
orderby safetylevel desc
orderby status
```

---

### Span Keyword

Control widget size in grid.

**Syntax:**
```sylang
span <rows>x<columns>
```

**Default:** `1x1`

**Examples:**
```sylang
span 1x1  # Single cell
span 2x2  # 2×2 block
span 1x2  # Wide widget
span 2x1  # Tall widget
```

---

## Query Complexity Levels

### Level 1: Simple Queries
- Single `source`
- Optional `where`, `groupby`, `orderby`
- **NO** `correlate` or `analyze`

**Example:**
```sylang
source type requirement where status = approved
groupby reqtype
```

---

### Level 2: Complex Queries
- Single `source`
- **HAS** `correlate` OR `analyze`
- Optional `where`, `groupby`, `orderby`

**Examples:**
```sylang
# Correlation
source type requirement
correlate type testcase via satisfies

# Aggregate analysis
source type all
analyze broken
groupby nodetype
```

---

### Level 3: Very Complex Queries
- Multiple `source` statements
- Custom `calculate` expressions
- Reverse lookup with `forward`/`reverse` keywords

**Examples:**
```sylang
# Multi-source comparison
source type requirement where domain = safety
source type requirement where domain = security

# Custom calculate
source type requirement
correlate type testcase via satisfies
calculate (count(req) * 100) / count(all)

# Reverse lookup
source type requirement
correlate type testcase via satisfies reverse
```

---

## Advanced Features

### Reverse Lookup

Follow relationships in reverse direction (find sources instead of targets).

**Syntax:**
```sylang
correlate type <nodetype> via <relationship> reverse
```

**Use Cases:**
- Find all requirements satisfied by a specific test
- Find all functions that implement requirements
- Impact analysis: "What references this symbol?"

**Examples:**
```sylang
# Forward: Find tests that satisfy requirements
source type requirement
correlate type testcase via satisfies forward  # or just 'forward' (default)

# Reverse: Find requirements that ARE satisfied by tests
source type testcase
correlate type requirement via satisfies reverse
```

**Performance Note:** Reverse lookup scans all symbols, so it may be slower for large projects.

---

### Multi-Source Queries

Compare or merge data from multiple sources.

**Syntax:**
```sylang
source type <nodetype1> [where <conditions>]
source type <nodetype2> [where <conditions>]
source type <nodetype3> [where <conditions>]
```

**Use Cases:**
- Compare coverage across different domains
- Merge requirements from multiple sources
- Cross-domain analysis

**Examples:**
```sylang
# Compare safety vs security requirements
def chart DOMAIN_COMPARISON
  name "Requirements by Domain"
  type bar
  source type requirement where domain = safety
  source type requirement where domain = security
  groupby status

# Multi-source count
def metric TOTAL_CRITICAL
  name "Total Critical Items"
  type count
  source type requirement where safetylevel = ASIL-D
  source type hazard where severity = catastrophic
```

---

### Custom Calculate Expressions

Define custom formulas for derived metrics.

**Syntax:**
```sylang
calculate <expression>
```

**Supported Operations:**
- `count(x)` - Count of items
- `+`, `-`, `*`, `/` - Basic math
- `()` - Parentheses for grouping

**Use Cases:**
- Custom coverage formulas
- Weighted scores
- Composite metrics

**Examples:**
```sylang
# Traceability score (0-100%)
def metric TRACEABILITY_SCORE
  name "Traceability Score"
  type gauge
  source type requirement
  correlate type function via implements
  correlate type testcase via satisfies
  calculate (count(req) * 100) / count(all)

# Weighted coverage
def metric WEIGHTED_COVERAGE
  name "Weighted Coverage"
  type percentage
  source type requirement where status = approved
  correlate type testcase via satisfies
  calculate (count(req) * 2 + count(test)) / (count(req) * 3)
```

**Note:** Calculate expressions are evaluated after base query execution.

---

## Complete Example

```sylang
hdef dashboard EPB_SYSTEM_METRICS
  name "EPB System Metrics Dashboard"
  owner "Systems Engineering Team"
  version "1.0"
  grid 3x4

# Row 1: Key Metrics
def metric TOTAL_REQUIREMENTS
  name "Total Requirements"
  type count
  source type requirement

def metric APPROVED_REQUIREMENTS
  name "Approved Requirements"
  type count
  source type requirement where status = approved

def metric TEST_COVERAGE
  name "Test Coverage"
  type percentage
  source type requirement where status = approved
  correlate type testcase via satisfies

def metric BROKEN_LINKS
  name "Broken Links"
  type count
  source type all
  analyze broken

# Row 2: Charts
def chart REQ_BY_STATUS
  name "Requirements by Status"
  type pie
  source type requirement
  groupby status
  span 1x2

def chart REQ_BY_LEVEL
  name "Requirements by Safety Level"
  type bar
  source type requirement where reqtype = functional
  groupby safetylevel
  orderby safetylevel desc
  span 1x2

# Row 3: Traceability
def chart TRACEABILITY_FLOW
  name "Traceability Flow"
  type sankey
  source type requirement
  correlate type function via implements
  correlate type testcase via satisfies
  span 2x2

def table ORPHANED_REQS
  name "Orphaned Requirements"
  source type requirement
  analyze orphan
  columns symbolName, symbolType, outgoingCount, incomingCount
  span 2x2
```

---

## Best Practices

1. **Grid Planning**
   - Plan your grid size based on widget count
   - Use `span` for important widgets
   - Maximum cells = rows × columns

2. **Query Optimization**
   - Use `where` clauses to filter early
   - Avoid overly broad queries (`source type all`)
   - Use specific node types when possible

3. **Widget Naming**
   - Use clear, descriptive names
   - Include metric type in name (e.g., "Test Coverage %")
   - Be consistent across dashboards

4. **Relationship Analysis**
   - Use `analyze` for quick insights
   - Use `correlate` for detailed traceability
   - Combine with `groupby` for breakdowns

5. **Layout Design**
   - Put key metrics at top (Row 1)
   - Use charts for trends (Row 2)
   - Use tables for details (Row 3)
   - Use `span` strategically

---

## Validation & Error Handling

### Common Errors

**Grid Overflow:**
```
Error: Grid overflow: 15 cells used, but grid is 3x4 (12 cells)
Recommendation: Increase grid size or reduce widget spans
```

**Invalid Node Type:**
```
Error: Invalid node type: requiremnt
Recommendation: Valid types: requirement, function, feature, ...
```

**Missing Property:**
```
Error: Metric type 'avg' requires 'property' keyword
Recommendation: Add: property <property_name>
```

**Analyze + Correlate Conflict:**
```
Error: Cannot use both 'analyze' and 'correlate' in same query
Recommendation: Use either analyze OR correlate, not both
```

---

## Tips & Tricks

### 1. Coverage Metrics
```sylang
# Requirements with tests
def metric REQ_WITH_TESTS
  name "Requirements with Tests"
  type percentage
  source type requirement
  correlate type testcase via satisfies
```

### 2. Safety-Critical Analysis
```sylang
# ASIL-D requirements
def chart ASIL_D_REQS
  name "ASIL-D Requirements"
  type bar
  source type requirement where safetylevel = ASIL-D
  groupby status
```

### 3. Traceability Gaps
```sylang
# Orphaned requirements (no tests)
def table ORPHANED_REQS
  name "Requirements Without Tests"
  source type requirement
  analyze orphan
  columns name, reqtype, owner
```

### 4. Multi-Hop Traceability
```sylang
# Req → Func → Test flow
def chart FULL_TRACEABILITY
  name "Full Traceability Chain"
  type sankey
  source type requirement
  correlate type function via implements
  correlate type testcase via satisfies
  span 2x2
```

---

## See Also

- [Sylang Complete Reference](SYLANG_COMPLETE_REFERENCE.md)
- [Relations Matrix Help](relations-matrix-help.md)
- [Specification Help](spec-help.md)

---

**Version:** 2.28.38  
**Last Updated:** 2025-10-19
