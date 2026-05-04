import { Link } from 'react-router-dom';
import { Leaf, Users, Sprout, HeartHandshake, ShieldCheck, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { lang } = useApp();

  const isEn = lang === 'en';

  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="hero" style={{ background: 'var(--green-light)', padding: '60px 0', textAlign: 'center' }}>
        <div className="container fade-in-up">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--green)', marginBottom: 16 }}>
            {isEn ? 'Empowering Farmers, Nourishing Communities' : 'किसानों को सशक्त बनाना, समुदायों का पोषण करना'}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
            {isEn 
              ? 'FarmDirect is bridging the gap between local Indian farmers and conscious consumers. We eliminate middlemen to ensure farmers get fair prices and you get the freshest produce.' 
              : 'फार्मडायरेक्ट स्थानीय भारतीय किसानों और जागरूक उपभोक्ताओं के बीच की खाई को पाट रहा है। हम यह सुनिश्चित करने के लिए बिचौलियों को हटाते हैं कि किसानों को उचित मूल्य मिले और आपको सबसे ताज़ी उपज मिले।'}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
          <div className="fade-in-up stagger-1">
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 20 }}>
              {isEn ? 'Our Mission' : 'हमारा मिशन'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 16 }}>
              {isEn
                ? 'For decades, the agricultural supply chain has been plagued by inefficiencies. Farmers work tirelessly yet capture only a fraction of the final retail price, while consumers settle for produce that has spent days in transit and cold storage.'
                : 'दशकों से, कृषि आपूर्ति श्रृंखला अक्षमताओं से त्रस्त रही है। किसान अथक परिश्रम करते हैं फिर भी अंतिम खुदरा मूल्य का केवल एक अंश प्राप्त करते हैं, जबकि उपभोक्ता उस उपज से समझौता करते हैं जिसने पारगमन और कोल्ड स्टोरेज में दिन बिताए हैं।'}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
              {isEn
                ? 'We built FarmDirect to change this narrative. By leveraging technology, we connect you directly to the farm. Every purchase you make supports a farmer\'s livelihood directly, promoting sustainable agriculture and rural development.'
                : 'हमने इस कथा को बदलने के लिए फार्मडायरेक्ट का निर्माण किया। प्रौद्योगिकी का लाभ उठाकर, हम आपको सीधे खेत से जोड़ते हैं। आपकी हर खरीदारी सीधे किसान की आजीविका का समर्थन करती है, जिससे टिकाऊ कृषि और ग्रामीण विकास को बढ़ावा मिलता है।'}
            </p>
          </div>
          <div className="glass-card fade-in-up stagger-2" style={{ padding: 40, background: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
            <Sprout size={64} color="var(--green)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, color: '#166534' }}>
              {isEn ? 'Freshness Guarantee' : 'ताज़गी की गारंटी'}
            </h3>
            <p style={{ color: '#15803D', lineHeight: 1.6 }}>
              {isEn 
                ? 'Produce is harvested only after you place an order, ensuring it reaches your kitchen within hours of leaving the soil.' 
                : 'उपज की कटाई आपके ऑर्डर देने के बाद ही की जाती है, यह सुनिश्चित करते हुए कि यह मिट्टी छोड़ने के कुछ घंटों के भीतर आपकी रसोई में पहुँच जाए।'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 30, textAlign: 'center' }}>
            {[
              { icon: Users, num: '10,000+', label: isEn ? 'Happy Customers' : 'संतुष्ट ग्राहक', color: '#3B82F6' },
              { icon: Leaf, num: '500+', label: isEn ? 'Verified Farmers' : 'सत्यापित किसान', color: '#10B981' },
              { icon: TrendingUp, num: '₹5Cr+', label: isEn ? 'Farmer Earnings' : 'किसानों की कमाई', color: '#F59E0B' },
              { icon: HeartHandshake, num: '50+', label: isEn ? 'Cities Served' : 'शहरों में सेवा', color: '#EC4899' },
            ].map((stat, i) => (
              <div key={i} className={`fade-in-up stagger-${i + 1}`} style={{ flex: '1 1 200px' }}>
                <div style={{ width: 64, height: 64, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <stat.icon size={32} color={stat.color} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{stat.num}</div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section container">
        <div className="section-header fade-in-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2>{isEn ? 'Our Core Values' : 'हमारे मूल मूल्य'}</h2>
          <p>{isEn ? 'The principles that guide everything we do.' : 'वे सिद्धांत जो हमारे हर काम का मार्गदर्शन करते हैं।'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {[
            { icon: ShieldCheck, title: isEn ? 'Transparency' : 'पारदर्शिता', desc: isEn ? 'You always know exactly who grew your food and where it comes from.' : 'आप हमेशा ठीक से जानते हैं कि आपका भोजन किसने उगाया है और यह कहाँ से आता है।' },
            { icon: HeartHandshake, title: isEn ? 'Fair Trade' : 'निष्पक्ष व्यापार', desc: isEn ? 'Farmers set their own prices and keep 100% of the produce value.' : 'किसान अपनी कीमतें खुद तय करते हैं और उपज मूल्य का 100% रखते हैं।' },
            { icon: Sprout, title: isEn ? 'Sustainability' : 'स्थिरता', desc: isEn ? 'We promote eco-friendly farming practices and zero-waste supply chains.' : 'हम पर्यावरण के अनुकूल कृषि पद्धतियों और शून्य-अपशिष्ट आपूर्ति श्रृंखलाओं को बढ़ावा देते हैं।' },
          ].map((value, i) => (
            <div key={i} className={`glass-card fade-in-up stagger-${i + 1}`} style={{ padding: 32, textAlign: 'center' }}>
              <value.icon size={48} color="var(--green)" strokeWidth={1.5} style={{ marginBottom: 20 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>{value.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--green)', color: '#fff', textAlign: 'center', padding: '60px 20px' }}>
        <div className="container fade-in-up">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 20 }}>
            {isEn ? 'Join the Agricultural Revolution' : 'कृषि क्रांति में शामिल हों'}
          </h2>
          <p style={{ fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 32px', opacity: 0.9 }}>
            {isEn 
              ? 'Whether you are a farmer looking for a fair market or a consumer seeking the freshest healthy food, FarmDirect is for you.' 
              : 'चाहे आप एक किसान हों जो एक निष्पक्ष बाजार की तलाश में हैं या एक उपभोक्ता जो सबसे ताज़ा स्वस्थ भोजन की तलाश में है, फार्मडायरेक्ट आपके लिए है।'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn" style={{ background: '#fff', color: 'var(--green)', padding: '14px 28px', fontSize: '1.1rem' }}>
              {isEn ? 'Start Shopping' : 'खरीदारी शुरू करें'}
            </Link>
            <Link to="/auth" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', padding: '14px 28px', fontSize: '1.1rem' }}>
              {isEn ? 'Join as Farmer' : 'किसान के रूप में जुड़ें'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
