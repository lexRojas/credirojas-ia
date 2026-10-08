/* eslint-disable @next/next/no-img-element */
'use server'

type DataInvitacion = {
    cedula: string;
    nombre: string;
    correo: string;
};

export interface invitacionProps {
    data?: DataInvitacion;
}

const DEFAULT_DATA: DataInvitacion = {
    cedula: "123456789",
    nombre: "Invitado(a)",
    correo: "test@example.com",
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: "100%",
        margin: "0 auto",
        display: "block",

    },
    centerRow: {
        display: "block",
        justifyItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: "20px", // mt-5
        marginInline: "auto"
    },
    title: {

        fontSize: "2rem", // text-4xl
        lineHeight: "2rem",
        fontWeight: 700, // font-bold
        textAlign: "center",
        color: "#1F2937", // text-gray-800
    },
    textBlock: {
        width: "90%",
        maxWidth: "768px", // max-w-3xl
        padding: "20px", // p-5
        marginLeft: "auto",
        marginRight: "auto", // mx-auto
    },
    justify: {
        textAlign: "justify",
    },
    linkBlock: {
        width: "100%",
        maxWidth: "768px",
        padding: "20px",
        marginLeft: "auto",
        marginRight: "auto",
    },
    buttonLink: {
        display: "inline-block",
        backgroundColor: "#172554", // bg-blue-950 (aprox)
        color: "#FFFFFF",
        padding: "8px", // p-2
        borderRadius: "12px", // rounded-xl
        textDecoration: "none",
    },
};

export default async function InvitacionCard({ data = DEFAULT_DATA }: invitacionProps) {
    const reglamentoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reglamento`;

    return (
        <div style={styles.container}>
            <div style={styles.centerRow}>
                <img src="cid:logo" alt="logo" width={100} height={87} />
            </div>

            <div style={styles.centerRow}>
                <p style={styles.title}>Bienvenida (A) a nuestra plataforma</p>
            </div>

            <div style={styles.textBlock}>
                <p style={styles.justify}>
                    Estimado(a): {data.nombre} es para nuestra organización es un gran honor
                    que usted nos haya elegido para formar parte de su vida.
                </p>

                <br />

                <p style={styles.justify}>
                    <strong>CrediRojas</strong>, busca fomentar el ahorro conjunto de familia,
                    amigos y personas en general que entienden que cultivando los hábitos de
                    ahorro se potencian las oportunidades de crecimiento personal. Es por
                    medio de ese mismo ahorro que usted y todos los miembros de esta
                    organización pueden acceder a prestamos de bajo interés y cuyos
                    beneficios se distribuirán al final de año entre los socios de acuerdo
                    con sus aportes
                </p>

                <br />

                <p style={styles.justify}>
                    Para <strong>CrediRojas</strong> es importante de antes de formalizar su
                    solicitud de ingreso conozca nuestro reglamento, el cual le facilitamos
                    mediante el siguiente link
                </p>
            </div>

            <div style={styles.linkBlock}>
                <a style={styles.buttonLink} href={reglamentoUrl}>
                    Ver reglamento
                </a>
            </div>
        </div>
    );
}
