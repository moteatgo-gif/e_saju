"use server";

import { getSession } from "@/lib/auth";
import {
  addDomainToVercel,
  removeDomainFromVercelProject,
  validDomainRegex,
} from "@/lib/domains";
import { getBlurDataURL } from "@/lib/utils";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";
import { withPostAuth, withSiteAuth } from "./auth";
import db from "./db";
import { SelectPost, SelectSite, posts, sites, users } from "./schema";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const createSite = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    await db
      .insert(users)
      .values({
        id: session.user.id,
        name: session.user.name || "마스터 관리자",
        email: session.user.email || "admin@saju.com",
        username: session.user.username || "admin",
        image: session.user.image || "https://avatar.vercel.sh/admin",
      })
      .onConflictDoNothing();

    const [response] = await db
      .insert(sites)
      .values({
        name,
        description,
        subdomain,
        userId: session.user.id,
      })
      .returning();

    revalidateTag(
      `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This subdomain is already taken`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const updateSite = withSiteAuth(
  async (formData: FormData, site: SelectSite, key: string) => {
    const value = formData.get(key) as string;

    try {
      let response;

      if (key === "customDomain") {
        if (value.includes("vercel.pub")) {
          return {
            error: "Cannot use vercel.pub subdomain as your custom domain",
          };

          // if the custom domain is valid, we need to add it to Vercel
        } else if (validDomainRegex.test(value)) {
          response = await db
            .update(sites)
            .set({
              customDomain: value,
            })
            .where(eq(sites.id, site.id))
            .returning()
            .then((res) => res[0]);

          await Promise.all([
            addDomainToVercel(value),
            // Optional: add www subdomain as well and redirect to apex domain
            // addDomainToVercel(`www.${value}`),
          ]);

          // empty value means the user wants to remove the custom domain
        } else if (value === "") {
          response = await db
            .update(sites)
            .set({
              customDomain: null,
            })
            .where(eq(sites.id, site.id))
            .returning()
            .then((res) => res[0]);
        }

        // if the site had a different customDomain before, we need to remove it from Vercel
        if (site.customDomain && site.customDomain !== value) {
          response = await removeDomainFromVercelProject(site.customDomain);

          /* Optional: remove domain from Vercel team 

          // first, we need to check if the apex domain is being used by other sites
          const apexDomain = getApexDomain(`https://${site.customDomain}`);
          const domainCount = await db.select({ count: count() }).from(sites).where(or(eq(sites.customDomain, apexDomain), ilike(sites.customDomain, `%.${apexDomain}`))).then((res) => res[0].count);


          // if the apex domain is being used by other sites
          // we should only remove it from our Vercel project
          if (domainCount >= 1) {
            await removeDomainFromVercelProject(site.customDomain);
          } else {
            // this is the only site using this apex domain
            // so we can remove it entirely from our Vercel team
            await removeDomainFromVercelTeam(
              site.customDomain
            );
          }
          
          */
        }
      } else if (key === "image" || key === "logo") {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          return {
            error:
              "Missing BLOB_READ_WRITE_TOKEN token. Note: Vercel Blob is currently in beta – please fill out this form for access: https://tally.so/r/nPDMNd",
          };
        }

        const file = formData.get(key) as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        const blurhash = key === "image" ? await getBlurDataURL(url) : null;

        response = await db
          .update(sites)
          .set({
            [key]: url,
            ...(blurhash && { imageBlurhash: blurhash }),
          })
          .where(eq(sites.id, site.id))
          .returning()
          .then((res) => res[0]);
      } else {
        response = await db
          .update(sites)
          .set({
            [key]: value,
          })
          .where(eq(sites.id, site.id))
          .returning()
          .then((res) => res[0]);
      }

      console.log(
        "Updated site data! Revalidating tags: ",
        `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        `${site.customDomain}-metadata`,
      );
      revalidateTag(
        `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      site.customDomain && revalidateTag(`${site.customDomain}-metadata`);

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This ${key} is already taken`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deleteSite = withSiteAuth(
  async (_: FormData, site: SelectSite) => {
    try {
      const [response] = await db
        .delete(sites)
        .where(eq(sites.id, site.id))
        .returning();

      revalidateTag(
        `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      response.customDomain && revalidateTag(`${site.customDomain}-metadata`);
      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const getSiteFromPostId = async (postId: string) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: {
      siteId: true,
    },
  });

  return post?.siteId;
};

export const createPost = withSiteAuth(
  async (_: FormData, site: SelectSite) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const [response] = await db
      .insert(posts)
      .values({
        siteId: site.id,
        userId: session.user.id,
      })
      .returning();

    revalidateTag(
      `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    site.customDomain && revalidateTag(`${site.customDomain}-posts`);

    return response;
  },
);

// creating a separate function for this because we're not using FormData
export const updatePost = async (data: SelectPost) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, data.id),
    with: {
      site: true,
    },
  });

  if (!post || post.userId !== session.user.id) {
    return {
      error: "Post not found",
    };
  }

  try {
    const [response] = await db
      .update(posts)
      .set({
        title: data.title,
        description: data.description,
        content: data.content,
      })
      .where(eq(posts.id, data.id))
      .returning();

    revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
    );

    // if the site has a custom domain, we need to revalidate those tags too
    post.site?.customDomain &&
      (revalidateTag(`${post.site?.customDomain}-posts`),
      revalidateTag(`${post.site?.customDomain}-${post.slug}`));

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updatePostMetadata = withPostAuth(
  async (
    formData: FormData,
    post: SelectPost & {
      site: SelectSite;
    },
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "image") {
        const file = formData.get("image") as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        const blurhash = await getBlurDataURL(url);
        response = await db
          .update(posts)
          .set({
            image: url,
            imageBlurhash: blurhash,
          })
          .where(eq(posts.id, post.id))
          .returning()
          .then((res) => res[0]);
      } else {
        response = await db
          .update(posts)
          .set({
            [key]: key === "published" ? value === "true" : value,
          })
          .where(eq(posts.id, post.id))
          .returning()
          .then((res) => res[0]);
      }

      revalidateTag(
        `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
      );

      // if the site has a custom domain, we need to revalidate those tags too
      post.site?.customDomain &&
        (revalidateTag(`${post.site?.customDomain}-posts`),
        revalidateTag(`${post.site?.customDomain}-${post.slug}`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This slug is already in use`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deletePost = withPostAuth(
  async (_: FormData, post: SelectPost) => {
    try {
      const [response] = await db
        .delete(posts)
        .where(eq(posts.id, post.id))
        .returning({
          siteId: posts.siteId,
        });

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const [response] = await db
      .update(users)
      .set({
        [key]: value,
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

// 속삭임사주 7대 정품 퍼널 상품을 내 사이트로 1초 만에 자동 복제하는 액션
export const cloneOriginalSajuProducts = withSiteAuth(
  async (_: any, site: SelectSite) => {
    const session = await getSession();
    if (!session?.user.id) {
      return { error: "Not authenticated" };
    }

    const defaultFunnels = [
      {
        slug: "siwoo_mz_dating",
        title: "시우도령의 MZ 연애 사주",
        category: "연애 사주",
        description: "여기가 요즘 핫한 연애 신당이라고...? 내 운명은 언제?",
        originalPrice: 39900,
        discountedPrice: 29900,
        characterName: "시우도령",
        characterPersona: "mz",
        characterEmpathy: "F",
        accentColor: "#D62221",
        ctaBgColor: "#FB9DF3",
        ctaLabel: "도령 찾으러 가기",
        image: "https://loisznqcftphaidyqtsp.supabase.co/storage/v1/object/public/character/cmpqww89z000004jxfuo004e7/f53f57a4-8829-4188-af77-f31743b31371.png",
      },
      {
        slug: "hoo_lifetime",
        title: "후도령의 평생사주",
        category: "평생 사주",
        description: "인생 전반의 흐름과 대운/세운을 명쾌하게 짚어내는 정통 평생사주",
        originalPrice: 49900,
        discountedPrice: 34900,
        characterName: "후도령",
        characterPersona: "traditional",
        characterEmpathy: "T",
        accentColor: "#F59E0B",
        ctaBgColor: "#FDE68A",
        ctaLabel: "내 평생운명 확인하기",
        image: "https://loisznqcftphaidyqtsp.supabase.co/storage/v1/object/public/site-assets/sites/cmpqwz1lw000005jpx2sv4gqb/6206d1eb-ff00-4310-b702-e662a6a9b1f8.jpg",
      },
      {
        slug: "hongyeon_reunion",
        title: "홍연보살 귀연재회",
        category: "재회 사주",
        description: "재회만 38년, 그 촉을 그대로 옮긴 무당 사주 (연락 오는 시기 명통)",
        originalPrice: 49900,
        discountedPrice: 29900,
        characterName: "홍연보살",
        characterPersona: "shaman",
        characterEmpathy: "F",
        accentColor: "#DC2626",
        ctaBgColor: "#FECACA",
        ctaLabel: "인연의 끈 확인하기",
        image: "https://loisznqcftphaidyqtsp.supabase.co/storage/v1/object/public/site-assets/sites/cmpqwz1lw000005jpx2sv4gqb/16f85d75-fe2d-44bc-93cf-a3e12d499ad7.jpg",
      },
      {
        slug: "dana_match",
        title: "단아선녀 사주궁합",
        category: "궁합 사주",
        description: "싸우는 이유부터 화해시키는 말, 스킨십까지 꿰뚫어 보는 궁합 사용설명서",
        originalPrice: 45000,
        discountedPrice: 29900,
        characterName: "단아선녀",
        characterPersona: "fairy",
        characterEmpathy: "F",
        accentColor: "#EC4899",
        ctaBgColor: "#FBCFE8",
        ctaLabel: "우리 속궁합 보기",
        image: "https://loisznqcftphaidyqtsp.supabase.co/storage/v1/object/public/site-assets/sites/cmpqwz1lw000005jpx2sv4gqb/f92c9ba5-0792-48f4-b287-8fb90b42f189.jpg",
      },
      {
        slug: "wolho_salpuri",
        title: "월호선 살 풀이 사주",
        category: "납량특집",
        description: "꼬인 인생, 액운/신살을 직설적으로 쳐내는 호러/납량특집 살풀이 비방",
        originalPrice: 39900,
        discountedPrice: 29900,
        characterName: "월호선",
        characterPersona: "dark",
        characterEmpathy: "T",
        accentColor: "#7C3AED",
        ctaBgColor: "#DDD6FE",
        ctaLabel: "살풀이 시작하기",
        image: "https://loisznqcftphaidyqtsp.supabase.co/storage/v1/object/public/site-assets/sites/cmpqwz1lw000005jpx2sv4gqb/788b9a81-a9c2-4998-bccb-d328e141239a.png",
      },
      {
        slug: "wolryeong_reunion",
        title: "월령신녀의 재회사주",
        category: "재회 사주",
        description: "연락 오는 정확한 주차 명시, 먼저 연락하면 망하는 금지일 지정",
        originalPrice: 39900,
        discountedPrice: 29900,
        characterName: "월령신녀",
        characterPersona: "cold",
        characterEmpathy: "T",
        accentColor: "#2563EB",
        ctaBgColor: "#BFDBFE",
        ctaLabel: "연락 시기 조회",
        image: "https://loisznqcftphaidyqtsp.supabase.co/storage/v1/object/public/site-assets/sites/cmpqwz1lw000005jpx2sv4gqb/6206d1eb-ff00-4310-b702-e662a6a9b1f8.jpg",
      },
      {
        slug: "moonlight_match",
        title: "달빛 궁합소 99%",
        category: "궁합 사주",
        description: "우리는 과연 어떤 사이일까? 서로를 끌어당기는 감성 궁합 풀이",
        originalPrice: 35000,
        discountedPrice: 24900,
        characterName: "달빛선녀",
        characterPersona: "emotional",
        characterEmpathy: "F",
        accentColor: "#F43F5E",
        ctaBgColor: "#FECDD3",
        ctaLabel: "인연 지수 확인",
        image: "https://loisznqcftphaidyqtsp.supabase.co/storage/v1/object/public/site-assets/sites/cmpqwz1lw000005jpx2sv4gqb/16f85d75-fe2d-44bc-93cf-a3e12d499ad7.jpg",
      },
    ];

    try {
      for (const item of defaultFunnels) {
        await db.insert(posts).values({
          siteId: site.id,
          userId: session.user.id,
          title: item.title,
          description: item.description,
          slug: item.slug,
          image: item.image,
          published: true,
          content: JSON.stringify(item),
        });
      }

      revalidateTag(`${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`);
      return { success: true, count: defaultFunnels.length };
    } catch (e: any) {
      return { error: e.message };
    }
  },
);

