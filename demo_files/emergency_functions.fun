// Emergency Functions for ADAS
def functiongroup safety_functions
    name "Safety Critical Functions"
    description "Core safety functions for ADAS"
    safetylevel ASIL-D
    category software
    
    def function emergency_braking
        name "Emergency Braking Function" 
        description "Applies emergency brakes to prevent collision"
        input "obstacle_distance"
        input "vehicle_speed"
        output "brake_pressure"
        algorithm "collision_avoidance"
        performance "< 100ms response time"
        safetylevel ASIL-D
        
        partof system
        allocatedto component brake_control_unit
        calls function calculate_braking_distance
        invokes function apply_brake_pressure
        
    def function calculate_braking_distance
        name "Calculate Braking Distance"
        description "Calculates required braking distance"
        input "current_speed"
        input "road_conditions"
        output "stopping_distance"
        complexity "O(1)"
        safetylevel ASIL-C
        
        returns "distance_meters"
        partof module physics_calculator

use components brake_control_unit, physics_calculator 