'use client'

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

export function ResetPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [ok, setOk] = useState<null | boolean>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();
    setOk(data.ok);
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Restablecer contraseña</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Cambiar contraseña
        </button>
      </form>

      {ok === true && (
        <p className="mt-4 text-green-600">
          ✅ Contraseña cambiada. Ya puedes iniciar sesión.
        </p>
      )}
      {ok === false && (
        <p className="mt-4 text-red-600">
          ❌ Error: token inválido o expirado.
        </p>
      )}
    </main>
  );
}


export default function page() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPage />
    </Suspense>
  )


}