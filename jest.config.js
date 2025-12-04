const nextJest = require("next/jest");

const createJestConfig = nextJest({
    // Next.js 앱의 루트 디렉토리
    dir: "./",
});

// Jest 설정
const customJestConfig = {
    // 테스트 환경: jsdom (브라우저 환경 시뮬레이션)
    testEnvironment: "jsdom",

    // @ 경로를 src로 매핑 (import @/components/... 같은 것들)
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },

    // 테스트 파일을 찾을 위치
    testMatch: ["<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}", "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}"],

    // 테스트에서 제외할 폴더들
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

    // Jest DOM matcher 설정
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

// Next.js와 Jest 설정을 합쳐서 내보내기
module.exports = createJestConfig(customJestConfig);
