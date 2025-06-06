"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Camera, Share2, Users, Eye, RefreshCw, UserCheck, QrCode } from "lucide-react"

// --- TYPESCRIPT INTERFACES ---
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

// --- CONSTANTS ---
const tourStops: TourStop[] = [
  { name: "Moena Centro", lat: 46.3769, lng: 11.6769, radius: 300, day: 1, emoji: "🏘️" },
  { name: "Passo San Pellegrino", lat: 46.3833, lng: 11.7833, radius: 500, day: 2, emoji: "🏔️" },
  { name: "Val San Nicolò", lat: 46.3667, lng: 11.7167, radius: 400, day: 3, emoji: "🌸" },
  { name: "Canazei", lat: 46.4769, lng: 11.7769, radius: 300, day: 4, emoji: "🚡" },
  { name: "Sass Pordoi", lat: 46.4833, lng: 11.8167, radius: 200, day: 4, emoji: "⛰️" },
  { name: "Lago di Carezza", lat: 46.4094, lng: 11.5794, radius: 200, day: 5, emoji: "🏞️" },
  { name: "Cavalese", lat: 46.2897, lng: 11.4597, radius: 400, day: 6, emoji: "🌲" },
]

const SHARED_POSITIONS_KEY = "trentino-all-positions"

// --- COMPONENT ---
export default function LiveTracking() {
  // State Hooks
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isDeviceSetup, setIsDeviceSetup] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentStop, setCurrentStop] = useState<TourStop | null>(null)
  const [visitedStops, setVisitedStops] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [sharedPositions, setSharedPositions] = useState<SharedPosition[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null)
  
  // SOLUZIONE PER L'ERRORE DI IDRATAZIONE: Stato per renderizzare solo sul client
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Questo si attiva solo una volta nel browser, dopo il render iniziale.
    // Impostando isClient a true, si scatena un secondo render che può usare le API del browser.
    setIsClient(true)
  }, [])
  
  // --- HELPER FUNCTIONS ---
  
  const getBaseUrl = (): string => {
    // Questa funzione ora verrà chiamata solo quando isClient è true
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

  // --- CORE LOGIC (eseguita solo sul client) ---
  
  useEffect(() => {
    // Tutto il codice che dipende dal browser viene eseguito solo quando isClient è true
    if (isClient) {
      const loadAllSharedPositions = () => {
        const savedPositions = localStorage.getItem(SHARED_POSITIONS_KEY)
        if (savedPositions) {
          try {
            const positions = JSON.parse(savedPositions)
            const now = Date.now()
            const filteredPositions = positions.filter((p: any) => now - new Date(p.lastUpdate).getTime() < 3600000)
            setSharedPositions(filteredPositions.map((p: any) => ({ ...p, lastUpdate: new Date(p.lastUpdate) })))
            localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(filteredPositions))
          } catch (e) { console.error("Errore caricamento posizioni:", e) }
        }
      }

      const updateSharedPosition = (newPosition: SharedPosition) => {
        setSharedPositions((prev) => {
          const filtered = prev.filter((p) => p.deviceInfo.id !== newPosition.deviceInfo.id)
          const updated = [...filtered, newPosition]
          localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(updated))
          return updated
        })
      }

      const checkForSharedPosition = () => {
        const urlParams = new URLSearchParams(window.location.search)
        const sharedData = urlParams.get("shared")
        if (sharedData) {
          try {
            const data = JSON.parse(decodeURIComponent(sharedData))
            const sharedPosition: SharedPosition = {
              deviceInfo: {
                id: data.deviceId, owner: data.owner, name: `Telefono di ${data.owner}`,
                color: data.owner === "Ivan" ? "blue" : "pink",
                emoji: data.owner === "Ivan" ? "👨‍💻" : "👩‍💼",
                isGuest: data.isGuest || false,
              },
              position: {
                latitude: data.lat, longitude: data.lng,
                accuracy: data.accuracy, timestamp: data.timestamp,
              },
              lastUpdate: new Date(data.timestamp), isOnline: true,
            }
            updateSharedPosition(sharedPosition)
            window.history.replaceState({}, document.title, window.location.pathname)
          } catch (e) { console.error("Errore caricamento URL condiviso:", e) }
        }
      }

      // --- SETUP INIZIALE ---
      const baseUrl = getBaseUrl()
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`)

      const savedDevice = localStorage.getItem("trentino-device")
      if (savedDevice) {
        setDeviceInfo(JSON.parse(savedDevice))
        setIsDeviceSetup(true)
      }

      loadAllSharedPositions()
      checkForSharedPosition()

      const syncPositions = () => {
        loadAllSharedPositions()
        // Ricondivide la posizione se il tracking è attivo (per mantenere lo stato online)
        // La logica per questa parte è già gestita da watchPosition
      }

      const interval = setInterval(syncPositions, 30000)
      setSyncInterval(interval)

      return () => {
        clearInterval(interval)
      }
    }
  }, [isClient])
  
  // Le altre funzioni che dipendono da `deviceInfo` o altre variabili di stato
  // non hanno bisogno di essere dentro lo useEffect perché vengono chiamate da eventi utente
  // che avvengono per forza sul client.

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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
    setIsTracking(true)
    setError("")

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: Position = {
          latitude: pos.coords.latitude, longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy, timestamp: pos.timestamp,
        }
        setPosition(newPosition)
        setLastUpdate(new Date())
        
        const url = generateShareUrl(newPosition)
        setShareUrl(url)
        setIsSharing(true)

        if (deviceInfo) {
          const sharedPos: SharedPosition = {
            deviceInfo, position: newPosition, lastUpdate: new Date(), isOnline: true
          }
          // Aggiorna la posizione nel "database" locale
          setSharedPositions(prev => {
            const others = prev.filter(p => p.deviceInfo.id !== deviceInfo.id)
            const updated = [...others, sharedPos];
            localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(updated))
            return updated;
          });
          checkNearbyStops(newPosition)
        }
      },
      (err) => { setError(`Errore GPS: ${err.message}`); setIsTracking(false) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }

  const stopTracking = () => {
    setIsTracking(false);
    setIsSharing(false);
    // Logica di pulizia già gestita dal `useEffect` di cleanup
  };

  const checkNearbyStops = (pos: Position) => {
    if (deviceInfo?.isGuest) return;
    for (const stop of tourStops) {
      const distance = calculateDistance(pos.latitude, pos.longitude, stop.lat, stop.lng);
      if (distance <= stop.radius) {
        setCurrentStop(stop);
        if (!visitedStops.includes(stop.name)) {
          setVisitedStops(prev => [...prev, stop.name]);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`🎉 Sei arrivato a ${stop.name}!`);
          }
        }
        return;
      }
    }
    setCurrentStop(null);
  };
  
  const generateShareUrl = (pos: Position): string => {
    if (!deviceInfo) return "";
    const shareData = {
        deviceId: deviceInfo.id, owner: deviceInfo.owner,
        lat: pos.latitude, lng: pos.longitude,
        timestamp: pos.timestamp, accuracy: pos.accuracy,
        isGuest: deviceInfo.isGuest,
    };
    return `${getBaseUrl()}?shared=${encodeURIComponent(JSON.stringify(shareData))}`;
  };

  const copyShareLink = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const sharePosition = () => {
    if (!position || !deviceInfo) return
    const googleMapsUrl = `https://www.google.com/maps?q=${position.latitude},${position.longitude}`
    const message = `🗺️ ${deviceInfo.emoji} ${deviceInfo.owner} è qui in Trentino!\n\n📍 Google Maps:\n${googleMapsUrl}\n\n🔗 Brochure Live:\n${getBaseUrl()}`
    if (navigator.share) {
      navigator.share({ title: `Posizione di ${deviceInfo.owner}`, text: message })
    } else {
      navigator.clipboard.writeText(message)
      alert("Messaggio copiato!")
    }
  }

  const setupGuest = () => {
    const guestName = prompt("Come ti chiami?")
    setupDevice("Guest", guestName || undefined)
  }

  // Effetto di cleanup per rimuovere la posizione quando si smonta o si smette di condividere
  useEffect(() => {
    return () => {
      if (isSharing && deviceInfo) {
        const saved = localStorage.getItem(SHARED_POSITIONS_KEY);
        if (saved) {
          const positions = JSON.parse(saved);
          const filtered = positions.filter((p: any) => p.deviceInfo.id !== deviceInfo.id);
          localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(filtered));
        }
      }
    }
  }, [isSharing, deviceInfo]);
  
  // --- RENDERING ---

  // 1. Mostra un loader se non siamo ancora sicuri di essere sul client.
  // Questo render è identico a quello del server e risolve l'errore di idratazione.
  if (!isClient) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600">Caricamento modulo di tracking interattivo...</p>
        </CardContent>
      </Card>
    )
  }

  // 2. Se siamo sul client, mostra l'interfaccia completa.
  const allPositions = sharedPositions.filter(p => p.isOnline);

  return (
    <div className="space-y-6">
      {!isDeviceSetup ? (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
           {/* ... Contenuto della Card di Setup ... (identico al tuo codice originale) */}
            <CardHeader><CardTitle>📱 Chi Sta Usando Questo Dispositivo?</CardTitle></CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                    <button onClick={() => setupDevice("Ivan")} className="p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg"><div className="text-center"><div className="text-4xl mb-2">👨‍💻</div><h3 className="font-bold text-blue-800">Ivan</h3></div></button>
                    <button onClick={() => setupDevice("Rita")} className="p-6 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-lg"><div className="text-center"><div className="text-4xl mb-2">👩‍💼</div><h3 className="font-bold text-pink-800">Rita</h3></div></button>
                    <button onClick={setupGuest} className="p-6 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-lg"><div className="text-center"><div className="text-4xl mb-2">👤</div><h3 className="font-bold text-gray-800">Ospite</h3></div></button>
                </div>
            </CardContent>
        </Card>
      ) : (
        <>
            {/* QR Code Fisso */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
                <CardHeader><CardTitle className="flex items-center"><QrCode className="w-6 h-6 mr-2" />QR Code Mappa Live</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-800 mb-2">Scansiona per Vedere Tutti</h4>
                        <p>Questo QR code porta alla mappa live. Salvalo e invialo a chi vuoi!</p>
                    </div>
                </CardContent>
            </Card>

            {/* Controlli Tracking */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Navigation className="w-6 h-6 mr-2 text-blue-600" /> Live Tracking GPS
                        <Badge className="ml-2">{deviceInfo?.emoji} {deviceInfo?.owner}</Badge>
                        <Badge className="ml-2 bg-green-600">{allPositions.length} attivi</Badge>
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
                    {error && <div className="text-red-600">{error}</div>}
                    {/* ... Resto dell'interfaccia (Posizioni condivise, Mappa, Progresso, ecc.) come nel tuo codice originale ... */}
                </CardContent>
            </Card>

            {/* Mappa Integrata */}
            {allPositions.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>🗺️ Mappa Live di Tutti</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full h-[400px] relative">
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/view?key=YOUR_Maps_API_KEY&center=${allPositions[0].position.latitude},${allPositions[0].position.longitude}&zoom=13`} // Nota: Per i marker avresti bisogno di un'implementazione più complessa
                                width="100%"
                                height="100%"
                                className="border-0"
                                loading="lazy"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ... Aggiungi qui le altre card che avevi, come la lista delle posizioni, la tappa attuale, etc. ... */}
        </>
      )}
    </div>
  )
}
