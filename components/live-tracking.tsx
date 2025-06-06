"use client"

import { useState, useEffect, useRef } from "react" // Aggiunto useRef
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Share2, RefreshCw, QrCode } from "lucide-react"

// --- INTERFACCE TYPESCRIPT ---
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
  radius: number // in metri
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

// --- COSTANTI ---
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

// --- COMPONENTE ---
export default function LiveTracking() {
  // State
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isDeviceSetup, setIsDeviceSetup] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentStop, setCurrentStop] = useState<TourStop | null>(null)
  const [visitedStops, setVisitedStops] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [sharedPositions, setSharedPositions] = useState<SharedPosition[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  
  // Ref per gestire l'ID del watchPosition
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // --- FUNZIONI HELPER ---
  const getBaseUrl = (): string => {
    if (typeof window !== "undefined") {
      return window.location.origin + window.location.pathname
    }
    return ""
  }

  const generateDeviceId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 7)
    return `device_${timestamp}_${random}`
  }
  
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Raggio della Terra in metri
    const f1 = (lat1 * Math.PI) / 180
    const f2 = (lat2 * Math.PI) / 180
    const deltaF = (lat2 - lat1) * Math.PI / 180
    const deltaL = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(deltaF / 2) * Math.sin(deltaF / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // --- LOGICA CORE (Client-side) ---
  useEffect(() => {
    if (!isClient) return;

    // Carica tutte le posizioni condivise e filtra quelle vecchie
    const loadAllSharedPositions = () => {
      const saved = localStorage.getItem(SHARED_POSITIONS_KEY)
      if (saved) {
        try {
          const positions: SharedPosition[] = JSON.parse(saved)
          const now = Date.now()
          const filtered = positions.filter(p => now - new Date(p.lastUpdate).getTime() < 3600000) // 1 ora
          setSharedPositions(filtered.map(p => ({ ...p, lastUpdate: new Date(p.lastUpdate) })))
          localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(filtered))
        } catch (e) { console.error("Errore nel parsing delle posizioni salvate:", e) }
      }
    }

    // Controlla se l'URL contiene una posizione condivisa
    const checkForSharedPositionInUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const sharedData = params.get("shared")
      if (sharedData) {
        try {
          const data = JSON.parse(decodeURIComponent(sharedData))
          const newSharedPos: SharedPosition = {
            deviceInfo: {
              id: data.deviceId, owner: data.owner, name: `Dispositivo di ${data.owner}`,
              color: data.owner === "Ivan" ? "blue" : "pink",
              emoji: data.owner === "Ivan" ? "?????" : "?????",
              isGuest: data.isGuest || false,
            },
            position: { latitude: data.lat, longitude: data.lng, accuracy: data.accuracy, timestamp: data.timestamp },
            lastUpdate: new Date(data.timestamp), isOnline: true,
          }
          // Aggiunge o aggiorna la posizione e pulisce l'URL
          setSharedPositions(prev => {
            const others = prev.filter(p => p.deviceInfo.id !== newSharedPos.deviceInfo.id)
            const updated = [...others, newSharedPos]
            localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(updated))
            return updated
          })
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (e) { console.error("Errore nel parsing dell'URL condiviso:", e) }
      }
    }

    // --- SETUP INIZIALE ---
    const device = localStorage.getItem("trentino-device")
    if (device) {
      setDeviceInfo(JSON.parse(device))
      setIsDeviceSetup(true)
    }

    const baseUrl = getBaseUrl()
    if (baseUrl) {
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`)
    }
    
    loadAllSharedPositions()
    checkForSharedPositionInUrl()

    const syncInterval = setInterval(loadAllSharedPositions, 30000)

    // Cleanup all intervals and watchers on component unmount
    return () => {
      clearInterval(syncInterval)
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isClient])

  // --- FUNZIONI DI CONTROLLO ---
  const setupDevice = (owner: "Ivan" | "Rita" | "Guest", customName?: string) => {
    const isGuest = owner === "Guest"
    const finalOwner = isGuest ? customName || "Ospite" : owner
    const device: DeviceInfo = {
      id: generateDeviceId(),
      name: isGuest ? finalOwner : (owner === "Ivan" ? "iPhone di Ivan" : "Telefono di Rita"),
      owner: finalOwner,
      color: owner === "Ivan" ? "blue" : owner === "Rita" ? "pink" : "gray",
      emoji: owner === "Ivan" ? "?????" : owner === "Rita" ? "?????" : "??",
      isGuest,
    }
    setDeviceInfo(device)
    setIsDeviceSetup(true)
    localStorage.setItem("trentino-device", JSON.stringify(device))
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("La geolocalizzazione non è supportata da questo browser.")
      return
    }
    if (deviceInfo?.isGuest) {
      setError("Gli ospiti possono solo visualizzare le posizioni.")
      return
    }
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
    
    setError("")
    setIsTracking(true)
    setIsSharing(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: Position = {
          latitude: pos.coords.latitude, longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy, timestamp: pos.timestamp,
        }
        setPosition(newPosition)
        
        if (deviceInfo) {
          const sharedPos: SharedPosition = {
            deviceInfo, position: newPosition, lastUpdate: new Date(), isOnline: true
          }
          // Aggiorna la posizione nel localStorage
          setSharedPositions(prev => {
            const others = prev.filter(p => p.deviceInfo.id !== deviceInfo.id)
            const updated = [...others, sharedPos];
            localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(updated))
            return updated;
          });
          checkNearbyStops(newPosition)
        }
      },
      (err) => {
        setError(`Errore GPS: ${err.message}`);
        setIsTracking(false)
        setIsSharing(false)
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    )
  }

  const stopTracking = () => {
    setIsTracking(false)
    setIsSharing(false)
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    // Rimuovi la propria posizione dal db locale
    if(deviceInfo) {
        setSharedPositions(prev => {
            const updated = prev.filter(p => p.deviceInfo.id !== deviceInfo.id)
            localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(updated))
            return updated
        })
    }
  }

  const checkNearbyStops = (pos: Position) => {
    if (deviceInfo?.isGuest) return
    for (const stop of tourStops) {
      if (calculateDistance(pos.latitude, pos.longitude, stop.lat, stop.lng) <= stop.radius) {
        if (currentStop?.name !== stop.name) {
          setCurrentStop(stop)
          if (!visitedStops.includes(stop.name)) {
            setVisitedStops(prev => [...prev, stop.name])
            if (Notification.permission === "granted") {
              new Notification(`?? Sei arrivato a ${stop.name}!`);
            }
          }
        }
        return // Trovata la tappa più vicina, esci
      }
    }
    setCurrentStop(null) // Nessuna tappa vicina
  }

  const sharePosition = () => {
    if (!position || !deviceInfo) return
    const googleMapsUrl = `https://www.google.com/maps?q=${position.latitude},${position.longitude}`
    const message = `??? ${deviceInfo.emoji} ${deviceInfo.owner} è qui in Trentino!\n\n?? Posizione su Google Maps:\n${googleMapsUrl}\n\n?? Mappa Live del gruppo:\n${getBaseUrl()}`
    
    if (navigator.share) {
      navigator.share({ title: `Posizione di ${deviceInfo.owner}`, text: message }).catch(e => console.error("Errore condivisione:", e))
    } else {
      navigator.clipboard.writeText(message).then(() => alert("Link e messaggio copiati negli appunti!"))
    }
  }

  const setupGuest = () => {
    const name = prompt("Come ti chiami?")
    if (name) {
      setupDevice("Guest", name)
    }
  }

  // --- RENDER ---
  if (!isClient) {
    return (
      <Card><CardContent className="p-8 text-center">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600">Caricamento modulo interattivo...</p>
      </CardContent></Card>
    )
  }

  const onlinePositions = sharedPositions.filter(p => p.isOnline);

  return (
    <div className="space-y-6">
      {!isDeviceSetup ? (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader><CardTitle>?? Chi sta usando questo dispositivo?</CardTitle></CardHeader>
          <CardContent><div className="grid md:grid-cols-3 gap-4">
            <button onClick={() => setupDevice("Ivan")} className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg text-center"><div className="text-4xl mb-2">?????</div><h3 className="font-bold text-blue-800">Ivan</h3></button>
            <button onClick={() => setupDevice("Rita")} className="p-6 bg-pink-50 hover:bg-pink-100 rounded-lg text-center"><div className="text-4xl mb-2">?????</div><h3 className="font-bold text-pink-800">Rita</h3></button>
            <button onClick={setupGuest} className="p-6 bg-gray-50 hover:bg-gray-100 rounded-lg text-center"><div className="text-4xl mb-2">??</div><h3 className="font-bold text-gray-800">Ospite</h3></button>
          </div></CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader><CardTitle className="flex items-center"><QrCode className="w-6 h-6 mr-2" />QR Code Mappa</CardTitle></CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white p-2 rounded-lg shadow-md">
                {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code per la mappa live" className="w-32 h-32 md:w-40 md:h-40" /> : <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 animate-pulse rounded-lg"/>}
              </div>
              <div>
                <h4 className="font-bold text-indigo-800 mb-2">Scansiona per vedere il gruppo</h4>
                <p className="text-sm">Questo QR code porta alla pagina con la mappa live di tutti. Inquadralo con un altro telefono per vedere dove siamo!</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center flex-wrap gap-2">
                <Navigation className="w-6 h-6 text-blue-600" /> Controllo GPS
                {deviceInfo && <Badge variant="secondary">{deviceInfo.emoji} {deviceInfo.owner}</Badge>}
                <Badge className="bg-green-600 text-white">{onlinePositions.length} Online</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!deviceInfo?.isGuest && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {!isTracking ? 
                    <button onClick={startTracking} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2"> <MapPin className="w-4 h-4"/> Inizia a Condividere </button> :
                    <button onClick={stopTracking} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2"> <MapPin className="w-4 h-4"/> Smetti di Condividere </button>
                  }
                  {position && <button onClick={sharePosition} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"> <Share2 className="w-4 h-4"/> Invia Posizione </button>}
                </div>
              )}
              {error && <div className="text-red-600 font-semibold p-3 bg-red-50 rounded-md text-sm">{error}</div>}
            </CardContent>
          </Card>

          {onlinePositions.length > 0 && (
            <Card>
              <CardHeader><CardTitle>??? Mappa Live del Gruppo</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[400px] md:h-[500px] relative bg-gray-200">
                  {(() => {
                    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
                    if (!apiKey) return <div className="flex items-center justify-center h-full text-red-600">API Key per Google Maps non trovata.</div>
                    
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
                            className="rounded-b-lg border-0"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
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
