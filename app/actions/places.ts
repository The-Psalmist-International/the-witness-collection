"use server";

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      text?: {
        text?: string;
      };
    };
  }>;
};

export async function searchPlaces(input: string): Promise<string[]> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const query = input.trim();

  if (!apiKey || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          input: query,
          includedRegionCodes: ["gh"],
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        const errorBody = await response.text();
        console.error(
          "Places autocomplete failed:",
          response.status,
          errorBody
        );
      }
      return [];
    }

    const data = (await response.json()) as AutocompleteResponse;

    return (data.suggestions ?? [])
      .map((suggestion) => suggestion.placePrediction?.text?.text?.trim())
      .filter((address): address is string => Boolean(address))
      .slice(0, 6);
  } catch {
    return [];
  }
}
