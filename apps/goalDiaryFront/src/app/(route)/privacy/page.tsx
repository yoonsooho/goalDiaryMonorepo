export const metadata = {
    title: "개인정보처리방침 | GoalDiary",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold sm:text-3xl">개인정보처리방침</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        GoalDiary(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다.
                    </p>
                </header>

                <section className="space-y-6 text-sm leading-relaxed text-gray-800">
                    <p>
                        본 개인정보처리방침은 서비스에서 어떤 개인정보를 수집하고, 어떻게 이용·보관·파기하는지에 대해
                        설명합니다. 본 방침은 모바일 앱 및 웹 서비스 전체에 적용됩니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">1. 수집하는 개인정보의 항목</h2>
                    <p>서비스는 다음과 같은 정보를 수집할 수 있습니다.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>
                            <strong>필수 정보</strong>: 이메일 주소 또는 소셜 로그인 계정 정보(예: Google 계정 ID), 사용자
                            ID, 닉네임 등
                        </li>
                        <li>
                            <strong>서비스 이용 정보</strong>: 일정, 루틴, 일기, 명언 등의 사용자가 앱 내에서 작성한
                            콘텐츠
                        </li>
                        <li>
                            <strong>기기 정보</strong>: 서비스 안정성 및 로그 분석을 위한 제한적인 기기 정보 및 로그
                            정보(오류 로그, 접속 기록 등)
                        </li>
                    </ul>

                    <h2 className="mt-6 text-lg font-semibold">2. 개인정보의 이용 목적</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>회원 가입 및 로그인 기능 제공 (이메일/비밀번호 또는 Google 등 소셜 로그인)</li>
                        <li>일정, 루틴, 일기, 명언 등 서비스 핵심 기능 제공 및 데이터 동기화</li>
                        <li>서비스 이용 기록을 기반으로 한 통계, 이용 행태 분석 및 서비스 품질 개선</li>
                        <li>부정 이용 방지, 보안 및 계정 보호</li>
                    </ul>

                    <h2 className="mt-6 text-lg font-semibold">3. 개인정보의 보관 및 파기</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>이용자가 서비스를 이용하는 동안 개인정보를 보관합니다.</li>
                        <li>
                            이용자가 계정 삭제를 요청하는 경우, 관련 법령에서 정한 보관 기간을 제외한 모든 개인정보는 지체
                            없이 삭제되거나 복구 불가능한 방식으로 파기됩니다.
                        </li>
                        <li>
                            법령에 따라 일정 기간 보존이 필요한 경우(예: 분쟁 해결, 부정 이용 방지 등), 해당 목적을 위해
                            필요한 최소한의 정보만 별도로 보관합니다.
                        </li>
                    </ul>

                    <h2 className="mt-6 text-lg font-semibold">4. 개인정보의 제3자 제공</h2>
                    <p>
                        서비스는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만, 법령에 따라 수사기관이나
                        감독기관이 적법한 절차를 통해 요청하는 경우 예외적으로 제공될 수 있습니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">5. 개인정보 처리의 위탁</h2>
                    <p>
                        서비스 제공과 안정적인 운영을 위해 일부 업무를 외부 서비스에 위탁할 수 있습니다. 이 경우, 위탁
                        업체가 개인정보 보호 관련 법령을 준수하도록 관리·감독합니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">6. 이용자의 권리</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>언제든지 계정 정보를 조회·수정할 수 있습니다.</li>
                        <li>앱 또는 웹의 설정/계정 메뉴를 통해 계정 삭제를 요청할 수 있습니다.</li>
                        <li>일부 데이터는 기능별로 삭제 요청이 가능하도록 순차적으로 제공될 수 있습니다.</li>
                    </ul>

                    <h2 className="mt-6 text-lg font-semibold">7. 데이터 전송 시 암호화</h2>
                    <p>
                        서비스는 HTTPS(SSL/TLS)를 사용하여 네트워크 구간에서 데이터를 암호화하여 전송합니다. Google
                        OAuth 등 외부 인증 과정 역시 해당 제공자에서 암호화된 채널을 통해 처리됩니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">8. 아동의 개인정보 보호</h2>
                    <p>
                        서비스는 원칙적으로 만 13세 미만 아동을 대상으로 하지 않으며, 아동임을 알면서 개인정보를 수집하지
                        않습니다. 만약 아동의 개인정보가 수집된 사실을 인지하는 경우, 지체 없이 삭제 조치를 취합니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">9. 개인정보처리방침의 변경</h2>
                    <p>
                        본 개인정보처리방침은 법령 변경, 서비스 개선 등에 따라 수정될 수 있습니다. 중요한 변경 사항이 있을
                        경우, 앱 내 공지 또는 웹 페이지를 통해 사전에 안내합니다.
                    </p>

                    <h2 className="mt-6 text-lg font-semibold">10. 문의처</h2>
                    <p>
                        개인정보 처리와 관련한 문의, 불만 처리, 권리 행사 요청은 앱 내 문의 기능 또는 개발자 연락처를 통해
                        요청하실 수 있습니다.
                    </p>
                </section>

                <footer className="mt-10 border-t pt-4 text-xs text-gray-500">
                    <p>본 개인정보처리방침은 GoalDiary 서비스에 적용됩니다.</p>
                </footer>
            </div>
        </main>
    );
}

