/* ============================================
   AGRI-SHARE PLATFORM - MAIN SCRIPT
   ============================================ */

/* ---- MULTILINGUAL TRANSLATIONS ---- */
const translations = {
  en: {
    name: "English",
    nav_features: "Features",
    nav_how: "How It Works",
    nav_gallery: "Gallery",
    nav_contact: "Contact",
    nav_login: "Login",
    nav_signup: "Sign Up Free",
    hero_badge: "🌾 AI-Powered Platform",
    hero_title: "AI-Powered Rural Equipment &",
    hero_highlight: "Mobility Sharing Platform",
    hero_subtitle: "Connecting farmers, equipment owners & drivers across rural India. Smart AI-powered booking, GPS tracking, bilingual support & fair pricing for every village.",
    hero_cta: "Get Started Free",
    hero_login: "Login to Account",
    stat_farmers: "Farmers",
    stat_equipment: "Equipment Listed",
    stat_villages: "Villages Covered",
    feat_title: "Smart Features for Smart Farming",
    feat_sub: "Everything you need to share, rent, and manage farm equipment — powered by AI",
    feat1_title: "GPS Location Tracking",
    feat1_desc: "Find equipment near your village with real-time GPS tracking and smart distance filtering.",
    feat2_title: "Tractor Rental",
    feat2_desc: "Rent tractors by the hour or day from trusted neighbors at fair, AI-predicted prices.",
    feat3_title: "Small Tools Sharing",
    feat3_desc: "Share and rent rotavators, sprayers, seeders and other small farm tools easily.",
    feat4_title: "Vehicle & Driver Booking",
    feat4_desc: "Book pickup vehicles with trusted drivers for goods transport across rural roads.",
    feat5_title: "AI Voice Assistant",
    feat5_desc: "Use voice commands in your local language — Hindi, Gujarati, Bhojpuri & more.",
    feat6_title: "Smart Pricing & Demand",
    feat6_desc: "AI predicts fair prices based on season, demand, and local market conditions.",
    how_title: "How It Works",
    how_sub: "Get started in 3 simple steps — no technical knowledge needed",
    step1_title: "Search Nearby",
    step1_desc: "Enter your village or use GPS to find available equipment and vehicles nearby.",
    step2_title: "Book Instantly",
    step2_desc: "Choose your dates, confirm details, and book in seconds with one tap.",
    step3_title: "Pay Securely",
    step3_desc: "Pay via UPI, cash, or digital wallet. Transparent pricing, no hidden charges.",
    gal_title: "Our Equipment Gallery",
    gal_sub: "Thousands of farm tools and vehicles available across rural India",
    gal1: "Tractor - Field Ready",
    gal2: "Harvesting Machine",
    gal3: "Spray Machine",
    gal4: "Rotavator",
    gal5: "Rural Pickup Vehicle",
    gal6: "Indian Farmers",
    test_title: "Trusted by Farmers Across India",
    test_sub: "Real stories from the fields",
    foot_about: "AI-powered equipment sharing platform connecting rural farmers across India with smart technology.",
    foot_links: "Quick Links",
    foot_contact: "Contact",
    foot_emergency: "🚨 Emergency Booking",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. Made with ❤️ for Bharat.",
  },
  hi: {
    name: "हिंदी",
    nav_features: "सुविधाएं",
    nav_how: "कैसे काम करता है",
    nav_gallery: "गैलरी",
    nav_contact: "संपर्क",
    nav_login: "लॉगिन",
    nav_signup: "मुफ्त साइन अप",
    hero_badge: "🌾 AI-संचालित प्लेटफ़ॉर्म",
    hero_title: "AI-संचालित ग्रामीण उपकरण और",
    hero_highlight: "मोबिलिटी शेयरिंग प्लेटफ़ॉर्म",
    hero_subtitle: "किसानों, उपकरण मालिकों और चालकों को जोड़ता है। स्मार्ट AI बुकिंग, GPS ट्रैकिंग, और उचित कीमत।",
    hero_cta: "मुफ्त शुरू करें",
    hero_login: "लॉगिन करें",
    stat_farmers: "किसान",
    stat_equipment: "उपकरण सूचीबद्ध",
    stat_villages: "गाँव शामिल",
    feat_title: "स्मार्ट खेती के लिए स्मार्ट सुविधाएं",
    feat_sub: "खेत के उपकरण साझा करने और किराये के लिए सब कुछ",
    feat1_title: "GPS लोकेशन ट्रैकिंग",
    feat1_desc: "रियल-टाइम GPS से अपने गाँव के पास उपकरण खोजें।",
    feat2_title: "ट्रैक्टर किराया",
    feat2_desc: "विश्वसनीय पड़ोसियों से उचित कीमत पर ट्रैक्टर किराए पर लें।",
    feat3_title: "छोटे उपकरण साझाकरण",
    feat3_desc: "रोटावेटर, स्प्रेयर और अन्य खेत उपकरण आसानी से साझा करें।",
    feat4_title: "वाहन और चालक बुकिंग",
    feat4_desc: "विश्वसनीय चालकों के साथ पिकअप वाहन बुक करें।",
    feat5_title: "AI वॉयस असिस्टेंट",
    feat5_desc: "हिंदी, गुजराती और अन्य भाषाओं में वॉयस कमांड का उपयोग करें।",
    feat6_title: "स्मार्ट मूल्य निर्धारण",
    feat6_desc: "AI सीजन और मांग के आधार पर उचित कीमत तय करता है।",
    how_title: "यह कैसे काम करता है",
    how_sub: "3 आसान चरणों में शुरू करें",
    step1_title: "पास में खोजें",
    step1_desc: "अपना गाँव दर्ज करें या GPS से पास के उपकरण खोजें।",
    step2_title: "तुरंत बुक करें",
    step2_desc: "तारीख चुनें और एक टैप में बुक करें।",
    step3_title: "सुरक्षित भुगतान करें",
    step3_desc: "UPI, नकद या डिजिटल वॉलेट से भुगतान करें।",
    gal_title: "हमारी उपकरण गैलरी",
    gal_sub: "भारत के ग्रामीण क्षेत्रों में हजारों उपकरण उपलब्ध",
    gal1: "ट्रैक्टर",
    gal2: "हार्वेस्टिंग मशीन",
    gal3: "स्प्रे मशीन",
    gal4: "रोटावेटर",
    gal5: "ग्रामीण पिकअप वाहन",
    gal6: "भारतीय किसान",
    test_title: "पूरे भारत के किसानों का भरोसा",
    test_sub: "खेतों की सच्ची कहानियां",
    foot_about: "AI-संचालित उपकरण साझाकरण प्लेटफ़ॉर्म।",
    foot_links: "त्वरित लिंक",
    foot_contact: "संपर्क",
    foot_emergency: "🚨 आपातकालीन बुकिंग",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. भारत के लिए ❤️ से बनाया।",
  },
  gu: {
    name: "ગુજરાતી",
    nav_features: "સુવિધાઓ",
    nav_how: "કેવી રીતે કામ કરે",
    nav_gallery: "ગેલેરી",
    nav_contact: "સંપર્ક",
    nav_login: "લૉગિન",
    nav_signup: "મફત સાઇન અપ",
    hero_badge: "🌾 AI-સંચાલિત પ્લેટફોર્મ",
    hero_title: "AI-સંચાલિત ગ્રામીણ સાધન અને",
    hero_highlight: "મોબિલિટી શેરિંગ પ્લેટફોર્મ",
    hero_subtitle: "ખેડૂતો, સાધન માલિકો અને ડ્રાઇવરોને જોડે છે. સ્માર્ટ AI બુકિંગ અને ઉચિત ભાવ.",
    hero_cta: "મફત શરૂ કરો",
    hero_login: "લૉગિન કરો",
    stat_farmers: "ખેડૂત",
    stat_equipment: "સાધન સૂચિ",
    stat_villages: "ગામ સામેલ",
    feat_title: "સ્માર્ટ ખેતી માટે સ્માર્ટ સુવિધાઓ",
    feat_sub: "ખેતીના સાધનો શેર અને ભાડે આપવા માટે સર્વ સ્થળ",
    feat1_title: "GPS લોકેશન ટ્રેકિંગ",
    feat1_desc: "રીઅલ-ટાઇમ GPS વડે નજીકનાં સાધનો શોધો.",
    feat2_title: "ટ્રેક્ટર ભાડું",
    feat2_desc: "ઉચિત ભાવે ટ્રેક્ટર ભાડે મેળવો.",
    feat3_title: "નાના સાધન શેરિંગ",
    feat3_desc: "રોટાવેટર, સ્પ્રેયર સરળતાથી શેર કરો.",
    feat4_title: "વાહન અને ડ્રાઇવર બુકિંગ",
    feat4_desc: "વિશ્વસ્ત ડ્રાઇવર સાથે વાહન બૂક કરો.",
    feat5_title: "AI વૉઇસ આસિસ્ટન્ટ",
    feat5_desc: "ગુજરાતી, હિન્દી અને અન્ય ભાષામાં ઉપયોગ.",
    feat6_title: "સ્માર્ટ ભાવ નિર્ધારણ",
    feat6_desc: "AI સીઝન અને માંગ આધારે ઉચિત ભાવ.",
    how_title: "તે કેવી રીતે કામ કરે",
    how_sub: "3 સરળ પગલામાં શરૂ કરો",
    step1_title: "નજીક શોધો",
    step1_desc: "ગામ દાખલ કરો અથવા GPS વડે સાધન શોધો.",
    step2_title: "તાત્કાલિક બૂક કરો",
    step2_desc: "તારીખ પસંદ કરો અને એક ટૅપે બૂક કરો.",
    step3_title: "સુરક્ષિત ચૂકવણી",
    step3_desc: "UPI, રોકડ અથવા ડિજિટલ વૉલેટ.",
    gal_title: "અમારી સાધન ગેલેરી",
    gal_sub: "ગ્રામીણ ભારતમાં હજારો સાધનો ઉપલબ્ધ",
    gal1: "ટ્રેક્ટર",
    gal2: "હાર્વેસ્ટિંગ",
    gal3: "સ્પ્રે મશીન",
    gal4: "રોટાવેટર",
    gal5: "ગ્રામ પિકઅપ",
    gal6: "ભારતીય ખેડૂત",
    test_title: "ભારતભરના ખેડૂતોનો વિશ્વાસ",
    test_sub: "ખેતરોની સાચી વાર્તાઓ",
    foot_about: "AI-સંચાલિત ખેત સાધન શેરિંગ પ્લેટફોર્મ.",
    foot_links: "ઝડપી લિંક",
    foot_contact: "સંપર્ક",
    foot_emergency: "🚨 ઇમર્જન્સી બૂકિંગ",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. ❤️ ભારત માટે.",
  },
  bh: {
    name: "भोजपुरी",
    nav_features: "सुविधा",
    nav_how: "कइसे काम करेला",
    nav_gallery: "गैलरी",
    nav_contact: "संपर्क",
    nav_login: "लॉगिन",
    nav_signup: "फ्री साइन अप",
    hero_badge: "🌾 AI से चालल मंच",
    hero_title: "AI से चालल ग्रामीण उपकरण आ",
    hero_highlight: "मोबिलिटी शेयरिंग मंच",
    hero_subtitle: "किसान, उपकरण मालिक आ ड्राइवर के जोड़ेला। समझदार AI बुकिंग आ उचित दाम।",
    hero_cta: "फ्री शुरू करीं",
    hero_login: "लॉगिन करीं",
    stat_farmers: "किसान",
    stat_equipment: "उपकरण",
    stat_villages: "गाँव",
    feat_title: "खेती खातिर स्मार्ट सुविधा",
    feat_sub: "खेत के उपकरण बाँटे आ किराया खातिर सब कुछ",
    feat1_title: "GPS लोकेशन",
    feat1_desc: "नजदीक के उपकरण GPS से खोजीं।",
    feat2_title: "ट्रैक्टर किराया",
    feat2_desc: "उचित दाम पर ट्रैक्टर किराए पर लीं।",
    feat3_title: "छोट उपकरण बाँटना",
    feat3_desc: "रोटावेटर, स्प्रेयर आसानी से बाँटीं।",
    feat4_title: "गाड़ी आ ड्राइवर",
    feat4_desc: "भरोसेमंद ड्राइवर के साथ गाड़ी बुक करीं।",
    feat5_title: "AI वॉयस असिस्टेंट",
    feat5_desc: "भोजपुरी, हिंदी में बोल के काम करीं।",
    feat6_title: "समझदार दाम",
    feat6_desc: "AI मौसम आ माँग के हिसाब से दाम तय करेला।",
    how_title: "कइसे काम करेला",
    how_sub: "3 आसान कदम में शुरू करीं",
    step1_title: "नजदीक खोजीं",
    step1_desc: "गाँव डालीं या GPS से उपकरण खोजीं।",
    step2_title: "फटाफट बुक करीं",
    step2_desc: "तारीख चुनीं आ एक टैप में बुक करीं।",
    step3_title: "सुरक्षित भुगतान",
    step3_desc: "UPI, नकद या डिजिटल वॉलेट से भुगतान करीं।",
    gal_title: "हमार उपकरण गैलरी",
    gal_sub: "ग्रामीण भारत में हजारों उपकरण उपलब्ध",
    gal1: "ट्रैक्टर",
    gal2: "हार्वेस्टिंग",
    gal3: "स्प्रे मशीन",
    gal4: "रोटावेटर",
    gal5: "पिकअप गाड़ी",
    gal6: "भारतीय किसान",
    test_title: "पूरा भारत के किसान के भरोसा",
    test_sub: "खेत के असली कहानी",
    foot_about: "AI से चालल उपकरण शेयरिंग मंच।",
    foot_links: "तुरंत लिंक",
    foot_contact: "संपर्क",
    foot_emergency: "🚨 आपाती बुकिंग",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. भारत खातिर ❤️ से बनाइल।",
  },
  bn: {
    name: "বাংলা",
    nav_features: "বৈশিষ্ট্য",
    nav_how: "কীভাবে কাজ করে",
    nav_gallery: "গ্যালারি",
    nav_contact: "যোগাযোগ",
    nav_login: "লগইন",
    nav_signup: "বিনামূল্যে নিবন্ধন",
    hero_badge: "🌾 AI-চালিত প্ল্যাটফর্ম",
    hero_title: "AI-চালিত গ্রামীণ যন্ত্রপাতি ও",
    hero_highlight: "মোবিলিটি শেয়ারিং প্ল্যাটফর্ম",
    hero_subtitle: "কৃষক, যন্ত্রপাতির মালিক ও ড্রাইভারদের সংযুক্ত করে। স্মার্ট AI বুকিং এবং সঠিক মূল্য।",
    hero_cta: "বিনামূল্যে শুরু করুন",
    hero_login: "লগইন করুন",
    stat_farmers: "কৃষক",
    stat_equipment: "যন্ত্রপাতি তালিকা",
    stat_villages: "গ্রাম অন্তর্ভুক্ত",
    feat_title: "স্মার্ট চাষের জন্য স্মার্ট বৈশিষ্ট্য",
    feat_sub: "কৃষি যন্ত্রপাতি শেয়ার ও ভাড়া করার জন্য সবকিছু",
    feat1_title: "GPS লোকেশন ট্র্যাকিং",
    feat1_desc: "রিয়েল-টাইম GPS দিয়ে কাছের যন্ত্রপাতি খুঁজুন।",
    feat2_title: "ট্র্যাক্টর ভাড়া",
    feat2_desc: "ন্যায্য মূল্যে ট্র্যাক্টর ভাড়া নিন।",
    feat3_title: "ছোট সরঞ্জাম শেয়ারিং",
    feat3_desc: "রোটাভেটর, স্প্রেয়ার সহজে শেয়ার করুন।",
    feat4_title: "যান ও ড্রাইভার বুকিং",
    feat4_desc: "বিশ্বস্ত ড্রাইভারসহ যান বুক করুন।",
    feat5_title: "AI ভয়েস অ্যাসিস্ট্যান্ট",
    feat5_desc: "বাংলা, হিন্দি ও অন্য ভাষায় ব্যবহার করুন।",
    feat6_title: "স্মার্ট মূল্য নির্ধারণ",
    feat6_desc: "AI মৌসুম ও চাহিদা অনুযায়ী মূল্য নির্ধারণ করে।",
    how_title: "কীভাবে কাজ করে",
    how_sub: "৩টি সহজ ধাপে শুরু করুন",
    step1_title: "কাছাকাছি খুঁজুন",
    step1_desc: "গ্রাম লিখুন বা GPS দিয়ে যন্ত্রপাতি খুঁজুন।",
    step2_title: "তাৎক্ষণিক বুক করুন",
    step2_desc: "তারিখ বেছে এক ট্যাপে বুক করুন।",
    step3_title: "নিরাপদে পেমেন্ট করুন",
    step3_desc: "UPI, নগদ বা ডিজিটাল ওয়ালেটে পেমেন্ট।",
    gal_title: "আমাদের যন্ত্রপাতি গ্যালারি",
    gal_sub: "গ্রামীণ ভারতে হাজারো যন্ত্রপাতি পাওয়া যায়",
    gal1: "ট্র্যাক্টর",
    gal2: "হারভেস্টিং মেশিন",
    gal3: "স্প্রে মেশিন",
    gal4: "রোটাভেটর",
    gal5: "পিকআপ যান",
    gal6: "ভারতীয় কৃষক",
    test_title: "সারা ভারতের কৃষকদের বিশ্বাস",
    test_sub: "মাঠের সত্যিকারের গল্প",
    foot_about: "AI-চালিত যন্ত্রপাতি শেয়ারিং প্ল্যাটফর্ম।",
    foot_links: "দ্রুত লিঙ্ক",
    foot_contact: "যোগাযোগ",
    foot_emergency: "🚨 জরুরি বুকিং",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. ভারতের জন্য ❤️ দিয়ে তৈরি।",
  },
  mr: {
    name: "मराठी",
    nav_features: "वैशिष्ट्ये",
    nav_how: "कसे कार्य करते",
    nav_gallery: "गॅलरी",
    nav_contact: "संपर्क",
    nav_login: "लॉगिन",
    nav_signup: "मोफत नोंदणी",
    hero_badge: "🌾 AI-चालित व्यासपीठ",
    hero_title: "AI-चालित ग्रामीण उपकरणे आणि",
    hero_highlight: "मोबिलिटी शेअरिंग व्यासपीठ",
    hero_subtitle: "शेतकरी, उपकरण मालक आणि चालकांना जोडते. स्मार्ट AI बुकिंग आणि योग्य किंमत.",
    hero_cta: "मोफत सुरू करा",
    hero_login: "लॉगिन करा",
    stat_farmers: "शेतकरी",
    stat_equipment: "उपकरणे",
    stat_villages: "गावे",
    feat_title: "स्मार्ट शेतीसाठी स्मार्ट वैशिष्ट्ये",
    feat_sub: "शेत उपकरणे सामायिक आणि भाड्याने देण्यासाठी सर्वकाही",
    feat1_title: "GPS स्थान ट्रॅकिंग",
    feat1_desc: "रिअल-टाइम GPS ने जवळची उपकरणे शोधा.",
    feat2_title: "ट्रॅक्टर भाडे",
    feat2_desc: "योग्य किंमतीत ट्रॅक्टर भाड्याने घ्या.",
    feat3_title: "लहान साधन सामायिकरण",
    feat3_desc: "रोटाव्हेटर, स्प्रेयर सहज सामायिक करा.",
    feat4_title: "वाहन आणि चालक बुकिंग",
    feat4_desc: "विश्वसनीय चालकासह वाहन बुक करा.",
    feat5_title: "AI व्हॉइस असिस्टंट",
    feat5_desc: "मराठी, हिंदी मध्ये वापरा.",
    feat6_title: "स्मार्ट किंमत",
    feat6_desc: "AI हंगाम आणि मागणीनुसार किंमत ठरवते.",
    how_title: "हे कसे कार्य करते",
    how_sub: "3 सोप्या चरणांमध्ये सुरू करा",
    step1_title: "जवळ शोधा",
    step1_desc: "गाव टाका किंवा GPS ने उपकरणे शोधा.",
    step2_title: "त्वरित बुक करा",
    step2_desc: "तारीख निवडा आणि एका टॅपमध्ये बुक करा.",
    step3_title: "सुरक्षित पेमेंट",
    step3_desc: "UPI, रोख किंवा डिजिटल वॉलेटने पेमेंट करा.",
    gal_title: "आमची उपकरण गॅलरी",
    gal_sub: "ग्रामीण भारतात हजारो उपकरणे उपलब्ध",
    gal1: "ट्रॅक्टर",
    gal2: "हार्वेस्टिंग मशीन",
    gal3: "स्प्रे मशीन",
    gal4: "रोटाव्हेटर",
    gal5: "पिकअप वाहन",
    gal6: "भारतीय शेतकरी",
    test_title: "संपूर्ण भारतातील शेतकऱ्यांचा विश्वास",
    test_sub: "शेतातील खऱ्या कथा",
    foot_about: "AI-चालित शेत उपकरण सामायिकरण व्यासपीठ.",
    foot_links: "त्वरित दुवे",
    foot_contact: "संपर्क",
    foot_emergency: "🚨 आपत्कालीन बुकिंग",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. भारतासाठी ❤️ ने बनवले.",
  },
  uk: {
    name: "गढ़वाली",
    nav_features: "सुविधा",
    nav_how: "कनी काम करदू",
    nav_gallery: "गैलरी",
    nav_contact: "संपर्क",
    nav_login: "लॉगिन",
    nav_signup: "मुफत साइन अप",
    hero_badge: "🌾 AI से चलणु मंच",
    hero_title: "AI-चालित पहाड़ी उपकरण आ",
    hero_highlight: "साझा मंच",
    hero_subtitle: "किसान, उपकरण मालिक आ ड्राइवर ने जोड़दो। स्मार्ट AI बुकिंग आ उचित दाम।",
    hero_cta: "मुफत शुरू करो",
    hero_login: "लॉगिन करो",
    stat_farmers: "किसान",
    stat_equipment: "उपकरण",
    stat_villages: "गाँव",
    feat_title: "खेती खातिर स्मार्ट सुविधा",
    feat_sub: "खेत के सामान किराये पर देण खातिर",
    feat1_title: "GPS लोकेशन",
    feat1_desc: "GPS ने नजदीक के सामान खोजो।",
    feat2_title: "ट्रैक्टर किराया",
    feat2_desc: "उचित दाम पर ट्रैक्टर किराये पर लो।",
    feat3_title: "छोटू सामान साझा",
    feat3_desc: "रोटावेटर, स्प्रेयर आसानी ने साझा करो।",
    feat4_title: "गाड़ी आ चालक",
    feat4_desc: "भरोसेमंद चालक से गाड़ी बुक करो।",
    feat5_title: "AI वॉयस",
    feat5_desc: "गढ़वाली-हिंदी में बोल के काम करो।",
    feat6_title: "उचित दाम",
    feat6_desc: "AI मौसम ने दाम तय करदू।",
    how_title: "कनी काम करदू",
    how_sub: "3 आसान कदम में शुरू करो",
    step1_title: "नजदीक खोजो",
    step1_desc: "गाँव डालो और GPS ने खोजो।",
    step2_title: "फटाफट बुक करो",
    step2_desc: "तारीख चुनो आ बुक करो।",
    step3_title: "सुरक्षित पैसा",
    step3_desc: "UPI या नकद ने दो।",
    gal_title: "हमार उपकरण गैलरी",
    gal_sub: "ग्रामीण भारत में हजारों उपकरण",
    gal1: "ट्रैक्टर",
    gal2: "हार्वेस्टिंग",
    gal3: "स्प्रे मशीन",
    gal4: "रोटावेटर",
    gal5: "पिकअप गाड़ी",
    gal6: "किसान",
    test_title: "भारत के किसान का भरोसा",
    test_sub: "खेत की असली कहानी",
    foot_about: "AI से चलणु उपकरण साझा मंच।",
    foot_links: "लिंक",
    foot_contact: "संपर्क",
    foot_emergency: "🚨 आपाती बुकिंग",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. भारत खातिर ❤️।",
  },
  hr: {
    name: "हरियाणवी",
    nav_features: "सुविधा",
    nav_how: "कैसे काम करे सै",
    nav_gallery: "गैलरी",
    nav_contact: "संपर्क",
    nav_login: "लॉगिन",
    nav_signup: "फ्री साइन अप",
    hero_badge: "🌾 AI वाला मंच",
    hero_title: "AI से चलण आला ग्रामीण उपकरण",
    hero_highlight: "साझा करण का मंच",
    hero_subtitle: "किसान, उपकरण मालिक अर ड्राइवर नै जोड़े। स्मार्ट AI बुकिंग अर सही दाम।",
    hero_cta: "फ्री शुरू करो",
    hero_login: "लॉगिन करो",
    stat_farmers: "किसान",
    stat_equipment: "उपकरण",
    stat_villages: "गाम",
    feat_title: "खेती खातर स्मार्ट सुविधा",
    feat_sub: "खेत के औजार किराए पर देण खातर",
    feat1_title: "GPS लोकेशन",
    feat1_desc: "GPS से नजदीक के उपकरण ढूंढो।",
    feat2_title: "ट्रैक्टर किराया",
    feat2_desc: "सही दाम पर ट्रैक्टर किराए लो।",
    feat3_title: "छोटे औजार बांटणा",
    feat3_desc: "रोटावेटर, स्प्रेयर आसानी से बांटो।",
    feat4_title: "गाड़ी अर ड्राइवर",
    feat4_desc: "भरोसेमंद ड्राइवर से गाड़ी बुक करो।",
    feat5_title: "AI वॉयस",
    feat5_desc: "हरियाणवी-हिंदी मैं बोल के काम करो।",
    feat6_title: "सही दाम",
    feat6_desc: "AI मौसम अर मांग देखकर दाम तय करे।",
    how_title: "कैसे काम करे सै",
    how_sub: "3 आसान कदम मैं शुरू करो",
    step1_title: "नजदीक ढूंढो",
    step1_desc: "गाम डालो या GPS से ढूंढो।",
    step2_title: "फटाफट बुक करो",
    step2_desc: "तारीख चुनो अर बुक करो।",
    step3_title: "सुरक्षित पैसा दो",
    step3_desc: "UPI या नकद से दो।",
    gal_title: "हमारी उपकरण गैलरी",
    gal_sub: "ग्रामीण भारत मैं हजारों उपकरण",
    gal1: "ट्रैक्टर",
    gal2: "हार्वेस्टिंग",
    gal3: "स्प्रे मशीन",
    gal4: "रोटावेटर",
    gal5: "पिकअप गाड़ी",
    gal6: "किसान भाई",
    test_title: "पूरे भारत के किसानाँ का भरोसा",
    test_sub: "खेत की असली बात",
    foot_about: "AI वाला उपकरण साझा करण का मंच।",
    foot_links: "लिंक",
    foot_contact: "संपर्क",
    foot_emergency: "🚨 जरूरी बुकिंग",
    foot_phone: "1800-AGRI-SHARE",
    foot_copy: "© 2024 AgriShare. भारत खातर ❤️ से बनाया।",
  }
};

