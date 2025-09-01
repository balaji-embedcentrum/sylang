# .tst (Test Suite) Examples

Test Suite Language files define test cases and validation procedures. Multiple `.tst` files are allowed per project.

## Basic Structure

```sylang
use requirementset <RequirementSetIdentifier>
use configset <ConfigSetIdentifier>

hdef testset <TestSetName>
  name "Test set name"
  description "Test set description"
  owner "Owner information"
  tags "tag1", "tag2"
  ref config <ConfigIdentifier>
  
  def testcase <TestCaseName>
    name "Test case name"
    description "Test case description"
    ref config <ConfigIdentifier>
    satisfies ref requirement <RequirementIdentifier>
    derivedfrom ref requirement <RequirementId1>, <RequirementId2>
    refinedfrom ref requirement <RequirementId1>, <RequirementId2>
    method <TEST_METHOD>
    setup "Test setup description"
    steps "Test execution steps"
    expected "Expected results"
    passcriteria "Pass criteria"
    safetylevel <SAFETY_LEVEL>
    testresult <TEST_RESULT>
```

## Enums

### Test Methods
- `HIL` - Hardware-in-the-Loop testing
- `SIL` - Software-in-the-Loop testing
- `MIL` - Model-in-the-Loop testing
- `manual` - Manual testing
- `automated` - Automated testing

### Test Results
- `pass` - Test passed
- `fail` - Test failed
- `intest` - Test in progress
- `blocked` - Test blocked
- `notrun` - Test not run

## Example 1: Blood Pressure Monitor Test Suite

```sylang
use requirementset BloodPressureSystemRequirements
use configset BloodPressureVariantsConfigs

hdef testset BloodPressureSystemTests
  name "Blood Pressure Monitoring System Test Suite"
  description "Comprehensive test cases for WiFi-enabled clinical blood pressure monitoring system validation"
  owner "Test Engineering Team"
  tags "medical-device", "validation", "clinical-testing"
  ref config c_AdvancedAlgorithms_PredictiveAnalytics
  
  def testcase TC_MEAS_001
    name "Blood Pressure Measurement Accuracy Test"
    description "Verify blood pressure measurement accuracy meets ±3 mmHg specification"
    ref config c_AdvancedAlgorithms_PredictiveAnalytics
    satisfies ref requirement REQ_MEAS_001
    method HIL
    setup "Device connected to calibrated pressure reference, standard test cuff"
    steps "Connect device to pressure reference standard \
           Apply known pressure sequences from 60-280 mmHg systolic \
           Record device measurements vs reference values \
           Calculate measurement error for each data point"
    expected "All measurements within ±3 mmHg of reference values"
    passcriteria "95% of measurements within ±3 mmHg, 100% within ±5 mmHg"
    safetylevel ASIL-C
    testresult pass
    
  def testcase TC_MEAS_002
    name "Measurement Timing Performance Test"
    description "Verify measurement completion within 120 second time limit"
    ref config c_AdvancedAlgorithms_PredictiveAnalytics
    satisfies ref requirement REQ_MEAS_002
    method SIL
    setup "Device in normal operating mode, standard adult cuff"
    steps "Initiate measurement using start button \
           Record timestamp at measurement start \
           Monitor measurement progress \
           Record timestamp at measurement completion"
    expected "Measurement completes within 120 seconds"
    passcriteria "All measurements complete within 120 seconds under normal conditions"
    safetylevel ASIL-B
    testresult pass

  def testcase TC_SAFE_001
    name "Overpressure Protection Validation"
    description "Verify overpressure protection activates at 300 mmHg threshold"
    satisfies ref requirement REQ_SAFE_001
    method HIL
    setup "Device with blocked release valve, pressure monitoring equipment"
    steps "Block cuff release valve completely \
           Initiate normal measurement cycle \
           Monitor pressure buildup \
           Verify emergency release activation \
           Record maximum pressure reached"
    expected "Emergency release activates before 300 mmHg, pressure drops immediately"
    passcriteria "Maximum pressure < 300 mmHg, emergency release < 100ms response time"
    safetylevel ASIL-D
    testresult pass

  def testcase TC_FUNC_001
    name "Automatic Deflation Test"
    description "Verify automatic cuff deflation upon measurement completion"
    satisfies ref requirement REQ_FUNC_001
    method automated
    setup "Device in normal operating mode, pressure monitoring"
    steps "Complete normal measurement cycle \
           Monitor cuff pressure after measurement \
           Verify complete deflation occurs \
           Test deflation during error conditions"
    expected "Cuff deflates to atmospheric pressure within 10 seconds"
    passcriteria "Complete deflation achieved, no residual pressure"
    safetylevel ASIL-C
    testresult pass

  def testcase TC_CONN_001
    name "WiFi Data Transmission Test"
    description "Verify WiFi data transmission functionality and timing"
    ref config c_ConnectivityFeatures_WiFi
    satisfies ref requirement REQ_CONN_001
    method automated
    setup "Device connected to test WiFi network, health platform simulator"
    steps "Complete blood pressure measurement \
           Verify WiFi connection status \
           Monitor data transmission to health platform \
           Record transmission timing and success rate"
    expected "Measurement data transmitted within 30 seconds of completion"
    passcriteria "100% transmission success rate, average transmission time < 15 seconds"
    testresult intest
```

