# .req (Requirements) Examples

Requirements Language files define system requirements and traceability. Multiple `.req` files are allowed per project.

## Basic Structure

```sylang
use functiongroup <FunctionGroupIdentifier>
use block <BlockIdentifier>
use configset <ConfigSetIdentifier>

hdef requirementset <RequirementSetName>
  name "Requirement set name"
  description "Requirements description"
  owner "Owner information"
  tags "tag1", "tag2"
  ref config <ConfigIdentifier>
  
  def requirement <RequirementName>
    name "Requirement name"
    description "Requirement description"
    ref config <ConfigIdentifier>
    reqtype <REQUIREMENT_TYPE>
    derivedfrom ref requirement <RequirementId1>, <RequirementId2>
    refinedfrom ref requirement <RequirementId1>, <RequirementId2>
    allocatedto ref block <BlockIdentifier>
    implements ref function <FunctionIdentifier>
    safetylevel <SAFETY_LEVEL>
    rationale "Rationale for requirement"
    verificationcriteria "Verification criteria"
    status <STATUS_ENUM>
```

## Enums

### Requirement Types
- `system` - System-level requirements
- `functional` - Functional requirements
- `performance` - Performance requirements
- `safety` - Safety requirements
- `security` - Security requirements
- `usability` - Usability requirements

### Status Enum
- `draft` - Draft requirement
- `review` - Under review
- `approved` - Approved requirement
- `deprecated` - Deprecated requirement
- `implemented` - Implemented requirement

## Example 1: Blood Pressure Monitor Requirements

```sylang
use functiongroup BloodPressureFunction
use block MeasurementSubsystem
use configset BloodPressureVariantsConfigs

hdef requirementset BloodPressureSystemRequirements
  name "Blood Pressure Monitoring System Requirements Specification"
  description "Complete requirements for WiFi-enabled clinical blood pressure monitoring system"
  owner "Medical Device Requirements Team"
  tags "medical-device", "blood-pressure", "clinical"
  ref config c_AdvancedAlgorithms_PredictiveAnalytics
  
  def requirement REQ_MEAS_001
    name "Blood Pressure Measurement Accuracy"
    description "WHEN performing blood pressure measurement THE system SHALL provide systolic and diastolic readings accurate to ±3 mmHg"
    ref config c_AdvancedAlgorithms_PredictiveAnalytics
    reqtype system
    derivedfrom ref requirement MedicalDeviceStandards, ClinicalAccuracyStandards
    allocatedto ref block MeasurementSubsystem
    implements ref function DeflateCuff
    safetylevel ASIL-C
    rationale "Clinical decision accuracy requires ±3 mmHg measurement precision"
    verificationcriteria "Accuracy testing against calibrated reference per ANSI/AAMI SP10:2002"
    status approved

  def requirement REQ_MEAS_002
    name "Measurement Completion Time"
    description "WHEN initiated by user THE system SHALL complete automatic blood pressure measurement WITHIN 120 seconds"
    ref config c_AdvancedAlgorithms_PredictiveAnalytics
    reqtype performance
    refinedfrom ref requirement ClinicalWorkflowRequirements, UserExperienceStandards
    allocatedto ref block MeasurementSubsystem
    safetylevel ASIL-B
    rationale "Timely measurements required for clinical efficiency and patient comfort"
    verificationcriteria "Timing verification during normal operation per test protocol TS_MEAS_001"
    status approved

  def requirement REQ_SAFE_001
    name "Overpressure Protection"
    description "THE system SHALL prevent cuff pressure from exceeding 300 mmHg under all operating conditions"
    reqtype safety
    derivedfrom ref requirement SafetyStandards, PatientSafetyRequirements
    allocatedto ref block MeasurementSubsystem
    implements ref function OverpressureProtection
    safetylevel ASIL-D
    rationale "Patient safety requires protection against dangerous overpressure conditions"
    verificationcriteria "Pressure testing with blocked release valve, maximum pressure verification"
    status approved

  def requirement REQ_FUNC_001
    name "Automatic Deflation"
    description "THE system SHALL automatically deflate the cuff upon measurement completion or error detection"
    reqtype functional
    allocatedto ref block MeasurementSubsystem
    implements ref function AutomaticDeflation
    safetylevel ASIL-C
    rationale "Automatic deflation ensures patient comfort and system reliability"
    verificationcriteria "Functional testing of deflation under normal and error conditions"
    status approved

  def requirement REQ_CONN_001
    name "WiFi Data Transmission"
    description "WHEN WiFi connectivity is available THE system SHALL transmit measurement data to configured health platform WITHIN 30 seconds"
    ref config c_ConnectivityFeatures_WiFi
    reqtype functional
    allocatedto ref block ConnectivitySubsystem
    implements ref function WiFiDataTransmission
    rationale "Real-time data sharing enables remote monitoring and clinical decision support"
    verificationcriteria "Network transmission testing with various WiFi configurations"
    status approved
```

