import Link from "next/link";

export const metadata = {
    title: "계정 삭제 안내 | GoalDiary",
};

export default function AccountDeletionPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold sm:text-3xl">계정 삭제 안내</h1>
                    <p className="mt-2 text-sm text-gray-500">GoalDiary 계정 및 데이터 삭제 방법을 안내드립니다.</p>
                </header>

                <section className="space-y-6 text-sm leading-relaxed text-gray-800">
                    <p>
                        GoalDiary는 사용자가 자신의 계정 및 데이터를 직접 관리할 수 있도록 계정 삭제 기능을 제공합니다.
                        아래 안내에 따라 모바일 앱 또는 웹에서 계정 삭제를 요청하실 수 있습니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">1. 모바일 앱에서 계정 삭제</h2>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                        <li>GoalDiary 모바일 앱에 로그인합니다.</li>
                        <li>하단 탭에서 <strong>설정</strong> 메뉴로 이동합니다.</li>
                        <li>설정 화면에서 <strong>계정 삭제</strong> 또는 유사한 메뉴를 선택합니다.</li>
                        <li>안내 문구를 확인한 후, 계정 삭제 요청을 확정합니다.</li>
                    </ol>

                    <h2 className="mt-6 text-lg font-semibold">2. 웹에서 계정 삭제</h2>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                        <li>웹 브라우저에서 GoalDiary 웹 서비스에 접속합니다.</li>
                        <li>로그인 후, 프로필 또는 설정 메뉴로 이동합니다.</li>
                        <li><strong>계정 삭제</strong> 메뉴를 선택하고, 안내에 따라 삭제를 진행합니다.</li>
                    </ol>

                    <h2 className="mt-6 text-lg font-semibold">3. 기술적 처리 방식</h2>
                    <p>
                        사용자가 앱 또는 웹에서 계정 삭제를 확정하면, 서버에서 다음과 같은 API 요청이 수행됩니다.
                    </p>
                    <div className="rounded-md bg-gray-100 px-3 py-2 font-mono text-xs text-gray-700">
                        DELETE https://tododndback.onrender.com/users/me
                    </div>
                    <p className="mt-2">
                        이 요청은 인증된 사용자에 대해서만 동작하며, 계정과 관련된 데이터가 삭제되거나 비활성화됩니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">4. 삭제되는 데이터 범위</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>계정 식별 정보 (이메일 주소, 사용자 ID 등)</li>
                        <li>사용자가 작성한 일정, 루틴, 일기, 명언 등 서비스 내 콘텐츠</li>
                        <li>알림 및 팀 관련 데이터 등 계정과 직접 연결된 정보</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-600">
                        관련 법령 또는 분쟁 해결, 부정 이용 방지 등을 위해 일부 정보는 일정 기간 암호화된 형태로 보관될 수
                        있습니다. 보관 기간이 경과하면 복구 불가능한 방식으로 완전 삭제됩니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">5. 계정 삭제 취소</h2>
                    <p>
                        계정 삭제 요청이 완료된 후에는 계정 및 데이터 복구가 불가능할 수 있습니다. 삭제를 진행하기 전에
                        필요한 데이터는 별도로 백업해 두시기 바랍니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">6. 문의처</h2>
                    <p>
                        계정 삭제와 관련된 추가 문의 사항이 있으신 경우, 앱 내 문의 기능 또는 개발자 연락처를 통해 문의해
                        주세요.
                    </p>
                </section>

                <footer className="mt-10 border-t pt-4 text-xs text-gray-500">
                    <p>본 페이지는 Google Play 스토어 요구 사항을 충족하기 위해 제공되는 계정 삭제 안내 페이지입니다.</p>
                    <p className="mt-1">
                        서비스 이용 약관 및 개인정보처리방침은{" "}
                        <Link href="/privacy" className="text-blue-600 underline">
                            개인정보처리방침 페이지
                        </Link>
                        에서 확인하실 수 있습니다.
                    </p>
                </footer>
            </div>
        </main>
    );
}

