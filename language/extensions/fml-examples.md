# .fml (Feature Model) Examples

Feature Model Language files define the feature structure and relationships. Only one `.fml` file is allowed per project.

## Basic Structure

```sylang
use featureset <FeatureSetIdentifier>  // Optional imports

hdef featureset <FeatureSetName>
  name "Feature set name"
  description "Feature set description"
  owner "Owner information"
  tags "tag1", "tag2"
  safetylevel <SAFETY_LEVEL_ENUM>
  listedfor ref productline <ProductLineIdentifier>
  
  def feature <FeatureName> <flag>
    name "Feature name"
    description "Feature description"
    tags "tag1", "tag2"
    safetylevel <SAFETY_LEVEL_ENUM>
    
    def feature <ChildFeatureName> <flag>
      // Nested features allowed
```

## Feature Flags

- `mandatory` - Must be selected if parent is selected
- `optional` - May be selected if parent is selected
- `or` - At least one sibling with `or` flag must be selected
- `alternative` - At most one sibling with `alternative` flag can be selected

## Example 1: Blood Pressure Monitor Features

```sylang
hdef featureset BloodPressureFeatures
  name "Blood Pressure Monitor Feature Set"
  description "Complete feature model for digital blood pressure monitoring system"
  owner "Medical Device Product Team"
  tags "medical", "monitoring", "blood-pressure"
  safetylevel ASIL-C
  listedfor ref productline BloodPressureProductLine

  def feature CoreMeasurement mandatory
    name "Core Blood Pressure Measurement"
    description "Essential measurement capabilities"
    tags "measurement", "core"
    safetylevel ASIL-C
    
    def feature OscillometricMethod mandatory
      name "Oscillometric Measurement Method"
      description "Standard oscillometric blood pressure measurement"
      tags "oscillometric", "measurement"
      
    def feature AuscultationMethod optional
      name "Auscultation Method Support"
      description "Traditional auscultation method for clinical use"
      tags "auscultation", "clinical"

  def feature DisplayInterface mandatory
    name "User Display Interface"
    description "Visual display for readings and status"
    tags "display", "interface"
    
    def feature LCDDisplay alternative
      name "LCD Display"
      description "Standard LCD display with backlight"
      tags "LCD", "display"
      
    def feature OLEDDisplay alternative
      name "OLED Display"
      description "High-contrast OLED display"
      tags "OLED", "display", "premium"

  def feature ConnectivityFeatures optional
    name "Connectivity and Data Sharing"
    description "Network connectivity options"
    tags "connectivity", "data"
    
    def feature WiFiConnectivity or
      name "WiFi Connectivity"
      description "802.11 WiFi connection capability"
      tags "WiFi", "wireless"
      
    def feature BluetoothConnectivity or
      name "Bluetooth Connectivity"
      description "Bluetooth Low Energy connectivity"
      tags "Bluetooth", "BLE", "wireless"
      
    def feature USBConnectivity or
      name "USB Data Transfer"
      description "USB connection for data transfer"
      tags "USB", "wired"

  def feature PowerManagement mandatory
    name "Power Management System"
    description "Device power supply and management"
    tags "power", "battery"
    
    def feature BatteryPower alternative
      name "Battery Operation"
      description "Rechargeable battery power"
      tags "battery", "portable"
      
    def feature ACPower alternative
      name "AC Power Supply"
      description "Direct AC power connection"
      tags "AC", "mains", "stationary"
```

## Example 2: Automotive EPB Features

```sylang
hdef featureset EPBFeatures
  name "Electronic Parking Brake Features"
  description "Feature model for electronic parking brake system"
  owner "Automotive Safety Team"
  tags "automotive", "brake", "safety"
  safetylevel ASIL-D
  listedfor ref productline ElectronicParkingBrakeProductLine

  def feature BrakeActuation mandatory
    name "Brake Actuation System"
    description "Core brake engagement and release mechanism"
    tags "actuation", "brake", "core"
    safetylevel ASIL-D
    
    def feature ElectricMotor alternative
      name "Electric Motor Actuation"
      description "Electric motor-driven brake actuation"
      tags "electric", "motor"
      
    def feature ElectroMechanical alternative
      name "Electro-Mechanical Actuation"
      description "Electro-mechanical brake actuation system"
      tags "electro-mechanical", "hybrid"

  def feature SafetyMonitoring mandatory
    name "Safety Monitoring and Diagnostics"
    description "Comprehensive safety monitoring system"
    tags "safety", "monitoring", "diagnostics"
    safetylevel ASIL-D
    
    def feature PositionSensing mandatory
      name "Brake Position Sensing"
      description "Real-time brake position feedback"
      tags "position", "sensor", "feedback"
      
    def feature ForceSensing mandatory
      name "Brake Force Monitoring"
      description "Brake force measurement and validation"
      tags "force", "sensor", "validation"
      
    def feature TemperatureMonitoring optional
      name "Temperature Monitoring"
      description "Actuator temperature monitoring"
      tags "temperature", "thermal", "monitoring"

  def feature UserInterface optional
    name "Driver Interface"
    description "Driver interaction and feedback system"
    tags "interface", "driver", "HMI"
    
    def feature PhysicalButton alternative
      name "Physical Button Interface"
      description "Traditional physical button control"
      tags "button", "physical", "tactile"
      
    def feature TouchInterface alternative
      name "Touch Interface"
      description "Touch-based control interface"
      tags "touch", "digital", "modern"

  def feature AutomaticFunctions optional
    name "Automatic Engagement Functions"
    description "Intelligent automatic brake engagement"
    tags "automatic", "intelligent", "convenience"
    
    def feature HillHoldAssist or
      name "Hill Hold Assist"
      description "Automatic engagement on inclines"
      tags "hill-hold", "slope", "assist"
      
    def feature AutoPark or
      name "Auto Park Engagement"
      description "Automatic engagement during parking"
      tags "auto-park", "parking", "convenience"
```

## Relationship Keywords

- `listedfor ref productline <identifier>` - Links to product line
- `inherits ref featureset <identifier>` - Inherits from parent feature set
- `enables ref feature <identifier1>, <identifier2>` - Enables other features
- `requires ref feature <identifier1>, <identifier2>` - Requires other features
- `excludes ref feature <identifier1>, <identifier2>` - Mutually exclusive features

## Validation Rules

### Feature Selection Logic
- **Mandatory**: Must be selected if parent is selected
- **Optional**: May be selected if parent is selected  
- **Or Group**: At least one sibling with `or` flag must be selected
- **Alternative Group**: At most one sibling with `alternative` flag can be selected

### Mixed Child Types
```sylang
# Valid: Parent selected, one alternative chosen
def feature PowerManagement mandatory
  def feature BatteryPower alternative  // ✅ Selected
  def feature ACPower alternative       // ❌ Not selected

# Valid: Parent selected, or siblings properly selected
def feature SecurityFeatures mandatory
  def feature UserAuth or              // ✅ Selected
  def feature SecureComm or            // ✅ Selected

# Invalid: Multiple alternatives selected
def feature Algorithms mandatory
  def feature Algorithm1 alternative   // ❌ Both selected - ERROR
  def feature Algorithm2 alternative   // ❌ Both selected - ERROR
```

## Key Rules

1. **One .fml per project** - Enforced by language
2. **Nested definitions allowed** - Parent-child via indentation
3. **Cross-file references** - Can reference symbols from other files
4. **Feature flags required** - Every feature must have a flag
5. **Inheritance support** - Can inherit from other feature sets
6. **Safety levels** - Can be specified at feature level
7. **Consistent indentation** - 2 spaces or 1 tab per level
