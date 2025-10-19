# Agent Definition (.agt)

## Overview
Defines **AI agents** with specialized expertise for systems engineering tasks.

## File Structure
- **ONE** `hdef agentset` per file
- **MULTIPLE** `def agent` statements

## Valid Keywords
```
use, hdef, agentset, def, agent, name, description, owner, role, 
specialization, expertise, context
```

## Syntax Structure
```
hdef agentset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]

  def agent [identifier]
    name [string-literal]
    description [string-literal]
    role [string-literal]
    specialization [string-literal]
    expertise [string-literal]
    context [string-literal]
```

## Complete Example
```sylang
hdef agentset AutonomousVehicleAgents
  name "Autonomous Vehicle Engineering Agents"
  description "Specialized AI agents for autonomous vehicle systems engineering"
  owner "AI Engineering Team"

  def agent PerceptionSystemsAgent
    name "Perception Systems Engineering Agent"
    description """
      Expert in autonomous vehicle perception systems, sensor fusion, and 
      computer vision. Specialized in developing safety-critical perception 
      algorithms for Level 3 autonomous vehicles with deep knowledge of 
      ISO 26262 compliance.
      """
    role "Perception Systems Engineer"
    specialization "Autonomous Vehicle Perception"
    expertise """
      Sensor fusion algorithms including Kalman filtering and particle filters
      Computer vision and deep learning for object detection
      Machine learning model optimization for automotive edge computing
      Real-time processing and deterministic system design
      Multi-modal sensor integration (camera, LiDAR, radar)
      Safety-critical software development per ISO 26262
      """
    context """
      Autonomous vehicles and ADAS systems development
      Multi-sensor perception systems for safety-critical applications
      ASIL-D compliance and functional safety requirements
      Object detection and tracking in dynamic environments
      Environmental perception for highway and urban driving scenarios
      """

  def agent FunctionalSafetyAgent
    name "Functional Safety Engineering Agent"
    description "Specialist in automotive functional safety and ISO 26262"
    role "Functional Safety Engineer"
    specialization "Automotive Functional Safety"
    expertise "ISO 26262", "Hazard analysis", "FMEA", "Fault tree analysis", "ASIL assessment"
    context "Automotive safety", "Risk assessment", "Safety mechanisms", "Failure analysis"

  def agent SafetyRequirementsAgent
    name "Safety Requirements Engineering Agent"
    description "Expert in safety-critical requirements engineering"
    role "Safety Requirements Engineer"
    specialization "Safety Requirements Engineering"
    expertise "Safety requirements", "Requirements traceability", "Verification", "Validation"
    context "Safety-critical systems", "ASIL requirements", "Requirements validation"
```

## Agent Properties
- `name` - Human-readable agent name
- `description` - Detailed agent description (multiline supported)
- `role` - Engineering role
- `specialization` - Domain specialization
- `expertise` - Technical expertise areas (multiline supported)
- `context` - Application context (multiline supported)

---
Referenced in `.spr` files with `assignedto ref agent [agent-ref]`

