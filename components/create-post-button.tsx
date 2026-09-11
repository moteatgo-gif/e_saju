"use client";

import { useTransition } from "react";
import { createPost } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import LoadingDots from "@/components/icons/loading-dots";
import va from "@vercel/analytics";

export default function CreatePostButton() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isPending, startTransition] = useTransition();
  const [isCloning, startCloning] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          startCloning(async () => {
            const res = await (window as any).cloneSaju?.(id) || await fetch(`/api/clone-saju?siteId=${id}`).catch(() => null);
            router.refresh();
          })
        }
        className={cn(
          "flex h-8 items-center justify-center space-x-1.5 rounded-lg border px-3 text-xs font-semibold transition-all focus:outline-none sm:h-9 sm:text-sm",
          isCloning
            ? "cursor-not-allowed border-stone-700 bg-stone-800 text-stone-400"
            : "border-seal-red/40 bg-seal-red/10 text-seal-red hover:bg-seal-red hover:text-white"
        )}
        disabled={isCloning}
      >
        <span>🔮</span>
        <span>{isCloning ? "복제 배포 중..." : "7대 퍼널 1초 복제"}</span>
      </button>

      <button
        onClick={() =>
          startTransition(async () => {
            const post = await createPost(null, id, null);
            va.track("Created Post");
            router.refresh();
            router.push(`/post/${post.id}`);
          })
        }
        className={cn(
          "flex h-8 w-32 items-center justify-center space-x-2 rounded-lg border text-xs font-semibold transition-all focus:outline-none sm:h-9 sm:text-sm",
          isPending
            ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            : "border-seal-hairline bg-white text-black hover:bg-stone-200 dark:bg-stone-800 dark:text-white dark:hover:bg-stone-700",
        )}
        disabled={isPending}
      >
        {isPending ? <LoadingDots color="#808080" /> : <p>+ 새 상품 등록</p>}
      </button>
    </div>
  );
}
