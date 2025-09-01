# .ple (Product Line) Examples

Product Line Engineering files define the top-level product line structure. Only one `.ple` file is allowed per project.

## Basic Structure

```sylang
hdef productline <ProductLineName>
  name "Product line name"
  description "Product line description"
  owner "Owner information"
  domain "domain1", "domain2", "domain3"
  compliance "standard1", "standard2"
  firstrelease "YYYY-MM-DD"
  tags "tag1", "tag2", "tag3"
  safetylevel <SAFETY_LEVEL_ENUM>
  region "region1", "region2"
```

## Example 1: Blood Pressure Monitoring System

```sylang
hdef productline BloodPressureProductLine
  name "Digital Blood Pressure Monitor"
  description "Comprehensive digital blood pressure monitoring system for home and clinical use"
  owner "Medical Device Engineering Team"
  domain "medical-devices", "health-monitoring", "connected-health"
  compliance "ISO 14971", "IEC 62304", "ISO 13485", "FDA 21 CFR 820", "EU MDR", "IEC 62366-1", "ISO 27001"
  firstrelease "2025-06-01"
  tags "blood-pressure", "sphygmomanometer", "digital-health", "WiFi", "telemedicine"
  safetylevel ASIL-C
  region "Global", "North America", "Europe", "Asia-Pacific", "Latin America"
```

## Example 2: Automotive Electronic Parking Brake

```sylang
hdef productline ElectronicParkingBrakeProductLine
  name "Electronic Parking Brake System"
  description "Advanced electronic parking brake system for passenger vehicles"
  owner "Automotive Safety Systems Team"
  domain "automotive", "safety-systems", "brake-systems"
  compliance "ISO 26262", "ASPICE", "AUTOSAR", "ECE R13H", "FMVSS 135"
  firstrelease "2025-03-15"
  tags "EPB", "parking-brake", "electronic-brake", "safety-critical", "automotive"
  safetylevel ASIL-D
  region "Global", "Europe", "North America", "Asia"
```

## Example 3: Industrial Inverter System

```sylang
hdef productline InverterProductLine
  name "Industrial Power Inverter"
  description "High-efficiency three-phase power inverter for industrial applications"
  owner "Power Electronics Engineering Team"
  domain "industrial-automation", "power-electronics", "motor-drives"
  compliance "IEC 61800-5-1", "IEC 61508", "UL 508C", "CE Marking", "FCC Part 15"
  firstrelease "2025-09-01"
  tags "inverter", "VFD", "motor-drive", "industrial", "power-conversion"
  safetylevel SIL-2
  region "Global", "North America", "Europe", "Asia-Pacific"
```

## Key Rules for .ple Files

1. **No `use` statements allowed** - `.ple` files are the root and cannot import anything
2. **Only one per project** - Enforced by the language
3. **Mandatory `hdef productline`** - Must be the header definition
4. **All properties are optional** except the header definition
5. **String literals** can contain multiple values separated by commas
6. **Safety levels** use predefined enums (ASIL-A through ASIL-D, SIL-1 through SIL-4)
7. **Indentation** must be consistent (2 spaces or 1 tab per level)

## Safety Level Enums

- **ASIL-A, ASIL-B, ASIL-C, ASIL-D** - Automotive Safety Integrity Levels (ISO 26262)
- **SIL-1, SIL-2, SIL-3, SIL-4** - Safety Integrity Levels (IEC 61508)
- **DAL-A, DAL-B, DAL-C, DAL-D, DAL-E** - Design Assurance Levels (DO-178C)

## Common Domains

- `automotive`, `aerospace`, `medical-devices`, `industrial-automation`
- `consumer-electronics`, `telecommunications`, `energy-systems`
- `defense`, `railway`, `marine`, `nuclear`

## Validation Rules

- Each line must start with a valid keyword
- Indentation must be exactly 2 spaces or 1 tab
- String literals must be enclosed in quotes
- Multiple values in properties are comma-separated
- Safety level must be from predefined enum
- Date format must be YYYY-MM-DD for `firstrelease`
