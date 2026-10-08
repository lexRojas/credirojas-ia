'use client'

// pages/forgot.tsx
import { useState } from "react";

export default function ForgotPage() {
    const [username, setUsername] = useState("");
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await fetch("/api/auth/forgot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        setSent(true);
    }

    return (
        <main className="max-w-md mx-auto p-6">
            <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
            {sent ? (
                <p>Si existe una cuenta con ese usuario recibirás un correo.</p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4">
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" className="w-full p-2 border" />
                    <button className="mt-3 w-full p-2 bg-blue-600 text-white">Enviar</button>
                </form>
            )}
        </main>
    );
}
