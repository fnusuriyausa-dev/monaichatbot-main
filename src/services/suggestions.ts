export async function submitSuggestion(
  original: string,
  suggestion: string,
  context: string
) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const response = await fetch(`${backendUrl}/api/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original, suggestion, context }),
  });

  if (!response.ok) {
    throw new Error("Failed to save suggestion");
  }

  return await response.json();
}