# Failure Analysis - FMEA (.flr)

## Overview
Defines **Failure Mode and Effects Analysis (FMEA)** with temporal properties and complete traceability. Supports both hierarchical (old) and flat (new) syntax patterns.

## File Structure
- **ONE** `hdef failureset` per file
- **MULTIPLE** `def failuremode` statements
- Supports temporal logic with `within` keyword
- Can `use` blocksets, functionsets, requirementsets, testsets, parameters

## Valid Keywords
```
use, hdef, failureset, def, failuremode, cause, effect, name, description, 
owner, tags, level, safetylevel, propagateto, block, timingreference, 
failurerate, severity, detectability, occurrence, actionpriority, 
allocatedto, affects, probability, rpn, faultdetectiontime, faulttolerancetime, 
propagationdelay, recoverytime, causedby, effects, detectedby, mitigatedby, 
testedby, derivedfrom, within, when, ref
```

## Syntax Structure
```
use blockset [blockset-ref]
use functionset [functionset-ref]
use requirementset [requirementset-ref]
use testset [testset-ref]

hdef failureset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
  timingreference [ms|us|s]
  propagateto ref failureset [failureset-ref]
  block ref block [block-ref]

  def failuremode [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    
    # AIAG VDA Quantitative Analysis
    failurerate [numeric-value]
    severity [1-10]
    occurrence [1-10]
    detectability [1-10]
    actionpriority [high|medium|low]
    rpn [numeric-value]
    
    # Temporal Properties
    faultdetectiontime [numeric-value]
    faulttolerancetime [numeric-value]
    propagationdelay [numeric-value]
    recoverytime [numeric-value]
    within [numeric-value]
    
    # Relationships
    causedby ref failuremode [failuremode-ref], [failuremode-ref], ...
    effects ref failuremode [failuremode-ref], [failuremode-ref], ...
    detectedby ref function [function-ref], [function-ref], ...
    mitigatedby ref function [function-ref], [function-ref], ...
    testedby ref testcase [testcase-ref], [testcase-ref], ...
    affects ref block [block-ref], [block-ref], ...
    allocatedto ref block [block-ref]
    derivedfrom ref requirement [requirement-ref]
    when ref config [config-ref]
```

## Complete Example (Flat Syntax - Recommended)
```sylang
use blockset AutomotiveECUBlocks
use functionset PowerSupplyFunctions
use requirementset SafetyRequirements
use testset PowerSupplyTests

hdef failureset PowerSupplyFailures
  name "Power Supply Subsystem FMEA"
  description "Comprehensive FMEA for automotive ECU power supply"
  owner "Safety Engineering Team"
  safetylevel ASIL-D
  timingreference ms
  propagateto ref failureset VehicleSystemFailures
  block ref block PowerSupplyBlock

  def failuremode VoltageRegulatorFailure
    name "Voltage Regulator Complete Failure"
    description "Primary voltage regulator stops providing regulated 5V power"
    owner "Hardware Safety Team"
    
    // FMEA Quantitative Analysis
    failurerate 1.2e-6        // Failures per million hours
    severity 9                // 1-10 scale
    detectability 3           // 1-10 scale
    occurrence 4              // 1-10 scale
    actionpriority high
    safetylevel ASIL-D
    
    // Temporal Properties (using timingreference=ms)
    faultdetectiontime 5      // Detected within 5ms
    faulttolerancetime 2      // System can tolerate for 2ms
    propagationdelay 10       // Propagates to system failure in 10ms
    recoverytime 500          // 500ms required for recovery
    
    // Failure Causality with Timing (MULTIPLE allowed)
    causedby ref failuremode TransistorBurnout within 50
    causedby ref failuremode CapacitorDegradation within 200
    
    // Failure Effects with Timing (MULTIPLE allowed)
    effects ref failuremode ProcessorPowerLoss within 10
    effects ref failuremode SystemShutdown within 500
    
    // Detection Mechanisms (MULTIPLE allowed)
    detectedby ref function VoltageSensorMonitoring within 5
    detectedby ref function PowerSupplyDiagnostic within 20
    
    // Mitigation Strategies (MULTIPLE allowed)
    mitigatedby ref function RedundantPowerPath within 2
    mitigatedby ref function PowerFailureSafeMode within 100
    
    // Testing and Requirements (SINGLE only)
    testedby ref testcase VoltageRegulatorFailureTest
    derivedfrom ref requirement VoltageRegulationReq

  def failuremode TransistorBurnout
    name "Power Transistor Thermal Burnout"
    description "Power MOSFET failure due to excessive thermal stress"
    
    failurerate 0.8e-6
    severity 7
    detectability 5
    occurrence 2
    actionpriority medium
    safetylevel ASIL-C
    
    // This is a root cause (no causes listed)
    effects ref failuremode VoltageRegulatorFailure within 50
    
    detectedby ref function TemperatureSensorMonitoring within 10
    mitigatedby ref function ThermalDerating within 1
    
    testedby ref testcase ThermalStressTest
    derivedfrom ref requirement ThermalManagementReq
```

## Relationship Multiplicity
**MULTIPLE allowed:**
- `causedby` - Multiple causes
- `effects` - Multiple effects
- `detectedby` - Multiple detection mechanisms
- `mitigatedby` - Multiple mitigation strategies

**SINGLE only:**
- `testedby` - One test case
- `derivedfrom` - One requirement

## Reference Constraints
- `causedby` → Can only ref `failuremode`
- `effects` → Can only ref `failuremode`
- `detectedby` → Can only ref `function`
- `mitigatedby` → Can only ref `function`
- `testedby` → Can only ref `testcase`
- `derivedfrom` → Can only ref `requirement`

## Temporal Properties
All timing values use `timingreference` from failureset level:
- `faultdetectiontime` - Time to detect failure
- `faulttolerancetime` - Time system can tolerate
- `propagationdelay` - Time to propagate to next failure
- `recoverytime` - Time required to recover
- `within` - Temporal constraint for relationships (e.g., `within 50` ms)

## Action Priority
```
actionpriority high
actionpriority medium
actionpriority low
```

---
ISO 26262 compliant FMEA with quantitative analysis and temporal logic.

