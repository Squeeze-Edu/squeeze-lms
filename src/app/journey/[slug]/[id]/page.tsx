"use client";

import MissionCard from "../_plan/MissionCard";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/common/Spinner";
import { useMissionInstance } from "@/hooks/useMissionInstance";
import Tiptap from "@/components/richTextInput/RichTextEditor";
import Heading from "@/components/Text/Heading";
import Text from "@/components/Text/Text";
import styled from "@emotion/styled";
import Button from "@/components/common/Button";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { createPost } from "@/app/journey/actions";
import { useAuth } from "@/components/AuthProvider";

export default function DoMissionPage() {
  const { id: userId } = useAuth();
  const params = useParams<{ id: string; slug: string }>();
  const { id, slug } = params;
  const router = useRouter();
  const { missionInstance, isLoading, error } = useMissionInstance(
    id ? Number(id) : null
  ); 
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!userId) return <div>로그인이 필요합니다.</div>;
  if (isLoading) return <Spinner />;
  if (error) return <div>오류가 발생했습니다: {error.message}</div>;
  if (!missionInstance) return <div>미션 인스턴스를 찾을 수 없습니다.</div>;

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    
    if (!content.trim()) {
      toaster.create({
        title: "미션 내용을 입력해주세요.",
        type: "warning",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await createPost({
        content: content,
        user_id: userId,
        mission_instance_id: missionInstance.id,
        title: "미션 제출",
        file_url: "",
        score: missionInstance.mission.points,
      });
      console.log("result", result);
      if (result.error) {
        console.error("미션 제출 오류:", result.error);
        toaster.create({
          title: "미션 제출 중 오류가 발생했습니다.",
          type: "error",
        });
        return;
      }

      // 성공 시 다음 페이지로 이동
      toaster.create({
        title: "미션이 성공적으로 제출되었습니다!",
        type: "success",
      });
      router.push(`/journey/${slug}`);
    } catch (error: any) {
      console.error("미션 제출 중 예외 발생:", error);
      toaster.create({
        title: "미션 제출 중 오류가 발생했습니다.",
        description: error?.message || "다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MissionContainer>
      <div className="mission-container">
        <Heading level={3}>{missionInstance.mission.name}</Heading>
        <Tiptap
          placeholder={
            missionInstance.mission.description ||
            "미션가이드에 따라 미션을 완료해주세요."
          }
          content={content}
          onChange={(value) => {
            setContent(value);
          }}
        />
        <Text variant="body" color="grey-700" fontWeight="bold">
          미션 상세 설명
        </Text>
        <MissionCard
          mission={missionInstance.mission}
          showDetails={true}
          isModal={true}
          missionInstance={missionInstance as any}
        />
      </div>
      <div className="button-container">
        <Button 
          variant="flat" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "제출"}
        </Button>
      </div>
    </MissionContainer>
  );
}

const MissionContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: space-between;
  height: 90dvh;
  .mission-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .button-container {
    margin-top: 16px;
  }
`;