/* ---- Language Management ---- */
let currentLang = 'en';

function getLang() {
  const stored = localStorage.getItem('agriShareLang');
  if (stored && translations[stored]) return stored;
  const browser = navigator.language.slice(0, 2);
  const map = { hi: 'hi', gu: 'gu', bn: 'bn', mr: 'mr' };
  return map[browser] || 'en';
}

function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('agriShareLang', lang);
  applyTranslations();
  document.querySelectorAll('.lang-select, .footer-lang-select').forEach(s => { s.value = lang; });
}

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || (translations.en[key]) || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-t-placeholder]').forEach(el => {
    const key = el.getAttribute('data-t-placeholder');
    el.placeholder = t(key);
  });
}

function buildLangSelects() {
  document.querySelectorAll('.lang-select, .footer-lang-select').forEach(sel => {
    sel.innerHTML = '';
    Object.keys(translations).forEach(code => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = translations[code].name;
      sel.appendChild(opt);
    });
    sel.value = currentLang;
    sel.addEventListener('change', e => setLang(e.target.value));
  });
}

/* ---- Navbar Scroll Effect ---- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ---- Scroll Animation (Intersection Observer) ---- */
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

/* ---- Lazy Loading Images ---- */
function initLazyLoad() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.src = e.target.dataset.src;
        e.target.removeAttribute('data-src');
        io.unobserve(e.target);
      }
    });
  });
  imgs.forEach(img => io.observe(img));
}

