import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  // if you are using Github OAuth, you can get rid of the username attribute (that is for Twitter OAuth)
  username: text("username"),
  gh_username: text("gh_username"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    };
  },
);

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => {
    return {
      compositePk: primaryKey({ columns: [table.identifier, table.token] }),
    };
  },
);

export const examples = pgTable("examples", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  domainCount: integer("domainCount"),
  url: text("url"),
  image: text("image"),
  imageBlurhash: text("imageBlurhash"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    refreshTokenExpiresIn: integer("refresh_token_expires_in"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    oauth_token_secret: text("oauth_token_secret"),
    oauth_token: text("oauth_token"),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
      compositePk: primaryKey({
        columns: [table.provider, table.providerAccountId],
      }),
    };
  },
);

export const sites = pgTable(
  "sites",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name"),
    description: text("description"),
    logo: text("logo").default(
      "https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/JRajRyC-PhBHEinQkupt02jqfKacBVHLWJq7Iy.png",
    ),
    font: text("font").default("font-cal").notNull(),
    image: text("image").default(
      "https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/hxfcV5V-eInX3jbVUhjAt1suB7zB88uGd1j20b.png",
    ),
    imageBlurhash: text("imageBlurhash").default(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC",
    ),
    subdomain: text("subdomain").unique(),
    customDomain: text("customDomain").unique(),
    message404: text("message404").default(
      "Blimey! You''ve found a page that doesn''t exist.",
    ),
    // 타이탄사주 테넌트 확장 필드
    companyName: text("companyName"),
    representative: text("representative"),
    address: text("address"),
    businessNumber: text("businessNumber"),
    mailOrderNumber: text("mailOrderNumber"),
    privacyOfficer: text("privacyOfficer"),
    email: text("email"),
    phone: text("phone"),
    customerServiceUrl: text("customerServiceUrl"),
    footerExtra: text("footerExtra"),
    theme: text("theme").default("DARK"),
    tossClientKey: text("tossClientKey"),
    tossSecretKey: text("tossSecretKey"),
    kakaoChannelId: text("kakaoChannelId"),
    solapiApiKey: text("solapiApiKey"),
    solapiApiSecret: text("solapiApiSecret"),
    solapiPfId: text("solapiPfId"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    userId: text("userId").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    };
  },
);

export const inviteCodes = pgTable("inviteCodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  code: text("code").notNull().unique(),
  issuerId: text("issuerId").references(() => users.id, { onDelete: "cascade" }),
  redeemedBy: text("redeemedBy").references(() => users.id),
  maxUses: integer("maxUses").default(1).notNull(),
  usedCount: integer("usedCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  role: text("role").default("TENANT").notNull(), // TENANT | INSTRUCTOR
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }),
});

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  siteId: text("siteId")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  category: text("category").default("개인 사주"),
  description: text("description"),
  originalPrice: integer("originalPrice").default(39900).notNull(),
  discountedPrice: integer("discountedPrice").default(29900).notNull(),
  creditCost: integer("creditCost").default(29900).notNull(),
  characterName: text("characterName").default("도령"),
  characterImageUrl: text("characterImageUrl"),
  characterPersona: text("characterPersona").default("mz"),
  characterEmpathy: text("characterEmpathy").default("F"),
  accentColor: text("accentColor").default("#D62221"),
  ctaBgColor: text("ctaBgColor").default("#FB9DF3"),
  ctaTextColor: text("ctaTextColor").default("#000000"),
  ctaLabel: text("ctaLabel").default("도령 찾으러 가기"),
  waitVideoUrl: text("waitVideoUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const funnelSteps = pgTable("funnelSteps", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  productId: text("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  stepKey: text("stepKey").notNull(),
  type: text("type").notNull(), // INTRO | IMAGE_SCREEN | FORM | FREEFORM | WAIT | OUTRO
  configJson: text("configJson").notNull(), // JSON 형태의 세부 연출/질문/비디오 설정
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  siteId: text("siteId")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => products.id),
  orderNumber: text("orderNumber").notNull().unique(),
  customerName: text("customerName").notNull(),
  customerPhone: text("customerPhone"),
  customerEmail: text("customerEmail"),
  birthDate: text("birthDate"),
  birthTime: text("birthTime"),
  isLunar: boolean("isLunar").default(false),
  gender: text("gender"),
  userStory: text("userStory"),
  amount: integer("amount").notNull(),
  paymentStatus: text("paymentStatus").default("PENDING").notNull(), // PENDING | PAID | FAILED | REFUNDED
  paymentKey: text("paymentKey"),
  paymentMethod: text("paymentMethod").default("TOSS"),
  reportContent: text("reportContent"), // AI가 생성한 사주 리포트
  reportStatus: text("reportStatus").default("WAITING").notNull(), // WAITING | GENERATING | COMPLETED | FAILED
  notifiedAt: timestamp("notifiedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text("title"),
    description: text("description"),
    content: text("content"),
    slug: text("slug")
      .notNull()
      .$defaultFn(() => createId()),
    image: text("image").default(
      "https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/hxfcV5V-eInX3jbVUhjAt1suB7zB88uGd1j20b.png",
    ),
    imageBlurhash: text("imageBlurhash").default(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC",
    ),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    published: boolean("published").default(false).notNull(),
    siteId: text("siteId").references(() => sites.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    userId: text("userId").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      siteIdIdx: index().on(table.siteId),
      userIdIdx: index().on(table.userId),
      slugSiteIdKey: uniqueIndex().on(table.slug, table.siteId),
    };
  },
);

export const productsRelations = relations(products, ({ one, many }) => ({
  site: one(sites, { references: [sites.id], fields: [products.siteId] }),
  steps: many(funnelSteps),
  orders: many(orders),
}));

export const funnelStepsRelations = relations(funnelSteps, ({ one }) => ({
  product: one(products, { references: [products.id], fields: [funnelSteps.productId] }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  site: one(sites, { references: [sites.id], fields: [orders.siteId] }),
  product: one(products, { references: [products.id], fields: [orders.productId] }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  site: one(sites, { references: [sites.id], fields: [posts.siteId] }),
  user: one(users, { references: [users.id], fields: [posts.userId] }),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  posts: many(posts),
  products: many(products),
  orders: many(orders),
  user: one(users, { references: [users.id], fields: [sites.userId] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [sessions.userId] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [accounts.userId] }),
}));

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  sites: many(sites),
  posts: many(posts),
}));

export type SelectSite = typeof sites.$inferSelect;
export type SelectPost = typeof posts.$inferSelect;
export type SelectProduct = typeof products.$inferSelect;
export type SelectFunnelStep = typeof funnelSteps.$inferSelect;
export type SelectOrder = typeof orders.$inferSelect;
export type SelectInviteCode = typeof inviteCodes.$inferSelect;
export type SelectExample = typeof examples.$inferSelect;

