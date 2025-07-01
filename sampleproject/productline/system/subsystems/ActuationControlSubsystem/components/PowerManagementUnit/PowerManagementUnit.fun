componentfunctions PowerManagementUnit
  // ========== PowerSupplyManager Decomposition ==========
  
  function VoltageRegulationController
    name "Voltage Regulation Controller"
    description "Controls voltage regulation circuits and maintains stable voltage supply for actuator systems"
    owner "Hardware Team"
    tags "voltage", "regulation", "control", "stability"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function CurrentLimitingProtection
    name "Current Limiting Protection"
    description "Implements current limiting protection to prevent overcurrent damage and ensure safe operation"
    owner "Hardware Team"
    tags "current", "limiting", "protection", "safety"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function PowerDistributionController
    name "Power Distribution Controller"
    description "Controls power distribution to multiple actuator components and manages power allocation"
    owner "Hardware Team"
    tags "power", "distribution", "allocation", "management"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function PowerQualityMonitor
    name "Power Quality Monitor"
    description "Monitors power quality parameters including voltage ripple, noise, and stability"
    owner "Hardware Team"
    tags "power", "quality", "monitoring", "stability"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  // ========== Power Efficiency Management ==========

  function PowerEfficiencyOptimizer
    name "Power Efficiency Optimizer"
    description "Optimizes power efficiency by adjusting operating parameters based on load conditions"
    owner "Hardware Team"
    tags "efficiency", "optimization", "parameters", "load"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function LoadPowerCalculator
    name "Load Power Calculator"
    description "Calculates power requirements for different load conditions and operational modes"
    owner "Hardware Team"
    tags "load", "power", "calculation", "requirements"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function PowerModeController
    name "Power Mode Controller"
    description "Controls different power modes including standby, active, and emergency power modes"
    owner "Hardware Team"
    tags "power", "modes", "control", "emergency"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function EnergyStorageManager
    name "Energy Storage Manager"
    description "Manages energy storage systems and backup power for emergency actuator operation"
    owner "Hardware Team"
    tags "energy", "storage", "backup", "emergency"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  // ========== Power Protection Systems ==========

  function OvervoltageProtectionAgent
    name "Overvoltage Protection Agent"
    description "Provides overvoltage protection and prevents damage from voltage spikes and surges"
    owner "Hardware Team"
    tags "overvoltage", "protection", "spikes", "surges"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function UndervoltageProtectionAgent
    name "Undervoltage Protection Agent"
    description "Provides undervoltage protection and manages system behavior during low voltage conditions"
    owner "Hardware Team"
    tags "undervoltage", "protection", "low-voltage", "management"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function ThermalPowerProtection
    name "Thermal Power Protection"
    description "Implements thermal protection for power components and prevents overheating damage"
    owner "Hardware Team"
    tags "thermal", "protection", "overheating", "components"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function PowerFaultDetector
    name "Power Fault Detector"
    description "Detects power system faults and initiates appropriate protection and recovery actions"
    owner "Hardware Team"
    tags "fault", "detection", "protection", "recovery"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  // ========== Advanced Power Management ==========

  function PowerSequencingController
    name "Power Sequencing Controller"
    description "Controls power sequencing during startup and shutdown to prevent system damage"
    owner "Hardware Team"
    tags "sequencing", "startup", "shutdown", "protection"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit

  function PowerConsumptionAnalyzer
    name "Power Consumption Analyzer"
    description "Analyzes power consumption patterns and optimizes power usage for efficiency"
    owner "Hardware Team"
    tags "consumption", "analysis", "patterns", "optimization"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnite

  function EmergencyPowerController
    name "Emergency Power Controller"
    description "Controls emergency power systems and ensures critical functions during power failures"
    owner "Hardware Team"
    tags "emergency", "power", "critical", "failures"
    safetylevel ASIL-D
    decomposes PowerSupplyManager
    performedby PowerManagementUnit 