# .vml (Variant Model) Examples

Variant Model Language files define specific product variants derived from feature models. Multiple `.vml` files are allowed per project.

## Basic Structure

```sylang
use variantset <VariantSetIdentifier>  // Optional imports

hdef variantset <VariantSetName>
  name "Variant set name"
  description "Variant set description"
  owner "Owner information"
  tags "tag1", "tag2"
  safetylevel <SAFETY_LEVEL_ENUM>
  derivedfor ref featureset <FeatureSetIdentifier>
  
  extends ref feature <FeatureName> <flag> <selection>
    extends ref feature <ChildFeatureName> <flag> <selection>
      // Nested feature selections
```

## Selection States
- `selected` - Feature is selected in this variant
- `deselected` - Feature is explicitly not selected
- (no selection) - Feature selection is inherited or default

## Example 1: Blood Pressure Monitor Variants

```sylang
hdef variantset BloodPressureBasicVariant
  name "Basic Blood Pressure Monitor"
  description "Entry-level blood pressure monitor with essential features"
  owner "Product Management Team"
  tags "basic", "entry-level", "cost-effective"
  safetylevel ASIL-B
  derivedfor ref featureset BloodPressureFeatures

  extends ref feature CoreMeasurement mandatory selected
    extends ref feature OscillometricMethod mandatory selected
    extends ref feature AuscultationMethod optional deselected

  extends ref feature DisplayInterface mandatory selected
    extends ref feature LCDDisplay alternative selected
    extends ref feature OLEDDisplay alternative deselected

  extends ref feature ConnectivityFeatures optional deselected
    extends ref feature WiFiConnectivity or deselected
    extends ref feature BluetoothConnectivity or deselected
    extends ref feature USBConnectivity or deselected

  extends ref feature PowerManagement mandatory selected
    extends ref feature BatteryPower alternative selected
    extends ref feature ACPower alternative deselected
```

```sylang
hdef variantset BloodPressurePremiumVariant
  name "Premium Blood Pressure Monitor"
  description "High-end blood pressure monitor with advanced connectivity"
  owner "Product Management Team"
  tags "premium", "advanced", "connected"
  safetylevel ASIL-C
  derivedfor ref featureset BloodPressureFeatures

  extends ref feature CoreMeasurement mandatory selected
    extends ref feature OscillometricMethod mandatory selected
    extends ref feature AuscultationMethod optional selected

  extends ref feature DisplayInterface mandatory selected
    extends ref feature LCDDisplay alternative deselected
    extends ref feature OLEDDisplay alternative selected

  extends ref feature ConnectivityFeatures optional selected
    extends ref feature WiFiConnectivity or selected
    extends ref feature BluetoothConnectivity or selected
    extends ref feature USBConnectivity or deselected

  extends ref feature PowerManagement mandatory selected
    extends ref feature BatteryPower alternative selected
    extends ref feature ACPower alternative deselected
```

```sylang
hdef variantset BloodPressureClinicalVariant
  name "Clinical Blood Pressure Monitor"
  description "Professional-grade monitor for clinical environments"
  owner "Clinical Products Team"
  tags "clinical", "professional", "stationary"
  safetylevel ASIL-C
  derivedfor ref featureset BloodPressureFeatures

  extends ref feature CoreMeasurement mandatory selected
    extends ref feature OscillometricMethod mandatory selected
    extends ref feature AuscultationMethod optional selected

  extends ref feature DisplayInterface mandatory selected
    extends ref feature LCDDisplay alternative deselected
    extends ref feature OLEDDisplay alternative selected

  extends ref feature ConnectivityFeatures optional selected
    extends ref feature WiFiConnectivity or selected
    extends ref feature BluetoothConnectivity or deselected
    extends ref feature USBConnectivity or selected

  extends ref feature PowerManagement mandatory selected
    extends ref feature BatteryPower alternative deselected
    extends ref feature ACPower alternative selected
```

## Example 2: Electronic Parking Brake Variants

