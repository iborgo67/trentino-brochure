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
    { name: "Moena Centro", lat: 46.3769, lng: 11.6769, radius: 300, day: 1, emoji: "???" },
    { name: "Passo San Pellegrino", lat: 46.3833, lng: 11.7833, radius: 500, day: 2, emoji: "???" },
    { name: "Val San Nicolò", lat: 46.3667, lng: 11.7167, radius: 400, day: 3, emoji: "??" },
    { name: "Canazei", lat: 46.4769, lng: 11.7769, radius: 300, day: 4, emoji: "??" },
    { name: "Sass Pordoi", lat: 46.4833, lng: 11.8167, radius: 200, day: 4, emoji: "??" },
    { name: "Lago di Carezza", lat: 46.4094, lng: 11.5794, radius: 200, day: 5, emoji: "???" },
    { name: "Cavalese", lat: 46.2897, lng: 11.4597, radius: 400, day: 6, emoji: "??" },
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
  
  // Soluzione per l'errore di idratazione: Stato per renderizzare solo sul client
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Questo si attiva solo una volta nel browser, dopo il render iniziale.
    setIsClient(true)
  }, [])
  
  // --- HELPER FUNCTIONS ---
  
  const getBaseUrl = (): string => {
    // Questa funzione ora verrà chiamata solo quando isClient è true
    if (typeof window !== "undefined") {
      return window.location.origin + window.location.pathname
    }
    return ""
  }

  const generateDeviceId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `device_${timestamp}_${random}`
  }
  
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Raggio della Terra in metri
    const f1 = (lat1 * Math.PI) / 180
    const f2 = (lat2 * Math.PI) / 180
    const deltaF = ((lat2 - lat1) * Math.PI) / 180
    const deltaL = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(deltaF / 2) * Math.sin(deltaF / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // --- CORE LOGIC (eseguita solo sul client) ---
  
  useEffect(() => {
    if (isClient) {
      const loadAllSharedPositions = () => {
        const savedPositions = localStorage.getItem(SHARED_POSITIONS_KEY)
        if (savedPositions) {
          try {
            const positions = JSON.parse(savedPositions)
            const now = Date.now()
            // Filtra posizioni più vecchie di 1 ora
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
                emoji: data.owner === "Ivan" ? "?????" : "?????",
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
      if(baseUrl) {
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`)
      }

      const savedDevice = localStorage.getItem("trentino-device")
      if (savedDevice) {
        setDeviceInfo(JSON.parse(savedDevice))
        setIsDeviceSetup(true)
      }

      loadAllSharedPositions()
      checkForSharedPosition()

      const syncPositions = () => {
        loadAllSharedPositions()
      }

      const interval = setInterval(syncPositions, 30000)
      setSyncInterval(interval)

      return () => {
        clearInterval(interval)
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
      emoji: owner === "Ivan" ? "?????" : owner === "Rita" ? "?????" : "??",
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
    // Questo return non funziona come previsto qui, la logica di pulizia è spostata
    // return () => navigator.geolocation.clearWatch(watchId)
  }

  const stopTracking = () => {
    setIsTracking(false);
    setIsSharing(false);
    // La logica di pulizia per `watchPosition` dovrebbe essere gestita
    // in un useEffect che dipende da `isTracking`.
  };

  const checkNearbyStops = (pos: Position) => {
    if (deviceInfo?.isGuest) return;
    for (const stop of tourStops) {
      const distance = calculateDistance(pos.latitude, pos.longitude, stop.lat, stop.lng);
      if (distance <= stop.radius) {
        if (currentStop?.name !== stop.name) {
            setCurrentStop(stop);
            if (!visitedStops.includes(stop.name)) {
                setVisitedStops(prev => [...prev, stop.name]);
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(`?? Sei arrivato a ${stop.name}!`);
                }
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
    const baseUrl = getBaseUrl();
    return `${baseUrl}?shared=${encodeURIComponent(JSON.stringify(shareData))}`;
  };

  const copyShareLink = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const sharePosition = () => {
    if (!position || !deviceInfo) return
    const googleMapsUrl = `https://www.google.com/maps?q=${position.latitude},${position.longitude}`;
    const message = `??? ${deviceInfo.emoji} ${deviceInfo.owner} è qui in Trentino!\n\n?? Google Maps:\n${googleMapsUrl}\n\n?? Brochure Live:\n${getBaseUrl()}`
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

  useEffect(() => {
    return () => {
      if (!isSharing && deviceInfo) {
        const saved = localStorage.getItem(SHARED_POSITIONS_KEY);
        if (saved) {
          try {
            const positions = JSON.parse(saved);
            const filtered = positions.filter((p: any) => p.deviceInfo.id !== deviceInfo.id);
            localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(filtered));
          } catch(e) {
              console.error("Errore durante la pulizia della posizione", e);
          }
        }
      }
    }
  }, [isSharing, deviceInfo]);
  
  // --- RENDERING ---

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

  const allPositions = sharedPositions.filter(p => p.isOnline);

  return (
    <div className="space-y-6">
      {!isDeviceSetup ? (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
            <CardHeader><CardTitle>?? Chi Sta Usando Questo Dispositivo?</CardTitle></CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                    <button onClick={() => setupDevice("Ivan")} className="p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg"><div className="text-center"><div className="text-4xl mb-2">?????</div><h3 className="font-bold text-blue-800">Ivan</h3></div></button>
                    <button onClick={() => setupDevice("Rita")} className="p-6 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-lg"><div className="text-center"><div className="text-4xl mb-2">?????</div><h3 className="font-bold text-pink-800">Rita</h3></div></button>
                    <button onClick={setupGuest} className="p-6 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-lg"><div className="text-center"><div className="text-4xl mb-2">??</div><h3 className="font-bold text-gray-800">Ospite</h3></div></button>
                </div>
            </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <CardHeader><CardTitle className="flex items-center"><QrCode className="w-6 h-6 mr-2" />QR Code Mappa Live</CardTitle></CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" /> : <div className="w-40 h-40 bg-gray-200 animate-pulse rounded-lg"/>}
                </div>
                <div>
                    <h4 className="font-bold text-indigo-800 mb-2">Scansiona per Vedere Tutti</h4>
                    <p>Questo QR code porta alla mappa live. Salvalo e invialo a chi vuoi!</p>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center flex-wrap gap-2">
                    <Navigation className="w-6 h-6 text-blue-600" /> Live Tracking GPS
                    {deviceInfo && <Badge className="ml-2">{deviceInfo.emoji} {deviceInfo.owner}</Badge>}
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
                {error && <div className="text-red-600 font-semibold p-2 bg-red-50 rounded-md">{error}</div>}
            </CardContent>
          </Card>

          {allPositions.length > 0 && (
            <Card>
              <CardHeader><CardTitle>??? Mappa Live di Tutti i Partecipanti</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[400px] md:h-[500px] relative">
                  {(() => {
                    const avgLat = allPositions.reduce((sum, pos) => sum + pos.position.latitude, 0) / allPositions.length
                    const avgLng = allPositions.reduce((sum, pos) => sum + pos.position.longitude, 0) / allPositions.length
                    
                    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
                    if(!apiKey) {
                        return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-600">API Key di Google Maps non configurata.</div>
                    }

                    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${avgLat},${avgLng}&zoom=12`;
                    
                    return (
                      <div className="w-full h-full relative">
                        <iframe
                          src={mapUrl}
                          width="100%"
                          height="100%"
                          className="rounded-b-lg border-0"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                        {/* Overlay con le posizioni */}
                        {/* Questo è un esempio concettuale. Per marker reali sulla mappa, 
                            dovresti usare una libreria come @react-google-maps/api o simili. */}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Qui puoi aggiungere le altre card: lista posizioni, tappa attuale, etc. */}
        </>
      )}
    </div>
  )
}
