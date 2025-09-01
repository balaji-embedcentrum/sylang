# .fun (Function Group) Examples

Function Group Language files define functional behavior and requirements. Multiple `.fun` files are allowed per project.

## Basic Structure

```sylang
use function <FunctionIdentifier>  // Optional imports

hdef functiongroup <FunctionGroupName>
  name "Function group name"
  description "Function group description"
  owner "Owner information"
  tags "tag1", "tag2"
  level <LEVEL_ENUM>
  safetylevel <SAFETY_LEVEL_ENUM>
  
  def function <FunctionName>
    name "Function name"
    description "Function description"
    input <input_specification>
    output <output_specification>
    behavior <behavior_specification>
    safetylevel <SAFETY_LEVEL_ENUM>
    
    def function <ChildFunctionName>
      // Nested functions allowed
```

## Example 1: Blood Pressure Monitor Functions

```sylang
hdef functiongroup BloodPressureFunctions
  name "Blood Pressure Monitor Functions"
  description "Core functional behavior for blood pressure monitoring system"
  owner "Medical Device Software Team"
  tags "medical", "monitoring", "functions"
  level system
  safetylevel ASIL-C

  def function MeasurementControl
    name "Blood Pressure Measurement Control"
    description "Orchestrates the complete measurement process"
    input user_command, system_state
    output measurement_result, system_status
    safetylevel ASIL-C
    
    behavior
      when user_command.start_measurement
        validate system_ready
        initiate cuff_inflation
        monitor pressure_buildup
        execute oscillometric_analysis
        calculate bp_values
        validate measurement_quality
        store measurement_data
        display results
        
    def function CuffInflation
      name "Cuff Inflation Control"
      description "Controls pneumatic cuff inflation process"
      input target_pressure, current_pressure
      output pump_control, valve_control
      safetylevel ASIL-C
      
      behavior
        when target_pressure > current_pressure
          activate inflation_pump
          monitor pressure_rise
          when current_pressure >= target_pressure
            deactivate inflation_pump
            
    def function PressureRelease
      name "Controlled Pressure Release"
      description "Manages gradual pressure release during measurement"
      input release_rate, current_pressure
      output valve_position, pressure_profile
      safetylevel ASIL-C
      
      behavior
        when measurement_phase.active
          calculate optimal_release_rate
          adjust valve_opening
          maintain steady_deflation
          monitor oscillation_patterns

  def function SignalProcessing
    name "Signal Processing Functions"
    description "Processes raw sensor signals into meaningful data"
    input raw_sensor_data, calibration_parameters
    output filtered_signals, processed_data
    safetylevel ASIL-B
    
    def function NoiseFiltering
      name "Signal Noise Filtering"
      description "Removes noise and artifacts from sensor signals"
      input raw_signal, filter_parameters
      output clean_signal
      
      behavior
        apply low_pass_filter
        remove power_line_interference
        eliminate motion_artifacts
        validate signal_quality
        
    def function OscillometricAnalysis
      name "Oscillometric Pattern Analysis"
      description "Analyzes oscillometric patterns for BP calculation"
      input pressure_signal, oscillation_envelope
      output systolic_pressure, diastolic_pressure, mean_pressure
      safetylevel ASIL-C
      
      behavior
        detect oscillation_onset
        identify maximum_oscillation
        calculate pressure_ratios
        determine bp_values
        validate measurement_confidence

  def function SafetyFunctions
    name "Safety and Monitoring Functions"
    description "Critical safety monitoring and protection functions"
    safetylevel ASIL-D
    
    def function OverpressureProtection
      name "Overpressure Protection"
      description "Prevents dangerous overpressure conditions"
      input current_pressure, pressure_limits
      output emergency_release, safety_alert
      safetylevel ASIL-D
      
      behavior
        continuously monitor_pressure
        when current_pressure > safety_limit
          immediately open_emergency_valve
          activate safety_alert
          log safety_event
          disable measurement_system
          
    def function SystemDiagnostics
      name "System Health Diagnostics"
      description "Monitors system health and detects faults"
      input system_parameters, sensor_status
      output diagnostic_results, fault_codes
      safetylevel ASIL-C
      
      behavior
        periodically test_sensors
        validate calibration_data
        check communication_integrity
        monitor power_supply
        detect component_failures
        generate diagnostic_reports

  def function ConnectivityFunctions
    name "Data Connectivity Functions"
    description "Manages external data communication and storage"
    level subsystem
    
    def function DataTransmission
      name "Wireless Data Transmission"
      description "Transmits measurement data to external devices"
      input measurement_data, connection_status
      output transmission_result, sync_status
      
      behavior
        validate data_integrity
        encrypt sensitive_data
        establish secure_connection
        transmit measurement_records
        confirm successful_delivery
        
    def function CloudSync
      name "Cloud Data Synchronization"
      description "Synchronizes data with cloud health platforms"
      input local_data, cloud_credentials
      output sync_status, cloud_response
      
      behavior
        authenticate user_credentials
        compare local_remote_data
        upload new_measurements
        download user_settings
        resolve sync_conflicts
```

