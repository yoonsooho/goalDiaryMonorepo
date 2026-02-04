module.exports = {
    expo: {
        name: "GoalDiary",
        slug: "goaldiary-mobile",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        scheme: "goaldiary",
        plugins: ["expo-font"],
        android: {
            package: "com.goaldiary.mobile",
            intentFilters: [
                {
                    action: "VIEW",
                    autoVerify: true,
                    data: [
                        {
                            scheme: "goaldiary",
                        },
                    ],
                    category: ["BROWSABLE", "DEFAULT"],
                },
            ],
        },
        ios: {
            bundleIdentifier: "com.goaldiary.mobile",
        },
    },
};
