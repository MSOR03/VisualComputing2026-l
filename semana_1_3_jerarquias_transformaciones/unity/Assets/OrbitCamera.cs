using UnityEngine;

public class OrbitCamera : MonoBehaviour
{
    public Transform target;
    public float distance = 15f;
    public float sensitivity = 3f;
    private float yaw = -45f;
    private float pitch = 30f;

    void Update()
    {
        if (Input.GetMouseButton(1))
        {
            yaw   += Input.GetAxis("Mouse X") * sensitivity;
            pitch -= Input.GetAxis("Mouse Y") * sensitivity;
            pitch  = Mathf.Clamp(pitch, -80f, 80f);
        }

        transform.position = (target != null ? target.position : Vector3.zero)
            + Quaternion.Euler(pitch, yaw, 0) * new Vector3(0, 0, -distance);
        transform.LookAt(target != null ? target.position : Vector3.zero);
    }
}