use featureset InverterFeatures

def functiongroup InverterFunctions
	def function PowerElectronicsController
		name "Power Electronics Controller"
		description "Main controller for all power electronics operations and switching control"
		owner "Power Electronics Team"
		tags "power-electronics", "controller", "switching"
		asil D
		enables feature InverterSystem, PowerConversion, DCBusManagement, IGBTDrivers

	def function MotorControlAlgorithmEngine
		name "Motor Control Algorithm Engine"
		description "Advanced motor control algorithms including field-oriented control"	
		owner "Controls Team"
		tags "motor-control", "algorithms", "FOC"
		asil D		
		enables feature MotorControl, VectorControl, SpaceVectorPWM

	def function TorqueManagementProcessor
		name "Torque Management Processor"
		description "Precise torque control and torque vectoring processing unit"
		owner "Controls Team"
		tags "torque", "management", "vectoring"
		asil D
		enables feature TorqueControl

	def function SpeedRegulationController
		name "Speed Regulation Controller"
		description "Motor speed regulation and cruise control support processing"
		owner "Controls Team"
		tags "speed", "regulation", "cruise"
		asil C
		enables feature SpeedControl

	def function ThermalManagementSystem
		name "Thermal Management System"
		description "Active thermal monitoring and cooling system coordination"
		owner "Thermal Team"
		tags "thermal", "cooling", "monitoring"
		asil C
		enables feature ThermalManagement, CoolingMethod

	def function CoolantFlowController
		name "Coolant Flow Controller"
		description "Liquid cooling system control and pump management unit"
		owner "Thermal Team"
		tags "coolant", "liquid-cooling", "pump"
		asil B
		enables feature CoolantControl

	def function AirCoolingManager
		name "Air Cooling Manager"
		description "Variable speed fan control for air cooling management"
		owner "Thermal Team"
		tags "air-cooling", "fan-control", "variable-speed"
		asil QM
		enables feature FanControl

	def function SafetyMonitoringEngine
		name "Safety Monitoring Engine"
		description "Comprehensive safety monitoring and fault management coordinator"
		owner "Safety Team"
		tags "safety", "monitoring", "fault-management"
		asil D
		enables feature SafetySystems

	def function OvervoltageProtectionUnit
		name "Overvoltage Protection Unit"
		description "DC bus and AC output overvoltage protection system"
		owner "Safety Team"
		tags "overvoltage", "protection", "safety"
		asil D
		enables feature OvervoltageProtection

	def function OvercurrentProtectionUnit
		name "Overcurrent Protection Unit"
		description "Phase current and DC bus overcurrent protection system"
		owner "Safety Team"
		tags "overcurrent", "protection", "current-limiting"
		asil D
		enables feature OvercurrentProtection

	def function ShortCircuitDetector
		name "Short Circuit Detector"
		description "Fast short circuit detection and protection system"
		owner "Safety Team"
		tags "short-circuit", "detection", "protection"
		asil D
		enables feature ShortCircuitProtection

	def function ThermalProtectionMonitor
		name "Thermal Protection Monitor"
		description "Junction and coolant temperature monitoring and protection"
		owner "Safety Team"
		tags "thermal-protection", "temperature", "monitoring"
		asil C
		enables feature OvertemperatureProtection

	def function IsolationMonitoringSystem
		name "Isolation Monitoring System"
		description "High-voltage isolation monitoring and fault detection system"
		owner "Safety Team"
		tags "isolation", "HV-monitoring", "insulation"
		asil D
		enables feature IsolationMonitoring

	def function CommunicationInterface
		name "Communication Interface"
		description "Vehicle network communication and data exchange coordinator"
		owner "Communication Team"
		tags "communication", "vehicle-network", "interface"
		asil C
		enables feature CommunicationInterfaces

	def function CANBusController
		name "CAN Bus Controller"
		description "Controller Area Network interface for vehicle communication"
		owner "Communication Team"
		tags "CAN", "bus-controller", "automotive"
		asil C
		enables feature CANInterface

	def function EthernetProcessor
		name "Ethernet Processor"
		description "High-speed Ethernet interface for advanced diagnostics"
		owner "Communication Team"
		tags "ethernet", "diagnostics", "high-speed"
		asil QM
		enables feature EthernetInterface

	def function DiagnosticCoordinator
		name "Diagnostic Coordinator"
		description "Comprehensive system diagnostics and fault reporting coordinator"
		owner "Diagnostics Team"
		tags "diagnostics", "fault-reporting", "coordinator"
		asil C
		enables feature Diagnostics

	def function OBDComplianceInterface
		name "OBD Compliance Interface"
		description "On-board diagnostics compliance for regulatory requirements"
		owner "Diagnostics Team"
		tags "OBD", "compliance", "regulations"
		asil C
		enables feature OBDCompliance

	def function FaultMemoryManager
		name "Fault Memory Manager"
		description "Non-volatile fault memory storage and retrieval system"
		owner "Diagnostics Team"
		tags "fault-memory", "non-volatile", "storage"
		asil C
		enables feature FaultMemory

	def function SensorInterfaceController
		name "Sensor Interface Controller"
		description "Interface controller for position, current, and temperature sensors"
		owner "Sensor Team"
		tags "sensors", "interface", "measurement"
		asil D
		enables feature SensorInterfaces

	def function CurrentSensingInterface
		name "Current Sensing Interface"
		description "Phase current measurement using hall-effect sensors"
		owner "Sensor Team"
		tags "current-sensing", "hall-effect", "measurement"
		asil D
		enables feature CurrentSensing

	def function PositionSensingInterface
		name "Position Sensing Interface"
		description "Rotor position sensing using resolver or encoder interface"
		owner "Sensor Team"
		tags "position-sensing", "resolver", "encoder"
		asil D
		enables feature PositionSensing

	def function TemperatureSensingInterface
		name "Temperature Sensing Interface"
		description "IGBT junction and coolant temperature measurement interface"
		owner "Sensor Team"
		tags "temperature-sensing", "thermal-monitoring", "NTC"
		asil C
		enables feature TemperatureSensing

	def function PowerModeManager
		name "Power Mode Manager"
		description "System power state management and energy optimization coordinator"
		owner "Power Management Team"
		tags "power-modes", "energy-optimization", "state-management"
		asil B
		enables feature PowerModes

	def function SleepModeController
		name "Sleep Mode Controller"
		description "Low-power sleep mode control for energy conservation"
		owner "Power Management Team"
		tags "sleep-mode", "low-power", "energy-saving"
		asil QM
		enables feature SleepMode

	def function RegenerativeBrakingController
		name "Regenerative Braking Controller"
		description "Energy recovery control during braking and deceleration"	
		owner "Controls Team"
		tags "regenerative-braking", "energy-recovery", "efficiency"
		asil C
		enables feature RegenerativeBraking

	def function EMCComplianceManager
		name "EMC Compliance Manager"
		description "Electromagnetic compatibility and interference management coordinator"
		owner "EMC Team"
		tags "EMC", "electromagnetic", "compliance"
		asil QM
		enables feature EMCCompliance

	def function EMIFilteringController
		name "EMI Filtering Controller"
		description "Electromagnetic interference filtering and suppression controller"
		owner "EMC Team"
		tags "EMI", "filtering", "suppression"
		asil QM
		enables feature EMIFiltering
