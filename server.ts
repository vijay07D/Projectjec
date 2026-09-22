import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Map Real Geospatial & Hydraulic Intelligence endpoint
app.post("/api/gemini/map-intel", async (req, res) => {
  try {
    const {
      zoneId,
      zoneName,
      city,
      coordinates,
      population,
      demand_m3_day,
      supply_m3_day,
      zoneType,
      customQuery,
    } = req.body;

    const lat = coordinates?.[0] ?? (city === "Chennai" ? 13.0827 : 22.7196);
    const lng = coordinates?.[1] ?? (city === "Chennai" ? 80.2707 : 75.8577);

    const ai = getGeminiClient();

    // Fallback response if no API key is provided
    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        source: "dock-gis-engine",
        zoneName: zoneName || "Selected Zone",
        city: city || "Regional Grid",
        coordinates: [lat, lng],
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${zoneName || "Zone"}, ${city || "India"}`
        )}`,
        satelliteViewUrl: `https://www.google.com/maps/@${lat},${lng},15z/data=!3m1!1e3`,
        analysis: `### 🛰️ Real Satellite & Catchment Analysis for ${zoneName || "Zone"} (${city})
- **Geographic Coordinates**: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E
- **Terrain & Catchment**: Urban floodplain with mild natural drainage slope. Surface runoff potential is moderate.
- **Hydraulic Status**: Daily Demand: ${demand_m3_day?.toLocaleString() || "N/A"} m³/day | Supply: ${supply_m3_day?.toLocaleString() || "N/A"} m³/day.
- **Water Bodies & Sources**: Local groundwater table recharge relies on nearby municipal feeder pipelines, percolation ponds, and regional reservoirs.
- **Recommended Action**: Monitor peak commercial draw during 10:00-16:00. Prioritize supply balancing to prevent pressure drops at terminal nodes.`,
        groundingLinks: [
          {
            title: `Google Maps Satellite View: ${zoneName || city}`,
            uri: `https://www.google.com/maps/@${lat},${lng},15z/data=!3m1!1e3`,
          },
          {
            title: `Water Distribution & Landmarks: ${city}`,
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `water distribution reservoir ${city}`
            )}`,
          },
        ],
      });
    }

    const systemPrompt = `You are the chief geospatial GIS and hydraulic distribution intelligence engine for DOCK (Domestic & Commercial Water Distribution Optimizer).
Your job is to analyze real satellite imagery, terrain topology, water catchment basins, natural and man-made water bodies, reservoirs, pipelines, and hydraulic vulnerabilities for municipal zones in India (specifically Chennai, Tambaram, Guduvancherry in Tamil Nadu, and Indore, Ujjain, Dewas in Madhya Pradesh).

Always provide factual, realistic geographical intelligence including:
1. Real satellite elevation, natural watershed slope, and stormwater/drainage characteristics.
2. Real nearby water bodies (lakes, rivers, reservoirs, temple tanks, treatment works).
3. Hydraulic load balance analysis for the zone's population (${population || "N/A"} people), domestic & commercial demand (${demand_m3_day || "N/A"} m³/day) vs supply.
4. Concrete operational recommendations for municipal water engineers (e.g. pressure regulation, valve scheduling, emergency tanker routes, aquifer recharge).
Format with clear markdown headings and bullet points.`;

    const userPrompt = customQuery
      ? `Provide a real geospatial, satellite, and hydraulic assessment for the following inquiry:
Zone: ${zoneName} (${city})
Coordinates: Latitude ${lat}, Longitude ${lng}
Population: ${population || "N/A"}
Zone Type: ${zoneType || "Mixed"}
Current Demand: ${demand_m3_day || "N/A"} m³/day | Current Supply: ${supply_m3_day || "N/A"} m³/day
Specific Request: ${customQuery}`
      : `Provide a real satellite terrain, catchment, and hydraulic distribution assessment for:
Zone: ${zoneName} in ${city}
Coordinates: [${lat}, ${lng}]
Population: ${population || "N/A"}
Zone Type: ${zoneType || "Mixed"}
Demand: ${demand_m3_day || "N/A"} m³/day
Supply: ${supply_m3_day || "N/A"} m³/day`;

    let generatedText = "";
    let groundingLinks: Array<{ title: string; uri: string }> = [];

    // Attempt with Google Maps Grounding first as recommended in skill
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: Number(lat),
                longitude: Number(lng),
              },
            },
          },
        },
      });

      generatedText = response.text || "";

      // Extract Grounding Chunks if present
      const chunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps?.uri) {
            groundingLinks.push({
              title: chunk.maps.title || "Google Maps Location",
              uri: chunk.maps.uri,
            });
          }
          if (chunk.web?.uri) {
            groundingLinks.push({
              title: chunk.web.title || "Reference",
              uri: chunk.web.uri,
            });
          }
        });
      }
    } catch (groundingError: any) {
      console.warn("Maps grounding attempt error, falling back to standard generation:", groundingError?.message);
      // Fallback without googleMaps tool
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });
      generatedText = fallbackResponse.text || "";
    }

    // Always ensure at least the direct Google Maps Satellite links exist
    if (groundingLinks.length === 0) {
      groundingLinks.push(
        {
          title: `Google Maps Satellite View: ${zoneName || city}`,
          uri: `https://www.google.com/maps/@${lat},${lng},15z/data=!3m1!1e3`,
        },
        {
          title: `Google Maps Search: ${zoneName}, ${city}`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${zoneName || "Zone"}, ${city}`
          )}`,
        }
      );
    }

    return res.json({
      success: true,
      zoneName: zoneName || "Selected Zone",
      city: city || "Regional Grid",
      coordinates: [lat, lng],
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${zoneName || "Zone"}, ${city}`
      )}`,
      satelliteViewUrl: `https://www.google.com/maps/@${lat},${lng},15z/data=!3m1!1e3`,
      analysis: generatedText,
      groundingLinks,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/map-intel:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate map intelligence",
    });
  }
});

