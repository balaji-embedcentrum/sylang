# Test Definition (.tst)

## Overview
Defines **validation and verification tests** with complete traceability to requirements. Supports multiple test methods (HIL, SIL, VIL, etc.).

## File Structure
- **ONE** `hdef testset` per file
- **MULTIPLE** `def testcase` statements
- Can `use` requirementsets, functionsets, parameters

## Valid Keywords
```
use, hdef, testset, def, testcase, name, description, owner, tags, 
level, safetylevel, setup, passcriteria, testresult, expected, method, 
testlevel, steps, satisfies, derivedfrom, refinedfrom, when, ref, config
```

## Syntax Structure
```
use requirementset [requirementset-ref]
use functionset [functionset-ref]
use parameter [parameter-ref], [parameter-ref], ...

hdef testset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]

  def testcase [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    method [HIL|SIL|VIL|MIL|manual|automated]
    testlevel [unit|integration|system|acceptance]
    setup [string-literal]
    steps [string-literal]
    expected [string-literal]
    passcriteria [string-literal]
    testresult [pass|fail|not-run|blocked]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    
    # Test relationships
    satisfies ref requirement [requirement-ref], [requirement-ref], ...
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    refinedfrom ref testcase [testcase-ref]
    when ref config [config-ref]
```

## Complete Example
```sylang
use requirementset AutonomousPerceptionRequirements
use functionset AutonomousPerceptionFunctions
use parameter MaxDetectionRange, ConfidenceThreshold

hdef testset PerceptionSystemValidationTests
  name "Autonomous Perception System Validation Test Suite"
  description "Comprehensive validation tests for perception system"
  owner "Perception Test Engineering Team"

  def testcase TEST_PERC_001_OBJECT_DETECTION
    name "Environmental Object Detection Performance Test"
    description "Validate object detection accuracy and range performance"
    satisfies ref requirement REQ_PERC_001
    method HIL
    testlevel system
    setup """
      Autonomous vehicle perception system in HIL test bench with 
      radar/camera/LiDAR simulators, calibrated test objects, and 
      environmental chamber with controlled lighting and weather simulation.
      """
    steps """
      1. Initialize perception system and verify all sensors active
      2. Place calibrated test objects at distances 20m, 50m, 100m, 150m, 200m
      3. Execute detection algorithm across all sensor modalities
      4. Verify object detection at each distance with position accuracy ±10cm
      5. Record detection rates and classification confidence scores
      6. Repeat tests in simulated rain (5mm/h, 10mm/h) and fog conditions
      7. Document all failure modes and edge cases encountered
      8. Generate comprehensive test report with statistical analysis
      """
    expected """
      Objects detected with ≥99.9% accuracy at all test distances.
      Classification confidence ≥95% for all object types.
      Consistent performance across all environmental conditions.
      """
    passcriteria """
      Detection accuracy meets specification in ≥98% of test cases.
      Zero tolerance for safety-critical failures (missed pedestrians, vehicles).
      Performance degradation <5% in adverse weather conditions.
      """
    safetylevel ASIL-D
    testresult notrun
    owner "Object Detection Test Team"

  def testcase TEST_PERC_001_1_CLASSIFICATION_ACCURACY
    name "Object Classification Accuracy Validation"
    satisfies ref requirement REQ_PERC_001_1
    method VIL
    testlevel integration
    setup "Perception ML model in virtual environment with annotated dataset"
    steps """
      1. Load pre-trained classification model
      2. Execute classification on test dataset (10,000+ objects)
      3. Measure classification accuracy per object class
      4. Verify processing time ≤100ms per classification
      5. Generate confusion matrix and performance metrics
      """
    expected "Classification accuracy ≥95% per object class, processing time ≤100ms"
    passcriteria "Accuracy specification met for all object classes"
    safetylevel ASIL-D
    testresult notrun
```

## Test Methods
```
method MIL       # Model-in-the-Loop
method SIL       # Software-in-the-Loop
method PIL       # Processor-in-the-Loop
method HIL       # Hardware-in-the-Loop
method VIL       # Vehicle-in-the-Loop
method manual    # Manual testing
method automated # Automated testing
```

## Test Levels
```
testlevel unit        # Unit testing
testlevel integration # Integration testing
testlevel system      # System testing
testlevel acceptance  # Acceptance testing
```

## Test Results
```
testresult pass    # Test passed
testresult fail    # Test failed
testresult intest  # Currently in test
testresult notrun  # Not yet run
testresult blocked # Blocked
```

## Traceability
- `satisfies ref requirement` - Satisfies requirement
- `derivedfrom ref requirement` - Derived from requirement
- `refinedfrom ref testcase` - Refinement of another test
- `when ref config` - Conditional visibility

---
Use multiline `"""` for setup, steps, expected, and passcriteria.

