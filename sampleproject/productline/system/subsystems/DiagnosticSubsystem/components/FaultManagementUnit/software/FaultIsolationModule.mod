softwaremodule FaultIsolationModule
  name "Fault Isolation Module"
  description "Software module responsible for isolation decision making, safety barrier control, component disconnection management, redundancy activation, and recovery strategy selection"
  owner "Diagnostics Team"
  tags "fault-isolation", "safety-barriers", "component-disconnection", "redundancy-activation"
  safetylevel ASIL-D
  partof FaultManagementUnit
  implements IsolationDecisionEngine, SafetyBarrierController, ComponentDisconnectionManager, RedundancyActivationController, RecoveryStrategySelector
  interfaces
    input isolation_requests "Fault isolation requests and safety containment requirements"
    input system_topology "System topology and redundancy configuration information"
    output isolation_decisions "Intelligent fault isolation decisions and implementation strategies"
    output safety_barriers "Safety barrier control and fault propagation prevention"
    output disconnection_manager "Safe component disconnection and isolation management"
    output redundancy_controller "Redundant system activation and failover control"
    output recovery_selector "Optimal recovery strategy selection and implementation"
