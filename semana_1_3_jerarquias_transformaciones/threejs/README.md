# Hierarchical Transformations in Three.js

This project demonstrates father-child hierarchical structures and transformation chains in Three.js using React Three Fiber and Leva for real-time GUI controls.

## 🎯 Features

### Hierarchical Structure (3 Levels)
1. **Grandparent (Root)** - Red Cube 🟥
   - The root/father node of the hierarchy
   - All transformations applied here cascade down to children and grandchildren

2. **Child (Level 1)** - Green Cube 🟩
   - Attached to the Grandparent
   - Inherits all transformations from the Grandparent
   - Has its own local transformations that affect the Grandchild

3. **Grandchild (Level 2)** - Blue Sphere 🔵
   - Attached to the Child
   - Inherits transformations from both Child and Grandparent
   - Demonstrates the complete transformation chain

### Interactive Controls

Each hierarchy level has independent controls for:
- **Position** (X, Y, Z translation)
- **Rotation** (X, Y, Z rotation in radians)
- **Scale** (uniform scaling)
- **Auto Rotate** (automatic continuous rotation)

### Visual Aids
- **Axes Helpers**: Each object shows its local coordinate system
  - Red = X-axis
  - Green = Y-axis
  - Blue = Z-axis
- **Grid**: Shows the world coordinate system
- **Orbit Controls**: Free camera movement with mouse

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+ (recommended)
- npm

### Installation

```bash
# Navigate to the project directory
cd semana_1_3_jerarquias_transformaciones/threejs

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173/` to view the application.

## 🎮 How to Use

1. **Open the Controls Panel** (top-right corner)
   - Expand each section: Grandparent, Child, and Grandchild
   - Each section contains Position, Rotation, Scale, and Auto Rotate controls

2. **Experiment with Transformations**
   - Start by rotating the **Grandparent**: Notice how the entire hierarchy rotates together
   - Then rotate the **Child**: Only the child and grandchild rotate
   - Finally, rotate the **Grandchild**: Only the sphere rotates
   - This demonstrates the cascading nature of hierarchical transformations

3. **Try Different Combinations**
   - Enable "Auto Rotate" on multiple levels simultaneously
   - Adjust positions to see how local coordinates work
   - Scale the parent and observe how it affects the entire hierarchy
   - Use the orbit controls (mouse drag) to view from different angles

## 🔍 Understanding Transformation Chains

### Key Concepts

1. **Parent-Child Relationship**
   - Children are positioned relative to their parent's coordinate system
   - When a parent moves/rotates/scales, all children transform with it

2. **Local vs World Coordinates**
   - Each object has its own local coordinate system (shown by axes)
   - The position/rotation you set in controls is in local space
   - World position = Parent's world transform × Local transform

3. **Transformation Order**
   - Grandparent transform → Child transform → Grandchild transform
   - Changes propagate down the hierarchy automatically

### Practical Example

```
Rotate Grandparent 45° on Y-axis:
└─ Grandparent rotates 45°
   └─ Child (at offset 3,1,0) orbits around Grandparent's Y-axis
      └─ Grandchild (at offset 2,0.5,0 from Child) follows the entire chain
```

## 📚 Technical Stack

- **React 19** - UI framework
- **Three.js** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers (OrbitControls, Grid, etc.)
- **Leva** - GUI controls for real-time parameter adjustment
- **Vite** - Fast development build tool

## 🎨 Code Structure

```
src/
├── HierarchyScene.jsx    # Main scene with hierarchical structure
├── App.jsx               # Application entry point
├── App.css               # Application styles
├── index.css             # Global styles
└── main.jsx              # React root
```

## 🧪 Experiments to Try

1. **Complex Chain Motion**
   - Enable auto-rotate on all three levels
   - Observe the compound rotation effect

2. **Scaling Effects**
   - Scale the Grandparent to 2.0
   - Notice how children appear larger but maintain relative positions

3. **Offset Adjustments**
   - Move the Child closer/farther from the Grandparent
   - Rotate the Grandparent and see how orbit radius changes

4. **Coordinate System Verification**
   - Set all rotations to 0
   - Observe how local axes align with world axes
   - Rotate parent and see how child's local axes rotate too

## 📖 Learning Objectives

- ✅ Understanding scene graphs and hierarchical structures
- ✅ Parent-child transformations and inheritance
- ✅ Local vs world coordinate systems
- ✅ Transformation chains across multiple levels
- ✅ Real-time 3D manipulation and visualization
- ✅ THREE.Group usage in React Three Fiber

## 🐛 Troubleshooting

**Issue**: Node version warning
- **Solution**: Upgrade to Node.js 20.19+ or 22.12+ for optimal compatibility

**Issue**: Leva panel not showing
- **Solution**: Check browser console for errors and ensure leva is installed

**Issue**: Objects not moving
- **Solution**: Make sure you're adjusting the correct level in the controls panel

## 📝 License

Educational project for Visual Computing course - Semester 8, 2026

