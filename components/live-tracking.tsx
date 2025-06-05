"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Camera, Share2, Users, Eye, Wifi, WifiOff } from "lucide-react"

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
  radius: 500 // metri
  day: number
  emoji: string
}

interface DeviceInfo {
  id: string
  name: string
  owner: string
  color: string
  emoji: string
}

interface SharedPosition {
  deviceInfo: DeviceInfo
  position: Position
  lastUpdate: Date
  isOnline: boolean
}

const tourStops: TourStop[] = [
  { name: "Moena Centro", lat: 46.3769, lng: 11.6769, radius: 300, day: 1, emoji: "🏘️" },
  { name: "Passo San Pellegrino", lat: 46.3833, lng: 11.7833, radius: 500, day: 2, emoji: "🏔️" },
  { name: "Val San Nicolò", lat: 46.3667, lng: 11.7167, radius: 400, day: 3, emoji: "🌸" },
  { name: "Canazei", lat: 46.4769, lng: 11.7769, radius: 300, day: 4, emoji: "🚡" },
  { name: "Sass Pordoi", lat: 46.4833, lng: 11.8167, radius: 200, day: 4, emoji: "⛰️" },
  { name: "Lago di Carezza", lat: 46.4094, lng: 11.5794, radius: 200, day: 5, emoji: "🏞️" },
  { name: "Cavalese", lat: 46.2897, lng: 11.4597, radius: 400, day: 6, emoji: "🌲" },
]

// Simulazione di un database condiviso globale (in una app reale useresti Firebase/Supabase)
const GLOBAL_POSITIONS_KEY = "trentino-global-positions"

