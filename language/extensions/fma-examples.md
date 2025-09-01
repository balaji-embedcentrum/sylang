# .fma (Failure Mode Analysis) Examples

Failure Mode Analysis files provide structured FMEA capabilities for safety-critical system development. Each `.fma` file represents failure analysis for a specific block. Only one `.fma` file is allowed per folder.

## Basic Structure

```sylang
use blockset <BlockSetIdentifier>
use functionset <FunctionSetIdentifier>

hdef failureset <FailureSetName>
  name "Failure set name"
  description "Failure analysis description"
  owner "Owner information"
  tags "tag1", "tag2"
  level <LEVEL_ENUM>
  safetylevel <SAFETY_LEVEL>
  
  def failuremode <FailureModeName>
    name "Failure mode name"
    description "Failure mode description"
    failurerate <FLOAT_VALUE>
    severity <1-10>
    detectability <1-10>
    occurrence <1-10>
    actionpriority <PRIORITY_ENUM>
    safetylevel <SAFETY_LEVEL>
    level <LEVEL_ENUM>
    
    causes ref failuremode <FailureModeId> within <TIME_UNIT>
    effects ref failuremode <FailureModeId> within <TIME_UNIT>
    detectedby ref function <FunctionId>
    mitigatedby ref function <FunctionId>
    testedby ref testcase <TestCaseId>
    derivedfrom ref requirement <RequirementId>
    propagateto ref block <BlockId>
```

## Enums and Properties

### Action Priority Enum
- `high` - High priority action required
- `medium` - Medium priority action
- `low` - Low priority action

### Level Enum
- `system` - System level
- `subsystem` - Subsystem level
- `module` - Module level
- `part` - Part level

### Quantitative Properties
- **Failure Rate**: Float value in FIT (Failures in Time - failures per hour)
- **Severity**: Impact level (1=negligible, 10=catastrophic)
- **Detectability**: Detection ability (1=always detected, 10=never detected)
- **Occurrence**: Frequency (1=very unlikely, 10=very frequent)
- **RPN**: Risk Priority Number = Severity × Occurrence × Detectability (auto-calculated)

### Time Units for Temporal Logic
- `within 500us` - Microseconds
- `within 100ms` - Milliseconds
- `within 2s` - Seconds
- `within 5min` - Minutes
- `within 24h` - Hours

## Example 1: Automotive ECU Power Supply FMEA

```sylang
use blockset VehicleSystemBlocks
use functionset VehicleSystemFunctions

hdef failureset VehicleSystemFailures
  name "Vehicle System Level FMEA"
  description "Top-level system FMEA for autonomous vehicle"
  owner "System Safety Team"
  tags "system-level", "FMEA", "vehicle-safety"
  level system
  safetylevel ASIL-D

  def failuremode SystemLevelCollision
    name "Vehicle Collision Event"
    description "System-level failure resulting in collision"
    severity 10
    occurrence 2
    detectability 3
    actionpriority high
    safetylevel ASIL-D
    level system
    failurerate 1.0e-9
    
    causes ref failuremode BrakeSystemFailure within 2s
    causes ref failuremode SteeringSystemFailure within 1s
    effects ref failuremode VehicleDamage within 100ms
    effects ref failuremode OccupantInjury within 100ms
    detectedby ref function CollisionDetection
    mitigatedby ref function EmergencyBraking
    testedby ref testcase TC_COLLISION_001

  def failuremode PowerSupplyFailure
    name "Primary Power Supply Failure"
    description "Complete loss of primary 12V power supply"
    severity 8
    occurrence 3
    detectability 2
    actionpriority high
    safetylevel ASIL-D
    level subsystem
    failurerate 5.2e-6
    
    causes ref failuremode SystemLevelCollision within 5s
    effects ref failuremode ECUShutdown within 500ms
    effects ref failuremode CommunicationLoss within 1s
    detectedby ref function PowerMonitoring
    mitigatedby ref function BackupPowerActivation
    propagateto ref block BackupPowerSystem
    derivedfrom ref requirement REQ_POWER_001

  def failuremode BrakeSystemFailure
    name "Electronic Brake System Failure"
    description "Loss of electronic brake control capability"
    severity 9
    occurrence 2
    detectability 4
    actionpriority high
    safetylevel ASIL-D
    level subsystem
    failurerate 2.1e-7
    
    causes ref failuremode SystemLevelCollision within 2s
    effects ref failuremode UncontrolledVehicle within 1s
    detectedby ref function BrakeSystemMonitoring
    mitigatedby ref function MechanicalBrakeBackup
    testedby ref testcase TC_BRAKE_FAILURE_001
    propagateto ref block EmergencyBrakeSystem

  def failuremode SensorDataCorruption
    name "Critical Sensor Data Corruption"
    description "Corruption of safety-critical sensor data"
    severity 7
    occurrence 4
    detectability 5
    actionpriority medium
    safetylevel ASIL-C
    level module
    failurerate 8.3e-6
    
    causes ref failuremode IncorrectDecision within 100ms
    effects ref failuremode SystemDegradation within 500ms
    detectedby ref function DataIntegrityCheck
    mitigatedby ref function SensorRedundancy
    propagateto ref block DecisionMakingSystem
```

