import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'

function TrackOrderPage() {

  const { orderId } = useParams()
  const navigate = useNavigate()

  const [currentOrder, setCurrentOrder] = useState()
  const [liveLocations, setLiveLocations] = useState({})

  const handleGetOrder = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      )
      setCurrentOrder(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    handleGetOrder()
  }, [orderId])

  // API polling instead of socket
  useEffect(() => {

    const fetchLiveLocation = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/order/get-live-location/${orderId}`,
          { withCredentials: true }
        )

        if (res.data) {
          setLiveLocations(res.data)
        }

      } catch {
        console.log("Live tracking not active")
      }
    }

    fetchLiveLocation()

    const interval = setInterval(fetchLiveLocation, 5000)

    return () => clearInterval(interval)

  }, [orderId])

  return (

    <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>

      {/* BACK BUTTON */}
      <div
        className='flex items-center gap-3 cursor-pointer'
        onClick={() => navigate(-1)}
      >
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
        <h1 className='text-xl font-bold'>Track Order</h1>
      </div>

      {currentOrder?.shopOrders?.map((shopOrder, index) => (

        <div
          key={index}
          className='bg-white p-4 rounded-xl shadow border'
        >

          <p className='font-bold text-orange-500'>
            {shopOrder.shop.name}
          </p>

          <p>
            Items:
            {shopOrder.shopOrderItems.map(i => i.name).join(", ")}
          </p>

          <p>Subtotal: ₹{shopOrder.subtotal}</p>

          <p>Address: {currentOrder.deliveryAddress?.text}</p>

          {(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") && (

            <div className="h-[350px] mt-4 rounded overflow-hidden">

              <DeliveryBoyTracking data={{
                deliveryBoyLocation:
                  liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                    lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                    lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                  },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }} />

            </div>

          )}

        </div>

      ))}

    </div>
  )
}

export default TrackOrderPage
