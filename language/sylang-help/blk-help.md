# Block Definition (.blk)

## Overview
The `.blk` file defines **hardware/software blocks** with their product characteristics. It represents architectural elements in your system design with AIAG VDA-compliant characteristics.

## File Structure Rules
- **ONE** `hdef block` statement per file
- **MULTIPLE** `def characteristic` statements (AIAG VDA product characteristics)
- Can `use` configsets, featuresets, functionsets, interfacesets
- Supports `needs` for input interface references at hdef level
- Supports `provides` for output interface references at hdef level
- Block relationships defined at hdef level
- **NOTE**: Operations, signals, parameters, and datatypes are defined in `.ifc` files, not in `.blk` files

## Valid Keywords
```
use, hdef, block, def, characteristic,
name, description, designrationale, comment, owner, tags, level, 
safetylevel, blocktype, chartype, unit, nominalvalue, upperlimit, lowerlimit,
tolerance, controlmethod, measuringequipment, samplingplan, inspectionfrequency,
documentreference, decomposedfrom, decomposesto, implements, enables,
derivedfrom, implementedby, needs, meets, verifiedby,
when, ref, config, feature, function, operation, signal, requirement, testcase
```

## Syntax Structure
```
use configset [configset-ref]
use featureset [featureset-ref]
use functionset [functionset-ref]
use interfaceset [interfaceset-ref]

hdef block [identifier]
  name [string-literal]
  description [string-literal]
  designrationale [string-literal]
  comment [string-literal]
  owner [string-literal]
  level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  tags [string-literal], [string-literal], ...
  blocktype [hardware|software|hybrid]
  
  # Input interfaces (NEEDS - at hdef level)
  needs ref operation [operation-ref], [operation-ref], ...
  needs ref signal [signal-ref], [signal-ref], ...
  
  # Output interfaces (PROVIDES - at hdef level)
  provides ref operation [operation-ref], [operation-ref], ...
  provides ref signal [signal-ref], [signal-ref], ...
  
  # Block relationships (at hdef level)
  decomposedfrom ref block [block-ref]
  decomposesto ref block [block-ref], [block-ref], ...
  implements ref function [function-ref], [function-ref], ...
  enables ref feature [feature-ref], [feature-ref], ...
  derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
  implementedby ref requirement [requirement-ref], [requirement-ref], ...
  when ref config [config-ref]

  # Product Characteristics (AIAG VDA) - ONLY def statements allowed
  def characteristic [identifier]
    name [string-literal]
    description [string-literal]
    chartype [special|critical|significant]
    unit [string-literal]
    nominalvalue [numeric-value]
    upperlimit [numeric-value]
    lowerlimit [numeric-value]
    tolerance [numeric-value]
    controlmethod [string-literal]
    measuringequipment [string-literal]
    samplingplan [string-literal]
    inspectionfrequency [string-literal]
    documentreference [string-literal]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    meets ref requirement [requirement-ref]
    verifiedby ref testcase [testcase-ref]
```

## Complete Example