## Example 2: Electronic Parking Brake Requirements

```sylang
use functiongroup EPBFunctions
use block EPBControlSystem
use configset EPBVariantConfigs

hdef requirementset EPBSafetyRequirements
  name "Electronic Parking Brake Safety Requirements"
  description "Critical safety requirements for automotive electronic parking brake system"
  owner "Automotive Safety Engineering Team"
  tags "automotive", "safety", "EPB", "ASIL-D"
  
  def requirement REQ_EPB_SAF_001
    name "Emergency Brake Engagement"
    description "THE system SHALL engage parking brake WITHIN 500 milliseconds of receiving emergency engagement command"
    reqtype safety
    derivedfrom ref requirement ISO26262_Requirements, VehicleSafetyStandards
    allocatedto ref block EPBControlSystem
    implements ref function EmergencyBrakeEngagement
    safetylevel ASIL-D
    rationale "Rapid emergency engagement critical for vehicle and occupant safety"
    verificationcriteria "Hardware-in-loop testing with emergency scenarios, timing verification"
    status approved

  def requirement REQ_EPB_SAF_002
    name "Brake Force Validation"
    description "THE system SHALL continuously validate applied brake force and detect force degradation exceeding 10% of target"
    reqtype safety
    allocatedto ref block EPBControlSystem
    implements ref function BrakeForceMonitoring
    safetylevel ASIL-D
    rationale "Continuous force validation ensures brake effectiveness and prevents vehicle rollaway"
    verificationcriteria "Force sensor validation testing with simulated degradation scenarios"
    status approved

  def requirement REQ_EPB_PERF_001
    name "Normal Engagement Time"
    description "WHEN driver activates parking brake THE system SHALL complete engagement WITHIN 2 seconds under normal conditions"
    reqtype performance
    allocatedto ref block EPBControlSystem
    implements ref function NormalBrakeEngagement
    safetylevel ASIL-C
    rationale "Timely engagement provides driver confidence and system responsiveness"
    verificationcriteria "Performance testing across temperature and load conditions"
    status approved

  def requirement REQ_EPB_FUNC_001
    name "Hill Hold Assist Activation"
    description "WHEN vehicle is on slope greater than 15 degrees AND engine is off AND driver exits vehicle THE system SHALL automatically engage parking brake"
    reqtype functional
    refinedfrom ref requirement ConvenienceFeatureRequirements
    allocatedto ref block EPBControlSystem
    implements ref function HillHoldAssist
    rationale "Automatic engagement prevents vehicle rollaway on slopes"
    verificationcriteria "Slope testing with various angles and vehicle configurations"
    status approved

  def requirement REQ_EPB_DIAG_001
    name "System Self-Diagnostics"
    description "THE system SHALL perform comprehensive self-diagnostics at each ignition cycle and report any detected faults"
    reqtype functional
    allocatedto ref block EPBControlSystem
    implements ref function SystemSelfTest
    safetylevel ASIL-C
    rationale "Regular diagnostics ensure system integrity and early fault detection"
    verificationcriteria "Diagnostic testing with injected faults and fault coverage analysis"
    status approved
```

## Example 3: Industrial Inverter Requirements

