# .vcf (Variant Configuration) Examples

Variant Configuration files are **auto-generated** through VSCode commands. Only one `.vcf` file is allowed per project.

## Generation Process
1. Right-click on any `.vml` file
2. Select "Generate variant config (.vcf)"
3. If existing `.vcf` exists, prompt for replacement

## Basic Structure
```sylang
hdef configset <ConfigSetName>
  name "Configuration set name"
  description "Configuration description"
  owner "Owner information"
  tags "tag1", "tag2"
  generatedfor ref variantset <VariantSetIdentifier>
  generatedon "YYYY-MM-DDTHH:MM:SSZ"
  
  config feature <FeatureName> <state>
    config feature <ChildFeatureName> <state>
```

## Configuration States
- `enabled` - Feature is enabled in this configuration
- `disabled` - Feature is disabled in this configuration

## Example 1: Generated EPB Configuration

```sylang
hdef configset EPBStandardConfiguration
  name "Standard EPB Configuration"
  description "Auto-generated configuration for standard EPB variant"
  owner "Configuration Management System"
  tags "auto-generated", "standard", "EPB"
  generatedfor ref variantset EPBStandardVariant
  generatedon "2025-01-15T10:30:00Z"

  config feature BrakeActuation enabled
    config feature ElectricMotor enabled
    config feature ElectroMechanical disabled

  config feature SafetyMonitoring enabled
    config feature PositionSensing enabled
    config feature ForceSensing enabled
    config feature TemperatureMonitoring disabled

  config feature UserInterface enabled
    config feature PhysicalButton enabled
    config feature TouchInterface disabled

  config feature AutomaticFunctions disabled
    config feature HillHoldAssist disabled
    config feature AutoPark disabled
```

## Example 2: Blood Pressure Monitor Premium Configuration

```sylang
hdef configset BloodPressurePremiumConfiguration
  name "Premium Blood Pressure Monitor Configuration"
  description "Auto-generated configuration for premium BP monitor variant"
  owner "Configuration Management System"
  tags "auto-generated", "premium", "medical-device"
  generatedfor ref variantset BloodPressurePremiumVariant
  generatedon "2025-01-15T14:22:15Z"

  config feature CoreMeasurement enabled
    config feature OscillometricMethod enabled
    config feature AuscultationMethod enabled

  config feature DisplayInterface enabled
    config feature LCDDisplay disabled
    config feature OLEDDisplay enabled

  config feature ConnectivityFeatures enabled
    config feature WiFiConnectivity enabled
    config feature BluetoothConnectivity enabled
    config feature USBConnectivity disabled

  config feature PowerManagement enabled
    config feature BatteryPower enabled
    config feature ACPower disabled
```

## Example 3: Industrial Inverter High-Performance Configuration

```sylang
hdef configset InverterHighPerformanceConfiguration
  name "High-Performance Inverter Configuration"
  description "Auto-generated configuration for high-performance industrial inverter"
  owner "Configuration Management System"
  tags "auto-generated", "high-performance", "industrial"
  generatedfor ref variantset HighPerformanceInverterVariant
  generatedon "2025-01-15T16:45:30Z"

  config feature PowerRating enabled
    config feature LowPower disabled
    config feature MediumPower disabled
    config feature HighPower enabled

  config feature CoolingSystem enabled
    config feature AirCooling disabled
    config feature LiquidCooling enabled

  config feature ControlInterface enabled
    config feature BasicHMI disabled
    config feature AdvancedHMI enabled
    config feature RemoteInterface enabled

  config feature ProtectionFeatures enabled
    config feature BasicProtection enabled
    config feature AdvancedProtection enabled
    config feature RedundantProtection enabled

  config feature CommunicationProtocols enabled
    config feature Modbus enabled
    config feature Profibus enabled
    config feature EthernetIP enabled
    config feature CANopen disabled
```

## Configuration Identifiers

Generated configurations create unique identifiers for each enabled feature combination:

```sylang
# Example configuration identifiers
c_AdvancedAlgorithms_PredictiveAnalytics
c_ConnectivityFeatures_WiFi
c_PowerManagement_BatteryPower
c_SafetyFeatures_TemperatureMonitoring
```

These identifiers can be referenced in requirements and test files:
```sylang
# In .req files
ref config c_AdvancedAlgorithms_PredictiveAnalytics

# In .tst files  
ref config c_ConnectivityFeatures_WiFi
```

## Validation Rules

1. **Auto-generated only** - Cannot be manually created or edited
2. **One per project** - Only one `.vcf` file allowed
3. **Derived from .vml** - Must be generated from variant model
4. **Timestamp tracking** - Includes generation timestamp
5. **Hierarchical structure** - Maintains parent-child feature relationships
6. **State consistency** - All features have explicit enabled/disabled state
7. **Configuration IDs** - Generates unique identifiers for feature combinations

## Key Properties

### Header Properties
- `name` - Configuration set name
- `description` - Auto-generated description
- `owner` - System identifier (auto-generated)
- `tags` - Classification tags
- `generatedfor` - Source variant set reference
- `generatedon` - ISO timestamp of generation

### Configuration Properties
- `config feature <name> <state>` - Feature configuration state
- Nested structure follows feature model hierarchy
- All features explicitly set to `enabled` or `disabled`

## Generation Command

The `.vcf` file is generated through VSCode command:
- Right-click any `.vml` file
- Select "Generate variant config (.vcf)"
- System processes all selected features from variant model
- Creates configuration with explicit enable/disable states
- Generates unique configuration identifiers for cross-referencing
