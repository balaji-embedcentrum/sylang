# .seq (Sequence Diagrams) Examples

Sequence Diagram Language files define temporal interactions between system components. Multiple `.seq` files are allowed per project.

## Basic Structure

```sylang
use functionset <FunctionSetIdentifier>
use featureset <FeatureSetIdentifier>

hdef sequenceset <SequenceSetName>
  name "Sequence set name"
  description "Sequence description"
  owner "Owner information"
  tags "tag1", "tag2"
  safetylevel <SAFETY_LEVEL>
  
  def participant <ParticipantName>
    name "Participant name"
    description "Participant description"
    owner "Owner information"
    enables ref feature <FeatureIdentifier>
  
  call ref function <FunctionIdentifier>
    sequence <NUMBER>
    from ref block <BlockIdentifier>
    to ref block <BlockIdentifier>
    content "function_call_details"
  
  def fragment <FragmentName>
    name "Fragment name"
    description "Fragment description"
    fragmenttype <FRAGMENT_TYPE>
    condition "fragment_condition"
    sequence <NUMBER>
    container enabled
```

## Fragment Types
- `alt` - Alternative execution path
- `else` - Else branch for alternative
- `parallel` - Parallel execution
- `loop` - Iterative execution
- `opt` - Optional execution

## Sequence Numbering
- **Integer sequences**: `sequence 1`, `sequence 2`, etc.
- **Decimal sequences**: `sequence 4.1`, `sequence 4.2` for nested calls
- **Hierarchical**: Fragment contents inherit parent sequence numbering

## Example 1: Encryption Web Application Sequence

```sylang
use functionset EncryptionWebAppFunctions
use featureset EncryptionWebAppFeatures

hdef sequenceset EncryptionWebAppSequence
  name "Encryption Web App Sequence"
  description "Complete text encryption workflow with user interface interactions"
  owner "Systems Engineering Team"
  tags "encryption", "web-app", "crypto-operations"
  safetylevel ASIL-B

  def participant UserInterface
    name "User Interface"
    description "Web-based user interface for text input and display"
    owner "Frontend Team"
    enables ref feature UserInterface

  def participant CryptographicEngine
    name "Cryptographic Engine"
    description "Web Crypto API based encryption engine"
    owner "Security Team"
    enables ref feature CryptographicEngine

  def participant ErrorHandler
    name "Error Handler"
    description "System error handling and validation"
    owner "Backend Team"
    enables ref feature ErrorHandling

  # Basic function call
  call ref function InitializeUserInterface
    sequence 1
    from ref block UserInterface
    to ref block UserInterface
    content "initialize_ui_components()"

  # Conditional fragment
  def fragment ValidInputDetected
    name "Valid Input Processing"
    description "Process valid user input through encryption pipeline"
    fragmenttype alt
    condition "input_validation_passed"
    sequence 2
    container enabled

    call ref function EncryptText
      sequence 2.1
      from ref block UserInterface
      to ref block CryptographicEngine
      content "encrypt_aes_gcm(text, key, iv)"

    call ref function DisplayResult
      sequence 2.2
      from ref block CryptographicEngine
      to ref block UserInterface
      content "display_encrypted_result(encrypted_data)"

  def fragment InvalidInputDetected
    name "Invalid Input Handling"
    description "Handle invalid input with error processing"
    fragmenttype else
    sequence 3
    container enabled

    call ref function HandleError
      sequence 3.1
      from ref block UserInterface
      to ref block ErrorHandler
      content "handle_validation_error(error_details)"

    call ref function DisplayErrorMessage
      sequence 3.2
      from ref block ErrorHandler
      to ref block UserInterface
      content "show_error_message(error_info)"

  # Loop fragment
  def fragment DataProcessingLoop
    name "Process Multiple Data Items"
    description "Iteratively process multiple data items"
    fragmenttype loop
    condition "more_data_available"
    sequence 4
    container enabled

    call ref function ProcessDataItem
      sequence 4.1
      from ref block Controller
      to ref block Processor
      content "process_item(data_item)"

    call ref function ValidateResult
      sequence 4.2
      from ref block Processor
      to ref block Validator
      content "validate_processed_data(result)"

  # Parallel fragment
  def fragment ParallelOperations
    name "Concurrent Operations"
    description "Simultaneous data processing operations"
    fragmenttype parallel
    sequence 5
    container enabled

    call ref function ProcessA
      sequence 5.1
      from ref block Controller
      to ref block ProcessorA
      content "process_type_a(data)"

    call ref function ProcessB
      sequence 5.2
      from ref block Controller
      to ref block ProcessorB
      content "process_type_b(data)"

    call ref function ProcessC
      sequence 5.3
      from ref block Controller
      to ref block ProcessorC
      content "process_type_c(data)"
```

