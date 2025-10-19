# Interface Definition (.ifc)

## Overview
The `.ifc` file defines **interface specifications** including operations, signals, datatypes, and parameters. These interfaces are referenced by blocks, functions, and features to define system interactions.

## File Structure Rules
- **ONE** `hdef interfaceset` statement per file
- **MULTIPLE** `def operation`, `def signal`, `def datatype`, `def parameter` statements
- Can `use` configsets for conditional visibility
- Interfaces are referenced by blocks via `needs`/`provides` relations

## Valid Keywords
```
use, hdef, interfaceset, def, operation, signal, datatype, parameter, 
name, description, owner, tags, safetylevel, level, decomposedfrom, 
decomposesto, allocatedto, derivedfrom, implementedby, when, requires, 
meets, ref, config, interfaceset, block, requirement, characteristic
```

## Syntax Structure
```
use configset [configset-ref]

hdef interfaceset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  
  # Interface relationships (ASPICE)
  decomposedfrom ref interfaceset [interfaceset-ref]
  decomposesto ref interfaceset [interfaceset-ref], [interfaceset-ref], ...
  allocatedto ref block [block-ref]

  def operation [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    requires ref datatype [datatype-ref]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    when ref config [config-ref]
    
  def signal [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    requires ref datatype [datatype-ref]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    when ref config [config-ref]
    
  def datatype [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    
  def parameter [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    requires ref datatype [datatype-ref]
    value [numeric-value]
    unit [string-literal]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
```

## Definition Types

### When to Use Operation vs Signal

Use this table to decide between `operation` and `signal`:

| If...                                        | Use...      |
| -------------------------------------------- | ----------- |
| You *request* something or trigger an action | `operation` |
| You *observe* or *broadcast* information     | `signal`    |
| You *need return codes or acknowledgments*   | `operation` |
| You *need periodic or event updates*         | `signal`    |
| You're *mimicking RTE_Call_*                 | `operation` |
| You're *mimicking RTE_Read/Write_*           | `signal`    |

**Examples:**
- `GetSystemStatus` → **operation** (request with response)
- `SetMotorSpeed` → **operation** (command with acknowledgment)
- `SpeedUpdate` → **signal** (periodic broadcast)
- `EmergencyAlert` → **signal** (event notification)
- `ReadSensorData` → **operation** (query with return value)
- `HeartbeatPulse` → **signal** (periodic status update)

### Operations
Functions or methods provided by an interface:
```sylang
def operation GetSystemStatus
  name "Get System Status"
  description "Retrieves current system status information"
  owner "System Team"
  level solution
  requires ref datatype StatusData
  safetylevel ASIL-D
```

### Signals
Events or data streams:
```sylang
def signal EmergencyAlert
  name "Emergency Alert Signal"
  description "Signal indicating emergency condition"
  owner "Safety Team"
  level solution
  requires ref datatype AlertType
  safetylevel ASIL-D
```

### Datatypes
Data structure definitions:
```sylang
def datatype VehicleStateData
  name "Vehicle State Data"
  description "Complete vehicle state information"
  owner "Data Architecture Team"
  level solution
```

### Parameters
Configurable values:
```sylang
def parameter MaxVelocity
  name "Maximum Velocity"
  description "Maximum allowed velocity parameter"
  owner "Control Team"
  level solution
  requires ref datatype VelocityValue
  value "120.0"
```

## Complete Example

```sylang
use configset VehicleConfig

hdef interfaceset VehicleControlInterfaces
  name "Vehicle Control Interface Definitions"
  description """
    Comprehensive interface definitions for vehicle control system including
    operations, signals, datatypes, and parameters for autonomous operation.
    """
  owner "System Architecture Team"
  tags "vehicle", "control", "interfaces", "autonomous"
  safetylevel ASIL-B

  def operation GetVehicleState
    name "Get Vehicle State"
    description "Retrieves current vehicle state information including speed, position, and heading"
    owner "Control Team"
    level solution
    requires ref datatype VehicleStateData
    safetylevel ASIL-B
    when ref config c_VehicleControl

  def operation SetVehicleSpeed
    name "Set Vehicle Speed"
    description "Sets target vehicle speed for autonomous control"
    owner "Control Team"
    level solution
    requires ref datatype SpeedValue
    safetylevel ASIL-C

  def operation GetEnvironmentData
    name "Get Environment Data"
    description "Retrieves environmental perception data from sensors"
    owner "Perception Team"
    level solution
    requires ref datatype EnvironmentModelData
    safetylevel ASIL-D
    when ref config c_PerceptionSystem

  def signal VehicleSpeedUpdate
    name "Vehicle Speed Update"
    description "Signal indicating vehicle speed has changed"
    owner "Control Team"
    level solution
    requires ref datatype SpeedValue
    safetylevel ASIL-C

  def signal EmergencyBrakeRequest
    name "Emergency Brake Request"
    description "Critical signal requesting immediate emergency braking"
    owner "Safety Team"
    level solution
    requires ref datatype BrakeRequestData
    safetylevel ASIL-D

  def signal SystemHeartbeat
    name "System Heartbeat"
    description "Periodic heartbeat signal for system health monitoring"
    owner "Diagnostic Team"
    level solution
    requires ref datatype uint32

  def datatype VehicleStateData
    name "Vehicle State Data"
    description "Complete vehicle state information structure"
    owner "Data Architecture Team"
    level solution

  def datatype SpeedValue
    name "Speed Value"
    description "Data type for vehicle speed values in km/h"
    owner "Control Team"
    level solution

  def datatype EnvironmentModelData
    name "Environment Model Data"
    description "Environmental perception data structure"
    owner "Perception Team"
    level solution

  def datatype BrakeRequestData
    name "Brake Request Data"
    description "Emergency brake request data structure"
    owner "Safety Team"
    level solution

  def parameter MaxSpeed
    name "Maximum Speed"
    description "Maximum allowed vehicle speed parameter"
    owner "Control Team"
    level solution
    requires ref datatype SpeedValue
    value "120.0"

  def parameter EmergencyBrakeThreshold
    name "Emergency Brake Threshold"
    description "Distance threshold for emergency braking activation"
    owner "Safety Team"
    level solution
    requires ref datatype DistanceValue
    value "5.0"
```

