"use client"

import Image from "next/image"
import {
  Heart,
  MapPin,
  Calendar,
  Backpack,
  Dog,
  Mountain,
  TreePine,
  Sun,
  Cloud,
  CloudDrizzle,
  CloudSun,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
                          </div>
                          <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                            {day.weather.icon}
                            <span className="ml-1 text-sm text-gray-700">{day.weather.temp}</span>
                            <span className="ml-1 text-xs text-gray-500 hidden sm:inline">• {day.weather.desc}</span>
                          </div>
                        </div>
                        <CardTitle className="text-2xl text-gray-800 mb-2">{day.title}</CardTitle>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{day.location}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ul className="space-y-2">
                          {day.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="flex items-start">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Weather Legend */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Cloud className="w-5 h-5 mr-2 text-blue-500" />
                Previsioni Meteo Tipiche di Giugno
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Le previsioni mostrate sono basate sul clima tipico di giugno in Trentino. Il tempo in montagna può
                variare rapidamente.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <Sun className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Soleggiato (17-22°C)</span>
                </div>
                <div className="flex items-center">
                  <CloudSun className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">Parzialmente nuvoloso (12-18°C)</span>
                </div>
                <div className="flex items-center">
                  <Cloud className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Nuvoloso (10-15°C)</span>
                </div>
                <div className="flex items-center">
                  <CloudDrizzle className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-sm text-gray-700">Possibili rovesci (15-19°C)</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <p>
                  Nota: In alta quota (sopra 2000m) le temperature possono essere 5-10°C più basse rispetto a valle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Weather Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-sky-50 p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
            🌐 Previsioni Meteo Aggiornate in Tempo Reale
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* MeteoTrentino Official */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">MeteoTrentino</h4>
                <p className="text-sm text-gray-600 mb-4">Servizio meteorologico ufficiale</p>
                <a
                  href="https://www.meteotrentino.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Apri Previsioni
                </a>
              </CardContent>
            </Card>

            {/* 3B Meteo */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">3B Meteo</h4>
                <p className="text-sm text-gray-600 mb-4">Previsioni dettagliate località</p>
                <a
                  href="https://www.3bmeteo.com/meteo/moena"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Moena & Dintorni
                </a>
              </CardContent>
            </Card>

            {/* Mountain Weather */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mountain className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Meteo Montagna</h4>
                <p className="text-sm text-gray-600 mb-4">Condizioni in alta quota</p>
                <a
                  href="https://www.mountain-forecast.com/peaks/Sass-Pordoi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Alta Quota
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Links */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">🔗 Link Rapidi per Località</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <a
                  href="https://www.meteotrentino.it/#!/content?menuItemDesktop=82&localita=moena"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">📍 Moena</span>
                    <span className="text-sm text-gray-600">MeteoTrentino</span>
                  </div>
                </a>
                <a
                  href="https://www.3bmeteo.com/meteo/passo+san+pellegrino"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-800">🏔️ Passo San Pellegrino</span>
                    <span className="text-sm text-gray-600">3B Meteo</span>
                  </div>
                </a>
                <a
                  href="https://www.meteotrentino.it/#!/content?menuItemDesktop=82&localita=canazei"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-800">🚡 Canazei</span>
                    <span className="text-sm text-gray-600">MeteoTrentino</span>
                  </div>
                </a>
              </div>
              <div className="space-y-2">
                <a
                  href="https://www.3bmeteo.com/meteo/lago+di+carezza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-teal-800">🏞️ Lago di Carezza</span>
                    <span className="text-sm text-gray-600">3B Meteo</span>
                  </div>
                </a>
                <a
                  href="https://www.meteotrentino.it/#!/content?menuItemDesktop=82&localita=cavalese"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-orange-800">🌲 Cavalese</span>
                    <span className="text-sm text-gray-600">MeteoTrentino</span>
                  </div>
                </a>
                <a
                  href="https://www.mountain-forecast.com/peaks/Sass-Pordoi/forecasts/2950"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-purple-800">⛰️ Sass Pordoi (2950m)</span>
                    <span className="text-sm text-gray-600">Mountain Forecast</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h4 className="font-bold text-gray-800 mb-4">📱 QR Code - MeteoTrentino</h4>
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 mx-auto mb-4 flex items-center justify-center rounded-lg border-2 border-blue-300">
                <div className="text-center">
                  <Cloud className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs text-blue-700 font-mono">QR</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Scansiona per accesso rapido</p>
              <p className="text-xs text-gray-500 mt-1">meteotrentino.it</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h4 className="font-bold text-gray-800 mb-4">📱 QR Code - App Meteo</h4>
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 mx-auto mb-4 flex items-center justify-center rounded-lg border-2 border-green-300">
                <div className="text-center">
                  <Sun className="w-8 h-8 text-green-600 mx-auto mb-1" />
                  <span className="text-xs text-green-700 font-mono">QR</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Scarica app 3B Meteo</p>
              <p className="text-xs text-gray-500 mt-1">Play Store / App Store</p>
            </div>
          </div>

          {/* Weather Checklist */}
          <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">✅ Checklist Meteo Pre-Partenza</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-green-600" />
                  <span className="text-sm">Controllare previsioni 3 giorni prima</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-green-600" />
                  <span className="text-sm">Verificare condizioni alta quota</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-green-600" />
                  <span className="text-sm">Scaricare app meteo offline</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-green-600" />
                  <span className="text-sm">Preparare abbigliamento per pioggia</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-green-600" />
                  <span className="text-sm">Controllare apertura funivie</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-green-600" />
                  <span className="text-sm">Salvare numeri emergenza meteo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Emergency Weather Info */}
          <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center text-red-700">
              <span className="font-semibold">⚠️ Allerta Meteo: 0461 495111</span>
              <span className="ml-4 text-sm">(Protezione Civile Trentino)</span>
            </div>
          </div>
        </div>

        {/* Equipment Images Section */}
        <section className="py-8 px-4 page-break">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative h-64 rounded-lg overflow-hidden avoid-break">
                <Image
                  src="/images/trekking-equipment.jpg"
                  alt="Attrezzatura da trekking"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Attrezzatura da Trekking</h3>
                </div>
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden avoid-break">
                <Image src="/images/dog-mountain.jpg" alt="Cane in montagna" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Il Nostro Compagno di Viaggio</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-green-50 page-break">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Backpack className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-4xl font-bold mb-4 text-gray-800">Abbigliamento e Consigli Utili</h2>
              <p className="text-xl text-gray-600">Pronti per l'Avventura!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Couple */}
              <Card className="bg-white shadow-lg border-gray-200 avoid-break">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Heart className="w-6 h-6 mr-2 text-red-400" />
                    Per Voi Due
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center text-gray-800">
                      <Sun className="w-5 h-5 mr-2" />
                      Vestirsi a Strati è la Chiave
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>
                        • <strong>Intimo Tecnico Traspirante:</strong> Per mantenere la pelle asciutta
                      </li>
                      <li>
                        • <strong>Pile o Felpa Tecnica:</strong> Per l'isolamento termico
                      </li>
                      <li>
                        • <strong>Giacca Antivento e Impermeabile:</strong> Essenziale per ogni condizione meteo
                      </li>
                      <li>
                        • <strong>Pantaloni da Escursione:</strong> Comodi, evitate i jeans sui sentieri
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Calzature</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>
                        • <strong>Scarponcini da Trekking:</strong> Impermeabili, con buona suola
                      </li>
                      <li>
                        • <strong>Scarpe Comode:</strong> Per il relax nei paesi
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Accessori Indispensabili</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Zaino (20-30L), Cappello, Occhiali da sole</li>
                      <li>• Crema solare alta protezione</li>
                      <li>• Borraccia, Bastoncini da trekking</li>
                      <li>• Kit primo soccorso, Macchina fotografica</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* For Dog */}
              <Card className="bg-white shadow-lg border-gray-200 avoid-break">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Dog className="w-6 h-6 mr-2 text-yellow-400" />
                    Per il Nostro Artù
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Documenti e Identificazione</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>
                        • <strong>Libretto Sanitario/Passaporto UE:</strong> Vaccinazioni in regola
                      </li>
                      <li>
                        • <strong>Collare con Medaglietta:</strong> Nome e numero di telefono
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Gestione e Sicurezza</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>
                        • <strong>Guinzaglio Robusto:</strong> Non allungabile sui sentieri
                      </li>
                      <li>
                        • <strong>Museruola:</strong> Obbligatoria in alcuni contesti
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Comfort e Salute</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Cibo abituale, ciotole da viaggio</li>
                      <li>• Copertina familiare, asciugamano</li>
                      <li>• Kit pronto soccorso per cani</li>
                      <li>• Protezione antiparassitaria attiva</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-green-50 to-white page-break">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl avoid-break">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-gray-800 flex items-center justify-center">
                  <Mountain className="w-8 h-8 mr-3 text-green-600" />
                  Consigli Generali per Tutti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Cloud className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Meteo Variabile</h4>
                        <p className="text-gray-600 text-sm">Controllate le previsioni, ma siate pronti a tutto</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Badge className="bg-green-100 text-green-800 mr-3 mt-1">Card</Badge>
                      <div>
                        <h4 className="font-semibold text-gray-800">Trentino Guest Card</h4>
                        <p className="text-gray-600 text-sm">Informatevi per sconti e gratuità</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="w-6 h-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Prenotazioni</h4>
                        <p className="text-gray-600 text-sm">Per rifugi e ristoranti affollati</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Heart className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Il Consiglio Più Importante</h4>
                        <p className="text-gray-600 text-sm">Godetevi ogni istante!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center text-red-700">
                    <span className="font-semibold">📞 Numero di Emergenza: 112</span>
                    <span className="ml-4 text-sm">(Emergenza Unica Europea)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-100 to-green-100 page-break">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Mappa del Nostro Viaggio</h2>
            <Card className="p-8 avoid-break">
              <div className="mb-6">
                <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">
                  Crea la tua mappa personalizzata su <strong>Google My Maps</strong> aggiungendo queste tappe:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-left">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Moena
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    Passo San Pellegrino
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    Val San Nicolò
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    Canazei (Sass Pordoi)
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                    Lago di Carezza
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    Cavalese
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                    Parco di Paneveggio
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* Interactive Map Section */}
        <section className="py-16 px-4 bg-white page-break">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Mappa Interattiva dei Percorsi</h2>
              <p className="text-xl text-gray-600">Tutti i tragitti in auto per il vostro viaggio</p>
            </div>

            {/* Interactive Google Map */}
            {/* Interactive Map Alternative */}
            <Card className="overflow-hidden shadow-2xl avoid-break">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">🗺️ Mappa Interattiva</h3>
                  <p className="text-gray-600 mb-6">
                    Clicca sui pulsanti per aprire le mappe direttamente su Google Maps
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <a
                    href="https://maps.google.com/maps?q=Moena,+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-green-800">Moena</h4>
                      <p className="text-sm text-gray-600">Base del viaggio</p>
                    </div>
                  </a>

                  <a
                    href="https://maps.google.com/maps?q=Passo+San+Pellegrino,+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-blue-800">Passo San Pellegrino</h4>
                      <p className="text-sm text-gray-600">1900m - Panorami</p>
                    </div>
                  </a>

                  <a
                    href="https://maps.google.com/maps?q=Val+San+Nicolò,+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-purple-800">Val San Nicolò</h4>
                      <p className="text-sm text-gray-600">Prati fioriti</p>
                    </div>
                  </a>

                  <a
                    href="https://maps.google.com/maps?q=Canazei,+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-red-50 hover:bg-red-100 rounded-lg border-2 border-red-200 hover:border-red-400 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-red-800">Canazei</h4>
                      <p className="text-sm text-gray-600">Sass Pordoi</p>
                    </div>
                  </a>

                  <a
                    href="https://maps.google.com/maps?q=Lago+di+Carezza,+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-teal-50 hover:bg-teal-100 rounded-lg border-2 border-teal-200 hover:border-teal-400 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-teal-800">Lago di Carezza</h4>
                      <p className="text-sm text-gray-600">Lago arcobaleno</p>
                    </div>
                  </a>

                  <a
                    href="https://maps.google.com/maps?q=Cavalese,+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-orange-800">Cavalese</h4>
                      <p className="text-sm text-gray-600">Val di Fiemme</p>
                    </div>
                  </a>
                </div>

                <div className="mt-8 text-center">
                  <a
                    href="https://maps.google.com/maps/dir/Moena,+Italy/Passo+San+Pellegrino,+Italy/Val+San+Nicolò,+Italy/Canazei,+Italy/Lago+di+Carezza,+Italy/Cavalese,+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    🗺️ Apri Percorso Completo su Google Maps
                  </a>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">💡 Come usare:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Clicca su ogni destinazione per aprire la mappa</li>
                    <li>• Usa "Percorso Completo" per navigazione step-by-step</li>
                    <li>• Salva le mappe offline prima di partire</li>
                    <li>• Condividi i link con Rita per coordinare il viaggio</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Route Details */}
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg avoid-break">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">🚗 Distanze e Tempi di Percorrenza</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Moena → Passo San Pellegrino</span>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">15 km</div>
                        <div className="text-sm text-gray-600">25 min</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Moena → Val San Nicolò</span>
                      <div className="text-right">
                        <div className="text-blue-600 font-semibold">8 km</div>
                        <div className="text-sm text-gray-600">15 min</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Moena → Canazei</span>
                      <div className="text-right">
                        <div className="text-purple-600 font-semibold">12 km</div>
                        <div className="text-sm text-gray-600">20 min</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                      <span className="font-medium">Moena → Lago di Carezza</span>
                      <div className="text-right">
                        <div className="text-teal-600 font-semibold">25 km</div>
                        <div className="text-sm text-gray-600">35 min</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Moena → Cavalese</span>
                      <div className="text-right">
                        <div className="text-orange-600 font-semibold">18 km</div>
                        <div className="text-sm text-gray-600">25 min</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg avoid-break">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">🛣️ Consigli per la Guida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Strade di Montagna</h4>
                        <p className="text-sm text-gray-600">Curve e pendenze: guidate con prudenza</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Parcheggi</h4>
                        <p className="text-sm text-gray-600">Molti sono a pagamento, portate monete</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Carburante</h4>
                        <p className="text-sm text-gray-600">Fate rifornimento nei paesi principali</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Meteo</h4>
                        <p className="text-sm text-gray-600">Controllate le condizioni dei passi</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Navigatore</h4>
                        <p className="text-sm text-gray-600">Scaricate le mappe offline</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alternative Routes */}
            <div className="mt-12">
              <Card className="shadow-lg avoid-break">
                <CardHeader>
                  <CardTitle className="text-center text-gray-800">🗺️ Percorsi Panoramici Alternativi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Strada delle Dolomiti</h4>
                      <p className="text-sm text-gray-700">SS48 - Panorami mozzafiato</p>
                      <p className="text-xs text-green-600 mt-2">+15 min, ma ne vale la pena!</p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Passo Pordoi</h4>
                      <p className="text-sm text-gray-700">SS48 - Regina delle Dolomiti</p>
                      <p className="text-xs text-blue-600 mt-2">Imperdibile per le foto!</p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Val di Fiemme</h4>
                      <p className="text-sm text-gray-700">SS48 - Tra boschi e prati</p>
                      <p className="text-xs text-purple-600 mt-2">Perfetto per il relax</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* QR Code for Mobile Maps */}
            <div className="mt-12 text-center">
              <Card className="inline-block p-8 shadow-lg avoid-break">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📱 Mappa Mobile</h3>
                  <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 flex items-center justify-center rounded-lg">
                    <span className="text-4xl">📍</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Scansiona per aprire</p>
                  <p className="text-sm text-gray-600">Google Maps sul telefono</p>
                  <p className="text-xs text-gray-500 mt-2">Oppure cerca: "Moena Trentino itinerario"</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-900 text-white text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Mountain className="w-8 h-8 mr-2" />
              <Heart className="w-6 h-6 text-red-400 mx-2" />
              <TreePine className="w-8 h-8 ml-2" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Il mio viaggio nel cassetto</h3>
            <p className="text-gray-300 mb-2">Trentino, Emozioni tra Montagne e Tradizioni</p>
            <p className="text-gray-400">11 - 17 Giugno 2025 • Moena, Val di Fassa</p>
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-sm text-gray-400">Creato con ❤️ da Ivan per Rita e Artù - Un viaggio indimenticabile</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