## Example 2: Electronic Parking Brake Functions

```sylang
use function VehicleSystemFunctions

hdef functiongroup EPBFunctions
  name "Electronic Parking Brake Functions"
  description "Complete functional specification for EPB system"
  owner "Automotive Safety Software Team"
  tags "automotive", "brake", "safety", "EPB"
  level system
  safetylevel ASIL-D
  inherits ref functiongroup VehicleSystemFunctions

  def function BrakeEngagement
    name "Parking Brake Engagement"
    description "Engages parking brake with safety validation"
    input driver_command, vehicle_state, brake_status
    output actuator_control, brake_force, system_status
    safetylevel ASIL-D
    
    behavior
      when driver_command.engage_brake
        validate vehicle_conditions
        check system_readiness
        initiate brake_application
        monitor force_buildup
        confirm engagement_complete
        update system_status
        
    def function ForceControl
      name "Brake Force Control"
      description "Controls applied brake force with precision"
      input target_force, current_force, vehicle_load
      output motor_control, force_feedback
      safetylevel ASIL-D
      
      behavior
        calculate required_torque
        adjust motor_power
        monitor force_sensors
        maintain target_force
        compensate for_temperature
        validate force_accuracy

  def function BrakeRelease
    name "Parking Brake Release"
    description "Safely releases parking brake"
    input release_command, safety_conditions, vehicle_state
    output actuator_control, release_confirmation
    safetylevel ASIL-D
    
    behavior
      when release_command.active
        verify safety_conditions
        check driver_presence
        validate vehicle_ready
        initiate gradual_release
        monitor release_progress
        confirm complete_release
        
    def function SafetyValidation
      name "Release Safety Validation"
      description "Validates conditions for safe brake release"
      input vehicle_sensors, driver_inputs, system_state
      output safety_approval, warning_signals
      safetylevel ASIL-D
      
      behavior
        check engine_running
        validate driver_seatbelt
        confirm transmission_ready
        verify hill_gradient
        assess traffic_conditions
        approve_or_deny release

  def function SafetyMonitoring
    name "Continuous Safety Monitoring"
    description "Real-time safety monitoring and fault detection"
    safetylevel ASIL-D
    
    def function PositionMonitoring
      name "Brake Position Monitoring"
      description "Continuously monitors brake actuator position"
      input position_sensors, reference_position
      output position_status, position_drift_alert
      safetylevel ASIL-D
      
      behavior
        continuously read_position_sensors
        compare with_expected_position
        detect position_drift
        validate sensor_consistency
        trigger alerts_on_deviation
        
    def function ForceMonitoring
      name "Brake Force Monitoring"
      description "Monitors applied brake force and validates effectiveness"
      input force_sensors, target_force, environmental_conditions
      output force_status, effectiveness_rating
      safetylevel ASIL-D
      
      behavior
        continuously measure_brake_force
        validate against_target
        compensate for_temperature
        detect force_degradation
        assess brake_effectiveness
        
    def function FaultDetection
      name "System Fault Detection"
      description "Detects and classifies system faults"
      input system_sensors, actuator_feedback, diagnostic_data
      output fault_classification, severity_level, recovery_action
      safetylevel ASIL-D
      
      behavior
        monitor all_system_parameters
        detect anomalous_behavior
        classify fault_severity
        determine recovery_strategy
        initiate safe_mode_if_required

  def function AutomaticFunctions
    name "Automatic Engagement Functions"
    description "Intelligent automatic brake engagement scenarios"
    level subsystem
    
    def function HillHoldAssist
      name "Hill Hold Assist Function"
      description "Automatically engages brake on steep inclines"
      input vehicle_angle, engine_state, driver_inputs
      output auto_engagement, hold_duration
      
      behavior
        continuously monitor_vehicle_angle
        when angle > hill_threshold
          and engine_off
          and driver_absent
          automatically engage_parking_brake
          maintain engagement_until_safe
          
    def function AutoParkEngagement
      name "Automatic Park Engagement"
      description "Engages brake during parking scenarios"
      input parking_sensors, vehicle_speed, transmission_state
      output auto_engagement, parking_confirmation
      
      behavior
        detect parking_scenario
        when vehicle_stopped
          and transmission_in_park
          and driver_door_open
          automatically engage_parking_brake
          confirm parking_complete

  def function DiagnosticFunctions
    name "System Diagnostic Functions"
    description "Comprehensive system diagnostics and maintenance"
    
    def function SelfTest
      name "System Self-Test"
      description "Performs comprehensive system self-test"
      input test_parameters, system_configuration
      output test_results, component_status, recommendations
      
      behavior
        test actuator_movement
        validate sensor_readings
        check communication_links
        verify safety_circuits
        assess component_wear
        generate test_report
        
    def function CalibrationCheck
      name "Calibration Validation"
      description "Validates system calibration parameters"
      input calibration_data, reference_values, environmental_conditions
      output calibration_status, drift_assessment, recalibration_need
      
      behavior
        compare current_vs_reference
        assess calibration_drift
        validate within_tolerances
        recommend recalibration_if_needed
        update calibration_timestamps
```