```sylang
use functiongroup InverterFunctions
use block InverterControlSystem

hdef requirementset InverterPerformanceRequirements
  name "Industrial Inverter Performance Requirements"
  description "Performance and operational requirements for three-phase industrial inverter"
  owner "Power Electronics Engineering Team"
  tags "industrial", "inverter", "power-electronics"
  
  def requirement REQ_INV_PERF_001
    name "Efficiency Specification"
    description "THE inverter SHALL maintain efficiency greater than 95% at rated load across operating temperature range"
    reqtype performance
    allocatedto ref block InverterControlSystem
    implements ref function EfficiencyOptimization
    safetylevel SIL-2
    rationale "High efficiency reduces energy costs and thermal management requirements"
    verificationcriteria "Efficiency testing per IEC 61800-9-2 across full load and temperature range"
    status approved

  def requirement REQ_INV_SAFE_001
    name "Overcurrent Protection"
    description "THE system SHALL detect overcurrent conditions exceeding 110% of rated current and initiate protective shutdown WITHIN 10 microseconds"
    reqtype safety
    derivedfrom ref requirement IEC61508_Requirements, ElectricalSafetyStandards
    allocatedto ref block InverterControlSystem
    implements ref function OvercurrentProtection
    safetylevel SIL-3
    rationale "Rapid overcurrent protection prevents component damage and fire hazards"
    verificationcriteria "Current injection testing with high-speed oscilloscope verification"
    status approved

  def requirement REQ_INV_FUNC_001
    name "Motor Speed Control"
    description "THE system SHALL control motor speed with accuracy of ±0.1% of commanded speed under steady-state conditions"
    reqtype functional
    allocatedto ref block InverterControlSystem
    implements ref function SpeedControl
    rationale "Precise speed control ensures process quality and equipment performance"
    verificationcriteria "Speed accuracy testing with calibrated encoder feedback"
    status approved

  def requirement REQ_INV_COMM_001
    name "Modbus Communication"
    description "THE system SHALL support Modbus RTU communication protocol with response time less than 50 milliseconds"
    reqtype functional
    refinedfrom ref requirement IndustrialCommunicationRequirements
    allocatedto ref block InverterControlSystem
    implements ref function ModbusCommunication
    rationale "Standard industrial communication enables integration with control systems"
    verificationcriteria "Protocol testing with Modbus master devices and timing verification"
    status approved
```

## Multi-line String Support

Properties like `description`, `rationale`, and `verificationcriteria` support multi-line strings using backslash continuation:

```sylang
def requirement REQ_COMPLEX_001
  name "Complex Multi-Step Requirement"
  description "WHEN system receives input data THE system SHALL \
               validate data integrity AND \
               process data according to algorithm specifications AND \
               generate output within specified time limits"
  rationale "Multi-step processing ensures data quality while \
             maintaining real-time performance requirements for \
             safety-critical applications"
  verificationcriteria "Integration testing with data validation scenarios \
                        Performance testing under maximum load conditions \
                        Timing verification with real-time constraints"
```

## Relationship Keywords

- `derivedfrom ref requirement <id1>, <id2>` - Derived from higher-level requirements
- `refinedfrom ref requirement <id1>, <id2>` - Refined from broader requirements
- `allocatedto ref block <identifier>` - Allocated to specific system block
- `implements ref function <identifier>` - Implements specific function
- `ref config <identifier>` - References configuration for conditional requirements

## Validation Rules

1. **Multiple .req files allowed** - No project limit
2. **Cross-file references** - Can reference symbols from other files
3. **Configuration references** - Support for variant-specific requirements
4. **Traceability links** - Must reference valid blocks and functions
5. **Safety level consistency** - Child requirements cannot exceed parent safety level
6. **Status tracking** - Requirements must have valid status
7. **Multi-line support** - Properties support backslash continuation
8. **Requirement types** - Must use valid requirement type enums

## Key Properties

### Required Properties
- `name` - Requirement name
- `description` - Detailed requirement specification

### Optional Properties
- `owner` - Responsible person/team
- `tags` - Classification tags
- `safetylevel` - Safety integrity level
- `rationale` - Justification for requirement
- `verificationcriteria` - How requirement will be verified
- `status` - Current requirement status
- `reqtype` - Type of requirement
- `ref config` - Configuration reference for conditional requirements

### Relation Properties
- `derivedfrom` - Parent requirements
- `refinedfrom` - Source requirements being refined
- `allocatedto` - System blocks responsible for implementation
- `implements` - Functions that satisfy the requirement
