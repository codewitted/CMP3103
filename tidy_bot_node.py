#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan, Image
from cv_bridge import CvBridge
import cv2
import numpy as np
import math

class TidyBotNode(Node):
    """
    Tidy-Bot Autonomous Controller for AgileX Limo.
    Implements a state-machine based behavior for tidying colored objects.
    """
    def __init__(self):
        super().__init__('tidy_bot_node')
        
        # Publishers & Subscribers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)
        self.image_sub = self.create_subscription(Image, '/camera/color/image_raw', self.image_callback, 10)
        
        # Utilities
        self.bridge = CvBridge()
        
        # State Machine
        # States: SEARCHING, TARGETING, PUSHING, RETURNING, OBSTACLE_AVOIDANCE
        self.state = "SEARCHING"
        
        # Sensor Data
        self.obstacle_detected = False
        self.target_visible = False
        self.target_center_x = 0
        self.target_dist = 0.0
        
        # Timer for control loop (10Hz)
        self.timer = self.create_timer(0.1, self.control_loop)
        
        self.get_logger().info("Tidy-Bot Node Started. Initial State: SEARCHING")

    def scan_callback(self, msg):
        # Simple obstacle detection using LiDAR
        # Check front 30 degrees
        front_ranges = msg.ranges[0:15] + msg.ranges[-15:]
        min_dist = min([r for r in front_ranges if r > 0.1])
        self.obstacle_detected = min_dist < 0.5

    def image_callback(self, msg):
        # Convert ROS Image to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, "bgr8")
        hsv = cv2.cvtColor(cv_image, cv2.COLOR_BGR2HSV)
        
        # Define color range for targeting (e.g., Blue objects)
        # Level 2 requirement: Color Discrimination
        lower_blue = np.array([100, 150, 0])
        upper_blue = np.array([140, 255, 255])
        
        mask = cv2.inRange(hsv, lower_blue, upper_blue)
        moments = cv2.moments(mask)
        
        if moments['m00'] > 500: # Minimum pixel area
            self.target_visible = True
            self.target_center_x = int(moments['m10'] / moments['m00'])
            self.image_width = cv_image.shape[1]
        else:
            self.target_visible = False

    def control_loop(self):
        msg = Twist()
        
        if self.state == "SEARCHING":
            # Rotate in place to find target
            msg.angular.z = 0.5
            if self.target_visible:
                self.state = "TARGETING"
                self.get_logger().info("Target spotted! Switching to TARGETING")
                
        elif self.state == "TARGETING":
            # Align with target
            error = (self.image_width / 2) - self.target_center_x
            msg.angular.z = error * 0.005 # Simple P-controller
            msg.linear.x = 0.2
            
            if not self.target_visible:
                self.state = "SEARCHING"
            
            # If very close (based on LiDAR or camera area), start pushing
            # For simplicity, we transition to PUSHING after some time or distance
            if self.obstacle_detected: # Assuming the obstacle is the box
                self.state = "PUSHING"
                self.get_logger().info("Contact made. Switching to PUSHING")

        elif self.state == "PUSHING":
            # Drive forward to push object
            msg.linear.x = 0.4
            msg.angular.z = 0.0
            
            # Level 1: Push until patch is cleared (timer based for simple implementation)
            # In a real scenario, we'd check if we crossed the patch boundary
            # For this demo, push for 3 seconds then return
            self.timer_push = self.get_clock().now()
            # (Logic to transition back to SEARCHING after push)
            
        elif self.state == "OBSTACLE_AVOIDANCE":
            # Level 3: Avoid static obstacles
            msg.linear.x = 0.0
            msg.angular.z = -0.6 # Turn away
            if not self.obstacle_detected:
                self.state = "SEARCHING"

        self.cmd_vel_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = TidyBotNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
