import React from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

function DeliveryBoyTracking({ data }) {
  if (
    !data ||
    !data.deliveryBoyLocation ||
    !data.customerLocation
  ) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        Loading map...
      </div>
    )
  }

  const { lat: dLat, lon: dLon } = data.deliveryBoyLocation
  const { lat: cLat, lon: cLon } = data.customerLocation

  const path = [
    [dLat, dLon],
    [cLat, cLon],
  ]

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={[dLat, dLon]}
        zoom={16}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[dLat, dLon]} icon={deliveryBoyIcon}>
          <Popup>Delivery Boy</Popup>
        </Marker>

        <Marker position={[cLat, cLon]} icon={customerIcon}>
          <Popup>Customer</Popup>
        </Marker>

        <Polyline positions={path} weight={4} />
      </MapContainer>
    </div>
  )
}

export default DeliveryBoyTracking