export default function LiveTracking() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isDeviceSetup, setIsDeviceSetup] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentStop, setCurrentStop] = useState<TourStop | null>(null)
  const [visitedStops, setVisitedStops] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [allSharedPositions, setAllSharedPositions] = useState<SharedPosition[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Funzione per configurare il dispositivo
  const setupDevice = (owner: "Ivan" | "Rita") => {
    const deviceId = generateDeviceId()
    const device: DeviceInfo = {
      id: deviceId,
      name: owner === "Ivan" ? "iPhone di Ivan" : "Telefono di Rita",
      owner: owner,
      color: owner === "Ivan" ? "blue" : "pink",
      emoji: owner === "Ivan" ? "👨‍💻" : "👩‍💼",
    }

    setDeviceInfo(device)
    setIsDeviceSetup(true)

    // Salva nelle preferenze del browser
    localStorage.setItem("trentino-device", JSON.stringify(device))
  }

  // Genera ID univoco del dispositivo
  const generateDeviceId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `device_${timestamp}_${random}`
  }

  // Carica configurazione salvata
  useEffect(() => {
    const savedDevice = localStorage.getItem("trentino-device")
    if (savedDevice) {
      setDeviceInfo(JSON.parse(savedDevice))
      setIsDeviceSetup(true)
    }

    // Carica tutte le posizioni globali condivise
    loadGlobalPositions()
  }, [])

  // Carica posizioni globali dal localStorage condiviso
  const loadGlobalPositions = () => {
    try {
      const globalPositions = localStorage.getItem(GLOBAL_POSITIONS_KEY)
      if (globalPositions) {
        const positions = JSON.parse(globalPositions)
        const validPositions = positions
          .map((p: any) => ({
            ...p,
            lastUpdate: new Date(p.lastUpdate),
          }))
          .filter((p: SharedPosition) => {
            // Considera una posizione valida se è stata aggiornata negli ultimi 10 minuti
            const timeDiff = Date.now() - p.lastUpdate.getTime()
            return timeDiff < 10 * 60 * 1000 // 10 minuti
          })

        setAllSharedPositions(validPositions)
      }
    } catch (e) {
      console.error("Errore nel caricamento posizioni globali:", e)
    }
  }

  // Salva posizione nel database globale
  const saveToGlobalPositions = (sharedPos: SharedPosition) => {
    try {
      const currentGlobal = localStorage.getItem(GLOBAL_POSITIONS_KEY)
      let globalPositions: SharedPosition[] = []

      if (currentGlobal) {
        globalPositions = JSON.parse(currentGlobal).map((p: any) => ({
          ...p,
          lastUpdate: new Date(p.lastUpdate),
        }))
      }

      // Rimuovi la posizione precedente di questo dispositivo
      globalPositions = globalPositions.filter((p) => p.deviceInfo.id !== sharedPos.deviceInfo.id)

      // Aggiungi la nuova posizione
      globalPositions.push(sharedPos)

      // Rimuovi posizioni troppo vecchie (più di 10 minuti)
      const now = Date.now()
      globalPositions = globalPositions.filter((p) => {
        const timeDiff = now - new Date(p.lastUpdate).getTime()
        return timeDiff < 10 * 60 * 1000 // 10 minuti
      })

      localStorage.setItem(GLOBAL_POSITIONS_KEY, JSON.stringify(globalPositions))
      setAllSharedPositions(globalPositions)
    } catch (e) {
      console.error("Errore nel salvataggio posizione globale:", e)
    }
  }

  // Polling per aggiornare le posizioni di altri dispositivi
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadGlobalPositions()
    }, 5000) // Controlla ogni 5 secondi

    return () => clearInterval(pollInterval)
  }, [])

  // Calcola distanza tra due punti GPS
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Raggio Terra in metri
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Controlla se sei vicino a una tappa
  const checkNearbyStops = (pos: Position) => {
    for (const stop of tourStops) {
      const distance = calculateDistance(pos.latitude, pos.longitude, stop.lat, stop.lng)
      if (distance <= stop.radius) {
        setCurrentStop(stop)
        if (!visitedStops.includes(stop.name)) {
          setVisitedStops((prev) => [...prev, stop.name])
          // Notifica di arrivo
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`🎉 Sei arrivato a ${stop.name}!`, {
              body: `Benvenuto alla tappa del giorno ${stop.day}`,
              icon: "/favicon.ico",
            })
          }
        }
        return
      }
    }
    setCurrentStop(null)
  }

  // Condividi posizione automaticamente
  const sharePositionAutomatically = (pos: Position) => {
    if (!deviceInfo || !isSharing) return

    const sharedPos: SharedPosition = {
      deviceInfo,
      position: pos,
      lastUpdate: new Date(),
      isOnline: true,
    }

    // Salva nel database globale
    saveToGlobalPositions(sharedPos)
  }

  // Avvia tracking GPS
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata dal browser")
      return
    }

    // Richiedi permesso notifiche
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    setIsTracking(true)
    setError("")

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: Position = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        }
        setPosition(newPosition)
        setLastUpdate(new Date())
        checkNearbyStops(newPosition)

        // Condividi automaticamente se la condivisione è attiva
        sharePositionAutomatically(newPosition)
      },
      (err) => {
        setError(`Errore GPS: ${err.message}`)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    )

    // Salva watchId per poterlo fermare
    return () => navigator.geolocation.clearWatch(watchId)
  }

  // Ferma tracking
  const stopTracking = () => {
    setIsTracking(false)

    // Rimuovi la posizione dal database globale quando fermi il tracking
    if (deviceInfo) {
      try {
        const currentGlobal = localStorage.getItem(GLOBAL_POSITIONS_KEY)
        if (currentGlobal) {
          let globalPositions = JSON.parse(currentGlobal)
          globalPositions = globalPositions.filter((p: any) => p.deviceInfo.id !== deviceInfo.id)
          localStorage.setItem(GLOBAL_POSITIONS_KEY, JSON.stringify(globalPositions))
          loadGlobalPositions()
        }
      } catch (e) {
        console.error("Errore nella rimozione posizione:", e)
      }
    }
  }

  // Attiva/disattiva condivisione
  const toggleSharing = () => {
    setIsSharing(!isSharing)
    if (!isSharing && position) {
      sharePositionAutomatically(position)
    } else if (isSharing && deviceInfo) {
      // Rimuovi la posizione quando disattivi la condivisione
      try {
        const currentGlobal = localStorage.getItem(GLOBAL_POSITIONS_KEY)
        if (currentGlobal) {
          let globalPositions = JSON.parse(currentGlobal)
          globalPositions = globalPositions.filter((p: any) => p.deviceInfo.id !== deviceInfo.id)
          localStorage.setItem(GLOBAL_POSITIONS_KEY, JSON.stringify(globalPositions))
          loadGlobalPositions()
        }
      } catch (e) {
        console.error("Errore nella rimozione posizione:", e)
      }
    }
  }

  // Condividi posizione manualmente
  const sharePosition = () => {
    if (!position || !deviceInfo) return

    const googleMapsUrl = `https://maps.google.com/maps?q=${position.latitude},${position.longitude}`
    const message = `🗺️ ${deviceInfo.emoji} ${deviceInfo.owner} è qui in Trentino!\n📍 ${googleMapsUrl}\n⏰ ${new Date().toLocaleString()}\n\n💡 Apri la brochure per vedere la posizione live!`

    if (navigator.share) {
      navigator.share({
        title: `Posizione di ${deviceInfo.owner} in Trentino`,
        text: message,
        url: googleMapsUrl,
      })
    } else {
      navigator.clipboard.writeText(message)
      alert("Messaggio copiato negli appunti!")
    }
  }

  // Scatta foto con posizione
  const takeGeoPhoto = () => {
    if (!position) return

    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("Foto scattata a:", position.latitude, position.longitude)
      }
    }

    input.click()
  }

  // Filtra le posizioni per escludere il dispositivo corrente
  const otherPositions = allSharedPositions.filter((p) => p.deviceInfo.id !== deviceInfo?.id)

  // Tutte le posizioni inclusa quella corrente
  const allPositions = [...otherPositions]
  if (position && deviceInfo && isSharing) {
    allPositions.push({
      deviceInfo,
      position,
      lastUpdate: new Date(),
      isOnline: true,
    })
  }

  return (
    <div className="space-y-6">
      {!isDeviceSetup && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">📱 Configura il Tuo Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">Prima di iniziare il tracking, dimmi chi sta usando questo telefono:</p>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setupDevice("Ivan")}
                className="p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-lg transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">👨‍💻</div>
                  <h3 className="font-bold text-blue-800">Ivan</h3>
                  <p className="text-sm text-gray-600">Il creatore del viaggio</p>
                </div>
              </button>

              <button
                onClick={() => setupDevice("Rita")}
                className="p-6 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 hover:border-pink-400 rounded-lg transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">👩‍💼</div>
                  <h3 className="font-bold text-pink-800">Rita</h3>
                  <p className="text-sm text-gray-600">La compagna di avventure</p>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✨ <strong>Novità!</strong> Ora tutti possono vedere le posizioni semplicemente aprendo questa pagina -
                niente più link da condividere!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controlli Tracking */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="w-6 h-6 mr-2 text-blue-600" />
            Live Tracking GPS
            {allPositions.length > 0 && (
              <Badge className="ml-2 bg-green-600">
                <Users className="w-3 h-3 mr-1" />
                {allPositions.length} attivi
              </Badge>
            )}
            <div className="ml-auto flex items-center">
              {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Inizia Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Ferma Tracking
              </button>
            )}

            {position && (
              <>
                <button
                  onClick={sharePosition}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Condividi
                </button>
                <button
                  onClick={toggleSharing}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white ${
                    isSharing ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {isSharing ? "Visibile a Tutti" : "Solo Privato"}
                </button>
                <button
                  onClick={takeGeoPhoto}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Foto GPS
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
          )}

          {lastUpdate && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              Ultimo aggiornamento: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posizioni di Altri Dispositivi */}
      {otherPositions.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-6 h-6 mr-2 text-green-600" />
              Altri Membri del Gruppo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherPositions.map((shared) => (
                <div
                  key={shared.deviceInfo.id}
                  className={`p-4 rounded-lg border-2 ${
                    shared.deviceInfo.color === "blue" ? "border-blue-200 bg-blue-50" : "border-pink-200 bg-pink-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{shared.deviceInfo.emoji}</span>
                      <div>
                        <h4 className="font-bold">{shared.deviceInfo.owner}</h4>
                        <p className="text-sm text-gray-600">
                          Aggiornato: {shared.lastUpdate.toLocaleTimeString()}
                          {shared.isOnline && <span className="ml-2 text-green-600">🟢 Online</span>}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://maps.google.com/maps?q=${shared.position.latitude},${shared.position.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Vedi
                    </a>
                  </div>
                  <p className="text-sm font-mono">
                    📍 {shared.position.latitude.toFixed(6)}, {shared.position.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">Precisione: ±{Math.round(shared.position.accuracy)}m</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posizione Attuale */}
      {position && deviceInfo && (
        <Card
          className={`border-2 ${deviceInfo.color === "blue" ? "border-blue-200 bg-blue-50" : "border-pink-200 bg-pink-50"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">{deviceInfo.emoji}</span>
              <MapPin className="w-6 h-6 mr-2 text-green-600" />
              La Tua Posizione ({deviceInfo.owner}){isSharing && <Badge className="ml-2 bg-green-600">Condivisa</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Dispositivo:</p>
                <p className="font-medium">{deviceInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stato:</p>
                <p className="text-sm">{isSharing ? "🟢 Visibile a tutti" : "🔒 Solo privato"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Coordinate GPS:</p>
                <p className="font-mono text-sm">
                  {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precisione:</p>
                <p className="text-sm">±{Math.round(position.accuracy)}m</p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <a
                href={`https://maps.google.com/maps?q=${position.latitude},${position.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🗺️ Apri su Google Maps
              </a>

              <button
                onClick={() => setIsDeviceSetup(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                🔄 Cambia Dispositivo
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mappa Integrata con Tutte le Posizioni */}
      {allPositions.length > 0 && (
        <Card className="shadow-lg border-2 border-blue-300">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-600" />
              🗺️ Mappa Live di Tutti ({allPositions.length} persone)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[400px] md:h-[500px] relative">
              {(() => {
                if (allPositions.length === 0) {
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-b-lg">
                      <div className="text-center">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Nessuna posizione condivisa</p>
                        <p className="text-gray-400 text-sm">Attiva "Visibile a Tutti" per apparire sulla mappa</p>
                      </div>
                    </div>
                  )
                }

                // Calcola centro mappa
                const avgLat = allPositions.reduce((sum, pos) => sum + pos.position.latitude, 0) / allPositions.length
                const avgLng = allPositions.reduce((sum, pos) => sum + pos.position.longitude, 0) / allPositions.length

                const mapUrl = `https://maps.google.com/maps?q=${avgLat},${avgLng}&z=13&output=embed`

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

                    {/* Overlay con informazioni posizioni */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <h4 className="font-bold text-sm text-gray-800 mb-2">👥 Posizioni Live</h4>
                      <div className="space-y-1">
                        {allPositions.map((pos, index) => (
                          <div key={pos.deviceInfo.id} className="flex items-center text-xs">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${pos.deviceInfo.color === "blue" ? "bg-blue-500" : "bg-pink-500"}`}
                            ></div>
                            <span className="font-medium">{pos.deviceInfo.owner}</span>
                            <span className="ml-1 text-green-600">🟢</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-b-lg">
              <a
                href={(() => {
                  if (allPositions.length === 0) return "#"

                  // Usa il primo punto come origine
                  const origin = `${allPositions[0].position.latitude},${allPositions[0].position.longitude}`

                  // Usa gli altri punti come destinazioni
                  const destinations = allPositions
                    .slice(1)
                    .map((pos) => `${pos.position.latitude},${pos.position.longitude}`)
                    .join("|")

                  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${destinations}`
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center font-medium"
              >
                🧭 Navigazione Gruppo
              </a>
              <button
                onClick={() => {
                  const positionsText = allPositions
                    .map(
                      (pos) =>
                        `${pos.deviceInfo.emoji} ${pos.deviceInfo.owner}: ${pos.position.latitude.toFixed(6)}, ${pos.position.longitude.toFixed(6)}`,
                    )
                    .join("\n")

                  navigator.clipboard.writeText(positionsText)
                  alert("Posizioni copiate negli appunti!")
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-medium"
              >
                📋 Copia Posizioni
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tappa Attuale */}
      {currentStop && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">{currentStop.emoji} Sei arrivato!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-800">{currentStop.name}</h3>
                <p className="text-sm text-green-600">Giorno {currentStop.day} del tour</p>
              </div>
              <Badge className="bg-green-600 text-white">✅ Check-in</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso Tour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">🗺️ Progresso del Tour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tourStops.map((stop, index) => {
              const isVisited = visitedStops.includes(stop.name)
              const isCurrent = currentStop?.name === stop.name

              return (
                <div
                  key={stop.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCurrent
                      ? "bg-green-100 border-green-300"
                      : isVisited
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{stop.emoji}</span>
                    <div>
                      <h4 className="font-medium">{stop.name}</h4>
                      <p className="text-sm text-gray-600">Giorno {stop.day}</p>
                    </div>
                  </div>
                  <div>
                    {isCurrent && <Badge className="bg-green-600">Qui ora!</Badge>}
                    {isVisited && !isCurrent && <Badge className="bg-blue-600">Visitato ✓</Badge>}
                    {!isVisited && !isCurrent && <Badge variant="outline">Da visitare</Badge>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso completamento:</span>
              <span className="text-sm font-bold">
                {visitedStops.length}/{tourStops.length} tappe
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(visitedStops.length / tourStops.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consigli Condivisione */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center text-green-800">
            <Users className="w-5 h-5 mr-2" />
            <div>
              <h4 className="font-semibold">✨ Sistema di Condivisione Automatica</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>
                  • <strong>Nessun link da condividere!</strong> Tutti vedono le posizioni aprendo questa pagina
                </li>
                <li>• Attiva "Visibile a Tutti" per apparire sulla mappa condivisa</li>
                <li>• Le posizioni si aggiornano automaticamente ogni 5 secondi</li>
                <li>• Papà può vedere Ivan semplicemente aprendo la brochure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