## Behavior Specification Syntax

### Conditional Logic
```sylang
behavior
  when condition1
    action1
    action2
  when condition2 and condition3
    action3
  otherwise
    default_action
```

### Continuous Monitoring
```sylang
behavior
  continuously monitor_parameter
  when parameter > threshold
    trigger_response
  maintain steady_state
```

### Sequential Operations
```sylang
behavior
  step1: initialize_system
  step2: validate_inputs
  step3: execute_operation
  step4: confirm_completion
```

## Input/Output Specifications

### Input Types
- `user_command` - User interface commands
- `sensor_data` - Sensor readings and feedback
- `system_state` - Current system status
- `vehicle_state` - Vehicle condition parameters
- `environmental_conditions` - External conditions

### Output Types
- `control_signals` - Actuator control commands
- `status_information` - System status updates
- `diagnostic_data` - Diagnostic and fault information
- `user_feedback` - User interface responses
- `safety_alerts` - Safety warnings and notifications

## Relationship Keywords

- `inherits ref functiongroup <identifier>` - Function group inheritance
- `implements ref interface <identifier>` - Interface implementation
- `requires ref function <identifier>` - Function dependencies
- `enables ref function <identifier>` - Function enablement
- `calls ref function <identifier>` - Function invocation

## Key Rules

1. **Multiple .fun files allowed** - No project limit
2. **Hierarchical structure** - Parent-child via indentation
3. **Behavior specification** - Required for function definitions
4. **Input/output definition** - Specify function interfaces
5. **Safety levels** - Can be specified at function level
6. **Cross-file references** - Can reference functions from other files
7. **Nested functions** - Support for function decomposition
8. **Behavioral logic** - Support for conditional and sequential behavior
