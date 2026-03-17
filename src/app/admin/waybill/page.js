"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "../../../lib/supabaseClient"

export default function WaybillPage() {

  const [orders, setOrders] = useState([])
  const [orderSearch, setOrderSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [error, setError] = useState("")

  // Load orders
  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        shipping_name,
        phone,
        address,
        delivery_method,
        created_at,
        order_items (
          quantity,
          product_name,
          products (
            name,
            price
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setOrders(data || [])
  }

  // Search Order
  async function searchOrder() {
    setError("")
    setSelectedOrder(null)

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          product_name,
          products (
            name,
            price
          )
        )
      `)
      .eq("order_number", orderSearch)
      .single()

    if (error) {
      setError("Order not found")
      return
    }

    setSelectedOrder(data)
  }

  // Calculate Total
  const totalPrice = useMemo(() => {
    if (!selectedOrder) return 0

    return selectedOrder.order_items.reduce((sum, item) => {
      const price = item.products?.price || 0
      return sum + price * item.quantity
    }, 0)

  }, [selectedOrder])

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>

      <h1>Waybill Search</h1>

      {/* Search Box */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Order Number"
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            marginRight: "10px"
          }}
        />

        <button onClick={searchOrder}>
          Search Order
        </button>
      </div>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {/* Order Result */}
      {selectedOrder && (
        <div style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "10px"
        }}>

          <h2>Order #{selectedOrder.order_number}</h2>

          <p><strong>Name:</strong> {selectedOrder.shipping_name}</p>
          <p><strong>Phone:</strong> {selectedOrder.phone}</p>
          <p><strong>Address:</strong> {selectedOrder.address}</p>
          <p><strong>Delivery:</strong> {selectedOrder.delivery_method}</p>

          <h3>Items</h3>

          {selectedOrder.order_items.map((item, i) => (
            <div key={i} style={{
              borderBottom: "1px solid #eee",
              padding: "10px 0"
            }}>
              <p>
                {item.product_name}  
                | Qty: {item.quantity}  
                | ₱{item.products?.price}
              </p>
            </div>
          ))}

          <h2 style={{ marginTop: "20px" }}>
            Total: ₱{totalPrice}
          </h2>

        </div>
      )}

    </div>
  )
}
      
