import { NextResponse } from "next/server";
import { Pool } from "pg";

// DB helper: shared pool for serverless execution
const pool =
  globalThis.__ewwPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (!globalThis.__ewwPool) {
  globalThis.__ewwPool = pool;
}

// Util: 8-char uppercase alphanumeric order number
function generateOrderNumber(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Route handler: POST /app/api/order/create
export async function POST(request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const items = body?.items ?? [];
    const customer = body?.customer ?? {};
    const shipping = body?.shipping ?? {};
    const deliveryMethod = body?.delivery_method ?? "";
    const deliveryOption = body?.delivery_option ?? "";

    // Validation: required fields
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are required." },
        { status: 400 }
      );
    }
    if (!shipping?.name || !shipping?.phone || !shipping?.address) {
      return NextResponse.json(
        { success: false, message: "Shipping name, phone, and address are required." },
        { status: 400 }
      );
    }
    if (!deliveryMethod) {
      return NextResponse.json(
        { success: false, message: "Delivery method is required." },
        { status: 400 }
      );
    }

    // Begin transaction
    await client.query("BEGIN");

    const productIds = items.map((item) => item.product_id);
    const { rows: products } = await client.query(
      `SELECT id, name, price, stock
       FROM products
       WHERE id = ANY($1::uuid[])
       FOR UPDATE`,
      [productIds]
    );

    if (products.length !== productIds.length) {
      throw Object.assign(new Error("One or more products not found."), {
        status: 404,
      });
    }

    // Stock checks + totals
    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = 0;

    for (const item of items) {
      const product = productMap.get(item.product_id);
      const qty = Number(item.quantity || 0);
      if (!product || qty <= 0) {
        throw Object.assign(new Error("Invalid item quantity."), { status: 400 });
      }
      if ((product.stock ?? 0) < qty) {
        throw Object.assign(new Error(`Insufficient stock for ${product.name}.`), {
          status: 409,
        });
      }
      total += Number(product.price) * qty;
    }

    // Insert order with unique order_number (retry on collision)
    let orderNumber = generateOrderNumber();
    let orderRow = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const { rows } = await client.query(
          `INSERT INTO orders
           (order_number, total, shipping_name, phone, address, delivery_method, delivery_option, customer_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           RETURNING id, order_number`,
          [
            orderNumber,
            total,
            shipping.name,
            shipping.phone,
            shipping.address,
            deliveryMethod,
            deliveryOption || null,
            customer?.id || null,
          ]
        );
        orderRow = rows[0];
        break;
      } catch (err) {
        if (err?.code === "23505") {
          orderNumber = generateOrderNumber();
          continue;
        }
        throw err;
      }
    }

    if (!orderRow) {
      throw Object.assign(new Error("Unable to generate a unique order number."), {
        status: 500,
      });
    }

    // Insert order items with snapshot name/price
    const orderItems = items.map((item) => {
      const product = productMap.get(item.product_id);
      return {
        order_id: orderRow.id,
        product_id: item.product_id,
        product_name: product.name,
        quantity: Number(item.quantity),
        price: Number(product.price),
      };
    });

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, quantity, price)
         VALUES ($1,$2,$3,$4,$5)`,
        [item.order_id, item.product_id, item.product_name, item.quantity, item.price]
      );
    }

    // Deduct stock
    for (const item of orderItems) {
      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      order_number: orderRow.order_number,
      summary: {
        order_number: orderRow.order_number,
        items: orderItems,
        total,
        delivery_method: deliveryMethod,
        delivery_option: deliveryOption,
        customer: {
          id: customer?.id || null,
          name: shipping.name,
          email: customer?.email || null,
          phone: shipping.phone,
          address: shipping.address,
        },
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    const status = err?.status || 500;
    return NextResponse.json(
      { success: false, message: err?.message || "Server error." },
      { status }
    );
  } finally {
    client.release();
  }
}