## Example 2: Medical Device Blood Pressure Monitor FMEA

```sylang
use blockset BloodPressureBlocks
use functionset BloodPressureFunctions

hdef failureset BloodPressureMonitorFailures
  name "Blood Pressure Monitor FMEA"
  description "Failure mode analysis for clinical blood pressure monitoring system"
  owner "Medical Device Safety Team"
  tags "medical-device", "FMEA", "patient-safety"
  level system
  safetylevel ASIL-C

  def failuremode OverpressureEvent
    name "Cuff Overpressure Event"
    description "Cuff pressure exceeds safe limits causing patient discomfort or injury"
    severity 8
    occurrence 2
    detectability 3
    actionpriority high
    safetylevel ASIL-D
    level system
    failurerate 1.5e-8
    
    causes ref failuremode PressureValveStuck within 2s
    causes ref failuremode PressureSensorFailure within 1s
    effects ref failuremode PatientDiscomfort within 100ms
    effects ref failuremode TissueIschemia within 30s
    detectedby ref function OverpressureMonitoring
    mitigatedby ref function EmergencyPressureRelease
    testedby ref testcase TC_OVERPRESSURE_001
    derivedfrom ref requirement REQ_PRESSURE_SAFETY_001

  def failuremode PressureValveStuck
    name "Pressure Release Valve Stuck Closed"
    description "Mechanical failure of pressure release valve in closed position"
    severity 7
    occurrence 3
    detectability 4
    actionpriority high
    safetylevel ASIL-C
    level component
    failurerate 3.2e-6
    
    causes ref failuremode OverpressureEvent within 2s
    effects ref failuremode PressureBuildupUncontrolled within 5s
    detectedby ref function ValvePositionSensing
    mitigatedby ref function BackupReleaseValve
    propagateto ref block PneumaticSystem

  def failuremode MeasurementInaccuracy
    name "Blood Pressure Measurement Inaccuracy"
    description "Systematic measurement error exceeding ±5 mmHg tolerance"
    severity 6
    occurrence 4
    detectability 6
    actionpriority medium
    safetylevel ASIL-B
    level subsystem
    failurerate 1.2e-5
    
    causes ref failuremode CalibrationDrift within 24h
    causes ref failuremode SensorDegradation within 168h
    effects ref failuremode IncorrectDiagnosis within 1min
    effects ref failuremode TreatmentError within 1h
    detectedby ref function CalibrationVerification
    mitigatedby ref function AutomaticRecalibration
    testedby ref testcase TC_ACCURACY_001

  def failuremode CommunicationFailure
    name "WiFi Communication Failure"
    description "Loss of wireless connectivity preventing data transmission"
    severity 4
    occurrence 5
    detectability 2
    actionpriority low
    safetylevel QM
    level module
    failurerate 2.8e-4
    
    causes ref failuremode NetworkConnectivityLoss within 30s
    effects ref failuremode DataTransmissionLoss within 1min
    effects ref failuremode RemoteMonitoringLoss within 5min
    detectedby ref function ConnectivityMonitoring
    mitigatedby ref function LocalDataStorage
    propagateto ref block DataManagementSystem
```

## Example 3: Industrial Inverter Power Electronics FMEA

