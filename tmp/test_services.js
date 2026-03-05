async function testServiceApi() {
    const API_KEY = 'rapidtech_secret_key_2026';
    const BASE_URL = 'http://localhost:3001/api/services';

    const testService = {
        title: "Detailed Mobile App Development",
        description: "Full-cycle app development services.",
        heroSubtitle: "Transforming ideas into high-performance mobile apps.",
        coreOfferings: [
            { title: "Strategy", description: "Market research and product-market fit." },
            { title: "UI/UX", description: "User-centric design." }
        ],
        platformExpertise: [
            { platform: "iOS", details: "Swift/SwiftUI" },
            { platform: "Android", details: "Kotlin/Jetpack Compose" }
        ],
        processSteps: [
            { step: 1, title: "Discovery", description: "Initial research and requirements gathering." },
            { step: 2, title: "Design", description: "Wireframing and prototyping." }
        ],
        techStack: [
            { name: "Flutter", icon: "https://example.com/flutter.png" },
            { name: "React Native", icon: "https://example.com/rn.png" }
        ],
        ctaTitle: "Ready to Start?",
        ctaText: "Let's build your next mobile masterpiece.",
        ctaButtonText: "Contact Us"
    };

    try {
        console.log("--- Testing POST ---");
        const postRes = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
            body: JSON.stringify(testService)
        });
        const postData = await postRes.json();
        console.log("POST Response:", JSON.stringify(postData, null, 2));

        if (postData.success) {
            const slug = postData.data.slug;
            console.log("\n--- Testing GET by Slug: " + slug + " ---");
            const getRes = await fetch(`${BASE_URL}/slug/${slug}`, {
                headers: { 'x-api-key': API_KEY }
            });
            const getData = await getRes.json();
            console.log("GET Response:", JSON.stringify(getData, null, 2));
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testServiceApi();
