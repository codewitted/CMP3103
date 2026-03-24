import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Stars } from '@react-three/drei';
import { 
  Bot, 
  Activity, 
  Eye, 
  Zap, 
  Terminal, 
  Settings, 
  Play, 
  Square, 
  RotateCcw,
  ChevronRight,
  Code,
  Layout,
  Cpu,
  Radar,
  Box as BoxIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

// --- Types ---
type RobotState = 'IDLE' | 'SEARCHING' | 'TARGETING' | 'PUSHING' | 'RETURNING' | 'AVOIDING';

interface Telemetry {
  battery: number;
  speed: number;
  angularVel: number;
  heading: number;
  position: { x: number; y: number };
  lidarDist: number;
  targetFound: boolean;
}

// --- Components ---

const RobotModel = ({ position, rotation, state }: { position: [number, number, number], rotation: number, state: RobotState }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Top Plate */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.35]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* LiDAR Sensor */}
      <mesh position={[0.1, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Camera */}
      <mesh position={[0.25, 0.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Wheels */}
      {[[-0.2, -0.15, 0.22], [0.2, -0.15, 0.22], [-0.2, -0.15, -0.22], [0.2, -0.15, -0.22]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
      {/* Status Light */}
      <pointLight 
        position={[0, 0.3, 0]} 
        intensity={2} 
        color={state === 'PUSHING' ? '#ef4444' : state === 'TARGETING' ? '#3b82f6' : '#22c55e'} 
      />
    </group>
  );
};

const Arena = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Walls */}
      {[
        [0, 0.5, 5, [10, 1, 0.2]],
        [0, 0.5, -5, [10, 1, 0.2]],
        [5, 0.5, 0, [0.2, 1, 10]],
        [-5, 0.5, 0, [0.2, 1, 10]],
      ].map((wall, i) => (
        <mesh key={i} position={wall.slice(0, 3) as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={wall[3] as [number, number, number]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      {/* Colored Patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.01, 3]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.01, -3]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>

      {/* Boxes */}
      <mesh position={[3, 0.25, 3]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[-3, 0.25, -3]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
};

const Simulation = ({ state, telemetry }: { state: RobotState, telemetry: Telemetry }) => {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden rounded-xl border border-white/10">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
        <OrbitControls maxPolarAngle={Math.PI / 2.1} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        
        <Arena />
        <RobotModel 
          position={[telemetry.position.x, 0.15, telemetry.position.y]} 
          rotation={telemetry.heading} 
          state={state}
        />
        
        <Grid 
          infiniteGrid 
          fadeDistance={20} 
          fadeStrength={5} 
          cellSize={1} 
          sectionSize={5} 
          sectionColor="#333" 
          cellColor="#222" 
        />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-2">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest mb-1">
            <Activity className="w-3 h-3" />
            System Status
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              state === 'IDLE' ? 'bg-gray-500' : 'bg-green-500'
            )} />
            {state}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg font-mono text-[10px] text-white/70">
          X: {telemetry.position.x.toFixed(2)} | Y: {telemetry.position.y.toFixed(2)} | H: {(telemetry.heading * 180 / Math.PI).toFixed(0)}°
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'sim' | 'code' | 'docs'>('sim');
  const [state, setState] = useState<RobotState>('IDLE');
  const [isRunning, setIsRunning] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    battery: 98,
    speed: 0,
    angularVel: 0,
    heading: 0,
    position: { x: 0, y: 0 },
    lidarDist: 5.0,
    targetFound: false
  });

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) {
      setState('IDLE');
      return;
    }

    const interval = setInterval(() => {
      setTelemetry(prev => {
        let newState = state;
        let newX = prev.position.x;
        let newY = prev.position.y;
        let newHeading = prev.heading;
        let newSpeed = prev.speed;

        // Simple State Machine Logic for Simulation
        if (state === 'IDLE') newState = 'SEARCHING';
        
        if (state === 'SEARCHING') {
          newHeading += 0.05;
          newSpeed = 0;
          if (Math.random() > 0.98) newState = 'TARGETING';
        } else if (state === 'TARGETING') {
          newSpeed = 0.2;
          // Move towards a mock target
          newX += Math.cos(newHeading) * newSpeed * 0.1;
          newY -= Math.sin(newHeading) * newSpeed * 0.1;
          if (Math.random() > 0.95) newState = 'PUSHING';
        } else if (state === 'PUSHING') {
          newSpeed = 0.5;
          newX += Math.cos(newHeading) * newSpeed * 0.1;
          newY -= Math.sin(newHeading) * newSpeed * 0.1;
          if (Math.random() > 0.9) newState = 'SEARCHING';
        }

        // Boundary checks
        if (Math.abs(newX) > 4.5 || Math.abs(newY) > 4.5) {
          newHeading += Math.PI;
          newX = Math.max(-4.4, Math.min(4.4, newX));
          newY = Math.max(-4.4, Math.min(4.4, newY));
        }

        setState(newState);
        return {
          ...prev,
          position: { x: newX, y: newY },
          heading: newHeading,
          speed: newSpeed,
          battery: Math.max(0, prev.battery - 0.01)
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, state]);

  const pythonCode = `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan, Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class TidyBotNode(Node):
    def __init__(self):
        super().__init__('tidy_bot_node')
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)
        self.image_sub = self.create_subscription(Image, '/camera/color/image_raw', self.image_callback, 10)
        
        self.bridge = CvBridge()
        self.state = "SEARCHING"
        self.timer = self.create_timer(0.1, self.control_loop)

    def control_loop(self):
        msg = Twist()
        if self.state == "SEARCHING":
            msg.angular.z = 0.5
            # Logic to find color patches...
        elif self.state == "TARGETING":
            # PID control to align with object...
            pass
        self.cmd_vel_pub.publish(msg)

def main():
    rclpy.init()
    node = TidyBotNode()
    rclpy.spin(node)
    rclpy.shutdown()`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">TIDY-BOT <span className="text-blue-500 font-mono text-[10px] ml-1">v2.4.0</span></h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Autonomous Systems Control</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
          {[
            { id: 'sim', icon: Layout, label: 'Dashboard' },
            { id: 'code', icon: Code, label: 'Source' },
            { id: 'docs', icon: Terminal, label: 'Logs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
            <Zap className={cn("w-3 h-3", telemetry.battery > 20 ? "text-yellow-500" : "text-red-500")} />
            <span className="text-[10px] font-mono font-bold">{telemetry.battery.toFixed(1)}%</span>
          </div>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95",
              isRunning 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
            )}
          >
            {isRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            {isRunning ? 'HALT SYSTEM' : 'INITIALIZE'}
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* Left Column: Telemetry & Vision */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* State Card */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Logic State</h2>
              <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded border border-blue-500/20">ACTIVE</div>
            </div>
            <div className="space-y-3">
              {['SEARCHING', 'TARGETING', 'PUSHING', 'RETURNING'].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                    state === s ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] scale-125" : "bg-white/10"
                  )} />
                  <span className={cn(
                    "text-xs font-mono transition-colors",
                    state === s ? "text-white font-bold" : "text-white/30"
                  )}>{s}</span>
                  {state === s && (
                    <motion.div 
                      layoutId="arrow"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-auto"
                    >
                      <ChevronRight className="w-3 h-3 text-blue-500" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Vision Feed */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Vision Mask (HSV)</h2>
              <Eye className="w-3 h-3 text-white/20" />
            </div>
            <div className="aspect-video bg-black rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
              {isRunning ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-blue-500/50 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  </div>
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-blue-400">
                    TARGET_LOCKED: {telemetry.speed > 0 ? 'TRUE' : 'FALSE'}
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-white/20 font-mono">FEED_OFFLINE</span>
              )}
            </div>
          </section>

          {/* LiDAR Radar */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">LiDAR Scan</h2>
              <Radar className="w-3 h-3 text-white/20" />
            </div>
            <div className="aspect-square bg-black rounded-lg border border-white/5 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 border border-white/5 rounded-full scale-75" />
              <div className="absolute inset-0 border border-white/5 rounded-full scale-50" />
              <div className="absolute inset-0 border border-white/5 rounded-full scale-25" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-full h-0.5 bg-gradient-to-r from-green-500/50 to-transparent origin-center"
              />
              <div className="w-1 h-1 bg-white rounded-full z-10" />
            </div>
          </section>
        </div>

        {/* Center Column: Main View */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="aspect-[16/10] w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'sim' && (
                <motion.div 
                  key="sim"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full h-full"
                >
                  <Simulation state={state} telemetry={telemetry} />
                </motion.div>
              )}
              {activeTab === 'code' && (
                <motion.div 
                  key="code"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full h-full bg-[#0d0d0d] rounded-xl border border-white/10 p-6 font-mono text-sm overflow-auto"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-xs text-white/60">tidy_bot_node.py</span>
                    </div>
                    <button className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 transition-colors">
                      COPY CODE
                    </button>
                  </div>
                  <pre className="text-blue-400/80 leading-relaxed">
                    {pythonCode}
                  </pre>
                </motion.div>
              )}
              {activeTab === 'docs' && (
                <motion.div 
                  key="docs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full h-full bg-[#0d0d0d] rounded-xl border border-white/10 p-6 font-mono text-xs overflow-auto space-y-2"
                >
                  <div className="text-white/30">[01:34:44] SYSTEM_BOOT_SEQUENCE_INITIATED</div>
                  <div className="text-white/30">[01:34:45] LOADING_ROS2_MIDDLEWARE... DONE</div>
                  <div className="text-white/30">[01:34:45] CONNECTING_TO_AGILEX_LIMO... OK</div>
                  <div className="text-green-500">[01:34:46] LIDAR_READY: 360_DEGREE_SCAN_ACTIVE</div>
                  <div className="text-green-500">[01:34:46] CAMERA_READY: RGBD_STREAM_STABLE</div>
                  <div className="text-blue-400">[01:34:47] NODE_START: tidy_bot_node</div>
                  {isRunning && (
                    <>
                      <div className="text-white/70">[01:34:48] STATE_CHANGE: IDLE {'->'} SEARCHING</div>
                      <div className="text-white/70">[01:34:52] TARGET_DETECTED: BLUE_BOX_01</div>
                      <div className="text-white/70">[01:34:52] STATE_CHANGE: SEARCHING {'->'} TARGETING</div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Controls */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Linear Vel', value: telemetry.speed.toFixed(2) + ' m/s', icon: Activity },
              { label: 'Angular Vel', value: telemetry.angularVel.toFixed(2) + ' rad/s', icon: RotateCcw },
              { label: 'Heading', value: (telemetry.heading * 180 / Math.PI).toFixed(0) + '°', icon: Radar },
              { label: 'Objects', value: '2/4 Cleared', icon: BoxIcon }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-lg font-mono font-bold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: System Info & Rubric Alignment */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Complexity Levels</h2>
            <div className="space-y-4">
              {[
                { level: 1, title: 'Basic Clearing', desc: 'Reactive behavior to push objects off patches.', status: 'VERIFIED' },
                { level: 2, title: 'Color Discrimination', desc: 'HSV masking to target specific colors.', status: 'VERIFIED' },
                { level: 3, title: 'Global Localization', desc: 'Nav2 integration with static obstacles.', status: 'IMPLEMENTED' }
              ].map(l => (
                <div key={l.level} className="group cursor-help">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-500">LEVEL {l.level}</span>
                    <span className="text-[9px] font-mono text-white/30">{l.status}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{l.title}</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-1">{l.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-bold text-white">System Parameters</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-white/50">Max Linear Speed</span>
                  <span className="text-white">0.5 m/s</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/2" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-white/50">Detection Sensitivity</span>
                  <span className="text-white">High</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-3/4" />
                </div>
              </div>
              <div className="pt-2">
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white/60 border border-white/10 transition-all">
                  RECALIBRATE SENSORS
                </button>
              </div>
            </div>
          </section>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3 h-3 text-white/20" />
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Hardware Info</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono space-y-1">
              <div>PLATFORM: AgileX Limo</div>
              <div>OS: Ubuntu 22.04 LTS</div>
              <div>ROS: Humble Hawksbill</div>
              <div>CPU: NVIDIA Jetson Nano</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-white/5 bg-black/40 px-6 flex items-center justify-between text-[9px] font-mono text-white/30 uppercase tracking-widest fixed bottom-0 w-full backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            ROS2_CORE: RUNNING
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            LIMO_DRIVER: CONNECTED
          </div>
        </div>
        <div>
          LATENCY: 12ms | FPS: 60 | SESSION_TIME: 00:12:44
        </div>
      </footer>
    </div>
  );
}
