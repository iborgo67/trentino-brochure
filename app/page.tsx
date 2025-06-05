"use client"

import Image from "next/image"
import { Heart, MapPin, Calendar, Mountain, TreePine, Sun, Cloud, CloudDrizzle, CloudSun } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LiveTracking from "@/components/live-tracking"

// Aggiungi questa costante all'inizio del file, subito dopo gli import
const VERSION = "v2.3.0 - Auto-Sync & QR Code Fisso"
const LAST_UPDATE = "7 Gennaio 2025, 10:30"

export default function TrentinoBrochure() {
  const days = [
    {
      date: "Mercoledì 11 Giugno",
      title: "Benvenuti nella Fata delle Dolomiti",
      location: "Moena",
      weather: {
        icon: <Sun className="w-5 h-5 text-yellow-500" />,
        temp: "18-22°C",
        desc: "Soleggiato",
      },
      activities: [
        "Arrivo a Moena, la 'Fata delle Dolomiti'",
        "Prima passeggiata nel centro storico",
        "Visita alla Pieve di San Vigilio",
        "Passeggiata lungo il torrente Avisio",
      ],
      image: "/images/moena-centro.jpg",
    },
    {
      date: "Giovedì 12 Giugno",
      title: "Panorami da Sogno al Passo San Pellegrino",
      location: "Passo San Pellegrino (1900m)",
      weather: {
        icon: <CloudSun className="w-5 h-5 text-blue-500" />,
        temp: "12-16°C",
        desc: "Parzialmente nuvoloso",
      },
      activities: [
        "Escursione al Passo San Pellegrino",
        "Passeggiata attorno al laghetto alpino",
        "Vista sulle Pale di San Martino",
        "Pranzo in rifugio di montagna",
      ],
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkU2jzsCKouLokqIbHUIX44lGftZb_ydMWAg&s",
    },
    {
      date: "Venerdì 13 Giugno",
      title: "La Magia della Val San Nicolò",
      location: "Val San Nicolò",
      weather: {
        icon: <Sun className="w-5 h-5 text-yellow-500" />,
        temp: "17-21°C",
        desc: "Soleggiato",
      },
      activities: [
        "Immersione nella pittoresca Val San Nicolò",
        "Prati fioriti e fienili tradizionali",
        "Passeggiata fino alla Baita alle Cascate",
        "Pranzo circondati dalla natura",
      ],
      image: "https://www.montagnaestate.it/wp-content/uploads/san-nicolo-1200x810.jpg",
    },
    {
      date: "Sabato 14 Giugno",
      title: "Canazei e l'Incredibile Terrazza delle Dolomiti",
      location: "Canazei - Sass Pordoi (2950m)",
      weather: {
        icon: <Cloud className="w-5 h-5 text-gray-500" />,
        temp: "10-14°C",
        desc: "Nuvoloso in quota",
      },
      activities: [
        "Visita a Canazei con case dipinte ladine",
        "Funivia fino al Sass Pordoi",
        "Terrazza delle Dolomiti a 2950m",
        "Panorama a 360° sulle Dolomiti",
      ],
      image:
        "https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcSuGGoJEO_ecJxAWmunZLNuYA19L3Kob8F8X_CWRfopr_yVlFBDOShTo7ny7yEq99e1aIsnxWB62NEjgkLxg4gL5O5KVIz2NMSXqWVa8w",
    },
    {
      date: "Domenica 15 Giugno",
      title: "I Colori del Lago di Carezza",
      location: "Lago di Carezza",
      weather: {
        icon: <CloudDrizzle className="w-5 h-5 text-blue-400" />,
        temp: "15-19°C",
        desc: "Possibili rovesci",
      },
      activities: [
        "Visita al leggendario Lago di Carezza",
        "Passeggiata circolare attorno al lago",
        "Riflessi del Latemar e Catinaccio",
        "Esplorazione dei boschi incantati",
      ],
      image:
        "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQjQJlQk9vPRHUbW8bHST0_-rhZnSW8hp-SK0LxJzWEX2gSPHEWK8kwfSdWQ9hbZNqkSD4Uni2_L9Dhlgu3T84J-wJ4n0rSt8uA8ob1zg",
    },
    {
      date: "Lunedì 16 Giugno",
      title: "Tesori della Val di Fiemme",
      location: "Cavalese - Foresta dei Violini",
      weather: {
        icon: <Sun className="w-5 h-5 text-yellow-500" />,
        temp: "16-20°C",
        desc: "Soleggiato",
      },
      activities: [
        "Visita a Cavalese e centro storico",
        "Palazzo della Magnifica Comunità",
        "Parco Naturale Paneveggio",
        "Foresta dei Violini e area cervi",
      ],
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTBCpwXrR3m1mQIRJUlb1xygxZc7qtsGxVeA&s",
    },
  ]

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
          * { box-shadow: none !important; }
        }
        @page {
          size: A4;
          margin: 1cm;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
        {/* Print Button */}
        <div className="fixed top-4 right-4 z-50 no-print">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            📄 Stampa PDF
          </button>
        </div>

        {/* Version Info */}
        <div className="fixed bottom-4 right-4 z-40 no-print">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
            <div className="text-xs text-gray-600">
              <div className="font-semibold text-blue-600">{VERSION}</div>
              <div className="text-gray-500">Aggiornato: {LAST_UPDATE}</div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="relative h-screen bg-gradient-to-r from-blue-900 via-green-800 to-blue-900 overflow-hidden avoid-break">
          <div className="absolute inset-0 bg-black/30"></div>
          <Image
            src="/images/dolomiti-panorama.jpg"
            alt="Panorama delle Dolomiti"
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Mountain className="w-12 h-12 mr-4" />
                <Heart className="w-8 h-8 text-red-400" />
                <TreePine className="w-12 h-12 ml-4" />
              </div>
              <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Il mio viaggio nel cassetto
              </h1>
              <h2 className="text-2xl md:text-4xl font-light mb-8 text-blue-100">
                Trentino, Emozioni tra Montagne e Tradizioni
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  Moena, Val di Fassa
                </div>
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  11 - 17 Giugno 2025
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Tracking Section */}
        <section className="py-16 px-4 no-print">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">📍 Tracking Live del Viaggio</h2>
              <p className="text-xl text-gray-600">Segui la tua posizione in tempo reale durante il tour</p>
            </div>
            <LiveTracking />
          </div>
        </section>

        {/* Love Letter Section */}
        <section className="py-16 px-4 page-break">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 avoid-break">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-serif text-gray-800">Una Lettera d'Amore</h3>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="text-xl font-light italic mb-6">"Cara Rita,"</p>
                  <p className="mb-6">
                    Ho sognato questo viaggio per noi, un'occasione per scoprire insieme le meraviglie del Trentino, per
                    immergerci nella sua natura rigogliosa, ammirare panorami che tolgono il fiato e passeggiare tra i
                    vicoli di borghi incantati. E, naturalmente, il nostro fedele Artù sarà con noi in ogni avventura!
                    Spero che questo itinerario sia l'inizio di ricordi indimenticabili.
                  </p>
                  <p className="text-xl font-light italic text-right">
                    "Con amore,
                    <br />
                    Ivan"
                    <br />
                    <span className="border-b-2 border-gray-300 pb-1 inline-block w-48 mt-2"></span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Itinerary Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-green-50 to-blue-50 page-break">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Il Nostro Itinerario Giorno per Giorno</h2>
              <p className="text-xl text-gray-600">Sei giorni di meraviglie tra le Dolomiti</p>
            </div>

            <div className="grid gap-8">
              {days.map((day, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 avoid-break"
                >
                  <div className="md:flex">
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                      <Image src={day.image || "/placeholder.svg"} alt={day.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-green-600 text-white px-3 py-1 text-sm">Giorno {index + 1}</Badge>
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8">
                      <CardHeader className="p-0 mb-4">
                        <div className="flex items-center justify-between text-green-600 mb-2">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            <span className="font-medium">{day.date}</span>
                          \
