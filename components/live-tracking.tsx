"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Share2, RefreshCw, QrCode } from "lucide-react"

// --- INTERFACCE TYPESCRIPT (invariate) ---
interface Position {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface TourStop {
  name: string
  lat: number
  lng: number
  radius: number // metri
  day: number
  emoji: string
}

interface DeviceInfo {
  id: string
  name: string
  owner: string
  color: string
  emoji: string
  isGuest: boolean
}

interface SharedPosition {
  deviceInfo: DeviceInfo
  position: Position
  lastUpdate: Date
  isOnline: boolean
}

// --- COSTANTI (invariate) ---
const tourStops: TourStop[] = [
    { name: "Moena Centro", lat: 46.3769, lng: 11.6769, radius: 300, day: 1, emoji: "🏘️" },
    { name: "Passo San Pellegrino", lat: 46.3833, lng: 11.7833, radius: 500, day: 2, emoji: "🏔️" },
    { name: "Val San Nicolò", lat: 46.3667, lng: 11.7167, radius: 400, day: 3, emoji: "🌸" },
    { name: "Canazei", lat: 46.4769, lng: 11.7769, radius: 300, day: 4, emoji: "🚡" },
    { name: "Sass Pordoi", lat: 46.4833, lng: 11.8167, radius: 200, day: 4, emoji: "⛰️" },
    { name: "Lago di Carezza", lat: 46.4094, lng: 11.5794, radius: 200, day: 5, emoji: "🏞️" },
    { name: "Cavalese", lat: 46.2897, lng: 11.4597, radius: 400, day: 6, emoji: "🌲" },
]

// --- COMPONENTE ---
export default function LiveTracking() {
  // --- State Hooks ---
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isDeviceSetup, setIsDeviceSetup] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentStop, setCurrentStop] = useState<TourStop | null>(null)
  const [visitedStops, setVisitedStops] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [sharedPositions, setSharedPositions] = useState<SharedPosition[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true); // Stato di caricamento per l'API

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // --- FUNZIONI HELPER (invariate) ---
  const getBaseUrl = (): string => {
    return window.location.origin + window.location.pathname
  }

  const generateDeviceId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `device_${timestamp}_${random}`
  }
  
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // --- LOGICA API ---
  const getPositionsFromAPI = async () => {
    try {
      // ⚠️ SOSTITUISCI CON L'URL DELLA TUA API GET
      const response = await fetch('/api/positions'); 
      if (!response.ok) {
        throw new Error('Errore nel recupero delle posizioni');
      }
      const positions: SharedPosition[] = await response.json();
      // Converte la stringa della data in un oggetto Date
      setSharedPositions(positions.map(p => ({ ...p, lastUpdate: new Date(p.lastUpdate) })));
    } catch (err: any) {
      setError(`Errore API: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePositionToAPI = async (currentPosition: Position) => {
    if (!deviceInfo) return;

    try {
      // ⚠️ SOSTITUISCI CON L'URL DELLA TUA API POST/PUT
      await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceInfo,
          position: currentPosition,
        }),
      });
    } catch (err: any) {
      // Gestisci l'errore in modo silenzioso per non infastidire l'utente
      console.error("Errore API durante l'aggiornamento:", err.message);
    }
  };

  // --- LOGICA CORE (Client-side) ---
  useEffect(() => {
    if (isClient) {
      const savedDevice = localStorage.getItem("trentino-device")
      if (savedDevice) {
        setDeviceInfo(JSON.parse(savedDevice))
        setIsDeviceSetup(true)
      }

      const baseUrl = getBaseUrl()
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`)

      // Caricamento iniziale e poi ogni 30 secondi
      getPositionsFromAPI();
      const interval = setInterval(getPositionsFromAPI, 30000);

      return () => {
        clearInterval(interval)
        // Pulisci il watch del GPS se il componente viene smontato
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
      }
    }
  }, [isClient])
  
  const setupDevice = (owner: "Ivan" | "Rita" | "Guest", customName?: string) => {
    const deviceId = generateDeviceId()
    const isGuest = owner === "Guest"
    const device: DeviceInfo = {
      id: deviceId,
      name: isGuest ? customName || "Ospite" : owner === "Ivan" ? "iPhone di Ivan" : "Telefono di Rita",
      owner: isGuest ? customName || "Ospite" : owner,
      color: owner === "Ivan" ? "blue" : owner === "Rita" ? "pink" : "gray",
      emoji: owner === "Ivan" ? "👨‍💻" : owner === "Rita" ? "👩‍💼" : "👤",
      isGuest: isGuest,
    }
    setDeviceInfo(device)
    setIsDeviceSetup(true)
    // Salviamo solo le info del dispositivo, non le posizioni
    localStorage.setItem("trentino-device", JSON.stringify(device))
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata")
      return
    }
    if (deviceInfo?.isGuest) {
      setError("Gli ospiti possono solo visualizzare")
      return
    }
    
    setError("")
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const newPosition: Position = {
          latitude: pos.coords.latitude, longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy, timestamp: pos.timestamp,
        }
        setPosition(newPosition)
        
        // Invia la posizione all'API
        await updatePositionToAPI(newPosition);

        // Aggiorna la vista locale immediatamente per reattività
        if (deviceInfo) {
            setSharedPositions(prev => {
                const self: SharedPosition = { deviceInfo, position: newPosition, lastUpdate: new Date(), isOnline: true };
                const others = prev.filter(p => p.deviceInfo.id !== deviceInfo.id);
                return [...others, self];
            });
        }
        checkNearbyStops(newPosition)
      },
      (err) => { setError(`Errore GPS: ${err.message}`); setIsTracking(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  const stopTracking = () => {
    setIsTracking(false);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    // TODO (Opzionale): Potresti voler chiamare un'API per notificare che il dispositivo è offline
    // await fetch('/api/offline', { method: 'POST', body: JSON.stringify({ deviceId: deviceInfo?.id }) });
  };

  const checkNearbyStops = (pos: Position) => {
    // ... Logica invariata
  };
  
  const sharePosition = () => {
    if (!position || !deviceInfo) return
    // CORREZIONE: Usa i template literal `` per inserire le variabili
    const googleMapsUrl = `https://www.google.com/maps?q=${position.latitude},${position.longitude}`
    const message = `??? ${deviceInfo.emoji} <span class="math-inline">\{deviceInfo\.owner\} è qui in Trentino\!\\n\\n?? Posizione su Google Maps\:\\n</span>{googleMapsUrl}\n\n?? Brochure Live:\n${getBaseUrl()}`;
    
    if (navigator.share) {
      navigator.share({ title: `Posizione di ${deviceInfo.owner}`, text: message })
    } else {
      navigator.clipboard.writeText(message).then(() => alert("Messaggio copiato!"))
    }
  }

  const setupGuest = () => {
    const guestName = prompt("Come ti chiami?")
    if (guestName) setupDevice("Guest", guestName || undefined)
  }

  // --- RENDERING ---
  if (!isClient || isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600">{isLoading ? "Caricamento posizioni dal server..." : "Caricamento modulo..."}</p>
        </CardContent>
      </Card>
    )
  }
  
  const onlinePositions = sharedPositions.filter(p => p.isOnline);

  return (
    <div className="space-y-6">
      {!isDeviceSetup ? (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader><CardTitle>📱 Chi Sta Usando Questo Dispositivo?</CardTitle></CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                    <button onClick={() => setupDevice("Ivan")} className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg text-center"><div className="text-4xl mb-2">👨‍💻</div><h3 className="font-bold text-blue-800">Ivan</h3></div></button>
                    <button onClick={() => setupDevice("Rita")} className="p-6 bg-pink-50 hover:bg-pink-100 rounded-lg text-center"><div className="text-4xl mb-2">👩‍💼</div><h3 className="font-bold text-pink-800">Rita</h3></div></button>
                    <button onClick={setupGuest} className="p-6 bg-gray-50 hover:bg-gray-100 rounded-lg text-center"><div className="text-4xl mb-2">👤</div><h3 className="font-bold text-gray-800">Ospite</h3></div></button>
                </div>
            </CardContent>
        </Card>
      ) : (
        <>
          {/* Card QR Code e Controlli Tracking (invariati) */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Navigation className="w-6 h-6 mr-2 text-blue-600" /> Live Tracking GPS
                    <Badge className="ml-2">{deviceInfo?.emoji} {deviceInfo?.owner}</Badge>
                    <Badge className="ml-2 bg-green-600">{onlinePositions.length} attivi</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!deviceInfo?.isGuest && (
                    <div className="flex flex-wrap gap-3 mb-4">
                        {!isTracking ? 
                            <button onClick={startTracking} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><MapPin className="w-4 h-4"/> Inizia Tracking</button> :
                            <button onClick={stopTracking} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><MapPin className="w-4 h-4"/> Ferma Tracking</button>
                        }
                        {position && <button onClick={sharePosition} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Share2 className="w-4 h-4"/> Condividi</button>}
                    </div>
                )}
                {error && <div className="text-red-600 font-semibold p-3 bg-red-50 rounded-md">{error}</div>}
            </CardContent>
          </Card>

          {/* Mappa Integrata che usa i dati dall'API */}
          {onlinePositions.length > 0 && (
            <Card>
                <CardHeader><CardTitle>🗺️ Mappa Live di Tutti i partecipanti</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="w-full h-[400px] relative bg-gray-200">
                      {(() => {
                        const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
                        if (!apiKey) return <div className="flex h-full items-center justify-center text-red-500">API Key di Google non configurata!</div>;
                        
                        const avgLat = onlinePositions.reduce((sum, p) => sum + p.position.latitude, 0) / onlinePositions.length;
                        const avgLng = onlinePositions.reduce((sum, p) => sum + p.position.longitude, 0) / onlinePositions.length;

                        const markers = onlinePositions.map(p => `&markers=color:${p.deviceInfo.color}%7Clabel:${p.deviceInfo.owner[0]}%7C${p.position.latitude},${p.position.longitude}`).join('');
                        const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${avgLat},${avgLng}&zoom=12&size=600x500${markers}&maptype=roadmap`;

                        return (
                          <iframe
                            title="Mappa Live del Gruppo"
                            src={mapUrl}
                            width="100%"
                            height="100%"
                            className="border-0"
                            loading="lazy"
                            allowFullScreen
                          ></iframe>
                        );
                      })()}
                    </div>
                </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