```sylang
hdef variantset EPBStandardVariant
  name "Standard EPB System"
  description "Standard electronic parking brake for mid-range vehicles"
  owner "Automotive Product Team"
  tags "standard", "mid-range", "cost-optimized"
  safetylevel ASIL-C
  derivedfor ref featureset EPBFeatures

  extends ref feature BrakeActuation mandatory selected
    extends ref feature ElectricMotor alternative selected
    extends ref feature ElectroMechanical alternative deselected

  extends ref feature SafetyMonitoring mandatory selected
    extends ref feature PositionSensing mandatory selected
    extends ref feature ForceSensing mandatory selected
    extends ref feature TemperatureMonitoring optional deselected

  extends ref feature UserInterface optional selected
    extends ref feature PhysicalButton alternative selected
    extends ref feature TouchInterface alternative deselected

  extends ref feature AutomaticFunctions optional deselected
    extends ref feature HillHoldAssist or deselected
    extends ref feature AutoPark or deselected
```

```sylang
hdef variantset EPBPremiumVariant
  name "Premium EPB System"
  description "Advanced EPB system with full automation features"
  owner "Automotive Premium Team"
  tags "premium", "luxury", "automated"
  safetylevel ASIL-D
  derivedfor ref featureset EPBFeatures

  extends ref feature BrakeActuation mandatory selected
    extends ref feature ElectricMotor alternative deselected
    extends ref feature ElectroMechanical alternative selected

  extends ref feature SafetyMonitoring mandatory selected
    extends ref feature PositionSensing mandatory selected
    extends ref feature ForceSensing mandatory selected
    extends ref feature TemperatureMonitoring optional selected

  extends ref feature UserInterface optional selected
    extends ref feature PhysicalButton alternative deselected
    extends ref feature TouchInterface alternative selected

  extends ref feature AutomaticFunctions optional selected
    extends ref feature HillHoldAssist or selected
    extends ref feature AutoPark or selected
```

```sylang
hdef variantset EPBCommercialVariant
  name "Commercial Vehicle EPB"
  description "Heavy-duty EPB system for commercial vehicles"
  owner "Commercial Vehicle Team"
  tags "commercial", "heavy-duty", "robust"
  safetylevel ASIL-D
  derivedfor ref featureset EPBFeatures

  extends ref feature BrakeActuation mandatory selected
    extends ref feature ElectricMotor alternative deselected
    extends ref feature ElectroMechanical alternative selected

  extends ref feature SafetyMonitoring mandatory selected
    extends ref feature PositionSensing mandatory selected
    extends ref feature ForceSensing mandatory selected
    extends ref feature TemperatureMonitoring optional selected

  extends ref feature UserInterface optional selected
    extends ref feature PhysicalButton alternative selected
    extends ref feature TouchInterface alternative deselected

  extends ref feature AutomaticFunctions optional selected
    extends ref feature HillHoldAssist or selected
    extends ref feature AutoPark or deselected
```

## Example 3: Industrial Inverter Variants

```sylang
use variantset BaseInverterVariant

hdef variantset CompactInverterVariant
  name "Compact Industrial Inverter"
  description "Space-optimized inverter for small industrial applications"
  owner "Industrial Compact Products"
  tags "compact", "space-saving", "small-power"
  safetylevel SIL-2
  derivedfor ref featureset InverterFeatures
  inherits ref variantset BaseInverterVariant

  extends ref feature PowerRating mandatory selected
    extends ref feature LowPower alternative selected      // 0.5-5 kW
    extends ref feature MediumPower alternative deselected // 5-50 kW
    extends ref feature HighPower alternative deselected   // 50+ kW

  extends ref feature CoolingSystem mandatory selected
    extends ref feature AirCooling alternative selected
    extends ref feature LiquidCooling alternative deselected

  extends ref feature ControlInterface mandatory selected
    extends ref feature BasicHMI alternative selected
    extends ref feature AdvancedHMI alternative deselected
    extends ref feature RemoteInterface optional deselected

  extends ref feature ProtectionFeatures mandatory selected
    extends ref feature BasicProtection mandatory selected
    extends ref feature AdvancedProtection optional deselected
    extends ref feature RedundantProtection optional deselected
```

