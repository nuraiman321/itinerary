'use client';
import { useState, useRef, useCallback, useEffect } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Place {
  id: string;
  order: number;
  name: string;
  description: string;
  country: string;
  state: string;
  mapLink: string;
  images: string[];
  notes?: string;
  photoSpots?: string[];
}

interface Eatery {
  id: string;
  name: string;
  description: string;
  images: string[];
  mapLink?: string;
}

interface Break {
  label?: string;
  eateries: Eatery[];
}

interface Day {
  id: string;
  dayNumber: number;
  date: string;
  label: string;
  places: Place[];
  break?: Break;
}

interface Trip {
  title: string;
  coverImage?: string;
  days: Day[];
}

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const GOLD        = "#c8aa64";
const GOLD_DIM    = "rgba(200,170,100,0.35)";
const GOLD_FAINT  = "rgba(200,170,100,0.1)";
const BG_CARD     = "#13100c";
const BG_DEEP     = "#0d0b09";
const TEXT_PRIMARY = "#f0e6d0";
const TEXT_MID    = "#a89878";
const TEXT_DIM    = "#4a3c28";
const BORDER_FAINT = "rgba(200,170,100,0.12)";
const SERIF       = "'Playfair Display', serif";
const BODY        = "'Lora', serif";

const DRIVE_FILE_NAME = "trip.json";

