import { useState, useEffect } from "react";
import { sendMagicLink } from "../lib/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check for error in URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      // Set error message based on error type
      if (error === "auth_failed") {
        setMessage({
          type: "error",
          text: "Fallo de autenticación. Por favor, intenta de nuevo.",
        });
      } else if (error === "config") {
        setMessage({
          type: "error",
          text: "Error de configuración. Contacta al administrador.",
        });
      } else if (error === "auth") {
        setMessage({
          type: "error",
          text: "Error de autenticación. Por favor, intenta de nuevo.",
        });
      } else if (error === "session") {
        setMessage({
          type: "error",
          text: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
        });
      }

      // Remove error param from URL to prevent stale messages
      params.delete("error");
      const newSearch = params.toString();
      const newUrl = newSearch
        ? `${window.location.pathname}?${newSearch}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await sendMagicLink(email);

    if (result.success) {
      setMessage({
        type: "success",
        text: "¡Link enviado! Revisa tu inbox y haz clic en el enlace para acceder a tu calendario.",
      });
      setEmail("");
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to send magic link. Please try again.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Calendario de Adviento
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ingresa tu email para acceder a tu calendario.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="juanito@email.com"
              disabled={loading}
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enviando link...
              </span>
            ) : (
              "Enviar link mágico"
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Solo emails autorizados pueden acceder al calendario.
              <br />
              Si no recibes el correo, checa que tu dirección sea correcta. O
              avísale a Zam.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
