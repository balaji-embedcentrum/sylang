# Sprint Planning (.spr)

## Overview
Defines **agile sprints, epics, stories, and tasks** with agent assignments and complete traceability.

## File Structure
- **ONE** `hdef sprint` per file
- **MULTIPLE** hierarchical `def epic/story/task`
- Can `use` agentsets

## Valid Keywords
```
use, hdef, sprint, def, epic, story, task, name, description, owner, 
startdate, enddate, issuestatus, priority, assignedto, points, 
outputfile, comment, ref, agent
```

## Syntax Structure
```
use agentset [agentset-ref]

hdef sprint [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  startdate [YYYY-MM-DD]
  enddate [YYYY-MM-DD]
  comment [string-literal]

  def epic [identifier]
    name [string-literal]
    description [string-literal]
    assignedto ref agent [agent-ref]
    issuestatus [open|in-progress|closed|blocked]
    priority [critical|high|medium|low]
    comment [string-literal]
    
    def story [identifier]
      name [string-literal]
      description [string-literal]
      assignedto ref agent [agent-ref]
      issuestatus [open|in-progress|closed|blocked]
      priority [critical|high|medium|low]
      points [numeric-value]
      
      def task [identifier]
        name [string-literal]
        description [string-literal]
        assignedto ref agent [agent-ref]
        issuestatus [open|in-progress|closed|blocked]
        priority [critical|high|medium|low]
        points [numeric-value]
        outputfile [file-path]
```

## Complete Example
```sylang
use agentset AutonomousVehicleAgents

hdef sprint AutonomousVehicleDevelopmentSprint
  name "Autonomous Vehicle L3 System Development Sprint"
  description "Complete autonomous vehicle system design and implementation"
  owner "Autonomous Systems Program Manager"
  startdate "2025-09-01"
  enddate "2025-12-15"
  comment """
    This sprint covers the complete development lifecycle for L3 autonomous 
    vehicle system. Key focus areas include perception, safety validation, 
    and ISO 26262 compliance.
    """

  def epic PerceptionSystemDevelopment
    name "Perception System Architecture and Implementation"
    description "Design and implement complete perception system"
    assignedto ref agent PerceptionSystemsAgent
    issuestatus open
    priority critical
    comment """
      Epic focuses on core perception capabilities for autonomous vehicle.
      Includes requirements definition, sensor fusion implementation, and 
      safety validation.
      """

    def story PerceptionRequirements
      name "Perception System Requirements Definition"
      description "Define comprehensive requirements for perception system"
      assignedto ref agent SafetyRequirementsAgent
      issuestatus open
      priority critical

      def task PerceptionFunctionalRequirements
        name "Perception Functional Requirements"
        description "Define functional requirements for object detection and tracking"
        assignedto ref agent PerceptionSystemsAgent
        issuestatus open
        priority critical
        points "13"
        outputfile "requirements/PerceptionFunctionalRequirements.req"

      def task PerceptionSafetyRequirements
        name "Perception Safety Requirements"
        description "Define ASIL-D safety requirements for perception system"
        assignedto ref agent SafetyRequirementsAgent
        issuestatus backlog
        priority critical
        points "21"
        outputfile "requirements/PerceptionSafetyRequirements.req"
```

## Issue Status
```
issuestatus backlog    # Backlog
issuestatus open       # Open
issuestatus inprogress # In progress
issuestatus blocked    # Blocked
issuestatus canceled   # Canceled
issuestatus done       # Done
```

## Priority
```
priority low       # Low priority
priority medium    # Medium priority
priority high      # High priority
priority critical  # Critical priority
```

---
Use `comment` for multiline descriptions on epics, stories, and tasks.