## Usage in Other Files

### In Block Files (.blk)
Blocks reference interfaces via `needs` and `provides`:
```sylang
use interfaceset VehicleControlInterfaces

hdef block ControlModule
  # Input interfaces (what this block needs)
  needs ref operation GetVehicleState
  needs ref signal VehicleSpeedUpdate
  
  # Output interfaces (what this block provides)
  def operation SetVehicleSpeed
    # Implements the operation defined in .ifc
```

### In Function Files (.fun)
Functions reference interfaces via `needs` and `provides`:
```sylang
use interfaceset VehicleControlInterfaces

hdef functionset ControlFunctions
  def function SpeedController
    needs ref operation GetVehicleState
    provides ref operation SetVehicleSpeed
```

### In Feature Files (.fml)
Features reference interfaces via `needs` and `offers`:
```sylang
use interfaceset VehicleControlInterfaces

hdef featureset VehicleFeatures
  def feature AutonomousControl mandatory
    needs ref operation GetVehicleState
    needs ref operation GetEnvironmentData
    offers ref operation SetVehicleSpeed
    offers ref signal EmergencyBrakeRequest
```

## Level Hierarchy
```
level product          # Product level
level system           # System level
level subsystem        # Subsystem level
level component        # Component level
level module           # Module level
level solution         # Solution level
level solutionelement  # Solution element level
```

## Common Patterns

### Sensor Interface
```sylang
hdef interfaceset SensorInterfaces
  def operation GetSensorData
    name "Get Sensor Data"
    requires ref datatype SensorReadingData
    
  def signal SensorFault
    name "Sensor Fault Signal"
    requires ref datatype FaultCode
    safetylevel ASIL-D
```

### Actuator Interface
```sylang
hdef interfaceset ActuatorInterfaces
  def operation SetActuatorCommand
    name "Set Actuator Command"
    requires ref datatype ActuatorCommandData
    safetylevel ASIL-C
    
  def signal ActuatorFeedback
    name "Actuator Feedback"
    requires ref datatype ActuatorStatusData
```

### Diagnostic Interface
```sylang
hdef interfaceset DiagnosticInterfaces
  def operation GetDiagnosticData
    name "Get Diagnostic Data"
    requires ref datatype DiagnosticReport
    
  def signal DiagnosticTrigger
    name "Diagnostic Trigger"
    requires ref datatype TriggerType
    
  def parameter DiagnosticTimeout
    name "Diagnostic Timeout"
    requires ref datatype TimeValue
    value "500"
```

## Validation Rules
✅ Exactly one `hdef interfaceset` per file  
✅ Multiple `def operation/signal/datatype/parameter` allowed  
✅ Operations and signals can reference datatypes via `requires`  
✅ Parameters can have `value` property  
✅ Can use `when ref config` for conditional visibility  
✅ Interfaces are referenced by blocks via `needs`/`provides`  
✅ Interfaces are referenced by functions via `needs`/`provides`  
✅ Interfaces are referenced by features via `needs`/`offers`  
❌ No hierarchical definitions (flat structure only)

## Relationships

### InterfaceSet Level (hdef interfaceset)
- `decomposedfrom ref interfaceset` - Bottom-up interface composition (single only)
- `decomposesto ref interfaceset` - Top-down interface breakdown (multiple allowed)
- `allocatedto ref block` - Interface allocated to specific block (single only)

### Definition Level (def operation/signal/datatype/parameter)
- `requires ref datatype` - Links operation/signal/parameter to datatype
- `derivedfrom ref requirement` - Requirements traceability (ASPICE)
- `implementedby ref requirement` - Requirements implementation (ASPICE)
- `when ref config` - Conditional visibility based on configuration

### From other files to .ifc
- `.blk` files: `needs ref operation/signal`, `provides ref operation/signal`
- `.fun` files: `needs ref operation/signal`, `provides ref operation/signal`
- `.fml` files: `needs ref operation/signal`, `offers ref operation/signal`

## Best Practices

### 1. Organize by Subsystem
Group related interfaces in one interfaceset:
```sylang
hdef interfaceset PowerManagementInterfaces
  # All power-related operations, signals, datatypes
```

### 2. Define Datatypes First
Define datatypes before operations/signals that use them:
```sylang
def datatype VoltageValue
  # ...
  
def operation GetVoltage
  requires ref datatype VoltageValue
```

### 3. Use Consistent Naming
- Operations: Verb + Noun (GetVehicleState, SetMotorSpeed)
- Signals: Noun + Update/Alert/Status (SpeedUpdate, EmergencyAlert)
- Datatypes: Noun + Data/Value (SpeedValue, StateData)
- Parameters: Adjective + Noun (MaxSpeed, MinVoltage)

### 4. Safety-Critical Interfaces
Always specify safety level for critical interfaces:
```sylang
def operation EmergencyBrake
  safetylevel ASIL-D
```

---

**Next Steps**: Reference these interfaces in `.blk`, `.fun`, and `.fml` files using `needs`/`provides`/`offers` relations.