```sylang
use configset AutonomousVehicleConfig
use featureset AutonomousVehicleFeatures
use functionset PerceptionProcessingFunctions
use interfaceset PerceptionInterfaces

hdef block AdvancedPerceptionControlModule
  name "Advanced Perception Control Module"
  description """
    Comprehensive perception processing unit for Level 4 autonomous vehicle 
    environmental awareness. Handles multi-sensor data fusion, object detection, 
    tracking, prediction, and environmental model generation.
    """
  designrationale """
    Centralized perception architecture enables optimal sensor fusion and 
    reduces computational redundancy. Hardware-software co-design approach 
    ensures deterministic real-time performance for safety-critical operations.
    """
  comment """
    This module represents the core perception system for autonomous vehicles,
    implementing ISO 26262 ASIL-D requirements for functional safety.
    """
  owner "Advanced Perception Engineering Team"
  level module
  safetylevel ASIL-D
  blocktype hybrid
  tags "perception", "sensor-fusion", "AI-processing", "safety-critical"
  
  # Input interfaces (NEEDS - what this block requires)
  needs ref operation CameraRawData, LidarPointCloud, RadarTargets
  needs ref operation CalibrationParameters, SystemConfiguration
  needs ref signal SystemClockSignal, PowerSupplyStatus
  needs ref signal CalibrationStatus, SystemHeartbeat
  
  # Output interfaces (PROVIDES - what this block offers)
  provides ref operation EnvironmentalModel, ObjectTrackingData, HazardDetection
  provides ref signal ProcessingHeartbeat, SensorHealthStatus
  
  # Block relationships (ASPICE bilateral traceability)
  decomposesto ref block CameraProcessingSubmodule, LidarProcessingSubmodule
  decomposesto ref block FusionProcessingSubmodule, AIInferenceSubmodule
  implements ref function PerceptionProcessing, ObjectDetection
  enables ref feature PerceptionSystem, ObjectDetection
  derivedfrom ref requirement SYS_REQ_001, SYS_REQ_002
  implementedby ref requirement SW_REQ_100, SW_REQ_101
  when ref config c_CoreAutonomousFeatures_PerceptionSystem_L4

  # Product Characteristics (AIAG VDA)
  def characteristic ProcessingLatency
    name "Perception Processing Cycle Latency"
    description "Maximum time between sensor data input and environmental model output"
    chartype critical
    unit "milliseconds"
    nominalvalue 50.0
    upperlimit 75.0
    lowerlimit 30.0
    tolerance 5.0
    controlmethod "Real-time performance monitoring with cycle time measurement"
    measuringequipment "Oscilloscope with timing analysis software"
    samplingplan "100% continuous monitoring during operation"
    inspectionfrequency "Every processing cycle"
    documentreference "PERC-SPEC-001-v2.3"
    derivedfrom ref requirement PERF_REQ_010
    implementedby ref requirement SW_REQ_150
    meets ref requirement PERF_REQ_010
    verifiedby ref testcase TEST_PERF_001
    
  def characteristic DetectionAccuracy
    name "Object Detection Accuracy Rate"
    description "Percentage of correctly detected and classified objects"
    chartype critical
    unit "percent"
    nominalvalue 99.5
    upperlimit 100.0
    lowerlimit 98.0
    tolerance 0.5
    controlmethod "Statistical validation with test datasets"
    measuringequipment "ML model validation framework"
    samplingplan "10,000 test scenarios per validation cycle"
    inspectionfrequency "Monthly validation runs"
    documentreference "PERC-VALIDATION-001-v1.5"
    derivedfrom ref requirement SAFETY_REQ_020
    meets ref requirement SAFETY_REQ_020
    verifiedby ref testcase TEST_DETECTION_001
    
  def characteristic PowerConsumption
    name "Module Power Consumption"
    description "Electrical power consumption under typical operating conditions"
    chartype significant
    unit "watts"
    nominalvalue 45.0
    upperlimit 60.0
    lowerlimit 30.0
    tolerance 5.0
    controlmethod "Power monitoring during HIL testing"
    measuringequipment "Precision power analyzer"
    samplingplan "Sample 5 units per production batch"
    inspectionfrequency "Per batch during production"
    documentreference "HW-POWER-SPEC-001"
    derivedfrom ref requirement HW_REQ_030
    
  def characteristic OperatingTemperature
    name "Module Operating Temperature Range"
    description "Ambient temperature range for normal operation"
    chartype special
    unit "celsius"
    nominalvalue 25.0
    upperlimit 85.0
    lowerlimit -40.0
    tolerance 5.0
    controlmethod "Environmental chamber testing"
    measuringequipment "Calibrated thermocouples"
    samplingplan "Temperature cycling test for qualification"
    inspectionfrequency "Design validation and qualification testing"
    documentreference "ENV-TEST-SPEC-001"
    derivedfrom ref requirement ENV_REQ_001
```

## Interface Patterns

### NEEDS (Inputs) - At hdef Level
```sylang
hdef block MyBlock
  # What this block needs from others (defined in .ifc files)
  needs ref operation InputOperation1, InputOperation2
  needs ref signal InputSignal1, InputSignal2, InputSignal3
```

