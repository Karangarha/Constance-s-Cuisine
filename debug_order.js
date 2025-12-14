
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6eXJ5eXJ5eXJ5eXJ5eXJ5eXJ5Iiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNNni43kdQwgnWNReilDMblYTn_I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrder() {
    const orderId = '10000031' // Assuming string ID based on previous fixes, though user said 10000031 which looks like a number. Wait, previous fix changed ID to string UUID. But maybe this is an old order or the user is using the numeric ID?
    // The user URL was /track/10000031.
    // If the ID is 10000031, it's likely a number (serial).
    // But my code expects UUIDs now?
    // Let's check the type of ID in the DB.

    // Try fetching by ID as is.
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        menu_items ( name, price )
      )
    `)
        .eq('id', orderId)
        .single()

    if (error) {
        console.error('Error fetching order:', error)
        return
    }

    console.log('Order Status:', order.status)
    console.log('Order Total (DB):', order.total_amount)

    let calculatedTotal = 0
    console.log('Items:')
    order.order_items.forEach(item => {
        const itemTotal = item.quantity * item.price_at_time
        const isCancelled = item.order_item_status === 'cancelled'
        console.log(`- ${item.menu_items.name}: ${item.quantity} x $${item.price_at_time} = $${itemTotal} [${item.order_item_status}]`)

        if (!isCancelled) {
            calculatedTotal += itemTotal
        }
    })

    console.log('Calculated Total (Active Items):', calculatedTotal)
    console.log('Difference:', order.total_amount - calculatedTotal)
}

checkOrder()
