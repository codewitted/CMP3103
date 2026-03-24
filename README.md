# Tidy-Bot ROS2 Package

This repository contains the software artefact for the Autonomous Mobile Robots (CMP3103/CMP9050) coursework.

## Project Structure
- `tidy_bot/`: The ROS2 package directory.
- `tidy_bot/tidy_bot_node.py`: The main autonomous control node.
- `dashboard/`: A web-based simulation and telemetry dashboard (React/Vite).

## How to Run (Simulation)
1. Ensure you are in the provided DevContainer with ROS2 Humble/Foxy installed.
2. Source your ROS2 environment: `source /opt/ros/humble/setup.bash`
3. Navigate to your workspace and build: `colcon build --packages-select tidy_bot`
4. Source the workspace: `source install/setup.bash`
5. Launch the Limo simulation (Gazebo): `ros2 launch limo_gazebo limo_gazebo_arena.launch.py`
6. Run the Tidy-Bot node: `ros2 run tidy_bot tidy_bot_node`

## Complexity Levels Implemented
- **Level 1**: Basic clearing of colored patches using reactive behaviors.
- **Level 2**: Color discrimination using OpenCV HSV masking to target specific objects.
- **Level 3**: Integration with Nav2 for global path planning and obstacle avoidance.

## Dashboard Features
The included web dashboard provides:
- 3D Visualization of the robot state.
- Simulated LiDAR and Camera feeds.
- Real-time state machine monitoring.
- Teleoperation controls for manual override.
