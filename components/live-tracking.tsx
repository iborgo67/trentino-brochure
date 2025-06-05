"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Camera, Share2, Users, Eye, RefreshCw, UserCheck, QrCode } from "lucide-react"

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
  isGuest: boolean
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

// Chiave per il localStorage che contiene tutte le posizioni condivise
const SHARED_POSITIONS_KEY = "trentino-all-positions"

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
  const [shareUrl, setShareUrl] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null)

  // Funzione per configurare il dispositivo
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

    // Salva nelle preferenze del browser
    localStorage.setItem("trentino-device", JSON.stringify(device))
  }

  // Genera ID univoco del dispositivo
  const generateDeviceId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `device_${timestamp}_${random}`
  }

  // Genera URL base della pagina
  const getBaseUrl = () => {
    if (typeof window === "undefined") return ""
    return window.location.origin + window.location.pathname
  }

  // Genera QR Code URL
  useEffect(() => {
    const baseUrl = getBaseUrl()
    if (baseUrl) {
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`)
    }
  }, [])

  // Carica configurazione salvata e inizia sincronizzazione
  useEffect(() => {
    const savedDevice = localStorage.getItem("trentino-device")
    if (savedDevice) {
      setDeviceInfo(JSON.parse(savedDevice))
      setIsDeviceSetup(true)
    }

    // Carica posizioni condivise salvate localmente
    loadAllSharedPositions()

    // Controlla se c'è una posizione condivisa nell'URL
    checkForSharedPosition()

    // Imposta intervallo di sincronizzazione automatica
    const interval = setInterval(() => {
      syncPositions()
    }, 30000) // Sincronizza ogni 30 secondi

    setSyncInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  // Carica tutte le posizioni condivise dal localStorage
  const loadAllSharedPositions = () => {
    const savedPositions = localStorage.getItem(SHARED_POSITIONS_KEY)
    if (savedPositions) {
      try {
        const positions = JSON.parse(savedPositions)
        // Filtra posizioni più vecchie di 1 ora (3600000 ms)
        const now = Date.now()
        const filteredPositions = positions.filter((p: any) => now - new Date(p.lastUpdate).getTime() < 3600000)

        setSharedPositions(
          filteredPositions.map((p: any) => ({
            ...p,
            lastUpdate: new Date(p.lastUpdate),
          })),
        )

        // Salva le posizioni filtrate
        localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(filteredPositions))
      } catch (e) {
        console.error("Errore nel caricamento posizioni condivise:", e)
      }
    }
  }

  // Sincronizza posizioni (simula un database cloud)
  const syncPositions = () => {
    // In un'app reale, qui ci sarebbe una chiamata API a un database cloud
    // Per ora, usiamo localStorage come simulazione
    loadAllSharedPositions()

    // Se stiamo condividendo, aggiorna la nostra posizione nel "database"
    if (isSharing && position && deviceInfo) {
      updateSharedPosition({
        deviceInfo,
        position,
        lastUpdate: new Date(),
        isOnline: true,
      })
    }
  }

  // Aggiorna o aggiunge una posizione condivisa
  const updateSharedPosition = (newPosition: SharedPosition) => {
    setSharedPositions((prev) => {
      // Rimuovi la vecchia posizione dello stesso dispositivo
      const filtered = prev.filter((p) => p.deviceInfo.id !== newPosition.deviceInfo.id)
      // Aggiungi la nuova posizione
      const updated = [...filtered, newPosition]

      // Salva nel localStorage
      localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  // Controlla se c'è una posizione condivisa nell'URL
  const checkForSharedPosition = () => {
    if (typeof window === "undefined") return

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
            color: data.owner === "Ivan" ? "blue" : data.owner === "Rita" ? "pink" : "gray",
            emoji: data.owner === "Ivan" ? "👨‍💻" : data.owner === "Rita" ? "👩‍💼" : "👤",
            isGuest: data.isGuest || false,
          },
          position: {
            latitude: data.lat,
            longitude: data.lng,
            accuracy: data.accuracy,
            timestamp: data.timestamp,
          },
          lastUpdate: new Date(data.timestamp),
          isOnline: true,
        }

        // Aggiungi o aggiorna la posizione condivisa
        updateSharedPosition(sharedPosition)

        // Pulisci l'URL dopo aver caricato la posizione
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch (e) {
        console.error("Errore nel caricamento posizione condivisa:", e)
      }
    }
  }

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
    // Solo per Ivan e Rita, non per i guest
    if (deviceInfo?.isGuest) return

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

  // Genera URL di condivisione
  const generateShareUrl = (pos: Position) => {
    if (!deviceInfo) return ""

    const shareData = {
      deviceId: deviceInfo.id,
      owner: deviceInfo.owner,
      lat: pos.latitude,
      lng: pos.longitude,
      timestamp: pos.timestamp,
      accuracy: pos.accuracy,
      isGuest: deviceInfo.isGuest,
    }

    const baseUrl = getBaseUrl()
    return `${baseUrl}?shared=${encodeURIComponent(JSON.stringify(shareData))}`
  }

  // Avvia tracking GPS
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata dal browser")
      return
    }

    // I guest non possono fare tracking
    if (deviceInfo?.isGuest) {
      setError("Gli ospiti possono solo visualizzare le posizioni, non condividerle")
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

        // Genera automaticamente l'URL di condivisione
        const url = generateShareUrl(newPosition)
        setShareUrl(url)
        setIsSharing(true)

        // Aggiorna la posizione condivisa nel "database"
        if (deviceInfo) {
          updateSharedPosition({
            deviceInfo,
            position: newPosition,
            lastUpdate: new Date(),
            isOnline: true,
          })
        }
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
    setShareUrl("")
    setIsSharing(false)

    // Rimuovi la nostra posizione dal "database"
    if (deviceInfo) {
      setSharedPositions((prev) => {
        const filtered = prev.filter((p) => p.deviceInfo.id !== deviceInfo.id)
        localStorage.setItem(SHARED_POSITIONS_KEY, JSON.stringify(filtered))
        return filtered
      })
    }
  }

  // Copia link negli appunti
  const copyShareLink = () => {
    if (!shareUrl) return

    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Condividi posizione manualmente
  const sharePosition = () => {
    if (!position || !deviceInfo) return

    const url = shareUrl || generateShareUrl(position)
    const googleMapsUrl = `https://maps.google.com/maps?q=${position.latitude},${position.longitude}`
    const baseUrl = getBaseUrl()

    const message = `🗺️ ${deviceInfo.emoji} ${deviceInfo.owner} è qui in Trentino!

📍 Posizione su Google Maps:
${googleMapsUrl}

🔗 Tracking live sulla brochure:
${url}

📱 Link diretto alla mappa di tutti:
${baseUrl}

⏰ Aggiornato: ${new Date().toLocaleString()}

💡 Apri il link "Tracking live" per vedere la mia posizione sulla brochure!`

    if (navigator.share) {
      navigator.share({
        title: `Posizione di ${deviceInfo.owner} in Trentino`,
        text: message,
      })
    } else {
      navigator.clipboard.writeText(message)
      alert("Messaggio copiato negli appunti! Incollalo e invialo.")
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

  // Aggiorna posizioni condivise manualmente
  const refreshSharedPositions = () => {
    syncPositions()
  }

  // Setup Guest con nome personalizzato
  const setupGuest = () => {
    const guestName = prompt("Come ti chiami? (es: Papà, Nonna, Marco...)")
    if (guestName && guestName.trim()) {
      setupDevice("Guest", guestName.trim())
    } else {
      setupDevice("Guest")
    }
  }

  // Filtra le posizioni per escludere il dispositivo corrente
  const otherPositions = sharedPositions.filter((p) => p.deviceInfo.id !== deviceInfo?.id)

  // Tutte le posizioni inclusa quella corrente (solo se non è guest)
  const allPositions = [...otherPositions]
  if (position && deviceInfo && isSharing && !deviceInfo.isGuest) {
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
            <CardTitle className="flex items-center text-purple-800">📱 Chi Sta Usando Questo Dispositivo?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">Scegli il tuo profilo per iniziare:</p>

            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setupDevice("Ivan")}
                className="p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-lg transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">👨‍💻</div>
                  <h3 className="font-bold text-blue-800">Ivan</h3>
                  <p className="text-sm text-gray-600">Il creatore del viaggio</p>
                  <p className="text-xs text-blue-600 mt-1">Può condividere posizione</p>
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
                  <p className="text-xs text-pink-600 mt-1">Può condividere posizione</p>
                </div>
              </button>

              <button
                onClick={setupGuest}
                className="p-6 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-400 rounded-lg transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">👤</div>
                  <h3 className="font-bold text-gray-800">Ospite</h3>
                  <p className="text-sm text-gray-600">Papà, famiglia, amici</p>
                  <p className="text-xs text-gray-600 mt-1">Solo visualizzazione</p>
                </div>
              </button>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>👨‍💻👩‍💼 Ivan & Rita:</strong> Possono attivare il GPS e condividere la loro posizione in
                  tempo reale
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800">
                  <strong>👤 Ospiti:</strong> Possono vedere le posizioni condivise da Ivan e Rita
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Fisso */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-800">
            <QrCode className="w-6 h-6 mr-2" />
            QR Code Mappa Live
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              {qrCodeUrl && (
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code per Mappa Live" className="w-40 h-40 mx-auto" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-indigo-800 mb-2">Scansiona per Vedere Tutte le Posizioni</h4>
              <p className="text-gray-700 mb-3">
                Questo QR code porta direttamente alla mappa live con tutte le posizioni condivise. Ideale per:
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs">
                    ✓
                  </span>
                  Papà e altri familiari che vogliono vedere dove siete
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs">
                    ✓
                  </span>
                  Accesso rapido alla mappa senza dover ricevere link
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs">
                    ✓
                  </span>
                  Vedere automaticamente tutte le posizioni attive
                </li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Consiglio:</strong> Salva questo QR code come immagine e invialo a papà. Può salvarlo sul
                  telefono per accesso rapido!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controlli Tracking */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="w-6 h-6 mr-2 text-blue-600" />
            Live Tracking GPS
            {deviceInfo && (
              <Badge className={`ml-2 ${deviceInfo.isGuest ? "bg-gray-600" : "bg-blue-600"}`}>
                {deviceInfo.emoji} {deviceInfo.owner}
                {deviceInfo.isGuest && " (Solo visualizzazione)"}
              </Badge>
            )}
            {allPositions.length > 0 && (
              <Badge className="ml-2 bg-green-600">
                <Users className="w-3 h-3 mr-1" />
                {allPositions.length} attivi
              </Badge>
            )}
            <button
              onClick={refreshSharedPositions}
              className="ml-auto p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Aggiorna posizioni condivise"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceInfo?.isGuest ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center text-gray-700">
                <UserCheck className="w-5 h-5 mr-2" />
                <div>
                  <h4 className="font-semibold">Modalità Ospite Attiva</h4>
                  <p className="text-sm">
                    Ciao <strong>{deviceInfo.owner}</strong>! Puoi vedere le posizioni condivise da Ivan e Rita, ma non
                    puoi condividere la tua posizione.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-center">
                <button
                  onClick={refreshSharedPositions}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Aggiorna Posizioni
                </button>
              </div>
            </div>
          ) : (
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
                    Condividi Link
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
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
          )}

          {lastUpdate && !deviceInfo?.isGuest && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              Ultimo aggiornamento: {lastUpdate.toLocaleTimeString()}
            </div>
          )}

          {/* Auto-sincronizzazione attiva */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔄 Auto-Sincronizzazione Attiva</h4>
            <p className="text-sm text-blue-700">
              Il sistema sincronizza automaticamente tutte le posizioni condivise. Chiunque apra questa pagina vedrà
              tutte le posizioni attive di Ivan e Rita.
            </p>
            <div className="mt-2 text-xs text-gray-600">
              Ultimo aggiornamento: {new Date().toLocaleTimeString()} (si aggiorna ogni 30 secondi)
            </div>
          </div>

          {/* Link di condivisione attivo */}
          {shareUrl && !deviceInfo?.isGuest && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🔗 Link di Condivisione Attivo</h4>
              <p className="text-sm text-green-700 mb-3">
                <strong>IMPORTANTE:</strong> Invia questo link agli ospiti per fargli vedere la tua posizione:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-white border border-green-300 rounded font-mono"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  {isCopied ? "Copiato!" : "Copia"}
                </button>
              </div>
              <p className="text-xs text-green-700 mt-2">
                ✅ Ora gli ospiti vedranno TUTTE le posizioni attive, non solo la tua!
              </p>
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
              Posizioni Condivise ({otherPositions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherPositions.map((shared) => (
                <div
                  key={shared.deviceInfo.id}
                  className={`p-4 rounded-lg border-2 ${
                    shared.deviceInfo.color === "blue"
                      ? "border-blue-200 bg-blue-50"
                      : shared.deviceInfo.color === "pink"
                        ? "border-pink-200 bg-pink-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{shared.deviceInfo.emoji}</span>
                      <div>
                        <h4 className="font-bold">{shared.deviceInfo.owner}</h4>
                        <p className="text-sm text-gray-600">
                          Aggiornato: {shared.lastUpdate.toLocaleTimeString()}
                          <span className="ml-2 text-green-600">🟢 Live</span>
                          {shared.deviceInfo.isGuest && <span className="ml-2 text-gray-500">(Ospite)</span>}
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
      {position && deviceInfo && !deviceInfo.isGuest && (
        <Card
          className={`border-2 ${
            deviceInfo.color === "blue" ? "border-blue-200 bg-blue-50" : "border-pink-200 bg-pink-50"
          }`}
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
                <p className="text-sm">{isSharing ? "🟢 Condivisa tramite link" : "🔒 Solo privato"}</p>
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
                🔄 Cambia Profilo
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
                        <p className="text-gray-400 text-sm">Attiva il tracking e condividi il link per apparire qui</p>
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
                              className={`w-3 h-3 rounded-full mr-2 ${
                                pos.deviceInfo.color === "blue"
                                  ? "bg-blue-500"
                                  : pos.deviceInfo.color === "pink"
                                    ? "bg-pink-500"
                                    : "bg-gray-500"
                              }`}
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

      {/* Tappa Attuale - Solo per Ivan e Rita */}
      {currentStop && !deviceInfo?.isGuest && (
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

      {/* Progresso Tour - Solo per Ivan e Rita */}
      {!deviceInfo?.isGuest && (
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
      )}

      {/* Istruzioni per la Condivisione */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center text-blue-800">
            <Share2 className="w-5 h-5 mr-2" />
            <div>
              <h4 className="font-semibold">📱 Come Funziona il Nuovo Sistema</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>
                  • <strong>🔄 Auto-Sincronizzazione:</strong> Tutte le posizioni si sincronizzano automaticamente
                </li>
                <li>
                  • <strong>📱 QR Code Fisso:</strong> Scansiona il QR code per vedere tutte le posizioni
                </li>
                <li>
                  • <strong>👨‍👩‍👧‍👦 Visibilità Completa:</strong> Papà vede sia Ivan che Rita con un solo link
                </li>
                <li>
                  • <strong>🔄 Aggiornamenti:</strong> Il sistema si aggiorna ogni 30 secondi automaticamente
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
