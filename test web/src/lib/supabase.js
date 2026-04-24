import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[FarmDirect] Missing Supabase env vars.\n' +
    'Copy .env.example → .env and fill in your project URL and anon key.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export const signUp = (email, password, meta = {}) =>
  supabase.auth.signUp({ email, password, options: { data: meta } });

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// ─── Products ─────────────────────────────────────────────────────────────────

/** Fetch all active products, joined with farmer name */
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      farmers ( name, name_hi, location, verified, rating )
    `)
    .eq('is_active', true)
    .order('id');
  if (error) throw error;
  return data;
};

/** Fetch products by category */
export const fetchProductsByCategory = async (category) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, farmers(name, name_hi, verified)')
    .eq('category', category)
    .eq('is_active', true);
  if (error) throw error;
  return data;
};

/** Search products by name */
export const searchProducts = async (query) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, farmers(name, name_hi)')
    .ilike('name', `%${query}%`)
    .eq('is_active', true);
  if (error) throw error;
  return data;
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id');
  if (error) throw error;
  return data;
};

// ─── Farmers ──────────────────────────────────────────────────────────────────

export const fetchFarmers = async () => {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .order('rating', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchFarmerById = async (id) => {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// ─── Cart (persistent) ────────────────────────────────────────────────────────

export const fetchCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const upsertCartItem = async (userId, productId, qty) => {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({ user_id: userId, product_id: productId, qty }, { onConflict: 'user_id,product_id' })
    .select();
  if (error) throw error;
  return data;
};

export const removeCartItem = async (userId, productId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
};

export const clearCart = async (userId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

/** Place a new order with items */
export const placeOrder = async ({ consumerId, addressId, paymentMethod, subtotal, deliveryFee, total, farmerId, items }) => {
  // 1. Insert order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      consumer_id: consumerId,
      address_id:  addressId,
      payment_method: paymentMethod,
      subtotal, delivery_fee: deliveryFee, total,
      farmer_id: farmerId,
      status: 'placed',
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  // 2. Insert order items
  const orderItems = items.map(i => ({
    order_id:   order.id,
    product_id: i.id,
    name:       i.name,
    price:      i.price,
    qty:        i.qty,
    unit:       i.unit,
    emoji:      i.emoji,
  }));
  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) throw itemsErr;

  // 3. Insert initial tracking step
  await supabase.from('order_tracking').insert({
    order_id:  order.id,
    status:    'placed',
    label:     'Order Placed',
    label_hi:  'ऑर्डर दिया गया',
    detail:    'Your order has been confirmed',
    detail_hi: 'आपका ऑर्डर कन्फर्म हो गया है',
    step_time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    done:      true,
  });

  return order;
};

/** Fetch orders for a consumer */
export const fetchConsumerOrders = async (consumerId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_tracking(*)')
    .eq('consumer_id', consumerId)
    .order('placed_at', { ascending: false });
  if (error) throw error;
  return data;
};

/** Fetch orders for a farmer */
export const fetchFarmerOrders = async (farmerId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(full_name)')
    .eq('farmer_id', farmerId)
    .order('placed_at', { ascending: false });
  if (error) throw error;
  return data;
};

/** Update order status */
export const updateOrderStatus = async (orderId, status) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
};

// ─── Addresses ────────────────────────────────────────────────────────────────

export const fetchAddresses = async (userId) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const addAddress = async (userId, addressData) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ user_id: userId, ...addressData })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─── Earnings ─────────────────────────────────────────────────────────────────

export const fetchEarnings = async (farmerId) => {
  const { data, error } = await supabase
    .from('earnings')
    .select('*')
    .eq('farmer_id', farmerId)
    .single();
  if (error) throw error;
  return data;
};

// ─── Realtime subscription helpers ────────────────────────────────────────────

/** Subscribe to new/updated orders for a farmer */
export const subscribeToFarmerOrders = (farmerId, callback) =>
  supabase
    .channel(`farmer-orders-${farmerId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `farmer_id=eq.${farmerId}`,
    }, callback)
    .subscribe();

/** Subscribe to order tracking updates */
export const subscribeToOrderTracking = (orderId, callback) =>
  supabase
    .channel(`order-tracking-${orderId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'order_tracking',
      filter: `order_id=eq.${orderId}`,
    }, callback)
    .subscribe();
