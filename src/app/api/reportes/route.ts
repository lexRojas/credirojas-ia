/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";

const CARBONE_API_KEY = process.env.CARBONE_API_KEY;

export async function POST(req: Request) {
  try {
    if (!CARBONE_API_KEY) {
      throw new Error("Falta la variable de entorno CARBONE_API_KEY");
    }

    const body = await req.json();

    const { REPORT_ID, data } = body;

    const RPTID = REPORT_ID;

    // 1️⃣ Generar el reporte con Carbone
    const renderResponse = await fetch(
      `https://api.carbone.io/render/${RPTID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CARBONE_API_KEY}`,
        },
        body: JSON.stringify({ data: data, convertTo: "pdf" }),
      }
    );

    if (!renderResponse.ok) {
      const errorText = await renderResponse.text();
      throw new Error(
        `Carbone API Error (${renderResponse.status}): ${errorText}`
      );
    }

    const renderResult = await renderResponse.json();
    const renderId = renderResult.data.renderId;
    const downloadUrl = `https://api.carbone.io/render/${renderId}`;

    // 2️⃣ Descargar el PDF generado
    const pdfResponse = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${CARBONE_API_KEY}`,
      },
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      throw new Error(
        `Error al descargar el PDF: ${pdfResponse.status} ${errorText}`
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // 3️⃣ Devolver el PDF como respuesta en Vercel

    // hay un cambio y no lo quiere detectar git
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="somixa_reporte.pdf"',
      },
    });
  } catch (error: any) {
    console.error("Error en la API:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