## Example 2: Blood Pressure Measurement Sequence

```sylang
use functionset BloodPressureFunctions
use featureset BloodPressureFeatures

hdef sequenceset BloodPressureMeasurementSequence
  name "Blood Pressure Measurement Sequence"
  description "Complete blood pressure measurement workflow"
  owner "Medical Device Engineering Team"
  tags "medical-device", "measurement", "workflow"
  safetylevel ASIL-C

  def participant UserInterface
    name "User Interface"
    description "Patient and clinician interface"
    owner "UI Team"
    enables ref feature DisplayInterface

  def participant MeasurementController
    name "Measurement Controller"
    description "Main measurement control system"
    owner "Control Systems Team"
    enables ref feature CoreMeasurement

  def participant PneumaticSystem
    name "Pneumatic System"
    description "Cuff inflation and pressure control"
    owner "Hardware Team"
    enables ref feature PneumaticControl

  def participant SafetyMonitor
    name "Safety Monitor"
    description "Safety monitoring and protection"
    owner "Safety Team"
    enables ref feature SafetyMonitoring

  # Initialize system
  call ref function InitializeSystem
    sequence 1
    from ref block UserInterface
    to ref block MeasurementController
    content "initialize_measurement_system()"

  call ref function SystemSelfTest
    sequence 2
    from ref block MeasurementController
    to ref block SafetyMonitor
    content "perform_self_diagnostics()"

  # Measurement process
  def fragment NormalMeasurement
    name "Normal Measurement Process"
    description "Standard measurement workflow"
    fragmenttype alt
    condition "system_ready_and_user_initiated"
    sequence 3
    container enabled

    call ref function StartInflation
      sequence 3.1
      from ref block MeasurementController
      to ref block PneumaticSystem
      content "begin_cuff_inflation(target_pressure)"

    call ref function MonitorPressure
      sequence 3.2
      from ref block PneumaticSystem
      to ref block SafetyMonitor
      content "continuous_pressure_monitoring()"

    call ref function BeginDeflation
      sequence 3.3
      from ref block MeasurementController
      to ref block PneumaticSystem
      content "controlled_pressure_release(release_rate)"

    call ref function AnalyzeOscillations
      sequence 3.4
      from ref block MeasurementController
      to ref block MeasurementController
      content "oscillometric_analysis(pressure_data)"

    call ref function DisplayResults
      sequence 3.5
      from ref block MeasurementController
      to ref block UserInterface
      content "show_bp_results(systolic, diastolic, pulse)"

  def fragment EmergencyStop
    name "Emergency Stop Procedure"
    description "Emergency measurement termination"
    fragmenttype else
    sequence 4
    container enabled

    call ref function EmergencyRelease
      sequence 4.1
      from ref block SafetyMonitor
      to ref block PneumaticSystem
      content "emergency_pressure_release()"

    call ref function AlertUser
      sequence 4.2
      from ref block SafetyMonitor
      to ref block UserInterface
      content "display_safety_alert(alert_type)"
```

## Example 3: Electronic Parking Brake Engagement Sequence

