# Sylang File Extensions

This directory contains detailed specifications for each Sylang file extension.

## File Extension Categories

### Product Line Management
- **[`.ple`](ple-examples.md)** - Product Line Engineering
- **[`.fml`](fml-examples.md)** - Feature Model Language  
- **[`.vml`](vml-examples.md)** - Variant Model Language
- **[`.vcf`](vcf-examples.md)** - Variant Configuration Format

### Systems Engineering
- **[`.blk`](blk-examples.md)** - Block Definition Language
- **[`.fun`](fun-examples.md)** - Function Group Language
- **[`.req`](req-examples.md)** - Requirements Language
- **[`.tst`](tst-examples.md)** - Test Suite Language

### Systems Analysis
- **[`.fma`](fma-examples.md)** - Failure Mode Analysis
- **[`.seq`](seq-examples.md)** - Sequence Diagrams
- **`.flr`** - Failure Analysis (see fma-examples.md)

### Safety Analysis (Planned)
- **`.itm`** - Item Definition Language
- **`.haz`** - Hazard Analysis Language
- **`.rsk`** - Risk Assessment Language
- **`.sgl`** - Safety Goals Language

## Usage Rules

### File Limits
- **One per project**: `.ple`, `.fml`, `.vcf`
- **One per folder**: `.fma`, `.fmc`, `.fta`
- **Multiple allowed**: `.vml`, `.blk`, `.fun`, `.req`, `.tst`, `.itm`, `.haz`, `.rsk`, `.sgl`

### Dependencies
- `.vml` files are derived from `.fml`
- `.vcf` files are generated from `.vml`
- `.blk` files can reference other `.blk` files
- `.fun` files can reference `.blk` definitions
- `.req` files can trace to `.fun` and `.blk` files
- `.tst` files validate `.req`, `.fun`, and `.blk` files

## File Naming Conventions

- Use descriptive names reflecting content
- Separate words with hyphens or underscores
- Include version numbers when appropriate
- Examples:
  - `main-system.ple`
  - `safety-features.fml`
  - `variant-premium.vml`
  - `brake-system.blk`
  - `emergency-functions.fun`