## Example 2: Electronic Parking Brake Test Suite

```sylang
use requirementset EPBSafetyRequirements
use configset EPBVariantConfigs

hdef testset EPBValidationTests
  name "Electronic Parking Brake Validation Test Suite"
  description "Safety-critical validation tests for automotive EPB system"
  owner "Automotive Test Engineering Team"
  tags "automotive", "safety-validation", "EPB", "ASIL-D"
  
  def testcase TC_EPB_SAF_001
    name "Emergency Engagement Response Time Test"
    description "Validate emergency brake engagement meets 500ms requirement"
    satisfies ref requirement REQ_EPB_SAF_001
    method HIL
    setup "EPB system in vehicle test bench, high-speed data acquisition"
    steps "Configure emergency engagement scenario \
           Trigger emergency engagement command \
           Monitor actuator response with high-speed sensors \
           Record engagement timing and force buildup \
           Verify complete engagement achieved"
    expected "Brake engagement completes within 500 milliseconds"
    passcriteria "100% of tests complete engagement within 500ms, force > 8000N"
    safetylevel ASIL-D
    testresult pass

  def testcase TC_EPB_SAF_002
    name "Brake Force Validation Test"
    description "Verify continuous brake force monitoring and degradation detection"
    satisfies ref requirement REQ_EPB_SAF_002
    method HIL
    setup "EPB system with force simulation capability, fault injection equipment"
    steps "Engage parking brake to target force \
           Simulate gradual force degradation \
           Monitor system response to force loss \
           Verify degradation detection and alerts \
           Test various degradation rates and patterns"
    expected "System detects 10% force degradation within 1 second"
    passcriteria "All degradation scenarios detected, appropriate alerts generated"
    safetylevel ASIL-D
    testresult pass

  def testcase TC_EPB_PERF_001
    name "Normal Engagement Performance Test"
    description "Verify normal brake engagement timing under various conditions"
    satisfies ref requirement REQ_EPB_PERF_001
    method HIL
    setup "EPB system in environmental test chamber, load simulation"
    steps "Test engagement across temperature range -40°C to +85°C \
           Vary vehicle load conditions \
           Measure engagement timing for each condition \
           Record force buildup profiles \
           Analyze performance consistency"
    expected "Engagement completes within 2 seconds across all conditions"
    passcriteria "95% of tests within 2 seconds, 100% within 2.5 seconds"
    safetylevel ASIL-C
    testresult pass

  def testcase TC_EPB_FUNC_001
    name "Hill Hold Assist Activation Test"
    description "Validate automatic engagement on slopes with driver exit"
    satisfies ref requirement REQ_EPB_FUNC_001
    method HIL
    setup "Vehicle simulator with tilt capability, door sensor simulation"
    steps "Position vehicle on 15+ degree slope \
           Turn off engine \
           Simulate driver door opening \
           Monitor automatic brake engagement \
           Test various slope angles and conditions \
           Verify engagement force adequate for slope"
    expected "Automatic engagement occurs within 5 seconds of door opening"
    passcriteria "100% activation on slopes >15°, adequate holding force"
    testresult pass

  def testcase TC_EPB_DIAG_001
    name "System Self-Diagnostics Test"
    description "Verify comprehensive self-diagnostic functionality"
    satisfies ref requirement REQ_EPB_DIAG_001
    method automated
    setup "EPB system with fault injection capability, diagnostic interface"
    steps "Perform ignition cycle with normal system \
           Inject various fault conditions \
           Monitor diagnostic responses \
           Verify fault detection and reporting \
           Test diagnostic coverage completeness"
    expected "All injected faults detected and reported correctly"
    passcriteria "Diagnostic coverage >95%, all critical faults detected"
    safetylevel ASIL-C
    testresult pass
```

## Example 3: Industrial Inverter Test Suite

