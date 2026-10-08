
export interface solicitudPrestamoProps {
  idSocio: number;
  cedula: string;
  nombre: string;
  motivo: string;
  monto: number;
  plazo: number;
  token: string;
}

export default function SolicitudPrestamoVotacion(data: solicitudPrestamoProps) {



  const approvedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approvedloan?token=${encodeURIComponent(data.token)}&code=1`;
  const reprovedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approvedloan?token=${encodeURIComponent(data.token)}&code=0`;


  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5dc', fontFamily: 'Arial, sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
          CREDI-ROJAS 2025
        </h1>
        <hr />
        <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>Solicitud de Préstamo</h2>
        <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>Cédula: {data.cedula}</p>
        <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>Nombre: {data.nombre}</p>
      </div>
      <hr />
      <div>
        <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>Monto</p>
        <p style={{ fontSize: '1.5rem', margin: '5px 0' }}>
          {data.monto.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
        </p>
        <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>Plazo</p>
        <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>{data.plazo} meses</p>

        <div
          style={{
            border: '2px solid #ccc',
            borderRadius: '10px',
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#ffff'
          }}
        >
          <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>Motivo</p>
          <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>{data.motivo}</p>
        </div>
      </div>
      <hr />
      <div style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>
          <p style={{ fontSize: '0.7rem', margin: '5px 0' }}>
            Si está de acuerdo presione el botón de abajo <strong>(su voto será secreto)</strong>
          </p>
        </div>
        <div style={{ width: "100%", display: 'flex', justifyContent: 'center' }}>
          <a
            href={approvedUrl}
            style={{
              textDecoration: 'none',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              display: 'inline-block', // Asegura que el botón esté centrado
            }}
          >
            APROBAR
          </a>

          <a
            href={reprovedUrl}
            style={{
              textDecoration: 'none',
              backgroundColor: '#ff0000',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              display: 'inline-block', // Asegura que el botón esté centrado
            }}
          >
            DENEGAR PRESTAMO
          </a>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <p style={{ fontSize: '0.7rem', margin: '5px 0', color: "red" }}>
          <strong>ESTE LINK ESTARÁ DISPONIBLE POR 24 HORAS</strong>
        </p>
      </div>
    </div>
  );
}
