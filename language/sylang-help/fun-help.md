# Function Definition (.fun)

## Overview
Defines **functional behavior** and decomposition. Maps features to executable functions with conditional visibility based on configurations.

## File Structure
- **ONE** `hdef functionset` per file
- **MULTIPLE** `def function` statements
- Can `use` featuresets, configsets, interfacesets
- Supports `needs` for input interface references at def function level
- Supports `provides` for output interface references at def function level
- Supports functional decomposition

## Valid Keywords
```
use, hdef, functionset, def, function, name, description, owner, tags, 
level, safetylevel, functiontype, enables, allocatedto, decomposedfrom,
decomposesto, derivedfrom, implementedby, detects, needs, provides, meets,
when, ref, config, feature, function, block, requirement, malfunction, 
failure, failuremode, operation, signal, interfaceset
```

## Syntax Structure
```
use featureset [featureset-ref]
use configset [configset-ref]
use interfaceset [interfaceset-ref]

hdef functionset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]

  def function [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    functiontype [solution|function|solutionelement]
    
    # Input interfaces (NEEDS - from .ifc files)
    needs ref operation [operation-ref], [operation-ref], ...
    needs ref signal [signal-ref], [signal-ref], ...
    
    # Output interfaces (PROVIDES - from .ifc files)
    provides ref operation [operation-ref], [operation-ref], ...
    provides ref signal [signal-ref], [signal-ref], ...
    
    # Function relationships
    enables ref feature [feature-ref], [feature-ref], ...
    allocatedto ref block [block-ref]
    decomposedfrom ref function [function-ref]
    decomposesto ref function [function-ref], [function-ref], ...
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    detects ref malfunction [malfunction-ref], [malfunction-ref], ...
    detects ref failure [failure-ref], [failure-ref], ...
    meets ref requirement [requirement-ref]
    when ref config [config-ref]
```

## Complete Example
```sylang
use featureset AutonomousVehicleFeatures
use configset AutonomousVehicleConfig
use interfaceset PerceptionInterfaces

hdef functionset AutonomousPerceptionFunctions
  name "Autonomous Vehicle Perception Functions"
  description "Core perception functions for environmental awareness"
  owner "Perception Systems Team"
  safetylevel ASIL-D
  tags "perception", "autonomous", "sensor-fusion"

  def function CameraImageProcessing
    name "Camera Image Processing Function"
    description "Real-time processing of stereo and mono camera feeds"
    owner "Computer Vision Team"
    level subsystem
    safetylevel ASIL-D
    functiontype function
    
    # Input interfaces (from .ifc)
    needs ref operation CameraRawData, CalibrationParameters
    needs ref signal SystemClockSignal
    
    # Output interfaces (from .ifc)
    provides ref operation ProcessedImageData
    provides ref signal ImageProcessingStatus
    
    # Function relationships
    enables ref feature CameraSystem
    allocatedto ref block VisionProcessingModule
    derivedfrom ref requirement SYS_REQ_010, SYS_REQ_011
    implementedby ref requirement SW_REQ_200, SW_REQ_201
    detects ref malfunction CameraMalfunction
    when ref config c_CameraSystem

  def function LidarPointCloudProcessing
    name "LiDAR Point Cloud Processing Function"
    description "3D point cloud processing for precise distance measurement"
    owner "LiDAR Processing Team"
    level subsystem
    safetylevel ASIL-C
    functiontype function
    
    # Input interfaces
    needs ref operation LidarPointCloud, CalibrationData
    needs ref signal SystemHeartbeat
    
    # Output interfaces
    provides ref operation ProcessedPointCloud
    provides ref signal LidarProcessingStatus
    
    enables ref feature LidarSystem
    allocatedto ref block LidarProcessingModule
    derivedfrom ref requirement SYS_REQ_015
    implementedby ref requirement SW_REQ_210
    detects ref malfunction LidarMalfunction
    safetylevel ASIL-C
    when ref config c_LidarSystem

  def function SensorFusion
    name "Multi-Sensor Fusion Function"
    description "Fusion of camera, LiDAR, and radar data"
    owner "Sensor Fusion Team"
    level system
    safetylevel ASIL-D
    functiontype solution
    
    # Input interfaces
    needs ref operation ProcessedImageData, ProcessedPointCloud, RadarTargets
    needs ref signal ImageProcessingStatus, LidarProcessingStatus
    
    # Output interfaces
    provides ref operation EnvironmentalModel, ObjectTrackingData
    provides ref signal FusionStatus
    
    enables ref feature PerceptionSystem
    allocatedto ref block FusionControlModule
    decomposesto ref function CameraImageProcessing, LidarPointCloudProcessing
    derivedfrom ref requirement SYS_REQ_001, SYS_REQ_002
    implementedby ref requirement SW_REQ_100, SW_REQ_101
    detects ref malfunction CameraMalfunction, LidarMalfunction
    detects ref failure SensorDataLoss
    meets ref requirement SAFETY_REQ_001
    safetylevel ASIL-D
```

## Function Types
```
functiontype solution         # Solution-level function
functiontype function         # Standard function
functiontype solutionelement  # Solution element function
```

## Interface Relationships
- `needs ref operation` - Input operations required (from .ifc files, multiple allowed)
- `needs ref signal` - Input signals required (from .ifc files, multiple allowed)
- `provides ref operation` - Output operations provided (from .ifc files, multiple allowed)
- `provides ref signal` - Output signals provided (from .ifc files, multiple allowed)

**Note**: Operations and signals are defined in `.ifc` files and referenced here via `needs` and `provides`.

## Function Relationships (ASPICE Bilateral Traceability)
- `enables ref feature` - Enables a feature (multiple allowed)
- `allocatedto ref block` - Allocated to a block (single block only)
- `decomposedfrom ref function` - Decomposes from parent function (single only)
- `decomposesto ref function` - Decomposes to child functions (multiple allowed)
- `derivedfrom ref requirement` - Derived from requirements (ASPICE, multiple allowed)
- `implementedby ref requirement` - Implemented by requirements (ASPICE, multiple allowed)
- `detects ref malfunction` - Detects safety malfunctions (multiple allowed)
- `detects ref failure` - Detects failure modes (multiple allowed)
- `meets ref requirement` - Meets specific requirements (multiple allowed)
- `when ref config` - Conditional visibility

## Validation Rules
✅ Exactly one `hdef functionset` per file  
✅ Multiple `def function` allowed  
✅ `needs` and `provides` reference operations/signals from `.ifc` files  
✅ Can use `when ref config` for conditional visibility  
✅ Multiline strings use `"""` triple quotes  
✅ Functions can be hierarchically decomposed  
❌ No `def operation/signal` in `.fun` files (define in `.ifc`)

---

**Next Steps**:
- Define operations and signals in `.ifc` files
- Define features in `.fml` files
- Define blocks in `.blk` files
- Define requirements in `.req` files

