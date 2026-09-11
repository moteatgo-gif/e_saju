import Form from "@/components/form";
import { updateSite } from "@/lib/actions";
import db from "@/lib/db";

export default async function SiteSettingsPayment({
  params,
}: {
  params: { id: string };
}) {
  const data = await db.query.sites.findFirst({
    where: (sites, { eq }) => eq(sites.id, decodeURIComponent(params.id)),
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="rounded-xl border border-seal-red/30 bg-seal-red/5 p-4 text-sm text-stone-300">
        💡 <b>토스페이먼츠 & 카카오 알림톡 자동 연동</b>: 키를 입력하지 않아도 모의(Sandbox) 결제와 테스트 모드가 자동 가동됩니다. 실서비스 런칭 시 발급받은 키를 등록하시면 즉시 실결제로 전환됩니다.
      </div>

      <Form
        title="토스페이먼츠 클라이언트 키 (Client Key)"
        description="토스페이먼츠 개발자센터에서 발급받은 연동 클라이언트 키입니다."
        helpText="예: test_ck_... 또는 live_ck_..."
        inputAttrs={{
          name: "tossClientKey",
          type: "text",
          defaultValue: (data as any)?.tossClientKey || "",
          placeholder: "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="토스페이먼츠 시크릿 키 (Secret Key)"
        description="결제 승인 및 검증을 위한 보안 시크릿 키입니다."
        helpText="예: test_sk_... 또는 live_sk_..."
        inputAttrs={{
          name: "tossSecretKey",
          type: "text",
          defaultValue: (data as any)?.tossSecretKey || "",
          placeholder: "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="카카오 비즈니스 채널 ID"
        description="알림톡 발송에 사용할 카카오톡 채널 고유 ID입니다."
        helpText="예: @후도령사주"
        inputAttrs={{
          name: "kakaoChannelId",
          type: "text",
          defaultValue: (data as any)?.kakaoChannelId || "",
          placeholder: "@속삭임사주",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="알림톡 솔라피(Solapi) API Key"
        description="카카오톡 알림톡 자동 전송을 위한 솔라피 API Key"
        helpText="솔라피 콘솔에서 발급받은 API Key"
        inputAttrs={{
          name: "solapiApiKey",
          type: "text",
          defaultValue: (data as any)?.solapiApiKey || "",
          placeholder: "NCS...",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="알림톡 솔라피(Solapi) API Secret"
        description="솔라피 보안 시크릿 키"
        helpText="솔라피 콘솔에서 발급받은 API Secret"
        inputAttrs={{
          name: "solapiApiSecret",
          type: "text",
          defaultValue: (data as any)?.solapiApiSecret || "",
          placeholder: "...",
        }}
        handleSubmit={updateSite}
      />
    </div>
  );
}