```sylang
use requirementset InverterPerformanceRequirements

hdef testset InverterValidationTests
  name "Industrial Inverter Validation Test Suite"
  description "Performance and safety validation for three-phase industrial inverter"
  owner "Power Electronics Test Team"
  tags "industrial", "power-electronics", "validation"
  
  def testcase TC_INV_PERF_001
    name "Efficiency Measurement Test"
    description "Validate inverter efficiency across operating range"
    satisfies ref requirement REQ_INV_PERF_001
    method automated
    setup "Inverter connected to calibrated load bank, power analyzers"
    steps "Configure inverter for rated output \
           Vary load from 25% to 100% of rated power \
           Measure input and output power at each load point \
           Calculate efficiency at each operating point \
           Test across temperature range -10°C to +50°C"
    expected "Efficiency >95% at rated load across temperature range"
    passcriteria "Efficiency >95% at rated load, >92% at 50% load"
    safetylevel SIL-2
    testresult pass

  def testcase TC_INV_SAFE_001
    name "Overcurrent Protection Test"
    description "Verify rapid overcurrent detection and shutdown"
    satisfies ref requirement REQ_INV_SAFE_001
    method HIL
    setup "Inverter with current injection capability, high-speed oscilloscope"
    steps "Configure inverter for normal operation \
           Inject overcurrent condition at 110% rated current \
           Monitor protection response with microsecond resolution \
           Verify shutdown timing and sequence \
           Test various overcurrent levels and rates"
    expected "Protection activates within 10 microseconds of overcurrent detection"
    passcriteria "100% of overcurrent events trigger protection within 10μs"
    safetylevel SIL-3
    testresult pass

  def testcase TC_INV_FUNC_001
    name "Speed Control Accuracy Test"
    description "Verify motor speed control precision"
    satisfies ref requirement REQ_INV_FUNC_001
    method automated
    setup "Inverter driving calibrated motor with encoder feedback"
    steps "Command various speed setpoints from 10% to 100% rated speed \
           Allow system to reach steady state \
           Measure actual speed with calibrated encoder \
           Calculate speed error for each setpoint \
           Test under varying load conditions"
    expected "Speed accuracy within ±0.1% of commanded speed"
    passcriteria "All speed points within ±0.1% accuracy under steady-state"
    testresult pass

  def testcase TC_INV_COMM_001
    name "Modbus Communication Test"
    description "Validate Modbus RTU communication protocol performance"
    satisfies ref requirement REQ_INV_COMM_001
    method automated
    setup "Inverter connected to Modbus master test equipment"
    steps "Configure Modbus communication parameters \
           Send various read/write commands \
           Measure response times for each command type \
           Test communication under electrical noise conditions \
           Verify data integrity and error handling"
    expected "All Modbus responses within 50 milliseconds"
    passcriteria "100% response rate, average response time <25ms"
    testresult pass
```

## Multi-line String Support

Test properties support multi-line strings using backslash continuation:

```sylang
def testcase TC_COMPLEX_001
  name "Complex Integration Test"
  setup "Multi-component test setup with \
         calibrated measurement equipment and \
         environmental control systems"
  steps "Initialize all test equipment \
         Configure system under test \
         Execute test sequence with data logging \
         Monitor all critical parameters \
         Verify system responses at each step"
  expected "System meets all performance criteria \
            under specified test conditions with \
            no anomalous behavior detected"
  passcriteria "All measured parameters within specification limits \
                No error conditions or warnings generated \
                System maintains stable operation throughout test"
```

## Relationship Keywords

- `satisfies ref requirement <identifier>` - Test validates specific requirement
- `derivedfrom ref requirement <id1>, <id2>` - Test derived from requirements
- `refinedfrom ref requirement <id1>, <id2>` - Test refines requirement validation
- `ref config <identifier>` - Configuration-specific test cases

## Validation Rules

1. **Multiple .tst files allowed** - No project limit
2. **Cross-file references** - Can reference requirements from other files
3. **Configuration references** - Support for variant-specific tests
4. **Requirement traceability** - Must reference valid requirements
5. **Safety level consistency** - Test safety level should match requirement
6. **Test method validation** - Must use valid test method enums
7. **Multi-line support** - Properties support backslash continuation
8. **Test result tracking** - Must have valid test result status

## Key Properties

### Required Properties
- `name` - Test case name
- `description` - Detailed test description

### Optional Properties
- `owner` - Responsible person/team
- `tags` - Classification tags
- `safetylevel` - Safety integrity level
- `method` - Test execution method
- `setup` - Test setup description
- `steps` - Test execution steps
- `expected` - Expected test results
- `passcriteria` - Criteria for test pass
- `testresult` - Current test status
- `ref config` - Configuration reference for conditional tests

### Relation Properties
- `satisfies` - Requirements validated by this test
- `derivedfrom` - Parent requirements
- `refinedfrom` - Source requirements being refined