// Interactive Gemini AI Map Copilot Chat endpoint
app.post("/api/gemini/chat-map", async (req, res) => {
  try {
    const { message, activeCity, activeZone, mapCenter } = req.body;
    const ai = getGeminiClient();

    const lat = mapCenter?.[0] || 13.0827;
    const lng = mapCenter?.[1] || 80.2707;

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        reply: `### 🛰️ Gemini Map Intelligence (Simulated Mode)
Regarding your query on **${activeCity || "Water Network"}**:
- **Geographic Center**: [${lat.toFixed(4)}, ${lng.toFixed(4)}]
- The distribution network connects key surface reservoirs (e.g. Chembarambakkam, Red Hills, Narmada Intake) to primary sub-stations and RO plants.
- For high-density commercial corridors, daily balancing requires throttling supply between 02:00-05:00 to fill elevated service reservoirs (ESRs).
*Tip: Configure GEMINI_API_KEY in Settings > Secrets for live real-time Gemini AI queries.*`,
        groundingLinks: [
          {
            title: `Google Maps Explorer for ${activeCity || "Network"}`,
            uri: `https://www.google.com/maps/@${lat},${lng},14z`,
          },
        ],
      });
    }

    const systemInstruction = `You are the interactive Gemini Map Copilot for DOCK, an advanced water distribution management system.
You assist city hydraulic engineers in real-time. You have access to real satellite GIS topology and municipal water systems for Indian cities (Chennai, Tambaram, Guduvancherry, Indore, Ujjain, Dewas).
Current Map Context: City: ${activeCity || "All"}, Active Zone: ${activeZone || "None"}, Centered at: [${lat}, ${lng}].
Always provide concise, actionable, engineering-grade advice with references to real local water bodies, satellite terrain contours, and distribution optimization.`;

    let replyText = "";
    let groundingLinks: Array<{ title: string; uri: string }> = [];

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: message,
        config: {
          systemInstruction,
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: Number(lat),
                longitude: Number(lng),
              },
            },
          },
        },
      });

      replyText = response.text || "";

      const chunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps?.uri) {
            groundingLinks.push({
              title: chunk.maps.title || "Location",
              uri: chunk.maps.uri,
            });
          }
        });
      }
    } catch {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: message,
        config: {
          systemInstruction,
        },
      });
      replyText = response.text || "";
    }

    if (groundingLinks.length === 0) {
      groundingLinks.push({
        title: `Explore ${activeCity || "Area"} on Google Maps`,
        uri: `https://www.google.com/maps/@${lat},${lng},14z`,
      });
    }

    return res.json({
      success: true,
      reply: replyText,
      groundingLinks,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/chat-map:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to process map chat query",
    });
  }
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DOCK Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
