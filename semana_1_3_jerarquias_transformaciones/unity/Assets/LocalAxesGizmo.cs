using UnityEngine;

public class LocalAxesGizmo : MonoBehaviour
{
    public float length = 2.5f;

    void OnDrawGizmos()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawRay(transform.position, transform.right * length);

        Gizmos.color = Color.green;
        Gizmos.DrawRay(transform.position, transform.up * length);

        Gizmos.color = Color.blue;
        Gizmos.DrawRay(transform.position, transform.forward * length);
    }
}
