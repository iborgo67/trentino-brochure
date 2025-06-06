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

// --- GOOGLE MAPS COMPONENT ---
interface GoogleMapProps {
  positions: SharedPosition[]
  tourStops: TourStop[]
}

const GoogleMap: React.FC<GoogleMapProps> = ({ positions, tourStops }) => {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string>("")

  useEffect(() => {
    // Carica Google Maps API
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}&libraries=geometry`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapLoaded(true)
      }
      script.onerror = () => {
        setMapError("Errore nel caricamento di Google Maps")
      }
      document.head.appendChild(script)
    } else {
      setMapLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && positions.length > 0) {
      initializeMap()
    }
  }, [mapLoaded, positions])

  const initializeMap = () => {
    try {
      // Calcola il centro della mappa
      const bounds = new window.google.maps.LatLngBounds()
      
      // Aggiungi le posizioni dei partecipanti
      positions.forEach(pos => {
        bounds.extend(new window.google.maps.LatLng(pos.position.latitude, pos.position.longitude))
      })

      // Aggiungi le tappe del tour
      tourStops.forEach(stop => {
        bounds.extend(new window.google.maps.LatLng(stop.lat, stop.lng))
      })

      const mapOptions = {
        zoom: 10,
        center: bounds.getCenter(),
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      }

      const map = new window.google.maps.Map(document.getElementById('google-map'), mapOptions)
      
      // Adatta la mappa ai bounds
      map.fitBounds(bounds)

      // Aggiungi marker per le posizioni dei partecipanti
      positions.forEach(pos => {
        const marker = new window.google.maps.Marker({
          position: { lat: pos.position.latitude, lng: pos.position.longitude },
          map: map,
          title: `${pos.deviceInfo.owner} - ${new Date(pos.lastUpdate).toLocaleTimeString()}`,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="${pos.deviceInfo.color === 'blue' ? '#3b82f6' : pos.deviceInfo.color === 'pink' ? '#ec4899' : '#6b7280'}" stroke="white" stroke-width="3"/>
                <text x="20" y="28" text-anchor="middle" font-size="16" fill="white">${pos.deviceInfo.emoji}</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }
        })

        // Info window per ogni marker
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${pos.deviceInfo.emoji} ${pos.deviceInfo.owner}</h4>
              <p style="margin: 0; font-size: 12px; color: #666;">
                Ultimo aggiornamento: ${new Date(pos.lastUpdate).toLocaleString()}<br>
                Precisione: ${Math.round(pos.position.accuracy)}m
              </p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })
      })

      // Aggiungi marker per le tappe del tour
      tourStops.forEach((stop, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map: map,
          title: `${stop.name} - Giorno ${stop.day}`,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="13" fill="#10b981" stroke="white" stroke-width="2"/>
                <text x="15" y="20" text-anchor="middle" font-size="12" fill="white">${stop.emoji}</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 15)
          }
        })

        // Cerchio per il raggio della tappa
        const circle = new window.google.maps.Circle({
          strokeColor: '#10b981',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.1,
          map: map,
          center: { lat: stop.lat, lng: stop.lng },
          radius: stop.radius
        })

        // Info window per le tappe
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${stop.emoji} ${stop.name}</h4>
              <p style="margin: 0; font-size: 12px; color: #666;">
                Giorno ${stop.day}<br>
                Raggio: ${stop.radius}m
              </p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })
      })

    } catch (error) {
      console.error('Errore nell\'inizializzazione della mappa:', error)
      setMapError("Errore nell'inizializzazione della mappa")
    }
  }

  if (mapError) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 text-gray-600">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{mapError}</p>
          <p className="text-sm mt-2">Verifica che la tua API key sia valida e abbia le autorizzazioni necessarie</p>
        </div>
      </div>
    )
  }

  if (!mapLoaded) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600">Caricamento mappa...</p>
        </div>
      </div>
    )
  }

  return <div id="google-map" className="w-full h-[400px]" />
}

// --- COMPONENT PRINCIPALE ---
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
    setIsClient(true)
  }, [])
  
  // --- HELPER FUNCTIONS ---
  
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

  // --- CORE LOGIC ---
  
  useEffect(() => {
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
                    
                    {/* Posizioni Condivise */}
                    {allPositions.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-bold mb-2">👥 Posizioni Live ({allPositions.length})</h4>
                            <div className="space-y-2">
                                {allPositions.map((pos, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{pos.deviceInfo.emoji}</span>
                                            <div>
                                                <p className="font-semibold">{pos.deviceInfo.owner}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(pos.lastUpdate).toLocaleTimeString()} - Precisione: {Math.round(pos.position.accuracy)}m
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={`${pos.deviceInfo.color === 'blue' ? 'bg-blue-600' : pos.deviceInfo.color === 'pink' ? 'bg-pink-600' : 'bg-gray-600'}`}>
                                            Online
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Mappa Integrata */}
            {allPositions.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>🗺️ Mappa Live di Tutti i Partecipanti</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <GoogleMap positions={allPositions} tourStops={tourStops} />
                    </CardContent>
                </Card>
            )}

            {/* Tappa Attuale */}
            {currentStop && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                    <CardHeader><CardTitle>📍 Sei Arrivato!</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <div className="text-6xl mb-4">{currentStop.emoji}</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">{currentStop.name}</h3>
                            <p className="text-green-700">Giorno {currentStop.day} del tour</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progresso Tour */}
            {visitedStops.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>🎯 Progresso Tour</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tourStops.map((stop, index) => (
                                <div key={index} className={`p-3 rounded-lg text-center ${visitedStops.includes(stop.name) ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100'}`}>
                                    <div className="text-2xl mb-1">{stop.emoji}</div>
                                    <p className="text-sm font-semibold">{stop.name}</p>
                                    <p className="text-xs text-gray-600">Giorno {stop.day}</p>
                                    {visitedStops.includes(stop.name) && <div className="text-green-600 text-xs mt-1">✅ Visitato</div>}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <Badge className="bg-green-600">{visitedStops.length}/{tourStops.length} Tappe Completate</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
      )}
    </div>
  )
}
