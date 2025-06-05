"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Camera, Share2, Battery, Users, Eye } from "lucide-react"

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

export default function LiveTracking() {
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

    // Carica posizioni condivise salvate
    const savedPositions = localStorage.getItem("trentino-shared-positions")
    if (savedPositions) {
      const positions = JSON.parse(savedPositions)
      setSharedPositions(
        positions.map((p: any) => ({
          ...p,
          lastUpdate: new Date(p.lastUpdate),
        })),
      )
    }
  }, [])

  // Salva posizioni condivise
  useEffect(() => {
    if (sharedPositions.length > 0) {
      localStorage.setItem("trentino-shared-positions", JSON.stringify(sharedPositions))
    }
  }, [sharedPositions])

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

  // Condividi posizione con altri dispositivi
  const sharePositionWithOthers = (pos: Position) => {
    if (!deviceInfo) return

    // Controlla se è passato abbastanza tempo dall'ultimo aggiornamento (30 secondi)
    const lastSharedPosition = sharedPositions.find((p) => p.deviceInfo.id === deviceInfo.id)
    const now = new Date()

    if (lastSharedPosition) {
      const timeSinceLastUpdate = now.getTime() - lastSharedPosition.lastUpdate.getTime()
      // Aggiorna solo se sono passati almeno 30 secondi
      if (timeSinceLastUpdate < 30000) {
        return // Salta l'aggiornamento se troppo frequente
      }
    }

    const sharedPos: SharedPosition = {
      deviceInfo,
      position: pos,
      lastUpdate: now,
    }

    // Aggiorna o aggiungi la posizione di questo dispositivo
    setSharedPositions((prev) => {
      const filtered = prev.filter((p) => p.deviceInfo.id !== deviceInfo.id)
      return [...filtered, sharedPos]
    })

    // Genera link di condivisione
    const shareData = {
      deviceId: deviceInfo.id,
      owner: deviceInfo.owner,
      lat: pos.latitude,
      lng: pos.longitude,
      timestamp: pos.timestamp,
      accuracy: pos.accuracy,
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encodeURIComponent(JSON.stringify(shareData))}`

    // Copia negli appunti per condivisione
    navigator.clipboard.writeText(shareUrl).then(() => {
      console.log("Link di condivisione copiato!")
    })
  }

  // Carica posizione condivisa da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sharedData = urlParams.get("shared")

    if (sharedData) {
      try {
        const data = JSON.parse(decodeURIComponent(sharedData))
        const sharedPosition: SharedPosition = {
          deviceInfo: {
            id: data.deviceId,
            owner: data.owner,
            name: `Telefono di ${data.owner}`,
            color: data.owner === "Ivan" ? "blue" : "pink",
            emoji: data.owner === "Ivan" ? "👨‍💻" : "👩‍💼",
          },
          position: {
            latitude: data.lat,
            longitude: data.lng,
            accuracy: data.accuracy,
            timestamp: data.timestamp,
          },
          lastUpdate: new Date(data.timestamp),
        }

        setSharedPositions((prev) => {
          const filtered = prev.filter((p) => p.deviceInfo.id !== data.deviceId)
          return [...filtered, sharedPosition]
        })
      } catch (e) {
        console.error("Errore nel caricamento posizione condivisa:", e)
      }
    }
  }, [])

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

        // Non condividere automaticamente ad ogni aggiornamento
        // La condivisione avverrà tramite l'intervallo definito nell'useEffect
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
  }

  // Attiva/disattiva condivisione
  const toggleSharing = () => {
    setIsSharing(!isSharing)
    if (!isSharing && position) {
      sharePositionWithOthers(position)
    }
  }

  // Condividi posizione manualmente
  const sharePosition = () => {
    if (!position || !deviceInfo) return

    sharePositionWithOthers(position)

    const shareData = {
      deviceId: deviceInfo.id,
      owner: deviceInfo.owner,
      lat: position.latitude,
      lng: position.longitude,
      timestamp: position.timestamp,
      accuracy: position.accuracy,
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encodeURIComponent(JSON.stringify(shareData))}`
    const googleMapsUrl = `https://maps.google.com/maps?q=${position.latitude},${position.longitude}`
    const message = `🗺️ ${deviceInfo.emoji} ${deviceInfo.owner} è qui in Trentino!\n📍 ${googleMapsUrl}\n🔗 Tracking live: ${shareUrl}\n⏰ ${new Date().toLocaleString()}`

    if (navigator.share) {
      navigator.share({
        title: `Posizione di ${deviceInfo.owner} in Trentino`,
        text: message,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(message)
      alert("Link copiato negli appunti!")
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

  // Genera URL mappa con tutte le posizioni
  const generateMapUrl = () => {
    const allPositions = [...sharedPositions]
    if (position && deviceInfo) {
      allPositions.push({
        deviceInfo,
        position,
        lastUpdate: new Date(),
      })
    }

    if (allPositions.length === 0) return ""

    const markers = allPositions
      .map(
        (pos, index) =>
          `markers=color:${pos.deviceInfo.color}%7Clabel:${pos.deviceInfo.owner[0]}%7C${pos.position.latitude},${pos.position.longitude}`,
      )
      .join("&")

    const center = allPositions[0]
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center.position.latitude},${center.position.longitude}&zoom=12&size=600x400&${markers}&key=YOUR_API_KEY`
  }

  // Aggiungi un effetto per stabilizzare la mappa e prevenire il lampeggiamento

  // Aggiungi questo useEffect dopo gli altri useEffect esistenti
  useEffect(() => {
    // Stabilizza la mappa prevenendo aggiornamenti troppo frequenti
    const mapUpdateInterval = setInterval(() => {
      if (position && isSharing) {
        sharePositionWithOthers(position)
      }
    }, 30000) // Aggiorna ogni 30 secondi invece di ad ogni cambio di posizione

    return () => clearInterval(mapUpdateInterval)
  }, [position, isSharing])

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

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 Questa configurazione verrà salvata sul dispositivo e permetterà di condividere la posizione con
                l'altro
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
            {sharedPositions.length > 0 && (
              <Badge className="ml-2 bg-green-600">
                <Users className="w-3 h-3 mr-1" />
                {sharedPositions.length + (position ? 1 : 0)} attivi
              </Badge>
            )}
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
                  {isSharing ? "Condivisione ON" : "Condivisione OFF"}
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

      {/* Posizioni Condivise */}
      {sharedPositions.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-6 h-6 mr-2 text-green-600" />
              Posizioni Condivise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sharedPositions.map((shared) => (
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
                        <p className="text-sm text-gray-600">Aggiornato: {shared.lastUpdate.toLocaleTimeString()}</p>
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
              La Tua Posizione ({deviceInfo.owner})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Dispositivo:</p>
                <p className="font-medium">{deviceInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Dispositivo:</p>
                <p className="font-mono text-xs text-gray-500">{deviceInfo.id.slice(-8)}</p>
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
      {(position || sharedPositions.length > 0) && (
        <Card className="shadow-lg border-2 border-blue-300">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-600" />
              🗺️ Mappa Live di Tutti
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[400px] md:h-[500px] relative">
              {(() => {
                // Memorizza le posizioni in una variabile stabile per evitare il lampeggiamento
                const allPositions = [...sharedPositions]
                if (position && deviceInfo) {
                  // Aggiungi la posizione corrente solo se non è già presente
                  const isCurrentDeviceShared = sharedPositions.some((p) => p.deviceInfo.id === deviceInfo.id)
                  if (!isCurrentDeviceShared) {
                    allPositions.push({
                      deviceInfo,
                      position,
                      lastUpdate: new Date(),
                    })
                  }
                }

                if (allPositions.length === 0) {
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-b-lg">
                      <p className="text-gray-500">Nessuna posizione disponibile</p>
                    </div>
                  )
                }

                // Calcola centro mappa
                const avgLat = allPositions.reduce((sum, pos) => sum + pos.position.latitude, 0) / allPositions.length
                const avgLng = allPositions.reduce((sum, pos) => sum + pos.position.longitude, 0) / allPositions.length

                // Crea URL con tutti i marker
                const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBMH3XLIQGqDYTvI-lqVXZtFYQmgw-MLD0&q=${avgLat},${avgLng}&zoom=13`

                return (
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    className="rounded-b-lg border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                )
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-b-lg">
              <a
                href={(() => {
                  const allPositions = [...sharedPositions]
                  if (position && deviceInfo) {
                    allPositions.push({
                      deviceInfo,
                      position,
                      lastUpdate: new Date(),
                    })
                  }

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
                  const allPositions = [...sharedPositions]
                  if (position && deviceInfo) {
                    allPositions.push({
                      deviceInfo,
                      position,
                      lastUpdate: new Date(),
                    })
                  }

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
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center text-yellow-800">
            <Battery className="w-5 h-5 mr-2" />
            <div>
              <h4 className="font-semibold">💡 Consigli per la Condivisione</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Attiva "Condivisione ON" per aggiornamenti automatici</li>
                <li>• Condividi il link con Rita per vedere la tua posizione</li>
                <li>• Le posizioni vengono salvate localmente su ogni dispositivo</li>
                <li>• Usa "Navigazione Gruppo" per raggiungervi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
