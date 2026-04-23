import heroImg from '../assets/hero_background.png';
import productsImg from '../assets/products_collage.png';
import farmerImg from '../assets/farmer_portrait.png';
import deliveryImg from '../assets/delivery_illustration.png';

export const images = { heroImg, productsImg, farmerImg, deliveryImg };

export const categories = [
  { id: 1, name: 'Fruits', nameHi: 'फल', icon: '🍎', color: '#FEE2E2', accent: '#EF4444', count: 48 },
  { id: 2, name: 'Vegetables', nameHi: 'सब्ज़ियाँ', icon: '🥬', color: '#DCFCE7', accent: '#16A34A', count: 62 },
  { id: 3, name: 'Dairy', nameHi: 'डेयरी', icon: '🥛', color: '#FEF9C3', accent: '#F59E0B', count: 24 },
  { id: 4, name: 'Grains', nameHi: 'अनाज', icon: '🌾', color: '#FED7AA', accent: '#EA580C', count: 35 },
  { id: 5, name: 'Spices', nameHi: 'मसाले', icon: '🌶️', color: '#FECACA', accent: '#DC2626', count: 29 },
  { id: 6, name: 'Herbs', nameHi: 'जड़ी बूटी', icon: '🌿', color: '#D1FAE5', accent: '#059669', count: 18 },
];

export const farmers = [
  { id: 1, name: 'Ramesh Patel', nameHi: 'रमेश पटेल', location: 'Nashik, Maharashtra', locationHi: 'नाशिक, महाराष्ट्र', rating: 4.8, reviews: 234, products: 18, image: null, verified: true, since: 2019, specialty: 'Organic Vegetables' },
  { id: 2, name: 'Sunita Devi', nameHi: 'सुनीता देवी', location: 'Shimla, Himachal', locationHi: 'शिमला, हिमाचल', rating: 4.9, reviews: 189, products: 12, image: null, verified: true, since: 2020, specialty: 'Apples & Fruits' },
  { id: 3, name: 'Arjun Singh', nameHi: 'अर्जुन सिंह', location: 'Amritsar, Punjab', locationHi: 'अमृतसर, पंजाब', rating: 4.7, reviews: 312, products: 25, image: null, verified: true, since: 2018, specialty: 'Wheat & Grains' },
  { id: 4, name: 'Lakshmi Bai', nameHi: 'लक्ष्मी बाई', location: 'Anand, Gujarat', locationHi: 'आनंद, गुजरात', rating: 4.9, reviews: 156, products: 8, image: null, verified: true, since: 2021, specialty: 'Fresh Dairy' },
  { id: 5, name: 'Kiran Kumar', nameHi: 'किरण कुमार', location: 'Raichur, Karnataka', locationHi: 'रायचूर, कर्नाटक', rating: 4.6, reviews: 98, products: 15, image: null, verified: false, since: 2022, specialty: 'Rice & Millets' },
  { id: 6, name: 'Meena Kumari', nameHi: 'मीना कुमारी', location: 'Jaipur, Rajasthan', locationHi: 'जयपुर, राजस्थान', rating: 4.8, reviews: 201, products: 20, image: null, verified: true, since: 2020, specialty: 'Spices & Herbs' },
];

