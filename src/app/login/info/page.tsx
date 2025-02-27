"use client";

import styled from "@emotion/styled";
import InputAndTitle from "@/components/InputAndTitle";
import Heading from "@/components/Text/Heading";
import { Input } from "@chakra-ui/react";
import Button from "@/components/common/Button";
// import { PasswordInput } from "@/components/ui/password-input";
import Text from "@/components/Text/Text";
import Checkbox from "@/components/common/Checkbox";
import { Separator, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type Signup } from "@/types/users";
import { DevTool } from "@hookform/devtools";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { decrypt } from "@/utils/encryption";

type DecryptedAuthData = {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
};

type Agreement = "mailAgreement" | "cookieAgreement";
const supabase = createClient();

export default function LoginInfoPage() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState<Agreement[]>([]);
  const handleCheckboxChangeAll = () => {
    if (isChecked.length === 2) {
      setIsChecked([]);
    } else {
      setIsChecked(["mailAgreement", "cookieAgreement"]);
    }
  };
  const handleCheckboxChange = (value: Agreement) => {
    if (isChecked.includes(value)) {
      setIsChecked(isChecked.filter((item) => item !== value));
    } else {
      setIsChecked([...isChecked, value]);
    }
  };
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Signup>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
      lastName: "",
      phone: "",
      mailAgreement: false,
      cookieAgreement: false,
    },
  });
  useEffect(() => {
    console.log("useEffect 실행됨");
    const authData = Cookies.get("auth_data");
    console.log("쿠키 데이터:", authData, typeof authData);

    if (!authData || typeof authData !== "string") {
      console.log("유효하지 않은 auth_data");
      window.location.href =
        "/error?message=로그인 정보가 없거나 유효하지 않습니다";
      return;
    }

    try {
      // 문자열이 아닌 경우를 대비해 JSON.stringify 추가
      const decryptedString = decrypt(authData);
      console.log("복호화된 문자열:", decryptedString);

      if (!decryptedString) {
        throw new Error("복호화된 데이터가 없습니다");
      }

      const decryptedAuthData: DecryptedAuthData = JSON.parse(decryptedString);
      console.log("파싱된 데이터:", decryptedAuthData);

      if (!decryptedAuthData || !decryptedAuthData.email) {
        throw new Error("필수 데이터가 누락되었습니다");
      }

      setValue("email", decryptedAuthData.email);
      setValue("name", decryptedAuthData.first_name);
      setValue("lastName", decryptedAuthData.last_name);
    } catch (error) {
      console.error("데이터 처리 중 에러:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다";
      window.location.href = `/error?message=${encodeURIComponent(
        errorMessage
      )}`;
    }
  }, [setValue]);
  const onSubmit = async (data: Signup) => {
    console.log(data);
    const { error } = await supabase.from("users").insert({
      uid: data.uid,
      email: data.email,
      password: data.password,
      name: data.name,
      lastName: data.lastName,
      phone: data.phone,
      role: "user",
      mailAgreement: isChecked.includes("mailAgreement"),
      cookieAgreement: isChecked.includes("cookieAgreement"),
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error(error);
      router.push("/error?error=회원가입 실패");
    }
    router.push("/");
  };

  return (
    <Container onSubmit={handleSubmit(onSubmit)}>
      <Heading level={3}>회원가입</Heading>
      <InputContainer>
        <HorizontalContainer>
          <InputAndTitle title="성" errorMessage={errors.lastName?.message}>
            <Input type="text" placeholder="홍" {...register("lastName")} />
          </InputAndTitle>
          <InputAndTitle title="이름" errorMessage={errors.name?.message}>
            <Input type="text" placeholder="길동" {...register("name")} />
          </InputAndTitle>
        </HorizontalContainer>
        <InputAndTitle title="이메일" errorMessage={errors.email?.message}>
          <Input
            type="email"
            placeholder="example@gmail.com"
            {...register("email")}
          />
        </InputAndTitle>
        <InputAndTitle title="전화번호" errorMessage={errors.phone?.message}>
          <Input
            type="tel"
            placeholder="010-1234-5678"
            {...register("phone")}
          />
        </InputAndTitle>
        {/* <InputAndTitle title="비밀번호" errorMessage={errors.password?.message}>
          <PasswordInput
            placeholder="비밀번호를 입력해주세요"
            {...register("password")}
          />
        </InputAndTitle>
        <InputAndTitle
          title="비밀번호 확인"
          errorMessage={
            errors.passwordConfirm?.message ||
            getValues("password") !== getValues("passwordConfirm")
              ? "비밀번호가 일치하지 않습니다"
              : undefined
          }
        >
          <PasswordInput
            placeholder="비밀번호를 입력해주세요"
            {...register("passwordConfirm")}
          />
        </InputAndTitle> */}
      </InputContainer>
      <Stack className="agreement-container">
        <div className="agreement-container-line">
          <Text variant="caption" weight="bold">
            개인정보 보호정책 및 메일 수신에 동의합니다
          </Text>
          <Checkbox
            checked={
              isChecked.includes("mailAgreement") &&
              isChecked.includes("cookieAgreement")
            }
            onChange={handleCheckboxChangeAll}
          />
        </div>
        <Separator orientation="horizontal" style={{ width: "100%" }} />
        <div className="agreement-container-line">
          <Text variant="small" weight="medium">
            메일 수신 동의하기(선택)
          </Text>
          <Checkbox
            checked={isChecked.includes("mailAgreement")}
            onChange={() => handleCheckboxChange("mailAgreement")}
          />
        </div>
        <div className="agreement-container-line">
          <Text variant="small" weight="medium">
            개인정보 보호정책 및 쿠키 사용에 동의합니다(필수)
          </Text>
          <Checkbox
            checked={isChecked.includes("cookieAgreement")}
            onChange={() => handleCheckboxChange("cookieAgreement")}
          />
        </div>
      </Stack>
      <Button type="submit">{isSubmitting ? "로딩중..." : "회원가입"}</Button>
      <DevTool control={control} />
    </Container>
  );
}

const Container = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 16px;

  .agreement-container {
    margin: 16px 0;
    display: flex;
    align-items: center;
    gap: 3px;
    flex-direction: column;
    background-color: var(--white);
    padding: 10px;
    border-radius: 6px;
    width: 100%;
    .agreement-container-line {
      width: 100%;
      justify-content: space-between;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-direction: row;
    }
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  input {
    background-color: var(--white);
  }
  .password-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
`;

const HorizontalContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  flex-direction: row;
  align-items: top;
  justify-content: top;
`;
