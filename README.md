# Tidy-Bot: Autonomous Object Clearing for AgileX Limo

An advanced autonomous robotics simulation developed for the **Autonomous Systems and Robotics** assessment. This project serves as a high-fidelity "Digital Twin" for the AgileX Limo platform, implementing a reactive state machine to identify, target, and clear objects from designated patches within a constrained arena.

## 🚀 Project Overview

The **Tidy-Bot** system is designed to automate the process of clearing an arena of debris (represented by colored boxes). The robot utilizes a combination of simulated LiDAR for obstacle avoidance and a Vision-based HSV masking pipeline for object detection. 

The simulation environment mirrors the physical constraints of a standard 10m x 10m robotics arena, enforcing hard boundaries and realistic object-robot interactions.

### Key Technical Features
- **Reactive State Machine:** A robust control loop managing transitions between 8 distinct logic states.
- **Vision Pipeline Simulation:** Real-time HSV filtering simulation with interactive calibration sliders.
- **Obstacle Avoidance:** Reactive steering logic using simulated LiDAR data to navigate around static pillars.
- **Strategic Home-Base Logic:** Automatic "Return to Center" behavior after task completion to optimize sensor coverage for the next search.
- **Power Management:** Integrated battery depletion and "Return to Charge" safety protocols.

---

## 🛠 System Requirements

To run this simulation locally, ensure your environment meets the following specifications:

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Browser:** Modern evergreen browser (Chrome, Firefox, Edge, or Safari) with WebGL 2.0 support.
- **Hardware:** Dedicated GPU recommended for optimal 60FPS performance in the 3D view.

---

## 📦 Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/tidy-bot-limo.git
   cd tidy-bot-limo
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Standard React/Vite setup. No additional `.env` files are required for the core simulation.

---

## 🏃 How to Run

1. **Start the Development Server:**
   ```bash
   npm run dev
   ```

2. **Access the Dashboard:**
   Open your browser and navigate to `http://localhost:3000`.

3. **Initialize the Mission:**
   - Click the **INITIALIZE MISSION** button in the top header to start the autonomous control loop.
   - Use the **Reset** button (circular arrow) to restore the arena and robot to their starting positions at any time.
   - Adjust the **Simulation Speed (RTF)** slider in the right panel to toggle between Real-Time (1.0x) and Turbo (5.0x) modes.

---

## 🧠 Control Logic: The State Machine

The robot's "brain" is built on a non-linear reactive state machine. This approach was chosen over simple linear scripts to ensure the robot can handle dynamic interruptions (like hitting a wall or encountering an obstacle).

| State | Description |
| :--- | :--- |
| **IDLE** | System standby; waiting for user initialization. |
| **SEARCHING** | 360-degree rotation to scan for colored targets using the HSV vision mask. |
| **TARGETING** | PID-based heading correction to align the robot with the detected object. |
| **PUSHING** | Linear acceleration toward the target until the object is cleared from its patch. |
| **REVERSING** | Safety maneuver after a successful push or boundary collision. |
| **RETURNING** | Strategic navigation back to `(0,0)` to reset the search area. |
| **AVOIDING** | Reactive obstacle avoidance triggered by LiDAR proximity sensors. |
| **CHARGING** | Emergency return-to-base triggered by low battery levels (<15%). |

---

## 📊 Assessment Rubric Alignment

This project was developed with specific focus on the following criteria:

### Criterion 1: Basic Functionality
The robot successfully clears all 4 boxes from their starting patches. "Cleared" is defined as moving an object >1.5m from its origin, evidenced by the emissive glow effect applied to cleared objects.

### Criterion 2: Performance Evaluation
The **Evaluation** tab provides a quantitative breakdown of the mission. Metrics include Success Rate, Off-Patch Accuracy, and Average Time to Clear. These metrics are used to validate the control strategy against real-world Limo performance.

### Criterion 3: Advanced Complexity
- **Multi-Object Environment:** Handling 4 distinct targets and 4 static obstacles.
- **Digital Twin Fidelity:** Implementation of hard boundaries and corner recovery logic.
- **Sensor Simulation:** Visual representation of LiDAR scans and Vision HSV masks.

---

## 📂 Project Structure

- `/src/App.tsx`: Core application logic, state machine, and UI components.
- `/src/main.tsx`: Entry point.
- `/src/index.css`: Tailwind CSS configuration and global styles.
- `/public/`: Static assets (if any).

---

## 📝 Future Improvements
- **Path Planning:** Transition from reactive avoidance to A* or Dijkstra global path planning.
- **SLAM Integration:** Implementing a 2D occupancy grid map based on LiDAR data.
- **Multi-Robot Coordination:** Swarm logic for clearing larger arenas with multiple Limo units.

---

**Author:** Kevin Byamukama
**Course:** Autonomous Systems and Robotics  
**Date:** March 2026
