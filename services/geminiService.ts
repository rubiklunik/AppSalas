
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getNearbyAmenities = async (lat: number, lng: number, query: string) => {
  if (!API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Proporciona una lista detallada de servicios cercanos (colegios, hospitales, parques, transporte) para un proyecto inmobiliario en estas coordenadas. Consulta: ${query}`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.maps?.title || "Ver en Google Maps",
        uri: chunk.maps?.uri || "#"
      })) || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
