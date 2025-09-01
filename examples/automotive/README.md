# Automotive Systems Examples

Examples of Sylang implementations for automotive systems, focusing on safety-critical applications.

## Examples Included

- **Electronic Parking Brake (EPB)** - Basic brake system implementation
- **Advanced Driver Assistance Systems (ADAS)** - Complex sensor fusion
- **Powertrain Control** - Engine and transmission management
- **Body Control Module** - Lighting, doors, and comfort features

## Safety Standards

These examples follow automotive safety standards:
- ISO 26262 (Functional Safety)
- ASPICE (Automotive SPICE)
- AUTOSAR (Automotive Open System Architecture)

## File Structure

Each automotive example follows this pattern:
```
system-name/
├── .sylangrules
├── system.ple          # Product line definition
├── features.fml        # Feature model
├── architecture/
│   ├── main.blk        # Main system block
│   └── subsystems/     # Subsystem definitions
├── functions/
│   ├── safety.fun      # Safety functions
│   └── operational.fun # Normal operation functions
├── requirements/
│   └── system.req      # System requirements
└── tests/
    └── validation.tst  # Test suites
```
