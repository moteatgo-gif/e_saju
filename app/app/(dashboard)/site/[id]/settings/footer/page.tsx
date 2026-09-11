import Form from "@/components/form";
import { updateSite } from "@/lib/actions";
import db from "@/lib/db";

export default async function SiteSettingsFooter({
  params,
}: {
  params: { id: string };
}) {
  const data = await db.query.sites.findFirst({
    where: (sites, { eq }) => eq(sites.id, decodeURIComponent(params.id)),
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="상호명"
        description="사이트 하단(푸터) 및 결제 영수증에 표기될 공식 상호입니다."
        helpText="예: 후 도령 또는 본인의 상호명"
        inputAttrs={{
          name: "companyName",
          type: "text",
          defaultValue: (data as any)?.companyName || "",
          placeholder: "후 도령",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="대표자명"
        description="통신판매업 및 전자상거래법상 필수로 노출되는 대표자 성함입니다."
        helpText="대표자 실명을 입력해주세요."
        inputAttrs={{
          name: "representative",
          type: "text",
          defaultValue: (data as any)?.representative || "",
          placeholder: "오후록",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="사업자등록번호"
        description="홈택스에 등록된 사업자등록번호 (10자리)"
        helpText="예: 314-46-01401"
        inputAttrs={{
          name: "businessNumber",
          type: "text",
          defaultValue: (data as any)?.businessNumber || "",
          placeholder: "314-46-01401",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="통신판매업 신고번호"
        description="관할 구청/시청에서 발급받은 통신판매업 신고번호"
        helpText="예: 제 2026-경기김포-4157 호"
        inputAttrs={{
          name: "mailOrderNumber",
          type: "text",
          defaultValue: (data as any)?.mailOrderNumber || "",
          placeholder: "제 2026-경기김포-4157 호",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="사업장 주소"
        description="사업자등록증 상의 도로명 주소"
        helpText="고객 안내용 공식 사업장 주소"
        inputAttrs={{
          name: "address",
          type: "text",
          defaultValue: (data as any)?.address || "",
          placeholder: "경기도 김포시 고촌읍 고송로 36, 2층 202호",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="카카오톡 상담 고객센터 링크"
        description="고객센터 버튼 클릭 시 연결될 카카오톡 채널 채팅 URL"
        helpText="예: http://pf.kakao.com/_xnGlTX/chat"
        inputAttrs={{
          name: "customerServiceUrl",
          type: "text",
          defaultValue: (data as any)?.customerServiceUrl || "",
          placeholder: "http://pf.kakao.com/_xnGlTX/chat",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="고객센터 유선 전화번호"
        description="고객 문의용 대표 전화번호"
        helpText="예: 07080589400"
        inputAttrs={{
          name: "phone",
          type: "text",
          defaultValue: (data as any)?.phone || "",
          placeholder: "07080589400",
        }}
        handleSubmit={updateSite}
      />
    </div>
  );
}
