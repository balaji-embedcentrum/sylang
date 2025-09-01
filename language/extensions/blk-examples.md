# .blk (Block Definition) Examples

Block Definition Language files define system architecture and component structure. Multiple `.blk` files are allowed per project.

## Basic Structure

```sylang
use block <BlockIdentifier>  // Optional imports

hdef block <BlockName>
  name "Block name"
  description "Block description"
  owner "Owner information"
  tags "tag1", "tag2"
  level <LEVEL_ENUM>
  safetylevel <SAFETY_LEVEL_ENUM>
  
  def port <PortName> <direction>
    name "Port name"
    description "Port description"
    datatype <DATA_TYPE>
    
  def block <ChildBlockName>
    // Nested blocks allowed
    
  composedof ref block <BlockId1>, <BlockId2>
  needs ref port <PortId1>, <PortId2>
```

## Level Enums
- `productline` - Top-level product line
- `system` - System-level blocks
- `subsystem` - Subsystem-level blocks
- `component` - Component-level blocks
- `module` - Module-level blocks
- `interface` - Interface-level blocks

## Port Directions
- `input` - Input port
- `output` - Output port
- `bidirectional` - Bidirectional port

## Example 1: Blood Pressure Monitor System Block

```sylang
hdef block BloodPressureMonitorSystem
  name "Blood Pressure Monitor System"
  description "Complete blood pressure monitoring system architecture"
  owner "Medical Device Architecture Team"
  tags "medical", "monitoring", "system"
  level system
  safetylevel ASIL-C

  def port PowerInput input
    name "Power Input"
    description "Main power supply input"
    datatype voltage_12V
    
  def port UserInterface bidirectional
    name "User Interface Port"
    description "User interaction interface"
    datatype digital_interface
    
  def port MeasurementOutput output
    name "Measurement Data Output"
    description "Blood pressure measurement results"
    datatype bp_measurement_data
    
  def port ConnectivityPort output
    name "Connectivity Interface"
    description "External connectivity for data sharing"
    datatype wireless_data

  def block MeasurementSubsystem
    name "Measurement Subsystem"
    description "Core blood pressure measurement components"
    level subsystem
    safetylevel ASIL-C
    
    def port CuffInterface input
      name "Cuff Interface"
      description "Connection to inflatable cuff"
      datatype pneumatic_interface
      
    def port SensorData output
      name "Sensor Data"
      description "Raw measurement sensor data"
      datatype analog_sensor_data
      
    def block PressureSensor
      name "Pressure Sensor"
      description "Pneumatic pressure sensing component"
      level component
      
    def block InflationPump
      name "Inflation Pump"
      description "Cuff inflation mechanism"
      level component
      
    def block ValveControl
      name "Valve Control"
      description "Pressure release valve control"
      level component

  def block ProcessingSubsystem
    name "Processing Subsystem"
    description "Data processing and algorithm execution"
    level subsystem
    
    def port RawData input
      name "Raw Measurement Data"
      description "Input from measurement subsystem"
      datatype analog_sensor_data
      
    def port ProcessedData output
      name "Processed Results"
      description "Calculated blood pressure values"
      datatype bp_results
      
    def block SignalProcessor
      name "Signal Processing Unit"
      description "Analog signal processing and filtering"
      level component
      
    def block AlgorithmEngine
      name "Algorithm Engine"
      description "Blood pressure calculation algorithms"
      level component
      
    def block DataValidator
      name "Data Validation"
      description "Measurement validation and quality assessment"
      level component

  def block ConnectivitySubsystem
    name "Connectivity Subsystem"
    description "External communication capabilities"
    level subsystem
    
    def port DataInput input
      name "Data Input"
      description "Processed measurement data"
      datatype bp_results
      
    def port ExternalComm output
      name "External Communication"
      description "External data transmission"
      datatype wireless_protocol
      
    def block WiFiModule
      name "WiFi Communication Module"
      description "802.11 wireless communication"
      level component
      
    def block BluetoothModule
      name "Bluetooth Module"
      description "Bluetooth Low Energy communication"
      level component

  composedof ref block MeasurementSubsystem, ProcessingSubsystem, ConnectivitySubsystem
  needs ref port PowerInput, UserInterface
```

## Example 2: Electronic Parking Brake System Block