/* ============================================
   FORM VALIDATION - SHARED UTILITIES
   ============================================ */
function showError(field, msg) {
  field.classList.add('error');
  field.classList.remove('success');
  const err = field.parentElement.querySelector('.field-error') ||
               field.closest('.form-group')?.querySelector('.field-error');
  if (err) { err.textContent = msg; err.style.display = 'block'; }
}

function showSuccess(field) {
  field.classList.remove('error');
  field.classList.add('success');
  const err = field.parentElement.querySelector('.field-error') ||
               field.closest('.form-group')?.querySelector('.field-error');
  if (err) err.style.display = 'none';
}

function clearFieldState(field) {
  field.classList.remove('error', 'success');
  const err = field.parentElement.querySelector('.field-error') ||
               field.closest('.form-group')?.querySelector('.field-error');
  if (err) err.style.display = 'none';
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v) { return /^[6-9]\d{9}$/.test(v); }

/* ============================================
   SIGNUP PAGE
   ============================================ */
function initSignup() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const fields = {
    fullName: document.getElementById('fullName'),
    mobile: document.getElementById('mobile'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    role: document.getElementById('role'),
    location: document.getElementById('location'),
    langPref: document.getElementById('langPref'),
  };

  const strengthFill = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');

  // Password strength checker
  if (fields.password) {
    fields.password.addEventListener('input', function () {
      const val = this.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = ['', 'weak', 'fair', 'good', 'strong'];
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

      if (strengthFill && strengthLabel) {
        strengthFill.className = 'strength-fill';
        strengthLabel.className = 'strength-label';
        if (val.length > 0) {
          strengthFill.classList.add('strength-' + levels[score]);
          strengthLabel.classList.add(levels[score]);
          strengthLabel.textContent = 'Strength: ' + labels[score];
        } else {
          strengthLabel.textContent = '';
        }
      }
    });
  }

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        this.textContent = input.type === 'password' ? '👁️' : '🙈';
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    // Validate fullName
    if (!fields.fullName.value.trim() || fields.fullName.value.trim().length < 3) {
      showError(fields.fullName, 'Please enter your full name (min 3 characters)');
      valid = false;
    } else { showSuccess(fields.fullName); }

    // Validate mobile
    if (!isValidPhone(fields.mobile.value.trim())) {
      showError(fields.mobile, 'Enter a valid 10-digit Indian mobile number');
      valid = false;
    } else { showSuccess(fields.mobile); }

    // Validate email
    if (!isValidEmail(fields.email.value.trim())) {
      showError(fields.email, 'Enter a valid email address');
      valid = false;
    } else { showSuccess(fields.email); }

    // Validate password
    if (fields.password.value.length < 6) {
      showError(fields.password, 'Password must be at least 6 characters');
      valid = false;
    } else { showSuccess(fields.password); }

    // Validate confirmPassword
    if (fields.confirmPassword.value !== fields.password.value) {
      showError(fields.confirmPassword, 'Passwords do not match');
      valid = false;
    } else { showSuccess(fields.confirmPassword); }

    // Validate role
    if (!fields.role.value) {
      showError(fields.role, 'Please select your role');
      valid = false;
    } else { showSuccess(fields.role); }

    // Validate location
    if (!fields.location.value.trim()) {
      showError(fields.location, 'Please enter your village/district');
      valid = false;
    } else { showSuccess(fields.location); }

    if (!valid) return;

    // Save to localStorage
    const users = JSON.parse(localStorage.getItem('agriShareUsers') || '[]');
    const existing = users.find(u => u.mobile === fields.mobile.value.trim() || u.email === fields.email.value.trim());
    if (existing) {
      showAlert('alert-error', '⚠️ An account with this mobile or email already exists. Please login.');
      return;
    }

    users.push({
      fullName: fields.fullName.value.trim(),
      mobile: fields.mobile.value.trim(),
      email: fields.email.value.trim(),
      password: fields.password.value,
      role: fields.role.value,
      location: fields.location.value.trim(),
      langPref: fields.langPref ? fields.langPref.value : 'en',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('agriShareUsers', JSON.stringify(users));

    showAlert('alert-success', '✅ Account created successfully! Redirecting to login...');
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  });
}