### PROVIDES (Outputs) - At hdef Level
```sylang
hdef block MyBlock
  # What this block provides to others (defined in .ifc files)
  provides ref operation OutputOperation1, OutputOperation2
  provides ref signal OutputSignal1, OutputSignal2
```

**Note**: Operations and signals are defined in `.ifc` files and only *referenced* in `.blk` files via `needs` and `provides`.

## Block Relationships (ASPICE Bilateral Traceability)

### Bottom-Up Composition (decomposedfrom)
```sylang
hdef block ChildBlock
  decomposedfrom ref block ParentBlock
  # Single block only - this block is part of ParentBlock
```

### Top-Down Decomposition (decomposesto)
```sylang
hdef block SystemBlock
  decomposesto ref block SubsystemBlock1, SubsystemBlock2, SubsystemBlock3
  # Multiple blocks allowed - this block decomposes into subsystems
```

### Function Implementation (implements)
```sylang
hdef block ControlModule
  implements ref function SpeedControl, BrakeControl, SteeringControl
  # This block implements these functions
```

### Feature Enablement (enables)
```sylang
hdef block VisionProcessingBlock
  enables ref feature CameraSystem, ObjectDetection
  # This block enables these features
```

### Requirement Traceability (derivedfrom, implementedby)
```sylang
hdef block SafetyController
  derivedfrom ref requirement SYS_REQ_001, SYS_REQ_002
  implementedby ref requirement SW_REQ_100, SW_REQ_101
  # ASPICE bilateral traceability to requirements
```

## Level Hierarchy
```
level product          # Product level
level system           # System level
level subsystem        # Subsystem level
level component        # Component level
level subcomponent     # Subcomponent level
level module           # Module level
level submodule        # Submodule level
level part             # Part level
level subpart          # Subpart level
```

## Common Patterns

### ECU/Controller Block with Characteristics
```sylang
hdef block VehicleControllerECU
  level component
  safetylevel ASIL-D
  blocktype hardware
  
  needs ref operation VehicleStateData
  needs ref signal SensorInputs
  provides ref operation ControlCommands
  
  decomposesto ref block ProcessorModule, MemoryModule, CommunicationModule
  
  def characteristic ProcessingPower
    name "ECU Processing Power"
    chartype critical
    unit "MIPS"
    nominalvalue 2000.0
    upperlimit 2500.0
    lowerlimit 1500.0
```

### Sensor Block with Quality Characteristics
```sylang
hdef block RadarSensor
  level part
  safetylevel ASIL-C
  blocktype hardware
  
  needs ref operation CalibrationData
  needs ref signal PowerSupply
  provides ref signal RadarTargets
  
  def characteristic DetectionRange
    name "Maximum Detection Range"
    chartype critical
    unit "meters"
    nominalvalue 200.0
    upperlimit 250.0
    lowerlimit 150.0
```

### Processing Module with Performance Characteristics
```sylang
hdef block SignalProcessingModule
  level module
  safetylevel ASIL-B
  blocktype software
  
  needs ref signal RawSensorData
  provides ref operation ProcessedData
  
  def characteristic CycleTime
    name "Processing Cycle Time"
    chartype critical
    unit "milliseconds"
    nominalvalue 10.0
    upperlimit 15.0
    lowerlimit 5.0
```

## Validation Rules
✅ Exactly one `hdef block` per file  
✅ Multiple `def characteristic` allowed (AIAG VDA)  
✅ `needs` at hdef level for input interfaces  
✅ `provides` at hdef level for output interfaces  
✅ Can use `when ref config` for conditional visibility  
✅ Multiline strings use `"""` triple quotes  
✅ Operations/signals defined in `.ifc` files, referenced here  
❌ NO `def operation/signal/parameter/datatype` in `.blk` files  
❌ Input interfaces via `needs`, not `def`  
❌ Output interfaces via `provides`, not `def`

---

**Next Steps**: 
- Define operations, signals, parameters, and datatypes in `.ifc` files
- Define functions in `.fun` files
- Define requirements in `.req` files