```sylang
use functionset EPBFunctions
use featureset EPBFeatures

hdef sequenceset EPBEngagementSequence
  name "EPB Engagement Sequence"
  description "Electronic parking brake engagement workflow"
  owner "Automotive Safety Team"
  tags "automotive", "brake", "safety-sequence"
  safetylevel ASIL-D

  def participant DriverInterface
    name "Driver Interface"
    description "Driver controls and feedback"
    owner "HMI Team"
    enables ref feature UserInterface

  def participant BrakeController
    name "Brake Controller"
    description "Main brake control system"
    owner "Control Systems Team"
    enables ref feature BrakeActuation

  def participant ActuatorSystem
    name "Actuator System"
    description "Physical brake actuators"
    owner "Mechatronics Team"
    enables ref feature ActuatorSystem

  def participant SafetySystem
    name "Safety System"
    description "Safety monitoring and validation"
    owner "Safety Team"
    enables ref feature SafetyMonitoring

  # Driver initiates brake engagement
  call ref function DriverBrakeCommand
    sequence 1
    from ref block DriverInterface
    to ref block BrakeController
    content "engage_parking_brake_request()"

  # Safety validation
  call ref function ValidateSafetyConditions
    sequence 2
    from ref block BrakeController
    to ref block SafetySystem
    content "check_engagement_safety_conditions()"

  def fragment SafeEngagement
    name "Safe Engagement Process"
    description "Normal brake engagement when conditions are safe"
    fragmenttype alt
    condition "safety_conditions_met"
    sequence 3
    container enabled

    call ref function InitiateEngagement
      sequence 3.1
      from ref block BrakeController
      to ref block ActuatorSystem
      content "begin_brake_engagement(target_force)"

    call ref function MonitorForce
      sequence 3.2
      from ref block ActuatorSystem
      to ref block SafetySystem
      content "monitor_brake_force_buildup()"

    call ref function ConfirmEngagement
      sequence 3.3
      from ref block SafetySystem
      to ref block BrakeController
      content "confirm_engagement_complete(force_achieved)"

    call ref function UpdateDriverDisplay
      sequence 3.4
      from ref block BrakeController
      to ref block DriverInterface
      content "update_brake_status_display(engaged)"

  def fragment UnsafeConditions
    name "Unsafe Conditions Handling"
    description "Handle unsafe engagement conditions"
    fragmenttype else
    sequence 4
    container enabled

    call ref function RejectEngagement
      sequence 4.1
      from ref block SafetySystem
      to ref block BrakeController
      content "reject_engagement_request(safety_reason)"

    call ref function NotifyDriver
      sequence 4.2
      from ref block BrakeController
      to ref block DriverInterface
      content "display_engagement_warning(warning_message)"
```

## Validation Rules

### General Validation
- Sequence file (.seq) shall only contain specified keywords
- Only one `hdef sequenceset` statement allowed per file
- `use` statements must appear before `hdef` statement
- Indentation must be multiples of 2 spaces or tabs
- All referenced functions must exist in imported function sets
- All referenced blocks must be defined as participants

### Block Validation
- Participant names must be unique within the sequence
- Participants must be defined before being referenced in calls
- `enables` relationships must reference valid features

### Function Call Validation
- `from` and `to` must reference defined participants
- Referenced functions must exist in imported function sets
- Sequence numbers must be unique within the same scope
- Nested sequence numbers (e.g., 4.1, 4.2) must be within fragments

### Fragment Validation
- Fragment types must be valid enum values
- `else` fragments must follow `alt` fragments
- Container must be either `enabled` or `disabled`
- Fragments can be nested but must maintain proper sequence numbering
- Loop fragments require meaningful condition expressions

## Key Properties

### Sequence Set Properties
- `name` - Sequence set name
- `description` - Detailed description
- `owner` - Responsible person/team
- `tags` - Classification tags
- `safetylevel` - Safety integrity level

### Participant Properties
- `name` - Participant name
- `description` - Participant description
- `owner` - Responsible person/team
- `enables` - Feature enablement reference

### Call Properties
- `sequence` - Sequence number for ordering
- `from` - Source participant
- `to` - Target participant
- `content` - Function call details

### Fragment Properties
- `name` - Fragment name
- `description` - Fragment description
- `fragmenttype` - Type of fragment (alt, else, parallel, loop, opt)
- `condition` - Execution condition
- `sequence` - Fragment sequence number
- `container` - Container state (enabled/disabled)