```sylang
use block VehicleInterface

hdef block ElectronicParkingBrakeSystem
  name "Electronic Parking Brake System"
  description "Complete EPB system architecture"
  owner "Automotive Safety Architecture Team"
  tags "automotive", "brake", "safety", "EPB"
  level system
  safetylevel ASIL-D

  def port VehiclePower input
    name "Vehicle Power Supply"
    description "12V vehicle electrical system"
    datatype voltage_12V
    
  def port CANBusInterface bidirectional
    name "CAN Bus Interface"
    description "Vehicle CAN network communication"
    datatype can_protocol
    
  def port BrakeForceOutput output
    name "Brake Force Output"
    description "Mechanical brake force application"
    datatype mechanical_force
    
  def port DiagnosticInterface output
    name "Diagnostic Interface"
    description "System diagnostic and status information"
    datatype diagnostic_data

  def block ControlSubsystem
    name "EPB Control Subsystem"
    description "Main control and decision-making subsystem"
    level subsystem
    safetylevel ASIL-D
    
    def port CommandInput input
      name "Brake Command Input"
      description "Driver and system brake commands"
      datatype digital_command
      
    def port ActuatorControl output
      name "Actuator Control Signals"
      description "Control signals to brake actuators"
      datatype pwm_control
      
    def block MainController
      name "Main Control Unit"
      description "Primary EPB control processor"
      level component
      safetylevel ASIL-D
      
    def block SafetyMonitor
      name "Safety Monitoring Unit"
      description "Independent safety monitoring and validation"
      level component
      safetylevel ASIL-D
      
    def block DiagnosticManager
      name "Diagnostic Manager"
      description "System diagnostics and fault management"
      level component

  def block ActuationSubsystem
    name "Brake Actuation Subsystem"
    description "Physical brake actuation mechanism"
    level subsystem
    safetylevel ASIL-D
    
    def port ControlSignals input
      name "Control Signals"
      description "Control commands from control subsystem"
      datatype pwm_control
      
    def port MechanicalOutput output
      name "Mechanical Brake Force"
      description "Applied mechanical braking force"
      datatype mechanical_force
      
    def block LeftActuator
      name "Left Brake Actuator"
      description "Left wheel brake actuator assembly"
      level component
      
      def block ElectricMotor
        name "Electric Motor"
        description "Brake actuation motor"
        level module
        
      def block GearReduction
        name "Gear Reduction Unit"
        description "Motor speed reduction gearing"
        level module
        
      def block BrakePads
        name "Brake Pad Assembly"
        description "Friction brake pad mechanism"
        level module
      
    def block RightActuator
      name "Right Brake Actuator"
      description "Right wheel brake actuator assembly"
      level component
      
      def block ElectricMotor
        name "Electric Motor"
        description "Brake actuation motor"
        level module
        
      def block GearReduction
        name "Gear Reduction Unit"
        description "Motor speed reduction gearing"
        level module
        
      def block BrakePads
        name "Brake Pad Assembly"
        description "Friction brake pad mechanism"
        level module

  def block SensingSubsystem
    name "Sensing and Feedback Subsystem"
    description "Position and force sensing for brake feedback"
    level subsystem
    
    def port SensorData output
      name "Sensor Feedback Data"
      description "Position and force sensor readings"
      datatype sensor_feedback
      
    def block PositionSensors
      name "Position Sensing Assembly"
      description "Brake position feedback sensors"
      level component
      
    def block ForceSensors
      name "Force Sensing Assembly"
      description "Brake force measurement sensors"
      level component
      
    def block TemperatureSensors
      name "Temperature Monitoring"
      description "Actuator temperature monitoring"
      level component

  composedof ref block ControlSubsystem, ActuationSubsystem, SensingSubsystem
  needs ref port VehiclePower, CANBusInterface
  inherits ref block VehicleInterface
```

## Relationship Keywords

- `composedof ref block <id1>, <id2>` - Block composition relationships
- `needs ref port <id1>, <id2>` - Port dependency relationships
- `inherits ref block <identifier>` - Block inheritance
- `connects ref port <port1> to <port2>` - Port connections
- `implements ref interface <identifier>` - Interface implementation

## Data Types

### Common Data Types
- `voltage_12V`, `voltage_24V`, `voltage_5V` - Power supply voltages
- `can_protocol`, `lin_protocol`, `ethernet` - Communication protocols
- `digital_interface`, `analog_interface` - Interface types
- `pwm_control`, `digital_command` - Control signal types
- `mechanical_force`, `hydraulic_pressure` - Physical quantities
- `sensor_feedback`, `diagnostic_data` - Data payload types

### Custom Data Types
```sylang
def datatype bp_measurement_data
  name "Blood Pressure Measurement Data"
  description "Structured blood pressure reading data"
  fields "systolic", "diastolic", "pulse", "timestamp"
  
def datatype wireless_protocol
  name "Wireless Communication Protocol"
  description "Generic wireless data transmission protocol"
  encoding "JSON", "binary"
```

## Key Rules

1. **Multiple .blk files allowed** - No project limit
2. **Hierarchical structure** - Parent-child via indentation and composition
3. **Port definitions** - Input, output, bidirectional ports
4. **Cross-file references** - Can reference blocks from other files
5. **Level specification** - Must specify hierarchical level
6. **Safety levels** - Can be specified at block and port level
7. **Composition relationships** - Use `composedof` for structural hierarchy
8. **Port connections** - Use `needs` for port dependencies