/* ─────────────────────────────────────────────
   SAMPLE DATA
───────────────────────────────────────────── */
const SAMPLE: Trip = {
  title: "A Week Across Europe",
  coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1400&q=85",
  days: [
    {
      id: "d1", dayNumber: 1, date: "2025-06-01", label: "Paris — Icons & Light",
      places: [
        {
          id: "p1", order: 1,
          name: "Eiffel Tower",
          description: "Gustave Eiffel's iron lattice masterpiece has towered over Paris since 1889. Originally built as a temporary exhibition arch, it became the city's most recognisable silhouette. Ascend to the third floor at dusk and watch Paris turn amber below you.",
          country: "France", state: "Paris",
          mapLink: "https://maps.google.com/?q=Eiffel+Tower+Paris",
          images: [
            "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=900&q=80",
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80",
            "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=900&q=80",
          ],
          notes: "Book summit tickets online weeks ahead. The light show runs every hour after dark — best viewed from Trocadéro.",
          photoSpots: [
            "Trocadéro Gardens — the classic straight-on symmetrical shot, best at golden hour",
            "Champ de Mars lawn — low angle from the grass gives dramatic scale",
            "Bir-Hakeim Bridge — the arched ironwork frames the tower perfectly, beloved by filmmakers",
            "Seine riverbank at night — reflections on water with the hourly sparkle",
          ],
        },
        {
          id: "p2", order: 2,
          name: "Musée du Louvre",
          description: "The world's largest art museum occupies a former royal palace on the Seine. With 35,000 works on display across 72,735 square metres, one visit can only scratch the surface. The glass pyramid entrance, designed by I.M. Pei, remains quietly controversial.",
          country: "France", state: "Paris",
          mapLink: "https://maps.google.com/?q=Louvre+Museum+Paris",
          images: [
            "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80",
            "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=80",
          ],
          notes: "Free on the first Sunday of every month. Arrive at opening — the Mona Lisa room fills fast.",
          photoSpots: [
            "Glass Pyramid at dusk — golden light reflecting off the pyramid against the palace facade",
            "Richelieu Wing courtyard — Napoleon's horses sculptures under the glass roof",
            "Denon Wing corridor — the long gallery creates a stunning vanishing-point perspective",
          ],
        },
      ],
      break: {
        label: "Lunch Break",
        eateries: [
          {
            id: "e1", name: "Café de Flore",
            description: "A Left Bank institution since 1887. Existentialists Sartre and de Beauvoir held court here for decades. The croque-monsieur and café crème are benchmarks. Touristy, yes — but the terrace on Boulevard Saint-Germain is still magic.",
            images: [
              "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80",
              "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=900&q=80",
            ],
            mapLink: "https://maps.google.com/?q=Cafe+de+Flore+Paris",
          },
          {
            id: "e2", name: "Boulangerie Poilâne",
            description: "Paris's most celebrated bakery, known for its large sourdough miche baked in wood-fired ovens since 1932. Grab a slice of their famous apple tart or a sablé cookie and eat on the street — this is Parisian lunch at its most honest.",
            images: [
              "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80",
              "https://images.unsplash.com/photo-1549931319-a545dcf3bc7f?w=900&q=80",
            ],
            mapLink: "https://maps.google.com/?q=Poilane+Bakery+Paris",
          },
        ],
      },
    },
    {
      id: "d2", dayNumber: 2, date: "2025-06-02", label: "Rome — Ancient & Eternal",
      places: [
        {
          id: "p3", order: 1,
          name: "Colosseum",
          description: "Completed in 80 AD under Emperor Titus, the Colosseum held up to 80,000 spectators for gladiatorial combat, animal hunts, and public spectacles. Even in ruin it is breathtaking — the largest amphitheatre ever built, still standing after two millennia.",
          country: "Italy", state: "Rome",
          mapLink: "https://maps.google.com/?q=Colosseum+Rome",
          images: [
            "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80",
            "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=900&q=80",
            "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=900&q=80",
          ],
          notes: "Book skip-the-line tickets. Combine with the Roman Forum and Palatine Hill on one ticket.",
          photoSpots: [
            "Via Sacra approach — the full front facade framed between ancient pines",
            "Interior arena floor — looking up at the tiered arches for scale and drama",
            "Arch of Constantine opposite — both monuments in one wide frame at golden hour",
          ],
        },
        {
          id: "p4", order: 2,
          name: "Trevi Fountain",
          description: "Rome's most flamboyant baroque fountain, completed in 1762. Neptune commands the centrepiece, flanked by tritons wrestling seahorses. Some €1.5 million in coins are thrown in each year — the tradition guarantees your return to Rome.",
          country: "Italy", state: "Rome",
          mapLink: "https://maps.google.com/?q=Trevi+Fountain+Rome",
          images: [
            "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=900&q=80",
            "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=900&q=80",
          ],
          notes: "Visit between 5–6 am for crowd-free photos. The fountain is cleaned and drained periodically.",
          photoSpots: [
            "Left corner at street level — Neptune's horses at an oblique angle, catching the water spray",
            "Above from the steps — birds-eye view of the coins glittering in turquoise water",
            "Night long-exposure — silky water motion against golden-lit baroque stone",
          ],
        },
      ],
      break: {
        label: "Lunch Break",
        eateries: [
          {
            id: "e3", name: "Supplì Roma",
            description: "Roman street food at its finest. Supplì are deep-fried rice croquettes stuffed with mozzarella — bite in and watch the cheese stretch. This tiny shop near the Campo de' Fiori has been frying them since 1979. Join the queue; it moves fast.",
            images: [
              "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=900&q=80",
              "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=900&q=80",
            ],
            mapLink: "https://maps.google.com/?q=Suppli+Roma",
          },
        ],
      },
    },
    {
      id: "d3", dayNumber: 3, date: "2025-06-03", label: "Amsterdam — Canals & Culture",
      places: [
        {
          id: "p5", order: 1,
          name: "Anne Frank House",
          description: "The secret annex where Anne Frank and her family hid for over two years during the German occupation. Now a museum of quiet power, it preserves the original rooms. Deeply moving.",
          country: "Netherlands", state: "Amsterdam",
          mapLink: "https://maps.google.com/?q=Anne+Frank+House+Amsterdam",
          images: [
            "https://images.unsplash.com/photo-1584003564911-fa850f1b5dfc?w=900&q=80",
            "https://images.unsplash.com/photo-1589307357824-5e4a58da4bc4?w=900&q=80",
          ],
          notes: "Timed entry only — book weeks ahead online. No photography inside the annex out of respect.",
          photoSpots: [
            "Prinsengracht canal facade — the narrow house exterior reflected in the canal at dawn",
            "Westerkerk tower nearby — looking down the canal with church spire and bicycles below",
          ],
        },
        {
          id: "p6", order: 2,
          name: "Rijksmuseum",
          description: "The Netherlands' premier museum of art and history, home to Rembrandt's Night Watch and Vermeer's The Milkmaid. The building itself is a neo-Gothic and Renaissance masterpiece, renovated by Cruz y Ortiz in 2013.",
          country: "Netherlands", state: "Amsterdam",
          mapLink: "https://maps.google.com/?q=Rijksmuseum+Amsterdam",
          images: [
            "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=900&q=80",
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=900&q=80",
          ],
          notes: "Last entry is 30 minutes before closing. The museum garden is free and beautiful.",
          photoSpots: [
            "Museumplein reflecting pool — symmetrical shot with the museum's red facade",
            "Grand Hall interior — the arched gilded ceiling frames the Night Watch perfectly",
            "Museum garden arcade — bicycle-friendly passage under the building with arched views",
          ],
        },
      ],
      break: {
        label: "Coffee & Snack Break",
        eateries: [
          {
            id: "e4", name: "Winkel 43",
            description: "Famous for what many call Amsterdam's best apple pie — a towering slice of warm, cinnamon-heavy appeltaart buried under whipped cream. The café sits on Noordermarkt square, perfect for watching canal life.",
            images: [
              "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=900&q=80",
              "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80",
            ],
            mapLink: "https://maps.google.com/?q=Winkel+43+Amsterdam",
          },
          {
            id: "e5", name: "Albert Cuyp Market — Stroopwafel",
            description: "Freshly made stroopwafels — thin caramel-filled waffle sandwiches — are a Dutch staple. At Albert Cuyp, vendors make them hot to order. Rest the waffle on your coffee cup for 30 seconds to soften the caramel syrup inside.",
            images: [
              "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900&q=80",
              "https://images.unsplash.com/photo-1545580219-dda9a2e8b0de?w=900&q=80",
            ],
            mapLink: "https://maps.google.com/?q=Albert+Cuyp+Market+Amsterdam",
          },
        ],
      },
    },
  ],
};

