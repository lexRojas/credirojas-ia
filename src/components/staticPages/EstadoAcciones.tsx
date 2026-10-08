import { sociosConAcciones_type } from "@/types/types";

export default function EstadoAcciones(data: sociosConAcciones_type) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        margin: 0,
        padding: 0,
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        className="container"
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "16px",
        }}
      >
        <div
          key={data.idSocio}
          className="card"
          style={{
            backgroundColor: "#f0f0f0",
            marginBottom: "24px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="header"
            style={{
              backgroundColor: "#f0f0f0",
              padding: "12px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            ESTADO DE CUENTA DEL SOCIO
          </div>

          <div
            className="socio-info"
            style={{ display: "flex", gap: "8px", padding: "8px 12px", fontWeight: "bold" }}
          >
            <p>{data.cedula}</p>
            <p>⇒</p>
            <p>{data.nombre}</p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
            <thead>
              <tr>
                <th
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    textAlign: "left",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  ID Accion
                </th>
                <th
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    textAlign: "left",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  Periodo
                </th>
                <th
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    textAlign: "left",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  Mes
                </th>
                <th
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    textAlign: "left",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    textAlign: "center",
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  Cantidad Acciones
                </th>
                <th
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    textAlign: "left",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  Monto
                </th>
              </tr>
            </thead>
            <tbody>
              {data.acciones.map((a) => (
                <tr
                  key={a.idAccion}
                  style={{ backgroundColor: "#dbeafe", cursor: "pointer" }}
                  onMouseOver={(e) => ((e.currentTarget.style.backgroundColor = "#e0e0e0"))}
                  onMouseOut={(e) => ((e.currentTarget.style.backgroundColor = "#dbeafe"))}
                >
                  <td style={{ padding: "8px", borderBottom: "1px solid #ccc", fontSize: "14px" }}>
                    {a.idAccion}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ccc", fontSize: "14px" }}>
                    {a.periodo}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ccc", fontSize: "14px" }}>
                    {a.mes}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ccc", fontSize: "14px" }}>
                    {a.fecha}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #ccc",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {a.cantidadAcciones}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ccc", fontSize: "14px" }}>
                    {a.monto_colones.toLocaleString("es-CR", {
                      style: "currency",
                      currency: "CRC",
                    })}
                  </td>
                </tr>
              ))}

              <tr style={{ backgroundColor: "#fff4b5", fontWeight: "bold" }}>
                <td colSpan={4} style={{ textAlign: "right", padding: "8px" }}>
                  TOTAL DE ACCIONES Y MONTO ⇒
                </td>
                <td style={{ textAlign: "center", padding: "8px" }}>
                  {data.acciones.reduce((sum, item) => sum + item.cantidadAcciones, 0)}
                </td>
                <td style={{ padding: "8px" }}>
                  {data.acciones
                    .reduce((sum, item) => sum + item.monto_colones, 0)
                    .toLocaleString("es-CR", { style: "currency", currency: "CRC" })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
