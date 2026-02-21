using UnityEngine;

public class TransformController : MonoBehaviour
{
    [Header("Auto Rotate")]
    public bool autoRotate = false;
    public Vector3 rotationSpeed = new Vector3(0f, 50f, 0f);

    void Update()
    {
        if (autoRotate)
        {
            transform.Rotate(rotationSpeed * Time.deltaTime, Space.Self);
        }
    }
}