/* ─────────────────────────────────────────────
   GOOGLE DRIVE HELPERS
   Uses the Anthropic Claude MCP Gmail/Drive proxy
───────────────────────────────────────────── */
async function callDriveApi(body: object): Promise<any> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a Google Drive file manager. 
When asked to SEARCH for a file, call the gdrive_search tool.
When asked to GET file content, call the gdrive_fetch tool.
When asked to CREATE or UPDATE a file, call the gdrive_create_file or gdrive_update_file tool.
Always respond with ONLY a JSON object (no markdown) with keys: "action", "fileId" (if found), "content" (if fetched), "success" (boolean).`,
      messages: [{ role: "user", content: JSON.stringify(body) }],
      mcp_servers: [{ type: "url", url: "https://drivemcp.googleapis.com/mcp/v1", name: "gdrive" }],
    }),
  });
  const data = await res.json();
  // Extract text or tool results
  const toolResults = (data.content || []).filter((b: any) => b.type === "mcp_tool_result");
  const textBlocks  = (data.content || []).filter((b: any) => b.type === "text");
  return { toolResults, textBlocks, raw: data };
}

async function findTripFileId(): Promise<string | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You manage Google Drive files. Search for a file named exactly "${DRIVE_FILE_NAME}" in the user's Drive. 
Respond ONLY with a raw JSON object (no markdown backticks): {"fileId": "<id or null>"}`,
        messages: [{ role: "user", content: `Search Google Drive for file named: ${DRIVE_FILE_NAME}` }],
        mcp_servers: [{ type: "url", url: "https://drivemcp.googleapis.com/mcp/v1", name: "gdrive" }],
      }),
    });
    const data = await res.json();
    const textBlock = (data.content || []).find((b: any) => b.type === "text");
    const toolResult = (data.content || []).find((b: any) => b.type === "mcp_tool_result");
    const raw = textBlock?.text || toolResult?.content?.[0]?.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.fileId || null;
  } catch {
    return null;
  }
}

// async function loadTripFromDrive(): Promise<Trip | null> {
//   try {
//     const res = await fetch("https://api.anthropic.com/v1/messages", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: "claude-sonnet-4-20250514",
//         max_tokens: 4096,
//         system: `You manage Google Drive files. Search for a file named exactly "${DRIVE_FILE_NAME}" in the user's Drive, then fetch its full content. 
// Respond ONLY with a raw JSON object (no markdown): {"found": true/false, "content": "<raw file text or null>"}`,
//         messages: [{ role: "user", content: `Find and return the full content of the file named: ${DRIVE_FILE_NAME}` }],
//         mcp_servers: [{ type: "url", url: "https://drivemcp.googleapis.com/mcp/v1", name: "gdrive" }],
//       }),
//     });
//     const data = await res.json();
//     const textBlock = (data.content || []).find((b: any) => b.type === "text");
//     const toolResults = (data.content || []).filter((b: any) => b.type === "mcp_tool_result");
//     // Try text block first, then tool results
//     let raw = textBlock?.text || "";
//     if (!raw && toolResults.length > 0) {
//       raw = toolResults[toolResults.length - 1]?.content?.[0]?.text || "";
//     }
//     const clean = raw.replace(/```json|```/g, "").trim();
//     // The response might be the wrapper OR raw trip JSON
//     try {
//       const wrapper = JSON.parse(clean);
//       if (wrapper.found && wrapper.content) {
//         const trip = JSON.parse(wrapper.content);
//         if (trip.title && trip.days) return trip as Trip;
//       }
//       // Maybe it returned trip JSON directly
//       if (wrapper.title && wrapper.days) return wrapper as Trip;
//     } catch {
//       // Try parsing raw as Trip directly
//       try {
//         const trip = JSON.parse(clean);
//         if (trip.title && trip.days) return trip as Trip;
//       } catch { /* ignore */ }
//     }
//     return null;
//   } catch {
//     return null;
//   }
// }


const RAW_URL = "https://raw.githubusercontent.com/nuraiman321/tripData/main/tripData.json";
// const RAW_URL = "https://github.com/nuraiman321/tripData/blob/main/tripData.json";

const USERNAME = "nuraiman321";
const REPO = "tripData";
const FILE_PATH = "tripData.json";

async function loadTripFromDrive() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Accept: "application/vnd.github.v3.raw", // returns raw content directly
        },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