```sylang
use blockset InverterBlocks
use functionset InverterFunctions

hdef failureset InverterPowerElectronicsFailures
  name "Industrial Inverter Power Electronics FMEA"
  description "Failure analysis for three-phase industrial inverter power stage"
  owner "Power Electronics Safety Team"
  tags "industrial", "power-electronics", "FMEA"
  level subsystem
  safetylevel SIL-3

  def failuremode IGBTShortCircuit
    name "IGBT Power Device Short Circuit"
    description "Internal short circuit in IGBT power switching device"
    severity 9
    occurrence 2
    detectability 3
    actionpriority high
    safetylevel SIL-3
    level component
    failurerate 4.5e-7
    
    causes ref failuremode OvercurrentCondition within 10us
    causes ref failuremode ThermalOverstress within 1ms
    effects ref failuremode SystemShutdown within 50us
    effects ref failuremode MotorDamage within 100ms
    detectedby ref function DesaturationDetection
    mitigatedby ref function FastCurrentLimiting
    testedby ref testcase TC_IGBT_FAULT_001
    propagateto ref block ProtectionSystem

  def failuremode DCBusOvervoltage
    name "DC Bus Overvoltage Condition"
    description "DC bus voltage exceeds maximum rated voltage"
    severity 8
    occurrence 3
    detectability 2
    actionpriority high
    safetylevel SIL-3
    level subsystem
    failurerate 2.1e-6
    
    causes ref failuremode RegenerativeBrakingOverload within 100ms
    causes ref failuremode VoltageRegulatorFailure within 500ms
    effects ref failuremode ComponentDamage within 1ms
    effects ref failuremode SystemProtectiveShutdown within 10ms
    detectedby ref function VoltageMonitoring
    mitigatedby ref function BrakingResistorActivation
    derivedfrom ref requirement REQ_OVERVOLTAGE_PROTECTION

  def failuremode ThermalOverload
    name "Power Module Thermal Overload"
    description "Junction temperature exceeds safe operating limits"
    severity 7
    occurrence 4
    detectability 3
    actionpriority medium
    safetylevel SIL-2
    level component
    failurerate 8.7e-6
    
    causes ref failuremode CoolingSystemFailure within 5min
    causes ref failuremode AmbientTemperatureExcessive within 10min
    effects ref failuremode PowerDerating within 30s
    effects ref failuremode SystemShutdown within 2min
    detectedby ref function TemperatureMonitoring
    mitigatedby ref function ThermalDerating
    propagateto ref block CoolingSystem

  def failuremode ControlSignalLoss
    name "Control Signal Communication Loss"
    description "Loss of control signals from main controller"
    severity 6
    occurrence 3
    detectability 4
    actionpriority medium
    safetylevel SIL-2
    level interface
    failurerate 1.5e-5
    
    causes ref failuremode CommunicationCableFailure within 1ms
    causes ref failuremode ElectromagneticInterference within 100us
    effects ref failuremode UncontrolledMotorOperation within 10ms
    effects ref failuremode SafeModeActivation within 50ms
    detectedby ref function CommunicationWatchdog
    mitigatedby ref function SafeStateTransition
    testedby ref testcase TC_COMM_LOSS_001
```

## Temporal Logic - Time-based Causality

The `within` keyword defines real-time temporal relationships:

```sylang
def failuremode PrimaryFailure
  name "Primary System Failure"
  
  # Propagation timing
  causes ref failuremode SecondaryFailure within 100ms
  effects ref failuremode SystemCollapse within 2s
  
  # Detection and response timing
  detectedby ref function FaultDetection within 50ms
  mitigatedby ref function EmergencyResponse within 200ms
```

## Relationship Keywords

### Failure Relationships
- `causes ref failuremode <id> within <time>` - Lower-level failures causing this failure
- `effects ref failuremode <id> within <time>` - Higher-level failures caused by this failure

### Detection and Mitigation
- `detectedby ref function <id>` - Functions that detect this failure
- `mitigatedby ref function <id>` - Functions that prevent/handle this failure

### Testing and Requirements
- `testedby ref testcase <id>` - Test cases verifying failure handling
- `derivedfrom ref requirement <id>` - Requirements addressing this failure

### System Propagation
- `propagateto ref block <id>` - System blocks affected by this failure

## Validation Rules

1. **One .fma file per folder** - Folder-level restriction
2. **Block association** - Must reference analyzed block
3. **Quantitative metrics** - Severity, occurrence, detectability (1-10 scale)
4. **Temporal relationships** - Support for time-based causality
5. **Cross-file references** - Can reference functions, blocks, requirements, tests
6. **Safety level consistency** - Failure safety level should match system criticality
7. **RPN calculation** - Risk Priority Number auto-calculated from metrics
8. **Failure rate units** - Must use FIT (Failures in Time) format

## Key Properties

### Required Properties
- `name` - Failure mode name
- `description` - Detailed failure description
- `severity` - Impact level (1-10)
- `occurrence` - Frequency rating (1-10)
- `detectability` - Detection capability (1-10)

### Optional Properties
- `failurerate` - Quantitative failure rate (FIT)
- `actionpriority` - Priority for corrective action
- `safetylevel` - Safety integrity level
- `level` - Hierarchical level
- `owner` - Responsible person/team
- `tags` - Classification tags

### Temporal Relationships
- `causes` - Causal relationships with timing
- `effects` - Effect relationships with timing
- `within` - Time constraints for propagation