function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'flex';
  el.className = 'alert ' + (id.includes('error') ? 'error' : 'success');
}

/* ============================================
   LOGIN PAGE
   ============================================ */
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const credential = document.getElementById('credential');
  const password = document.getElementById('password');

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        this.textContent = input.type === 'password' ? '👁️' : '🙈';
      }
    });
  });

  // Remember Me - auto-fill
  const remembered = localStorage.getItem('agriShareRemembered');
  if (remembered && credential) {
    credential.value = remembered;
    const rememberCheck = document.getElementById('rememberMe');
    if (rememberCheck) rememberCheck.checked = true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    if (!credential.value.trim()) {
      showError(credential, 'Enter your mobile number or email');
      valid = false;
    } else { showSuccess(credential); }

    if (!password.value) {
      showError(password, 'Enter your password');
      valid = false;
    } else { showSuccess(password); }

    if (!valid) return;

    const users = JSON.parse(localStorage.getItem('agriShareUsers') || '[]');
    const user = users.find(u =>
      (u.mobile === credential.value.trim() || u.email === credential.value.trim()) &&
      u.password === password.value
    );

    if (!user) {
      showAlert('alert-error', '❌ Invalid credentials. Please check your mobile/email and password.');
      showError(credential, '');
      showError(password, '');
      return;
    }

    const rememberCheck = document.getElementById('rememberMe');
    if (rememberCheck && rememberCheck.checked) {
      localStorage.setItem('agriShareRemembered', credential.value.trim());
    } else {
      localStorage.removeItem('agriShareRemembered');
    }

    localStorage.setItem('agriShareCurrentUser', JSON.stringify(user));
    showAlert('alert-success', `✅ Welcome back, ${user.fullName}! Redirecting...`);
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
  });
}

/* ============================================
   DASHBOARD
   ============================================ */
function initDashboard() {
  if (!document.getElementById('dashboardPage')) return;
  const user = JSON.parse(localStorage.getItem('agriShareCurrentUser') || 'null');
  if (user) {
    const nameEl = document.getElementById('dashUserName');
    const roleEl = document.getElementById('dashUserRole');
    if (nameEl) nameEl.textContent = user.fullName;
    if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('agriShareCurrentUser');
    window.location.href = 'login.html';
  });
}

/* ============================================
   INIT ON PAGE LOAD
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  currentLang = getLang();
  buildLangSelects();
  applyTranslations();
  initNavbar();
  initScrollAnimations();
  initLazyLoad();
  initSignup();
  initLogin();
  initDashboard();
});