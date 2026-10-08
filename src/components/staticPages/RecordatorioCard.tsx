/* eslint-disable @next/next/no-img-element */
'use server'

export interface recordatorioPagoProps {
    data: {
        idSocio: number;
        cedula: string;
        nombre: string;
        prestamos: {
            idPrestamo: number;
            motivo: string;
            saldo: number;
            fechaPago: string;
            montoPago: number;
        }[] | null
    }
}


export default async function RecordatorioCard(props: recordatorioPagoProps) {

    const { data } = props;

    return (
        <div style={{
            width: '91.67%',
            maxWidth: '36rem',
            marginTop: '1.25rem',
            margin: 'auto',
            border: '2px solid',
            outline: '1px solid gray',
            outlineOffset: '-1px',
            padding: '0.75rem',
            backgroundColor: '#2d3748', // slate-800
            color: 'white',
            borderRadius: '1rem',
            display: 'block' // Usar block para asegurar compatibilidad con correos
        }}>
            <table width="100%" style={{ marginBottom: '0.75rem' }}>
                <tbody>
                    <tr>
                        <td align="center">
                            <img src="cid:banner" alt="CrediRojas" width="150" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <hr />

            <table width="100%" style={{ marginTop: '0.75rem', gap: '0.75rem' }}>
                <tbody>
                    <tr>
                        <td width="30%">Cedula:</td>
                        <td>{data.cedula}</td>
                    </tr>
                    <tr>
                        <td width="30%">Nombre:</td>
                        <td style={{ textTransform: 'uppercase' }}>{data.nombre}</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ marginTop: '0.75rem' }}>
                <p>Estimado socio, le recordamos que ya se acerca su fecha de pago del o los prestamos que tiene con nuestra entidad, rogamos por favor coordinar con la tesorera para el correspondiente pago</p>
            </div>

            <p style={{
                fontWeight: 'bold',
                marginTop: '0.75rem',
                color: '#3b82f6' // blue-400
            }}>Detalle de pagos pendientes:</p>

            {data.prestamos && data.prestamos.map((prestamo) => (
                <div key={prestamo.idPrestamo} style={{
                    border: '2px solid',
                    marginTop: '0.5rem'
                }}>
                    <table width="100%" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                        <tbody>
                            <tr>
                                <td>ID Préstamo</td>
                                <td>{prestamo.idPrestamo}</td>
                            </tr>
                            <tr>
                                <td>Motivo</td>
                                <td>{prestamo.motivo}</td>
                            </tr>
                            <tr>
                                <td>Saldo</td>
                                <td>{prestamo.saldo.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</td>
                            </tr>
                        </tbody>
                    </table>

                    <table width="100%" style={{
                        padding: '0.25rem',
                        backgroundColor: '#4b5563', // slate-500
                        borderTop: '1px solid',
                        marginTop: '0.5rem'
                    }}>
                        <tbody>
                            <tr>
                                <td>Fecha Próximo pago:</td>
                                <td>{prestamo.fechaPago}</td>
                            </tr>
                            <tr>
                                <td>Monto a pagar</td>
                                <td style={{ fontWeight: 'bold' }}>
                                    {prestamo.montoPago.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
                <p>Le agradecemos coordinar el o los pagos y mantener un excelente record crediticio.</p>
            </div>
        </div>
    );
}
