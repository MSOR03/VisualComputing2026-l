using UnityEngine;

public class HierarchyControls : MonoBehaviour
{
    [Header("Assign in Inspector")]
    public Transform grandparent;
    public Transform child;
    public Transform grandchild;

    // Rotation values
    private Vector3 gpRot, childRot, gcRot;
    // Position values
    private Vector3 gpPos, childPos, gcPos;
    // Auto rotate flags
    private bool gpAuto, childAuto, gcAuto;

    void Start()
    {
        gpPos    = grandparent.localPosition;
        childPos = child.localPosition;
        gcPos    = grandchild.localPosition;
    }

    void Update()
    {
        // Apply rotations
        grandparent.localEulerAngles = gpRot;
        child.localEulerAngles       = childRot;
        grandchild.localEulerAngles  = gcRot;

        // Apply positions
        grandparent.localPosition = gpPos;
        child.localPosition       = childPos;
        grandchild.localPosition  = gcPos;

        // Auto rotate
        if (gpAuto)    gpRot.y    += Time.deltaTime * 50f;
        if (childAuto) childRot.z += Time.deltaTime * 80f;
        if (gcAuto)    gcRot.x    += Time.deltaTime * 120f;
    }

    void OnGUI()
    {
        GUIStyle title = new GUIStyle(GUI.skin.label);
        title.fontStyle = FontStyle.Bold;
        title.normal.textColor = Color.white;

        GUIStyle box = new GUIStyle(GUI.skin.box);

        int panelW = 320;
        int x = 10;

        // ---- GRANDPARENT ----
        GUI.color = new Color(1f, 0.3f, 0.3f, 0.95f);
        GUI.Box(new Rect(x, 10, panelW, 200), "");
        GUI.color = Color.white;

        GUI.Label(new Rect(x+10, 15, panelW, 20), "🔴 GRANDPARENT (Root)", title);

        GUI.Label(new Rect(x+10, 40, 100, 20), "Rot Y:");
        gpRot.y = GUI.HorizontalSlider(new Rect(x+80, 45, 180, 15), gpRot.y, -180f, 180f);
        GUI.Label(new Rect(x+265, 40, 50, 20), Mathf.RoundToInt(gpRot.y) + "°");

        GUI.Label(new Rect(x+10, 65, 100, 20), "Rot X:");
        gpRot.x = GUI.HorizontalSlider(new Rect(x+80, 70, 180, 15), gpRot.x, -180f, 180f);
        GUI.Label(new Rect(x+265, 65, 50, 20), Mathf.RoundToInt(gpRot.x) + "°");

        GUI.Label(new Rect(x+10, 90, 100, 20), "Pos X:");
        gpPos.x = GUI.HorizontalSlider(new Rect(x+80, 95, 180, 15), gpPos.x, -10f, 10f);
        GUI.Label(new Rect(x+265, 90, 50, 20), gpPos.x.ToString("F1"));

        GUI.Label(new Rect(x+10, 115, 100, 20), "Pos Y:");
        gpPos.y = GUI.HorizontalSlider(new Rect(x+80, 120, 180, 15), gpPos.y, -10f, 10f);
        GUI.Label(new Rect(x+265, 115, 50, 20), gpPos.y.ToString("F1"));

        GUI.Label(new Rect(x+10, 145, 150, 20), "Auto Rotate:");
        gpAuto = GUI.Toggle(new Rect(x+130, 145, 20, 20), gpAuto, "");

        // ---- CHILD ----
        GUI.color = new Color(0.3f, 1f, 0.3f, 0.95f);
        GUI.Box(new Rect(x, 220, panelW, 200), "");
        GUI.color = Color.white;

        GUI.Label(new Rect(x+10, 225, panelW, 20), "🟢 CHILD (Level 1)", title);

        GUI.Label(new Rect(x+10, 250, 100, 20), "Rot Z:");
        childRot.z = GUI.HorizontalSlider(new Rect(x+80, 255, 180, 15), childRot.z, -180f, 180f);
        GUI.Label(new Rect(x+265, 250, 50, 20), Mathf.RoundToInt(childRot.z) + "°");

        GUI.Label(new Rect(x+10, 275, 100, 20), "Rot Y:");
        childRot.y = GUI.HorizontalSlider(new Rect(x+80, 280, 180, 15), childRot.y, -180f, 180f);
        GUI.Label(new Rect(x+265, 275, 50, 20), Mathf.RoundToInt(childRot.y) + "°");

        GUI.Label(new Rect(x+10, 300, 100, 20), "Pos X:");
        childPos.x = GUI.HorizontalSlider(new Rect(x+80, 305, 180, 15), childPos.x, -10f, 10f);
        GUI.Label(new Rect(x+265, 300, 50, 20), childPos.x.ToString("F1"));

        GUI.Label(new Rect(x+10, 325, 100, 20), "Pos Y:");
        childPos.y = GUI.HorizontalSlider(new Rect(x+80, 330, 180, 15), childPos.y, -10f, 10f);
        GUI.Label(new Rect(x+265, 325, 50, 20), childPos.y.ToString("F1"));

        GUI.Label(new Rect(x+10, 355, 150, 20), "Auto Rotate:");
        childAuto = GUI.Toggle(new Rect(x+130, 355, 20, 20), childAuto, "");

        // ---- GRANDCHILD ----
        GUI.color = new Color(0.3f, 0.3f, 1f, 0.95f);
        GUI.Box(new Rect(x, 430, panelW, 200), "");
        GUI.color = Color.white;

        GUI.Label(new Rect(x+10, 435, panelW, 20), "🔵 GRANDCHILD (Level 2)", title);

        GUI.Label(new Rect(x+10, 460, 100, 20), "Rot X:");
        gcRot.x = GUI.HorizontalSlider(new Rect(x+80, 465, 180, 15), gcRot.x, -180f, 180f);
        GUI.Label(new Rect(x+265, 460, 50, 20), Mathf.RoundToInt(gcRot.x) + "°");

        GUI.Label(new Rect(x+10, 485, 100, 20), "Rot Y:");
        gcRot.y = GUI.HorizontalSlider(new Rect(x+80, 490, 180, 15), gcRot.y, -180f, 180f);
        GUI.Label(new Rect(x+265, 485, 50, 20), Mathf.RoundToInt(gcRot.y) + "°");

        GUI.Label(new Rect(x+10, 510, 100, 20), "Pos X:");
        gcPos.x = GUI.HorizontalSlider(new Rect(x+80, 515, 180, 15), gcPos.x, -10f, 10f);
        GUI.Label(new Rect(x+265, 510, 50, 20), gcPos.x.ToString("F1"));

        GUI.Label(new Rect(x+10, 535, 100, 20), "Pos Y:");
        gcPos.y = GUI.HorizontalSlider(new Rect(x+80, 540, 180, 15), gcPos.y, -10f, 10f);
        GUI.Label(new Rect(x+265, 535, 50, 20), gcPos.y.ToString("F1"));

        GUI.Label(new Rect(x+10, 565, 150, 20), "Auto Rotate:");
        gcAuto = GUI.Toggle(new Rect(x+130, 565, 20, 20), gcAuto, "");
    }
}
