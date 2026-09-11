import Image from "next/image";
import LoginButton from "./login-button";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0d0f12] text-[#f5f5f5]">
      {/* 4대 모서리 시그니처 십자 헤어라인 프레임 */}
      <span aria-hidden="true" className="absolute top-6 left-6 z-[2] h-10 w-10 border-t border-l border-white/10" />
      <span aria-hidden="true" className="absolute top-6 right-6 z-[2] h-10 w-10 border-t border-r border-white/10" />
      <span aria-hidden="true" className="absolute bottom-6 left-6 z-[2] h-10 w-10 border-b border-l border-white/10" />
      <span aria-hidden="true" className="absolute bottom-6 right-6 z-[2] h-10 w-10 border-b border-r border-white/10" />

      {/* 헤더 바 */}
      <header className="absolute top-0 right-0 left-0 z-[3] flex items-center justify-between px-8 py-6 md:px-14 md:py-8">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] font-bold leading-none text-seal-red">印</span>
          <span className="text-[15px] font-semibold tracking-tight text-white">타이탄 사주</span>
        </div>
        <div className="hidden items-center gap-6 text-[11px] tracking-[0.28em] text-white/40 uppercase md:flex">
          <span>사주 운세 솔루션</span>
          <span className="block h-3 w-px bg-white/10" />
          <span className="text-white/70">관리자 입장</span>
        </div>
      </header>

      {/* 중앙 메인 로그인 카드 */}
      <div className="grid min-h-screen place-items-center px-6 py-24">
        <div className="w-full max-w-[440px]">
          <div className="mb-7 flex items-center gap-3">
            <span className="block h-px w-8 bg-seal-red" />
            <span className="text-[11px] tracking-[0.32em] text-white/60 uppercase font-bold">LOGIN</span>
          </div>

          <h1 className="mb-4 text-[42px] leading-[1.05] font-bold tracking-tight text-white select-none md:text-[52px]">
            로그인
          </h1>

          <p className="mb-8 text-[14px] leading-[1.7] text-white/60">
            계정으로 로그인하시면 운영하시던 사이트로 바로 이동합니다.
          </p>

          <div className="rounded-2xl border border-white/10 bg-[#121418]/80 p-6 backdrop-blur-md shadow-2xl">
            <Suspense
              fallback={
                <div className="h-10 w-full rounded-md border border-white/10 bg-white/5" />
              }
            >
              <LoginButton />
            </Suspense>
          </div>
        </div>
      </div>

      {/* 하단 푸터 상태바 */}
      <footer className="absolute right-0 bottom-0 left-0 z-[3] flex flex-col items-start justify-between gap-4 px-8 pb-7 md:flex-row md:items-end md:px-14 md:pb-8">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-seal-red animate-pulse" />
          <span className="text-[12px] text-white/60">인증된 분들 전용 입구입니다.</span>
        </div>
        <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase">est · 印 · 2026</span>
      </footer>
    </div>
  );
}
