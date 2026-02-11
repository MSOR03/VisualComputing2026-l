# Visual Computing 2026-I

This repository contains all workshop deliverables, projects, and presentations for the Visual Computing course, organized by week and topic.

## 📋 Course Objective

Configure a professional development environment using Git for visual computing projects. Each student maintains a public repository structured by week and workshop, delivering well-documented assignments with proper version control and organized files.

## 📁 Repository Structure

Each workshop folder follows the naming convention:

```
semana_XX_Y_nombre_taller/
```

Where:
- `XX` = Week number (01-16)
- `Y` = Workshop number within that week
- `nombre_taller` = Descriptive workshop name

### Example Structure

```
visualcomputing2026-i/
├── semana_01_1_construyendo_mundo_3d/
│   ├── README.md
│   ├── threejs/
│   ├── python/
│   └── media/
├── semana_02_1_espacios_proyectivos_matrices_proyeccion/
│   ├── README.md
│   ├── unity/
│   ├── python/
│   └── media/
├── semana_03_2_zbuffer_depth_testing/
│   ├── README.md
│   ├── threejs/
│   └── media/
└── semana_10_3_flujo_optico_tracking/
    ├── README.md
    ├── python/
    └── media/
```

## 📂 Folder Structure per Workshop

Each workshop folder should contain:

```
semana_XX_Y_nombre_taller/
├── python/          # Python code (if applicable)
├── unity/           # Unity project (if applicable)
├── threejs/         # Three.js/React code (if applicable)
├── processing/      # Processing code (if applicable)
├── media/           # REQUIRED: Images, videos, GIFs
└── README.md        # REQUIRED: Complete documentation
```

### Media Folder

The `media/` folder is **mandatory** and should include:
- Screenshots of the project
- Demo videos or GIFs
- Diagrams or visualizations
- Any visual documentation of the work

## 🚫 .gitignore Configuration

Avoid uploading heavy folders or unnecessary files. Examples by technology:

### Node.js / Three.js
```
node_modules/
.env
.DS_Store
*.log
dist/
build/
.vscode/
```

### Unity
```
Library/
Temp/
Obj/
Build/
Builds/
Logs/
MemoryCaptures/
.vscode/
*.csproj
*.unityproj
*.sln
*.user
```

### Python / Jupyter
```
.ipynb_checkpoints/
*.pyc
__pycache__/
.env
venv/
.venv/
```

### Processing
```
*.class
*.jar
*.exe
*.log
*.tmp
*.svg
*.zip
```

**Generate your .gitignore automatically:** [https://www.toptal.com/developers/gitignore](https://www.toptal.com/developers/gitignore)

## 💬 Commit Best Practices (English)

### ✅ Good Commits
```
Add Three.js scene structure and controls
Fix gravity bug in Unity script
Update README for project presentation
Ignore node_modules and build folder
```

### ❌ Bad Commits
```
subí lo mío
último intento
lo que hice hoy
```

### Recommended Workflow
```bash
git add .
git commit -m "Add Unity desert scene and interaction logic"
git push
```

## 🔗 Repository Registration

1. Verify that your repository is **public**
2. Open the link in a browser **without logging in** to verify access
3. Register it with your institutional email on the official sheet

## 👥 Group Deliverables

- Each student must upload the complete project to their **own repository**
- In the `README.md` of each delivery, clearly specify which part of the work you completed

### Example Contribution Section

```markdown
### Contributions
- Programmed main animation logic in Processing
- Implemented OrbitControls in Three.js
- Created final report and presentation slides
```

## ✅ Final Checklist

Before each delivery, verify:

- [ ] Folder follows format `semana_XX_Y_nombre_taller`
- [ ] `README.md` explaining the activity
- [ ] `media/` folder with images, GIFs, or videos
- [ ] `.gitignore` configured according to project type
- [ ] Descriptive commits in English
- [ ] Public repository verified
- [ ] Group project delivered individually with contribution description

## 📚 Technologies Used

Throughout the course, various technologies may be used:

- **Three.js**: 3D graphics in the browser
- **Unity**: Game engine for 3D projects
- **Python**: Computer vision and numerical computing
- **Processing**: Creative coding and visualization
- **OpenCV**: Computer vision library
- **WebGL**: Low-level graphics API

---

**Academic Period:** 2026-I  
**Course:** Visual Computing  
**Repository Type:** Public