const harvestHoursAgo = (h) => {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

export const products = [
  { id: 1, name: 'Organic Tomatoes', nameHi: 'जैविक टमाटर', category: 'Vegetables', price: 40, marketPrice: 60, unit: 'kg', farmerId: 1, freshness: harvestHoursAgo(3), badge: 'Organic', badgeHi: 'जैविक', rating: 4.7, reviews: 89, stock: 50, description: 'Farm-fresh organic tomatoes, grown without pesticides. Rich in lycopene and vitamin C.', descriptionHi: 'खेत से ताज़े जैविक टमाटर, बिना कीटनाशक के उगाए गए। लाइकोपीन और विटामिन सी से भरपूर।', emoji: '🍅' },
  { id: 2, name: 'Fresh Spinach', nameHi: 'ताज़ा पालक', category: 'Vegetables', price: 30, marketPrice: 45, unit: 'bunch', farmerId: 1, freshness: harvestHoursAgo(2), badge: 'Fresh', badgeHi: 'ताज़ा', rating: 4.8, reviews: 67, stock: 30, description: 'Crisp, green spinach leaves packed with iron and nutrients. Perfect for salads and cooking.', descriptionHi: 'कुरकुरी, हरी पालक की पत्तियाँ आयरन और पोषक तत्वों से भरपूर।', emoji: '🥬' },
  { id: 3, name: 'Alphonso Mangoes', nameHi: 'अल्फांसो आम', category: 'Fruits', price: 350, marketPrice: 500, unit: 'dozen', farmerId: 2, freshness: harvestHoursAgo(8), badge: 'Premium', badgeHi: 'प्रीमियम', rating: 4.9, reviews: 156, stock: 20, description: 'Premium Alphonso mangoes from Ratnagiri. Sweet, aromatic, and perfectly ripe.', descriptionHi: 'रत्नागिरी से प्रीमियम अल्फांसो आम। मीठे, सुगंधित और पूरी तरह पके हुए।', emoji: '🥭' },
  { id: 4, name: 'Basmati Rice', nameHi: 'बासमती चावल', category: 'Grains', price: 120, marketPrice: 180, unit: 'kg', farmerId: 3, freshness: harvestHoursAgo(48), badge: 'Staple', badgeHi: 'मूल', rating: 4.6, reviews: 203, stock: 100, description: 'Long-grain premium basmati rice. Aged for perfect aroma and fluffiness.', descriptionHi: 'लंबे दाने वाले प्रीमियम बासमती चावल। सही सुगंध और फुलावट के लिए।', emoji: '🍚' },
  { id: 5, name: 'Farm Milk', nameHi: 'फार्म दूध', category: 'Dairy', price: 60, marketPrice: 80, unit: 'litre', farmerId: 4, freshness: harvestHoursAgo(1), badge: 'Fresh', badgeHi: 'ताज़ा', rating: 4.9, reviews: 134, stock: 40, description: 'Pure, unprocessed A2 cow milk delivered fresh from the farm every morning.', descriptionHi: 'शुद्ध, बिना प्रोसेस किया हुआ A2 गाय का दूध हर सुबह ताज़ा।', emoji: '🥛' },
  { id: 6, name: 'Organic Carrots', nameHi: 'जैविक गाजर', category: 'Vegetables', price: 45, marketPrice: 65, unit: 'kg', farmerId: 1, freshness: harvestHoursAgo(5), badge: 'Organic', badgeHi: 'जैविक', rating: 4.5, reviews: 56, stock: 35, description: 'Bright orange organic carrots, crunchy and sweet. Great for juicing and cooking.', descriptionHi: 'चमकीली नारंगी जैविक गाजर, कुरकुरी और मीठी।', emoji: '🥕' },
  { id: 7, name: 'Wheat Flour', nameHi: 'गेहूं का आटा', category: 'Grains', price: 55, marketPrice: 75, unit: 'kg', farmerId: 3, freshness: harvestHoursAgo(24), badge: 'Fresh Ground', badgeHi: 'ताज़ा पिसा', rating: 4.7, reviews: 178, stock: 80, description: 'Stone-ground whole wheat flour, made from the finest Punjab wheat.', descriptionHi: 'पत्थर पर पिसा हुआ साबुत गेहूं का आटा, बेहतरीन पंजाब गेहूं से।', emoji: '🌾' },
  { id: 8, name: 'Paneer', nameHi: 'पनीर', category: 'Dairy', price: 280, marketPrice: 360, unit: 'kg', farmerId: 4, freshness: harvestHoursAgo(4), badge: 'Homemade', badgeHi: 'घर का बना', rating: 4.8, reviews: 92, stock: 15, description: 'Soft, fresh homemade paneer. Made from pure farm milk with no preservatives.', descriptionHi: 'मुलायम, ताज़ा घर का बना पनीर। शुद्ध फार्म दूध से बिना किसी प्रिज़र्वेटिव के।', emoji: '🧀' },
  { id: 9, name: 'Red Onions', nameHi: 'लाल प्याज़', category: 'Vegetables', price: 35, marketPrice: 50, unit: 'kg', farmerId: 6, freshness: harvestHoursAgo(6), badge: 'Farm Fresh', badgeHi: 'खेत से ताज़ा', rating: 4.4, reviews: 145, stock: 60, description: 'Premium Nashik red onions, known for their pungent flavor and deep color.', descriptionHi: 'प्रीमियम नाशिक लाल प्याज़, अपने तीखे स्वाद और गहरे रंग के लिए जाने जाते हैं।', emoji: '🧅' },
  { id: 10, name: 'Green Chillies', nameHi: 'हरी मिर्च', category: 'Spices', price: 20, marketPrice: 35, unit: '250g', farmerId: 6, freshness: harvestHoursAgo(2), badge: 'Spicy', badgeHi: 'तीखा', rating: 4.6, reviews: 73, stock: 45, description: 'Fresh green chillies with the perfect kick. Adds flavor and heat to any dish.', descriptionHi: 'ताज़ी हरी मिर्च। किसी भी व्यंजन में स्वाद और तीखापन जोड़ती हैं।', emoji: '🌶️' },
  { id: 11, name: 'Fresh Coriander', nameHi: 'ताज़ा धनिया', category: 'Herbs', price: 15, marketPrice: 25, unit: 'bunch', farmerId: 6, freshness: harvestHoursAgo(1), badge: 'Aromatic', badgeHi: 'सुगंधित', rating: 4.7, reviews: 88, stock: 50, description: 'Fragrant fresh coriander leaves, perfect for garnishing and chutneys.', descriptionHi: 'सुगंधित ताज़ी धनिया पत्ती, सजावट और चटनी के लिए।', emoji: '🌿' },
  { id: 12, name: 'Shimla Apples', nameHi: 'शिमला सेब', category: 'Fruits', price: 180, marketPrice: 250, unit: 'kg', farmerId: 2, freshness: harvestHoursAgo(12), badge: 'Himalayan', badgeHi: 'हिमालयी', rating: 4.8, reviews: 167, stock: 25, description: 'Crisp, juicy apples from the orchards of Shimla. Naturally sweet and delicious.', descriptionHi: 'शिमला के बागों से कुरकुरे, रसीले सेब। प्राकृतिक रूप से मीठे और स्वादिष्ट।', emoji: '🍎' },
];

export const quickFilters = [
  { id: 'all', label: 'All', labelHi: 'सभी' },
  { id: 'organic', label: 'Organic', labelHi: 'जैविक' },
  { id: 'seasonal', label: 'Seasonal', labelHi: 'मौसमी' },
  { id: 'under50', label: 'Under ₹50', labelHi: '₹50 से कम' },
  { id: 'bestseller', label: 'Bestseller', labelHi: 'बेस्टसेलर' },
  { id: 'new', label: 'New Arrivals', labelHi: 'नई उपलब्धता' },
];

export const addresses = [
  { id: 1, type: 'Home', typeHi: 'घर', address: '42, Green Park Colony, Sector 15', city: 'Gurugram, Haryana - 122001', isDefault: true },
  { id: 2, type: 'Office', typeHi: 'ऑफिस', address: 'Tower B, Floor 4, Cyber City', city: 'Gurugram, Haryana - 122002', isDefault: false },
];

export const orderSteps = [
  { id: 1, status: 'placed', label: 'Order Placed', labelHi: 'ऑर्डर दिया गया', time: '10:30 AM', detail: 'Your order has been confirmed', detailHi: 'आपका ऑर्डर कन्फर्म हो गया है', done: true },
  { id: 2, status: 'packed', label: 'Packed', labelHi: 'पैक किया गया', time: '11:15 AM', detail: 'Farmer has packed your order', detailHi: 'किसान ने आपका ऑर्डर पैक कर दिया है', done: true },
  { id: 3, status: 'shipped', label: 'Out for Delivery', labelHi: 'डिलीवरी के लिए निकला', time: '12:00 PM', detail: 'Ravi is on the way with your order', detailHi: 'रवि आपके ऑर्डर के साथ रास्ते में है', done: true },
  { id: 4, status: 'delivered', label: 'Delivered', labelHi: 'डिलीवर हो गया', time: '12:45 PM', detail: 'Estimated delivery by 12:45 PM', detailHi: '12:45 PM तक डिलीवरी', done: false },
];

export const farmerOrders = [
  { id: 'ORD-2841', customer: 'Priya Sharma', items: 3, total: 245, status: 'New', time: '2 min ago' },
  { id: 'ORD-2840', customer: 'Amit Verma', items: 5, total: 580, status: 'Packed', time: '15 min ago' },
  { id: 'ORD-2839', customer: 'Neha Gupta', items: 2, total: 120, status: 'Delivered', time: '1 hr ago' },
  { id: 'ORD-2838', customer: 'Rajesh Kumar', items: 4, total: 390, status: 'Delivered', time: '2 hrs ago' },
  { id: 'ORD-2837', customer: 'Sonal Joshi', items: 1, total: 60, status: 'Delivered', time: '3 hrs ago' },
];

export const earningsData = {
  today: 1240,
  week: 8450,
  month: 32600,
  pending: 2100,
};