```sylang
hdef variantset HighPerformanceInverterVariant
  name "High-Performance Industrial Inverter"
  description "Advanced inverter for demanding industrial applications"
  owner "Industrial High-Performance Products"
  tags "high-performance", "advanced", "industrial"
  safetylevel SIL-3
  derivedfor ref featureset InverterFeatures

  extends ref feature PowerRating mandatory selected
    extends ref feature LowPower alternative deselected
    extends ref feature MediumPower alternative deselected
    extends ref feature HighPower alternative selected

  extends ref feature CoolingSystem mandatory selected
    extends ref feature AirCooling alternative deselected
    extends ref feature LiquidCooling alternative selected

  extends ref feature ControlInterface mandatory selected
    extends ref feature BasicHMI alternative deselected
    extends ref feature AdvancedHMI alternative selected
    extends ref feature RemoteInterface optional selected

  extends ref feature ProtectionFeatures mandatory selected
    extends ref feature BasicProtection mandatory selected
    extends ref feature AdvancedProtection optional selected
    extends ref feature RedundantProtection optional selected

  extends ref feature CommunicationProtocols optional selected
    extends ref feature Modbus or selected
    extends ref feature Profibus or selected
    extends ref feature EthernetIP or selected
    extends ref feature CANopen or deselected
```

## Validation Rules

### Feature Selection Consistency
```sylang
# ✅ Valid: Parent selected, one alternative chosen
extends ref feature PowerManagement mandatory selected
  extends ref feature BatteryPower alternative selected
  extends ref feature ACPower alternative deselected

# ✅ Valid: Parent selected, or siblings properly selected
extends ref feature SecurityFeatures mandatory selected
  extends ref feature UserAuth or selected
  extends ref feature SecureComm or selected

# ❌ Invalid: Multiple alternatives selected
extends ref feature Algorithms mandatory selected
  extends ref feature Algorithm1 alternative selected  // ERROR
  extends ref feature Algorithm2 alternative selected  // ERROR

# ❌ Invalid: No 'or' siblings selected when parent is selected
extends ref feature ConnectivityFeatures mandatory selected
  extends ref feature WiFi or deselected              // ERROR
  extends ref feature Bluetooth or deselected         // ERROR

# ❌ Invalid: Mandatory child not selected when parent is selected
extends ref feature DataManagement mandatory selected
  extends ref feature LocalStorage mandatory deselected  // ERROR
  extends ref feature CloudSync optional selected

# ✅ Valid: Parent not selected, children validation skipped
extends ref feature AdvancedFeatures optional deselected
  extends ref feature Feature1 alternative selected    // OK - ignored
  extends ref feature Feature2 alternative selected    // OK - ignored
```

### Inheritance Rules
```sylang
# Child variant can override parent selections
hdef variantset ChildVariant
  inherits ref variantset ParentVariant
  
  # Override parent's deselection
  extends ref feature ConnectivityFeatures optional selected
    extends ref feature WiFiConnectivity or selected
```

## Relationship Keywords

- `derivedfor ref featureset <identifier>` - Links to source feature model
- `inherits ref variantset <identifier>` - Inherits from parent variant
- `extends ref feature <identifier> <flag> <selection>` - Feature selection
- `overrides ref feature <identifier>` - Overrides inherited selection
- `requires ref variant <identifier>` - Variant dependencies

## Key Rules

1. **Multiple .vml files allowed** - Different variants per file
2. **Derived from .fml** - Must reference a feature model
3. **Feature selection validation** - Must follow feature model constraints
4. **Inheritance support** - Can inherit from other variants
5. **Selection consistency** - Alternative/or group rules enforced
6. **Safety level inheritance** - Can specify variant-specific safety levels
7. **Nested selections** - Parent-child feature selections via indentation
8. **Override capability** - Can override inherited selections
