/**
 * Community Seed Script
 * Creates random user accounts and posts sample farming questions with replies & likes.
 *
 * Run from src/backend/:  node scripts/seedCommunity.js
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models ────────────────────────────────────────────────────────────────────
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Reply = require('../models/replyModel');

// ── Fake Users ────────────────────────────────────────────────────────────────
const USERS = [
    { name: 'Ravi Kumar', email: 'ravi.kumar@farm.dev', password: 'Test@1234' },
    { name: 'Priya Sharma', email: 'priya.sharma@farm.dev', password: 'Test@1234' },
    { name: 'Amitabh Verma', email: 'amitabh.v@farm.dev', password: 'Test@1234' },
    { name: 'Sunita Patel', email: 'sunita.p@farm.dev', password: 'Test@1234' },
    { name: 'Dr. Arun Reddy', email: 'arun.expert@farm.dev', password: 'Test@1234' },
];

// ── Sample Posts (question + sample replies) ──────────────────────────────────
const POSTS = [
    {
        authorIndex: 0, // Ravi Kumar
        title: 'Why are my tomato leaves turning yellow and curling?',
        content: 'I have been growing tomatoes for 3 months now. In the last week I noticed the lower leaves are turning yellow and curling upward. The plants are in well-draining soil, I water them every 2 days. We are in the middle of summer here in Karnataka. The upper leaves still look green and healthy. Is this a nutrient deficiency or some kind of disease?',
        tags: ['tomato', 'disease', 'soil'],
        replies: [
            {
                authorIndex: 4, // Dr. Arun Reddy (expert)
                content: 'This sounds like Magnesium deficiency, which is very common in tomatoes during fruiting stage. The yellowing starts on older (lower) leaves first and the veins remain green — this is called interveinal chlorosis. Try foliar spray of Epsom salt (1 tbsp per litre of water) every week for 3 weeks. Also check your soil pH — tomatoes prefer 6.0–6.8. If pH is off, they cannot absorb magnesium even if it is present.',
                isExpert: true,
            },
            {
                authorIndex: 1, // Priya
                content: 'I had the same problem last season! I also found that over-watering causes this. Try letting the top inch of soil dry before watering. Also make sure there is good airflow between plants to prevent fungal issues.',
            },
        ],
    },
    {
        authorIndex: 1, // Priya Sharma
        title: 'Best organic fertilizer for wheat crop in black cotton soil?',
        content: 'I am planning to grow wheat on 2 acres of black cotton soil (Vertisol) in Madhya Pradesh. I want to avoid chemical fertilizers this time and go fully organic. What organic fertilizers work best for wheat? When should I apply them and in what quantity? Also, does black cotton soil need any special treatment before sowing?',
        tags: ['wheat', 'organic', 'soil', 'fertilizer'],
        replies: [
            {
                authorIndex: 4, // Expert
                content: 'For wheat on black cotton soil, I recommend this schedule: (1) Before sowing: incorporate 8-10 tonnes of well-decomposed FYM (farmyard manure) per acre. (2) At sowing: apply Azospirillum + phosphobacteria biofertilizer as seed treatment. (3) At 30 days: top dress with vermicompost @ 2 tonnes/acre. Black cotton soil has high water retention — avoid waterlogging by making proper drainage channels. Sow on raised beds if rainfall is heavy.',
                isExpert: true,
            },
            {
                authorIndex: 2, // Amitabh
                content: 'Also consider green manure — sow Dhaincha (Sesbania bispinosa) 45 days before wheat and incorporate it into soil. It fixes nitrogen naturally and improves soil structure significantly.',
            },
            {
                authorIndex: 3, // Sunita
                content: 'I grow wheat organically in Vidarbha on similar soil. Neem cake @ 100 kg/acre at sowing time is very effective — it suppresses soil-borne pests and slowly releases nitrogen.',
            },
        ],
    },
    {
        authorIndex: 2, // Amitabh Verma
        title: 'How to control whiteflies in brinjal without pesticides?',
        content: 'My brinjal (eggplant) crop is being heavily attacked by whiteflies. The undersides of leaves are covered with tiny white insects and the leaves are looking pale and weak. My neighbour suggested chemical pesticides but I want to try organic or IPM methods first. What are the best biological or organic controls? Also wondering if yellow sticky traps work well for whiteflies.',
        tags: ['pest', 'organic', 'disease'],
        replies: [
            {
                authorIndex: 4,
                content: 'Excellent that you want to avoid chemicals! Here is a complete IPM plan for whiteflies: (1) Yellow sticky traps @ 10-12 per acre — very effective for monitoring and mass trapping. (2) Neem oil spray 5ml/litre + 1ml dish soap as emulsifier — spray twice weekly on the underside of leaves. (3) Release Encarsia formosa (a parasitic wasp) — available from bio-control labs. (4) Remove heavily infested leaves and burn them. (5) Reflective silver mulch under plants confuses whiteflies. Start immediately as whitefly populations double every 10 days.',
                isExpert: true,
            },
            {
                authorIndex: 0,
                content: 'Yellow sticky traps work very well! I used them last season. Place them at crop canopy height for best results. Change them every 2-3 weeks when they get full.',
            },
        ],
    },
    {
        authorIndex: 3, // Sunita Patel
        title: 'Can I grow rice using drip irrigation? What are the water savings?',
        content: 'Traditional paddy cultivation uses flood irrigation which consumes huge amounts of water. I read about System of Rice Intensification (SRI) and drip irrigation for rice. Has anyone actually tried this? How much water can we save and what is the yield difference compared to conventional flooding? I am in Andhra Pradesh and water scarcity is becoming a big problem every summer.',
        tags: ['rice', 'irrigation'],
        replies: [
            {
                authorIndex: 4,
                content: 'SRI + drip irrigation for rice is gaining traction in South India. Research shows 30–50% water savings compared to flood irrigation with similar or higher yields. With drip: plant spacing is wider (25x25 cm), soil is kept moist but not flooded (alternate wetting and drying), roots grow deeper and stronger. ICAR studies in Andhra show 6-7 tonnes/hectare yield under SRI drip vs 5-5.5 tonnes under flood. Cost of drip installation is offset in 3-4 seasons. Government also has subsidy schemes — contact your local Krishi Vigyan Kendra.',
                isExpert: true,
            },
            {
                authorIndex: 1,
                content: 'I tried SRI last season without drip (only alternate wetting and drying) and saved about 35% water. Yields were also slightly better. Drip would save even more. The key difference is transplanting younger seedlings (8-12 days) and wider spacing.',
            },
        ],
    },
    {
        authorIndex: 0, // Ravi Kumar
        title: 'Black spots on potato leaves — early blight or late blight?',
        content: 'I have noticed dark brown to black spots with concentric rings on the lower leaves of my potato plants. Some spots have a yellow halo around them. The spots are spreading upward slowly over the past week. How do I know if this is early blight or late blight? The treatment must be different right? We have had humid and cool weather for the past 10 days in Himachal Pradesh.',
        tags: ['potato', 'disease', 'pest'],
        replies: [
            {
                authorIndex: 4,
                content: 'Great observation on the concentric rings — that is the key identifier. Early blight (Alternaria solani): dark brown spots with distinct concentric rings (like a target) on older lower leaves, yellow halo present, spreads slowly. Late blight (Phytophthora infestans): water-soaked grey-green spots that turn brown-black, white fuzzy growth on leaf underside in humid conditions, spreads VERY rapidly and can destroy a crop in days. From your description (concentric rings, starts on lower leaves, slow spread), it sounds like EARLY BLIGHT. Spray Mancozeb 75 WP @ 2g/litre immediately. For late blight, use Metalaxyl + Mancozeb. Check underside for white fuzz to confirm.',
                isExpert: true,
            },
            {
                authorIndex: 2,
                content: 'Cool humid weather in HP is perfect for late blight — please check leaf undersides for white mould. Late blight spreads extremely fast, I lost 60% of my crop last year because I delayed treatment by just 5 days.',
            },
            {
                authorIndex: 3,
                content: 'Also make sure your potato plants have good air circulation. If they are overcrowded, trim excess foliage. Avoid overhead irrigation — water at the base instead.',
            },
        ],
    },
    {
        authorIndex: 1, // Priya
        title: 'Starting hydroponic leafy greens at home — which system is best for beginners?',
        content: 'I want to start growing leafy vegetables (spinach, lettuce, methi) hydroponically at home on a small scale. I am a complete beginner. I have seen NFT (Nutrient Film Technique) and DWC (Deep Water Culture) systems. Which is easier to set up and maintain for a first timer? What is the approximate cost to start? And how do I handle nutrient solutions — is it complicated?',
        tags: ['hydroponic', 'organic'],
        replies: [
            {
                authorIndex: 4,
                content: 'For beginners, DWC (Deep Water Culture) is the best starting point — it is simpler, cheaper and more forgiving. You need only a food-grade container, an air pump, net pots, growing medium (coco peat/clay pebbles) and a premixed nutrient solution. Cost to start: ₹1,500–₹3,000 for a small 20-litre system. NFT is slightly more complex (pump, channels, timer) and better once you have experience. For nutrients, use ready-made hydroponic nutrient mixes from brands like General Hydroponics or Vegro — just follow the dilution instructions on the bottle.',
                isExpert: true,
            },
            {
                authorIndex: 0,
                content: 'I started with DWC 6 months ago! Lettuce and spinach grew beautifully. Methi was also great. The only challenge was maintaining pH between 5.5-6.5 — buy a cheap pH meter and pH adjustment drops. Once you get the hang of it, it is very satisfying to harvest fresh greens in 3-4 weeks!',
            },
        ],
    },
];

// ── Main Seeder ───────────────────────────────────────────────────────────────
async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
            serverSelectionTimeoutMS: 30000,
        });
        console.log('✅ MongoDB connected');

        // ── Create / reuse users ──────────────────────────────────────────────
        const userDocs = [];
        for (const u of USERS) {
            let userDoc = await User.findOne({ email: u.email });
            if (!userDoc) {
                userDoc = await User.create({
                    name: u.name,
                    email: u.email,
                    password: u.password, // hashed by pre-save hook
                });
                console.log(`  👤 Created user: ${u.name}`);
            } else {
                console.log(`  👤 Reusing user: ${u.name}`);
            }
            userDocs.push(userDoc);
        }

        // ── Create posts ──────────────────────────────────────────────────────
        for (const p of POSTS) {
            const author = userDocs[p.authorIndex];

            // Skip if a post with the same title already exists
            const exists = await Post.findOne({ title: p.title });
            if (exists) {
                console.log(`  ⏭  Skipping (already exists): "${p.title.slice(0, 55)}..."`);
                continue;
            }

            // Add random likes from other users
            const likers = userDocs
                .filter((_, i) => i !== p.authorIndex)
                .slice(0, Math.floor(Math.random() * 3) + 1)
                .map(u => u._id);

            const post = await Post.create({
                title: p.title,
                content: p.content,
                author: author._id,
                authorName: author.name,
                tags: p.tags,
                likes: likers,
                views: Math.floor(Math.random() * 80) + 10,
                replyCount: p.replies.length,
            });

            console.log(`  📝 Posted: "${p.title.slice(0, 55)}..."`);

            // Create replies
            for (const r of p.replies) {
                const replyAuthor = userDocs[r.authorIndex];
                const replyLikers = userDocs
                    .filter((_, i) => i !== r.authorIndex)
                    .slice(0, Math.floor(Math.random() * 3) + 1)
                    .map(u => u._id);

                await Reply.create({
                    postId: post._id,
                    content: r.content,
                    author: replyAuthor._id,
                    authorName: replyAuthor.name,
                    likes: replyLikers,
                    isExpertAnswer: r.isExpert || false,
                });
                console.log(`    💬 Reply by ${replyAuthor.name}${r.isExpert ? ' ⭐ Expert' : ''}`);
            }
        }

        console.log('\n🌱 Seed complete! Community is now populated.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seed();
