import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Posts from "@/components/posts";
import CreatePostButton from "@/components/create-post-button";
import db from "@/lib/db";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";

export default async function InvitesPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  // 발급된 초대코드 목록 쿼리
  const codes = await db.query.inviteCodes.findMany({
    orderBy: (c, { desc }) => desc(c.createdAt),
  }).catch(() => []);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-start justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="font-cal text-2xl font-bold dark:text-white sm:text-3xl">
            고액 수강생 전용 초대코드 발급 관리
          </h1>
          <p className="text-sm text-stone-400">
            타이탄사주 폐쇄형 회원가입용 초대코드를 발급하고 수강생 분양 현황을 통제합니다.
          </p>
        </div>

        <button
          onClick={undefined}
          className="flex h-9 items-center justify-center space-x-2 rounded-lg border border-seal-red bg-seal-red px-4 text-xs font-semibold text-white transition hover:bg-red-700"
        >
          <span>🔑</span>
          <span>새 초대코드 1초 발급</span>
        </button>
      </div>

      {/* 초대코드 현황 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-800 bg-[#121418] p-5">
          <p className="text-xs font-semibold text-stone-400">총 발급된 초대코드</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{codes.length || 12}개</h2>
          <p className="mt-1 text-xs text-stone-400">고액 분양 수강생 계정 풀</p>
        </div>
        <div className="rounded-xl border border-stone-800 bg-[#121418] p-5">
          <p className="text-xs font-semibold text-stone-400">현재 활성 분양 사이트</p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-400">8개소</h2>
          <p className="mt-1 text-xs text-stone-400">가입 완료 및 운영 중</p>
        </div>
        <div className="rounded-xl border border-stone-800 bg-[#121418] p-5">
          <p className="text-xs font-semibold text-stone-400">분양 매출 기여액 (누적)</p>
          <h2 className="mt-2 text-2xl font-bold text-seal-red">₩24,000,000</h2>
          <p className="mt-1 text-xs text-stone-400">수강료 및 분양 패키지</p>
        </div>
      </div>

      {/* 초대코드 리스트 테이블 */}
      <div className="overflow-hidden rounded-xl border border-stone-800 bg-[#121418]">
        <div className="border-b border-stone-800 px-6 py-4">
          <h3 className="text-base font-semibold text-white">초대코드 발급 및 사용 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-[#1a1d24] text-xs text-stone-400 uppercase">
              <tr>
                <th className="px-6 py-3">초대코드</th>
                <th className="px-6 py-3">권한 구분</th>
                <th className="px-6 py-3">사용 현황</th>
                <th className="px-6 py-3">상태</th>
                <th className="px-6 py-3">발행 일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              <tr className="hover:bg-white/5">
                <td className="px-6 py-4 font-mono font-bold text-seal-red">TITAN-VIP-9942</td>
                <td className="px-6 py-4 text-white">수강생 (TENANT)</td>
                <td className="px-6 py-4">1 / 1 회 사용됨 (강*훈 님 등록)</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-stone-700 px-2.5 py-1 text-xs text-stone-400">등록완료</span>
                </td>
                <td className="px-6 py-4 text-xs text-stone-400">2026-09-10 14:20</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="px-6 py-4 font-mono font-bold text-emerald-400">TITAN-VIP-8812</td>
                <td className="px-6 py-4 text-white">수강생 (TENANT)</td>
                <td className="px-6 py-4">0 / 1 회 미사용</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">가입대기중</span>
                </td>
                <td className="px-6 py-4 text-xs text-stone-400">2026-09-11 08:30</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
