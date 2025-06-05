"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Camera, Share2, Battery } from "lucide-react"

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
  const [position, setPosition] = useState<Position | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentStop, setCurrentStop] = useState<TourStop | null>(null)
  const [visitedStops, setVisitedStops] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

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

  // Condividi posizione
  const sharePosition = () => {
    if (!position) return

    const googleMapsUrl = `https://maps.google.com/maps?q=${position.latitude},${position.longitude}`
    const message = `🗺️ Sono qui in Trentino! ${googleMapsUrl}`

    if (navigator.share) {
      navigator.share({
        title: "La mia posizione in Trentino",
        text: message,
        url: googleMapsUrl,
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
        // Qui potresti salvare la foto con coordinate GPS
        console.log("Foto scattata a:", position.latitude, position.longitude)
      }
    }

    input.click()
  }

  return (
    <div className="space-y-6">
      {/* Controlli Tracking */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="w-6 h-6 mr-2 text-blue-600" />
            Live Tracking GPS
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

      {/* Posizione Attuale */}
      {position && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-green-600" />
              La Tua Posizione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
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

            <div className="mt-4">
              <a
                href={`https://maps.google.com/maps?q=${position.latitude},${position.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🗺️ Apri su Google Maps
              </a>
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

      {/* Mappa Live */}
      {position && (
        <Card>
          <CardHeader>
            <CardTitle>🗺️ Mappa Live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <iframe
                src={`https://maps.google.com/maps?q=${position.latitude},${position.longitude}&z=15&output=embed`}
                width="100%"
                height="100%"
                className="rounded-lg"
                loading="lazy"
              ></iframe>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://maps.google.com/maps/dir/?api=1&destination=${position.latitude},${position.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center text-sm"
              >
                🧭 Navigazione
              </a>
              <a
                href={`https://maps.google.com/maps?q=${position.latitude},${position.longitude}&layer=t`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center text-sm"
              >
                🛰️ Vista Satellite
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consigli Batteria */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center text-yellow-800">
            <Battery className="w-5 h-5 mr-2" />
            <div>
              <h4 className="font-semibold">💡 Consigli per il Tracking</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Porta un power bank per la batteria</li>
                <li>• Attiva la modalità risparmio energetico</li>
                <li>• Scarica le mappe offline prima di partire</li>
                <li>• Condividi la posizione con Rita per sicurezza</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
