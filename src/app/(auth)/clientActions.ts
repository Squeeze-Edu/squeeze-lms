import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

const getURL = () => {
  // 현재 환경이 개발(localhost) 환경인지 확인
  const isDevelopment = 
    !process.env.NEXT_PUBLIC_VERCEL_ENV || // Vercel 환경 변수가 없거나
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' || // 개발 환경이거나
    window.location.hostname === 'localhost' || // 호스트가 localhost이거나
    window.location.hostname === '127.0.0.1'; // 로컬 IP인 경우
  
  // 개발 환경이면 localhost 사용, 아니면 production URL 사용
  if (isDevelopment) {
    return 'http://localhost:3000/auth/callback';
  } else {
    return 'https://squeezeedu.com/auth/callback';
  }
}

export async function socialLogin(
  provider: "google" | "github" | "apple" | "twitter" | "facebook"
) {
  try {
    console.log("소셜 로그인 시도:", provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getURL(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("소셜 로그인 에러:", error);
      throw error;
    }

    console.log("소셜 로그인 데이터:", data);
    return { data, error };
  } catch (error) {
    console.error("소셜 로그인 예외:", error);
    return { data: null, error };
  }
}