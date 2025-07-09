def systemfunctions EPBFunctions
	def function CoreSystemOrchestrator
		name "Core System Orchestrator"
		description "Main orchestration engine for the entire EPB system architecture and coordination."
		owner "Systems Engineering"
		tags "orchestration", "system", "architecture"
		safetylevel ASIL-D
		enables EPBSystem

	def function HMIInterfaceProcessor
		name "HMI Interface Processor"
		description "Central processor for all human-machine interface operations and user interactions."
		owner "HMI Team"  
		tags "HMI", "processor", "interface"
		safetylevel ASIL-B
		enables UserInterface, StatusDisplay

	def function InputDeviceController
		name "Input Device Controller"
		description "Controls and manages different types of input devices and switch configurations."
		owner "HMI Team"
		tags "input", "device", "controller"
		safetylevel ASIL-B
		enables SwitchType, PushPullSwitch, RockerSwitch, ToggleSwitch

	def function PushPullInputDriver
		name "Push-Pull Input Driver"
		description "Low-level driver for push-pull switch mechanisms and input processing."
		owner "HMI Team"
		tags "push-pull", "driver", "input"
		safetylevel ASIL-B
		enables PushPullSwitch, SwitchIllumination, SwitchFeedback

	def function IlluminationControlService
		name "Illumination Control Service"
		description "Service for managing switch LED illumination and lighting control."
		owner "HMI Team"
		tags "illumination", "LED", "service"
		safetylevel QM
		enables SwitchIllumination, LEDColors, LEDBrightness

	def function HapticFeedbackEngine
		name "Haptic Feedback Engine"
		description "Engine for providing tactile and audible feedback from switch operations."
		owner "HMI Team"
		tags "haptic", "feedback", "engine"
		safetylevel QM
		enables SwitchFeedback

	def function RockerInputDriver
		name "Rocker Input Driver"
		description "Specialized driver for rocker-style switch input processing and control."
		owner "HMI Team"
		tags "rocker", "driver", "input"
		safetylevel ASIL-B
		enables RockerSwitch, RockerLabeling, TextLabels, IconLabels

	def function LabelingManagementModule
		name "Labeling Management Module"
		description "Module for managing switch labeling options and display configurations."
		owner "HMI Team"
		tags "labeling", "management", "module"
		safetylevel QM
		enables RockerLabeling, TextLabels, IconLabels

	def function TextRenderingService
		name "Text Rendering Service"
		description "Service for rendering and displaying text-based labels on interface elements."
		owner "HMI Team"
		tags "text", "rendering", "service"
		safetylevel QM
		enables TextLabels

	def function IconGraphicsEngine
		name "Icon Graphics Engine"
		description "Graphics engine for rendering and managing icon-based symbols and graphics."
		owner "HMI Team"
		tags "icons", "graphics", "engine"
		safetylevel QM
		enables IconLabels

	def function ToggleInputDriver
		name "Toggle Input Driver"
		description "Driver for toggle-style switch input mechanisms and state management."
		owner "HMI Team"
		tags "toggle", "driver", "input"
		safetylevel ASIL-B
		enables ToggleSwitch

	def function VisualFeedbackManager
		name "Visual Feedback Manager"
		description "Manager for all visual feedback systems and display coordination."
		owner "HMI Team"
		tags "visual", "feedback", "manager"
		safetylevel ASIL-B
		enables StatusDisplay, PrimaryIndicator, DedicatedLED, InstrumentDisplay

	def function IndicatorSelectionController
		name "Indicator Selection Controller"
		description "Controller for selecting and managing primary indicator types and configurations."
		owner "HMI Team"
		tags "indicator", "selection", "controller"
		safetylevel ASIL-B
		enables PrimaryIndicator, DedicatedLED, InstrumentDisplay

	def function LEDControllerChip
		name "LED Controller Chip"
		description "Hardware controller chip for dedicated LED management and control operations."
		owner "Hardware Team"
		tags "LED", "controller", "chip"
		safetylevel ASIL-B
		enables DedicatedLED, LEDColors, LEDBrightness

	def function ColorManagementService
		name "Color Management Service"
		description "Service for managing LED color schemes and state-based color transitions."
		owner "HMI Team"
		tags "color", "management", "service"
		safetylevel ASIL-B
		enables LEDColors

	def function AdaptiveBrightnessProcessor
		name "Adaptive Brightness Processor"
		description "Processor for automatic brightness adjustment based on ambient light conditions."
		owner "HMI Team"
		tags "brightness", "adaptive", "processor"
		safetylevel QM
		enables LEDBrightness

	def function InstrumentClusterInterface
		name "Instrument Cluster Interface"
		description "Interface for communicating with and controlling instrument cluster displays."
		owner "HMI Team"
		tags "instrument", "cluster", "interface"
		safetylevel ASIL-B
		enables InstrumentDisplay, DisplayPosition, CentralWarningArea, StatusBar

	def function DisplayLayoutEngine
		name "Display Layout Engine"
		description "Engine for managing display positioning and layout configurations."
		owner "HMI Team"
		tags "display", "layout", "engine"
		safetylevel QM
		enables DisplayPosition, CentralWarningArea, StatusBar

	def function WarningAreaRenderer
		name "Warning Area Renderer"
		description "Renderer for displaying status information in central warning display areas."
		owner "HMI Team"
		tags "warning", "area", "renderer"
		safetylevel QM
		enables CentralWarningArea

	def function StatusBarController
		name "Status Bar Controller"
		description "Controller for managing dedicated status bar displays and information."
		owner "HMI Team"
		tags "status", "bar", "controller"
		safetylevel QM
		enables StatusBar

	def function ActuationSystemManager
		name "Actuation System Manager"
		description "High-level manager for all physical actuation mechanisms and hardware coordination."
		owner "Hardware Team"
		tags "actuation", "system", "manager"
		safetylevel ASIL-D
		enables ActuatorSystem, ActuatorType, CablePullerActuator, CaliperIntegratedActuator

	def function ActuatorTypeSelector
		name "Actuator Type Selector"
		description "Selector and configuration manager for different actuator mechanism types."
		owner "Hardware Team"
		tags "actuator", "type", "selector"
		safetylevel ASIL-D
		enables ActuatorType, CablePullerActuator, CaliperIntegratedActuator

	def function CableDriveController
		name "Cable Drive Controller"
		description "Controller for cable-puller actuator mechanisms and cable-based operations."
		owner "Hardware Team"
		tags "cable", "drive", "controller"
		safetylevel ASIL-C
		enables CablePullerActuator, CableMonitoring, CableEmergencyRelease

	def function CableHealthMonitor
		name "Cable Health Monitor"
		description "Monitor for cable tension, condition, and health status tracking."
		owner "Hardware Team"
		tags "cable", "health", "monitor"
		safetylevel ASIL-C
		enables CableMonitoring

	def function EmergencyReleaseValve
		name "Emergency Release Valve"
		description "Emergency release mechanism and valve controller for cable systems."
		owner "Safety Team"
		tags "emergency", "release", "valve"
		safetylevel ASIL-B
		enables CableEmergencyRelease

	def function CaliperActuationDriver
		name "Caliper Actuation Driver"
		description "Driver for caliper-integrated actuator mechanisms and direct caliper control."
		owner "Hardware Team"
		tags "caliper", "actuation", "driver"
		safetylevel ASIL-D
		enables CaliperIntegratedActuator, PositionSensing, ForceControl

	def function PositionSensorInterface
		name "Position Sensor Interface"
		description "Interface for position sensing hardware and sensor data processing."
		owner "Hardware Team"
		tags "position", "sensor", "interface"
		safetylevel ASIL-D
		enables PositionSensing

	def function ForceRegulationModule
		name "Force Regulation Module"
		description "Module for precise force control and clamping force regulation."
		owner "Hardware Team"
		tags "force", "regulation", "module"
		safetylevel ASIL-C
		enables ForceControl

	def function AutomationCoordinator
		name "Automation Coordinator"
		description "Coordinator for all automatic def function operations and feature orchestration."
		owner "Software Team"
		tags "automation", "coordinator", "functions"
		safetylevel ASIL-B
		enables AutomaticFunctions, AutoHold, HillStartAssist

	def function AutoHoldStateMachine
		name "Auto-Hold State Machine"
		description "State machine for auto-hold functionality and standstill brake management."
		owner "Software Team"
		tags "autohold", "state", "machine"
		safetylevel ASIL-B
		enables AutoHold, AutoHoldActivation, ManualActivation, AutomaticActivation

	def function ActivationModeSelector
		name "Activation Mode Selector"
		description "Selector for different auto-hold activation modes and trigger mechanisms."
		owner "Software Team" 
		tags "activation", "mode", "selector"
		safetylevel ASIL-B
		enables AutoHoldActivation, ManualActivation, AutomaticActivation

	def function ManualTriggerProcessor
		name "Manual Trigger Processor"
		description "Processor for manual activation triggers and user-initiated auto-hold control."
		owner "Software Team"
		tags "manual", "trigger", "processor"
		safetylevel ASIL-B
		enables ManualActivation

	def function ConditionalActivationEngine
		name "Conditional Activation Engine"
		description "Engine for automatic activation based on driving conditions and vehicle state."
		owner "Software Team"
		tags "conditional", "activation", "engine"
		safetylevel ASIL-B
		enables AutomaticActivation

	def function HillAssistLogicController
		name "Hill Assist Logic Controller"
		description "Logic controller for hill-start assist functionality and rollback prevention."
		owner "Software Team"
		tags "hill", "assist", "logic"
		safetylevel ASIL-C
		enables HillStartAssist, SlopeDetection, ReleaseLogic

	def function InclinationDetectionService
		name "Inclination Detection Service"
		description "Service for detecting vehicle inclination and slope angle measurement."
		owner "Software Team"
		tags "inclination", "detection", "service"
		safetylevel ASIL-C
		enables SlopeDetection

	def function ReleaseStrategyManager
		name "Release Strategy Manager"
		description "Manager for different hill-assist release strategies and logic coordination."
		owner "Software Team"
		tags "release", "strategy", "manager"
		safetylevel ASIL-C
		enables ReleaseLogic, ThrottleBasedRelease, ClutchBasedRelease, TimeBasedRelease

	def function ThrottleMonitoringService
		name "Throttle Monitoring Service"
		description "Service for monitoring throttle input and throttle-based release triggers."
		owner "Software Team"
		tags "throttle", "monitoring", "service"
		safetylevel ASIL-C
		enables ThrottleBasedRelease

	def function ClutchEngagementDetector
		name "Clutch Engagement Detector"
		description "Detector for clutch engagement point and manual transmission release triggers."
		owner "Software Team"
		tags "clutch", "engagement", "detector"
		safetylevel ASIL-C
		enables ClutchBasedRelease

	def function TimerBasedReleaseService
		name "Timer-Based Release Service"
		description "Service for time-based release mechanisms and timeout management."
		owner "Software Team"
		tags "timer", "release", "service"
		safetylevel ASIL-C
		enables TimeBasedRelease

	def function SystemHealthSupervisor
		name "System Health Supervisor"
		description "Supervisor for overall system health monitoring and diagnostic coordination."
		owner "Diagnostics Team"
		tags "health", "supervisor", "diagnostics"
		safetylevel ASIL-D
		enables Diagnostics, FaultDetection, DiagnosticReporting

	def function FaultDetectionAlgorithm
		name "Fault Detection Algorithm"
		description "Advanced algorithm for fault detection, analysis, and system health assessment."
		owner "Diagnostics Team"
		tags "fault", "detection", "algorithm"
		safetylevel ASIL-D
		enables FaultDetection

	def function DiagnosticReportingGateway
		name "Diagnostic Reporting Gateway"
		description "Gateway for diagnostic data reporting and external system communication."
		owner "Diagnostics Team"
		tags "diagnostic", "reporting", "gateway"
		safetylevel ASIL-C
		enables DiagnosticReporting, ReportingProtocol

	def function CommunicationProtocolManager
		name "Communication Protocol Manager"
		description "Manager for diagnostic communication protocols and data exchange standards."
		owner "Diagnostics Team"
		tags "communication", "protocol", "manager"
		safetylevel ASIL-C
		enables ReportingProtocol, OBDProtocol, ProprietaryProtocol

	def function OBDComplianceInterface
		name "OBD Compliance Interface"
		description "Interface for OBD-II standard compliance and standardized diagnostic reporting."
		owner "Diagnostics Team"
		tags "OBD", "compliance", "interface"
		safetylevel ASIL-C
		enables OBDProtocol

	def function ProprietaryCommStack
		name "Proprietary Communication Stack"
		description "Communication stack for manufacturer-specific diagnostic protocols and reporting."
		owner "Diagnostics Team"
		tags "proprietary", "communication", "stack"
		safetylevel ASIL-C
		enables ProprietaryProtocol