async function saveTripToDrive(trip: Trip): Promise<boolean> {
  try {
    const content = JSON.stringify(trip, null, 2);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You manage Google Drive files. 
1. First search for a file named exactly "${DRIVE_FILE_NAME}".
2. If found, update it with the new content provided.
3. If not found, create a new file named "${DRIVE_FILE_NAME}" with the content provided.
Respond ONLY with raw JSON (no markdown): {"success": true/false, "fileId": "<id>"}`,
        messages: [{
          role: "user",
          content: `Save this JSON content to Google Drive as "${DRIVE_FILE_NAME}":\n\n${content}`,
        }],
        mcp_servers: [{ type: "url", url: "https://drivemcp.googleapis.com/mcp/v1", name: "gdrive" }],
      }),
    });
    const data = await res.json();
    const textBlock = (data.content || []).find((b: any) => b.type === "text");
    const toolResults = (data.content || []).filter((b: any) => b.type === "mcp_tool_result");
    const raw = textBlock?.text || toolResults[toolResults.length - 1]?.content?.[0]?.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.success === true;
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────────
   SYNC STATUS BADGE
───────────────────────────────────────────── */
type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error" | "not-connected";

function SyncBadge({ status, onRetry }: { status: SyncStatus; onRetry?: () => void }) {
  const configs: Record<SyncStatus, { icon: string; label: string; color: string; bg: string; border: string }> = {
    idle:          { icon: "☁️", label: "Drive",          color: GOLD_DIM,                   bg: GOLD_FAINT,                      border: `rgba(200,170,100,0.2)` },
    loading:       { icon: "⟳",  label: "Loading…",       color: "rgba(120,180,240,0.7)",     bg: "rgba(80,140,220,0.08)",          border: "rgba(100,160,240,0.2)" },
    saving:        { icon: "⟳",  label: "Saving…",        color: "rgba(120,180,240,0.7)",     bg: "rgba(80,140,220,0.08)",          border: "rgba(100,160,240,0.2)" },
    saved:         { icon: "✓",  label: "Saved to Drive", color: "rgba(80,200,140,0.8)",      bg: "rgba(40,160,100,0.08)",          border: "rgba(60,180,120,0.25)" },
    error:         { icon: "!",  label: "Sync failed",    color: "rgba(220,100,80,0.8)",      bg: "rgba(200,60,40,0.08)",           border: "rgba(200,80,60,0.25)" },
    "not-connected": { icon: "↑", label: "Connect Drive", color: "rgba(200,140,60,0.7)",      bg: "rgba(180,120,40,0.08)",          border: "rgba(200,140,60,0.2)" },
  };
  const c = configs[status];
  const spinning = status === "loading" || status === "saving";
  return (
    <button
      onClick={onRetry}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 99, background: c.bg, border: `0.5px solid ${c.border}`, color: c.color, fontFamily: BODY, fontSize: 11, cursor: onRetry ? "pointer" : "default", letterSpacing: "0.06em", transition: "all 0.3s" }}
    >
      <span style={{ display: "inline-block", animation: spinning ? "spin 1s linear infinite" : "none", fontSize: 13 }}>{c.icon}</span>
      {c.label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   EATERY MODAL
───────────────────────────────────────────── */
function EateryModal({ eatery, onClose }: { eatery: Eatery; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(8,6,4,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(12px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BG_CARD, borderRadius: 18, maxWidth: 560, width: "100%", maxHeight: "88vh", overflowY: "auto", border: "0.5px solid rgba(200,120,60,0.3)", boxShadow: "0 40px 100px rgba(0,0,0,0.95)" }}>
        <div style={{ position: "relative", height: 240, overflow: "hidden", borderRadius: "18px 18px 0 0", background: "#1a1208" }}>
          {eatery.images[imgIdx] && <img src={eatery.images[imgIdx]} alt={eatery.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,16,12,0.97) 0%, rgba(19,16,12,0.1) 60%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.55)", border: "0.5px solid rgba(255,255,255,0.1)", color: "#d4c4a0", cursor: "pointer", borderRadius: "50%", width: 32, height: 32, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(180,100,30,0.75)", backdropFilter: "blur(6px)", borderRadius: 99, padding: "4px 12px", border: "0.5px solid rgba(220,160,80,0.4)" }}>
            <span style={{ fontSize: 10, color: "#fde4a0", fontFamily: BODY, letterSpacing: "0.08em" }}>🍽 Food Stop</span>
          </div>
          {eatery.images.length > 1 && (
            <>
              <button onClick={() => setImgIdx((i) => (i - 1 + eatery.images.length) % eatery.images.length)} style={{ position: "absolute", left: 10, top: "44%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <button onClick={() => setImgIdx((i) => (i + 1) % eatery.images.length)} style={{ position: "absolute", right: 10, top: "44%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </>
          )}
        </div>
        {eatery.images.length > 1 && (
          <div style={{ display: "flex", gap: 5, padding: "7px 18px", background: "#0e0b08", borderBottom: "0.5px solid rgba(200,120,60,0.12)", alignItems: "center" }}>
            {eatery.images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width: 50, height: 38, borderRadius: 5, overflow: "hidden", border: i === imgIdx ? "1.5px solid rgba(200,140,60,0.8)" : "1.5px solid transparent", cursor: "pointer", padding: 0, background: "none", opacity: i === imgIdx ? 1 : 0.5, transition: "all 0.2s" }}>
                <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
        )}
        <div style={{ padding: "22px 26px 30px" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 900, color: TEXT_PRIMARY, margin: "0 0 12px", lineHeight: 1.2 }}>{eatery.name}</h3>
          <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.85, color: TEXT_MID, margin: "0 0 18px" }}>{eatery.description}</p>
          {eatery.mapLink && (
            <a href={eatery.mapLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 99, background: "transparent", border: "1px solid rgba(200,140,60,0.35)", color: "rgba(220,170,80,0.9)", textDecoration: "none", fontSize: 12, fontFamily: BODY, letterSpacing: "0.05em" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,140,60,0.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              View on Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PLACE MODAL
───────────────────────────────────────────── */
function PlaceModal({ place, onClose }: { place: Place; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const prev = () => setImgIdx((i) => (i - 1 + place.images.length) % place.images.length);
  const next = () => setImgIdx((i) => (i + 1) % place.images.length);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,8,5,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(10px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BG_CARD, borderRadius: 20, maxWidth: 680, width: "100%", maxHeight: "92vh", overflowY: "auto", border: `0.5px solid rgba(200,170,100,0.22)`, boxShadow: "0 48px 120px rgba(0,0,0,0.9)" }}>
        <div style={{ position: "relative", height: 300, overflow: "hidden", borderRadius: "20px 20px 0 0", background: "#1a1710" }}>
          {place.images.length > 0 && <img src={place.images[imgIdx]} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,16,12,0.98) 0%, rgba(19,16,12,0.15) 55%, rgba(0,0,0,0.3) 100%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.55)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#d4c4a0", cursor: "pointer", borderRadius: "50%", width: 34, height: 34, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", border: `0.5px solid ${GOLD_DIM}`, borderRadius: 99, padding: "5px 13px" }}>
            <span style={{ fontSize: 11, color: GOLD, letterSpacing: "0.07em", fontFamily: BODY }}>{place.state} · {place.country}</span>
          </div>
          <div style={{ position: "absolute", bottom: 18, left: 24 }}>
            <div style={{ fontSize: 9, color: "rgba(200,170,100,0.6)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: BODY, marginBottom: 2 }}>Stop</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: TEXT_PRIMARY, fontFamily: SERIF, lineHeight: 1 }}>{String(place.order).padStart(2, "0")}</div>
          </div>
          {place.images.length > 1 && (
            <>
              <button onClick={prev} style={{ position: "absolute", left: 12, top: "42%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <button onClick={next} style={{ position: "absolute", right: 12, top: "42%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </>
          )}
        </div>
        {place.images.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "8px 20px", background: "#0e0c09", borderBottom: `0.5px solid ${BORDER_FAINT}`, alignItems: "center" }}>
            {place.images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width: 54, height: 40, borderRadius: 6, overflow: "hidden", border: i === imgIdx ? `1.5px solid ${GOLD}` : "1.5px solid transparent", cursor: "pointer", padding: 0, background: "none", opacity: i === imgIdx ? 1 : 0.5, transition: "all 0.2s" }}>
                <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 11, color: GOLD_DIM, fontFamily: BODY }}>{imgIdx + 1}/{place.images.length}</span>
          </div>
        )}
        <div style={{ padding: "26px 30px 34px" }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 900, color: TEXT_PRIMARY, margin: "0 0 14px", lineHeight: 1.15 }}>{place.name}</h2>
          <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.88, color: TEXT_MID, margin: "0 0 20px" }}>{place.description}</p>
          <a href={place.mapLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 99, background: "transparent", border: `1px solid rgba(200,170,100,0.35)`, color: GOLD, textDecoration: "none", fontSize: 12, fontFamily: BODY, letterSpacing: "0.05em", marginBottom: (place.notes || (place.photoSpots?.length ?? 0) > 0) ? 22 : 0 }} onMouseEnter={(e) => { e.currentTarget.style.background = GOLD_FAINT; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            Open in Google Maps
          </a>
          {place.notes && (
            <div style={{ background: GOLD_FAINT, borderLeft: `2px solid ${GOLD}`, borderRadius: "0 10px 10px 0", padding: "14px 18px", marginBottom: (place.photoSpots?.length ?? 0) > 0 ? 20 : 0 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, fontFamily: BODY, marginBottom: 6, fontWeight: 500 }}>Traveller's Note</div>
              <p style={{ margin: 0, fontFamily: BODY, fontStyle: "italic", fontSize: 13.5, color: "#c8a870", lineHeight: 1.75 }}>{place.notes}</p>
            </div>
          )}
          {(place.photoSpots?.length ?? 0) > 0 && (
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 16 }}>📸</div>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(120,180,220,0.7)", fontFamily: BODY, fontWeight: 500 }}>Photo Spots</div>
                  <div style={{ fontSize: 12, color: "rgba(120,180,220,0.4)", fontFamily: BODY }}>Best locations to shoot</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {place.photoSpots!.map((spot, idx) => {
                  const parts = spot.split("—");
                  const location = parts[0]?.trim();
                  const reason = parts.slice(1).join("—").trim();
                  return (
                    <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(80,140,200,0.06)", border: "0.5px solid rgba(100,160,220,0.15)", borderRadius: 10, padding: "11px 14px" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(80,140,200,0.15)", border: "0.5px solid rgba(100,160,220,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 10, color: "rgba(140,190,240,0.8)", fontFamily: SERIF, fontWeight: 700 }}>{idx + 1}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {location && <div style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "rgba(180,210,240,0.85)", marginBottom: reason ? 3 : 0 }}>{location}</div>}
                        {reason && <div style={{ fontFamily: BODY, fontSize: 12.5, color: "rgba(140,170,200,0.6)", lineHeight: 1.55, fontStyle: "italic" }}>{reason}</div>}
                        {!reason && <div style={{ fontFamily: BODY, fontSize: 12.5, color: "rgba(140,170,200,0.6)", lineHeight: 1.55 }}>{spot}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   IMPORT PANEL
───────────────────────────────────────────── */
const SCHEMA_EXAMPLE = `{
  "title": "My Trip",
  "coverImage": "https://...",
  "days": [{
    "id": "d1", "dayNumber": 1,
    "date": "2025-06-01", "label": "Day Name",
    "places": [{
      "id": "p1", "order": 1,
      "name": "Place Name",
      "description": "...",
      "country": "France", "state": "Paris",
      "mapLink": "https://maps.google.com/?q=...",
      "images": ["https://..."],
      "notes": "Tip here",
      "photoSpots": ["Corner X — reason why"]
    }],
    "break": {
      "label": "Lunch Break",
      "eateries": [{
        "id": "e1", "name": "Restaurant",
        "description": "About the food...",
        "images": ["https://..."],
        "mapLink": "https://maps.google.com/?q=..."
      }]
    }
  }]
}`;

function ImportPanel({ onImport, onDismiss }: { onImport: (t: Trip) => void; onDismiss: () => void }) {
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.title || !Array.isArray(parsed.days)) throw new Error("Missing required 'title' or 'days' fields.");
        onImport(parsed as Trip);
      } catch (err: any) {
        setError("Invalid JSON — " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(10,8,5,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(10px)" }}>
      <div style={{ background: BG_CARD, border: `0.5px solid rgba(200,170,100,0.2)`, borderRadius: 20, maxWidth: 540, width: "100%", padding: "38px 40px", boxShadow: "0 40px 120px rgba(0,0,0,0.85)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, fontFamily: BODY, marginBottom: 10 }}>Import Itinerary</div>
        <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 900, color: TEXT_PRIMARY, margin: "0 0 8px" }}>Load your trip JSON</h2>
        <p style={{ fontFamily: BODY, fontSize: 13, color: TEXT_DIM, lineHeight: 1.7, margin: "0 0 26px" }}>
          Drop a <code style={{ color: GOLD, background: GOLD_FAINT, padding: "1px 5px", borderRadius: 4 }}>.json</code> file below. It will be <strong style={{ color: GOLD }}>automatically saved to your Google Drive</strong> — so you can access it from any device.
        </p>

        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onClick={() => fileRef.current?.click()} style={{ border: `1.5px dashed ${dragging ? GOLD : "rgba(200,170,100,0.2)"}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: dragging ? GOLD_FAINT : "transparent", transition: "all 0.2s", marginBottom: 18 }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>📂</div>
          <p style={{ fontFamily: BODY, fontSize: 13, color: TEXT_DIM, margin: 0 }}>
            Drag & drop a <strong style={{ color: GOLD }}>.json</strong> file, or <strong style={{ color: GOLD }}>click to browse</strong>
          </p>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        </div>

        {error && (
          <div style={{ background: "rgba(180,50,40,0.12)", border: "0.5px solid rgba(180,50,40,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ margin: 0, fontFamily: BODY, fontSize: 13, color: "#e07060" }}>{error}</p>
          </div>
        )}

        <details style={{ marginBottom: 24 }}>
          <summary style={{ fontFamily: BODY, fontSize: 12, color: "rgba(200,170,100,0.5)", cursor: "pointer", userSelect: "none", marginBottom: 8, outline: "none" }}>View JSON schema</summary>
          <pre style={{ background: BG_DEEP, border: `0.5px solid rgba(200,170,100,0.12)`, borderRadius: 8, padding: "12px 14px", fontSize: 10.5, color: "#6a8a5a", overflow: "auto", fontFamily: "monospace", lineHeight: 1.65, maxHeight: 220 }}>{SCHEMA_EXAMPLE}</pre>
        </details>

        <button onClick={onDismiss} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "transparent", border: `0.5px solid rgba(200,170,100,0.18)`, color: TEXT_DIM, fontFamily: BODY, fontSize: 13, cursor: "pointer", letterSpacing: "0.04em" }} onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; }} onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_DIM; }}>
          Continue with sample data
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DAY CARD
───────────────────────────────────────────── */
function DayCard({ day, isActive, onClick, onPlaceClick, onEateryClick }: {
  day: Day; isActive: boolean; onClick: () => void;
  onPlaceClick: (p: Place) => void; onEateryClick: (e: Eatery) => void;
}) {
  const coverImg = day.places[0]?.images[0];
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: isActive ? `1px solid rgba(200,170,100,0.38)` : `0.5px solid rgba(200,170,100,0.1)`, background: BG_CARD, boxShadow: isActive ? "0 8px 40px rgba(200,170,100,0.07)" : "none", transition: "border-color 0.25s, box-shadow 0.25s" }}>
      <button onClick={onClick} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", display: "block" }}>
        <div style={{ display: "flex", alignItems: "stretch", minHeight: 92 }}>
          <div style={{ width: 110, flexShrink: 0, position: "relative", overflow: "hidden", background: "#1a1710" }}>
            {coverImg && <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(19,16,12,0) 50%, rgba(19,16,12,1) 100%)" }} />
          </div>
          <div style={{ flex: 1, padding: "16px 18px 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
                <span style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 900, color: isActive ? GOLD : "#2e2618", lineHeight: 1, transition: "color 0.25s" }}>{String(day.dayNumber).padStart(2, "0")}</span>
                <span style={{ fontFamily: BODY, fontSize: 10, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>{new Date(day.date + "T00:00:00").toLocaleDateString("en-MY", { month: "short", day: "numeric" })}</span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: "#e8d8b4", lineHeight: 1.25 }}>{day.label}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <span style={{ fontFamily: BODY, fontSize: 11, color: TEXT_DIM }}>{day.places.length} stop{day.places.length !== 1 ? "s" : ""}</span>
                {day.break && <span style={{ fontFamily: BODY, fontSize: 11, color: "rgba(200,140,60,0.5)" }}>· 🍽 {day.break.label ?? "Break"}</span>}
              </div>
            </div>
            <span style={{ fontSize: 20, color: TEXT_DIM, transform: isActive ? "rotate(90deg)" : "none", transition: "transform 0.25s", flexShrink: 0 }}>›</span>
          </div>
        </div>
      </button>

      {isActive && (
        <div style={{ borderTop: `0.5px solid ${BORDER_FAINT}` }}>
          {[...day.places].sort((a, b) => a.order - b.order).map((place, idx) => (
            <button key={place.id} onClick={() => onPlaceClick(place)} style={{ width: "100%", display: "flex", alignItems: "stretch", background: "none", border: "none", borderBottom: (idx < day.places.length - 1 || day.break) ? `0.5px solid rgba(200,170,100,0.08)` : "none", cursor: "pointer", textAlign: "left", padding: 0, transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,170,100,0.04)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
              <div style={{ width: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `0.5px solid rgba(200,170,100,0.08)` }}>
                <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 900, color: GOLD_DIM }}>{place.order}</span>
              </div>
              <div style={{ width: 68, height: 60, flexShrink: 0, overflow: "hidden", background: "#1a1710" }}>
                {place.images[0] && <img src={place.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
              </div>
              <div style={{ flex: 1, padding: "11px 14px", minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#e8d8b4", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.name}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: TEXT_DIM }}>{place.state}, {place.country}</div>
                {(place.photoSpots?.length ?? 0) > 0 && (
                  <div style={{ fontFamily: BODY, fontSize: 10.5, color: "rgba(120,170,220,0.45)", marginTop: 2 }}>📸 {place.photoSpots!.length} photo spot{place.photoSpots!.length !== 1 ? "s" : ""}</div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingRight: 14 }}>
                <span style={{ fontSize: 15, color: GOLD_DIM }}>›</span>
              </div>
            </button>
          ))}

          {day.break && (
            <div style={{ borderTop: `0.5px solid rgba(200,140,60,0.2)`, background: "rgba(180,100,20,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 8px" }}>
                <span style={{ fontSize: 14 }}>🍽</span>
                <div>
                  <div style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(200,140,60,0.6)", fontWeight: 500 }}>{day.break.label ?? "Break"}</div>
                  <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(200,140,60,0.35)" }}>{day.break.eateries.length} option{day.break.eateries.length !== 1 ? "s" : ""} nearby</div>
                </div>
              </div>
              {day.break.eateries.map((eatery) => (
                <button key={eatery.id} onClick={() => onEateryClick(eatery)} style={{ width: "100%", display: "flex", alignItems: "stretch", background: "none", border: "none", borderTop: `0.5px solid rgba(200,140,60,0.08)`, cursor: "pointer", textAlign: "left", padding: 0, transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,140,60,0.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                  <div style={{ width: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `0.5px solid rgba(200,140,60,0.08)` }}>
                    <span style={{ fontSize: 14, opacity: 0.5 }}>🍴</span>
                  </div>
                  <div style={{ width: 68, height: 60, flexShrink: 0, overflow: "hidden", background: "#1a1208" }}>
                    {eatery.images[0] && <img src={eatery.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                  </div>
                  <div style={{ flex: 1, padding: "11px 14px", minWidth: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 700, color: "#ddc8a0", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{eatery.name}</div>
                    <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(180,140,80,0.5)", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{eatery.description.split(".")[0]}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", paddingRight: 14 }}>
                    <span style={{ fontSize: 15, color: "rgba(200,140,60,0.3)" }}>›</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const [trip, setTrip]               = useState<Trip>(SAMPLE);
  const [activeDayId, setActiveDayId] = useState<string | null>("d1");
  const [selectedPlace, setSelectedPlace]   = useState<Place | null>(null);
  const [selectedEatery, setSelectedEatery] = useState<Eatery | null>(null);
  const [showImport, setShowImport]   = useState(false);
  const [syncStatus, setSyncStatus]   = useState<SyncStatus>("idle");
  const [syncMsg, setSyncMsg]         = useState("");
  const isSampleRef = useRef(true);   // true while showing sample data

  /* ── Auto-load from Drive on mount ── */
  useEffect(() => {
    (async () => {
      setSyncStatus("loading");
      setSyncMsg("Checking Google Drive…");
      const loaded = await loadTripFromDrive();
      console.log(loaded, "Loaded");
      
      if (loaded) {
        setTrip(loaded);
        setActiveDayId(loaded.days[0]?.id ?? null);
        isSampleRef.current = false;
        setSyncStatus("saved");
        setSyncMsg(`Loaded "${loaded.title}" from Drive`);
        setTimeout(() => setSyncStatus("idle"), 3000);
      } else {
        setSyncStatus("idle");
        setSyncMsg("");
      }
    })();
  }, []);

  /* ── Import handler — saves to Drive automatically ── */
  async function handleImport(t: Trip) {
    setTrip(t);
    setActiveDayId(t.days[0]?.id ?? null);
    setSelectedPlace(null);
    setSelectedEatery(null);
    setShowImport(false);
    isSampleRef.current = false;

    setSyncStatus("saving");
    setSyncMsg("Saving to Google Drive…");
    const ok = await saveTripToDrive(t);
    if (ok) {
      setSyncStatus("saved");
      setSyncMsg("Saved to Drive — accessible from any device ✓");
      setTimeout(() => setSyncStatus("idle"), 4000);
    } else {
      setSyncStatus("error");
      setSyncMsg("Couldn't save to Drive. Try again.");
    }
  }

  /* ── Manual re-sync ── */
  async function handleManualSync() {
    if (isSampleRef.current) { setShowImport(true); return; }
    setSyncStatus("saving");
    setSyncMsg("Syncing to Google Drive…");
    const ok = await saveTripToDrive(trip);
    if (ok) {
      setSyncStatus("saved");
      setSyncMsg("Synced ✓");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } else {
      setSyncStatus("error");
      setSyncMsg("Sync failed. Tap to retry.");
    }
  }

  const totalPlaces = trip.days.reduce((s, d) => s + d.places.length, 0);
  const totalBreaks = trip.days.filter((d) => d.break).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG_DEEP}; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: BG_DEEP }}>

        {/* ── Cover ── */}
        <div style={{ position: "relative", height: 460, overflow: "hidden" }}>
          {trip.coverImage && <img src={trip.coverImage} alt="cover" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,11,9,0.25) 0%, rgba(13,11,9,0.55) 55%, rgba(13,11,9,1) 100%)" }} />

          {/* Nav bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(200,170,100,0.65)", letterSpacing: "0.06em" }}>Itinerary</span>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Sync status badge */}
              <SyncBadge status={syncStatus} onRetry={syncStatus === "error" ? handleManualSync : syncStatus === "idle" ? handleManualSync : undefined} />

              {/* Import button */}
              <button onClick={() => setShowImport(true)} style={{ fontFamily: BODY, fontSize: 11, color: GOLD, background: GOLD_FAINT, border: `0.5px solid rgba(200,170,100,0.28)`, borderRadius: 99, padding: "7px 16px", cursor: "pointer", letterSpacing: "0.07em" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,170,100,0.18)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = GOLD_FAINT; }}>
                ↑ Import JSON
              </button>
            </div>
          </div>

          {/* Drive sync status message */}
          {syncMsg && (
            <div style={{ position: "absolute", top: 64, right: 28, fontFamily: BODY, fontSize: 11, color: syncStatus === "error" ? "rgba(220,100,80,0.8)" : "rgba(200,170,100,0.5)", letterSpacing: "0.04em", maxWidth: 260, textAlign: "right" }}>
              {syncMsg}
            </div>
          )}

          {/* Title */}
          <div style={{ position: "absolute", bottom: 44, left: 0, right: 0, padding: "0 28px" }}>
            <div style={{ maxWidth: 740, margin: "0 auto" }}>
              <div style={{ fontFamily: BODY, fontSize: 10, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
                ✦ &nbsp;{trip.days.length} Days &nbsp;· &nbsp;{totalPlaces} Destinations
                {totalBreaks > 0 && <> &nbsp;· &nbsp;{totalBreaks} Food Stop{totalBreaks !== 1 ? "s" : ""}</>}
              </div>
              <h1 style={{ fontFamily: SERIF, fontSize: "clamp(30px, 4.5vw, 54px)", fontWeight: 900, color: "#f5ead8", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{trip.title}</h1>
            </div>
          </div>
        </div>

        {/* ── Day list ── */}
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "36px 24px 80px" }}>

          {/* Drive status bar (below cover) */}
          {syncStatus !== "idle" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, background: syncStatus === "saved" ? "rgba(40,160,100,0.07)" : syncStatus === "error" ? "rgba(200,60,40,0.07)" : "rgba(80,140,220,0.07)", border: `0.5px solid ${syncStatus === "saved" ? "rgba(60,180,120,0.2)" : syncStatus === "error" ? "rgba(200,80,60,0.2)" : "rgba(100,160,240,0.15)"}`, marginBottom: 20 }}>
              <span style={{ fontSize: 14 }}>{syncStatus === "saved" ? "✅" : syncStatus === "error" ? "⚠️" : "☁️"}</span>
              <span style={{ fontFamily: BODY, fontSize: 12, color: syncStatus === "saved" ? "rgba(80,200,140,0.8)" : syncStatus === "error" ? "rgba(220,100,80,0.8)" : "rgba(120,180,240,0.7)" }}>
                {syncStatus === "loading" ? "Loading your itinerary from Google Drive…" : syncStatus === "saving" ? "Saving to Google Drive…" : syncStatus === "saved" ? "Your itinerary is synced to Google Drive — open on any device" : "Could not sync to Google Drive. Tap the badge above to retry."}
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(200,170,100,0.13)" }} />
            <span style={{ fontFamily: BODY, fontSize: 9, color: "rgba(200,170,100,0.45)", letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Day by Day</span>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(200,170,100,0.13)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...trip.days].sort((a, b) => a.dayNumber - b.dayNumber).map((day) => (
              <DayCard
                key={day.id}
                day={day}
                isActive={activeDayId === day.id}
                onClick={() => setActiveDayId((prev) => prev === day.id ? null : day.id)}
                onPlaceClick={setSelectedPlace}
                onEateryClick={setSelectedEatery}
              />
            ))}
          </div>

          <div style={{ marginTop: 56, textAlign: "center" }}>
            <div style={{ width: 1, height: 36, background: "rgba(200,170,100,0.18)", margin: "0 auto 14px" }} />
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(200,170,100,0.25)" }}>Select a destination or food stop to read more</p>
          </div>
        </div>
      </div>

      {selectedPlace  && <PlaceModal  place={selectedPlace}  onClose={() => setSelectedPlace(null)} />}
      {selectedEatery && <EateryModal eatery={selectedEatery} onClose={() => setSelectedEatery(null)} />}
      {showImport     && <ImportPanel onImport={handleImport}  onDismiss={() => setShowImport(false)} />}
    </>
  );
}
